from litestar import Controller, get, post, delete
from litestar.exceptions import NotFoundException, MethodNotAllowedException
from litestar.channels import ChannelsPlugin
from util import AppState, guard_loggedIn, guard_has_permission, guard_ha_active, construct_detail, event
from models import EntityConfigEntry
from pydantic import BaseModel
from lowhass import State, Domain
from typing import *

class EntityModel(BaseModel):
    id: str
    name: str
    type: str
    state: str
    attributes: dict[str, Any]
    last_changed: Union[str, None]
    last_updated: Union[str, None]
    tracked: bool

    @classmethod
    def from_hass(cls, state: State, tracked: bool) -> "EntityModel":
        return EntityModel(
            id=state.entity_id,
            name=state.entity_id.split(".", maxsplit=1)[1],
            type=state.entity_id.split(".", maxsplit=1)[0],
            attributes=state.attributes,
            last_changed=state.last_changed.ctime() if state.last_changed else None,
            last_updated=state.last_updated.ctime() if state.last_updated else None,
            state=state.state,
            tracked=tracked
        )

class TrackedEntity(BaseModel):
    id: str
    last_update: float
    haid: str
    name: str
    type: str
    tracked_values: list[dict[str, Any]]

    @classmethod
    def from_entity(cls, entity: EntityConfigEntry) -> "TrackedEntity":
        return TrackedEntity(id=entity.id, last_update=entity.last_update, haid=entity.haid, name=entity.name, type=entity.type, tracked_values=entity.tracked_values)


class HAController(Controller):
    path = "/ha"
    guards = [guard_loggedIn, guard_ha_active]

    @get("/entities")
    async def get_entities(self, app_state: AppState) -> list[EntityModel]:
        all_tracked = [i.haid for i in EntityConfigEntry.all(app_state.db)]
        return [EntityModel.from_hass(s, s.entity_id in all_tracked) for s in app_state.home_assistant.rest.get_states()]
    
    @get("/entities/{entity_id: str}")
    async def get_entity(self, app_state: AppState, entity_id: str) -> EntityModel:
        track_result = EntityConfigEntry.load_haid(app_state.db, entity_id) != None
        try:
            hass_result = app_state.home_assistant.rest.get_state(entity_id)
        except:
            raise NotFoundException(construct_detail("entity.invalid_id", f"Entity with id {entity_id} does not exist."))
        return EntityModel.from_hass(hass_result, track_result)
    
    @get("/entities/tracked", guards=[guard_has_permission], opt={"scope": "settings", "allowed": ["view", "edit"]})
    async def get_tracked_entities(self, app_state: AppState) -> list[TrackedEntity]:
        return [TrackedEntity.from_entity(entity) for entity in EntityConfigEntry.all(app_state.db)]
    
    @get("/entities/tracked/{haid:str}", guards=[guard_has_permission], opt={"scope": "settings", "allowed": ["view", "edit"]})
    async def get_tracked_entity(self, app_state: AppState, haid: str) -> TrackedEntity:
        results: list[EntityConfigEntry] = EntityConfigEntry.load(app_state.db, {"group": "entity", "haid": haid})
        if len(results) > 0:
            return TrackedEntity.from_entity(results[0])
        else:
            raise NotFoundException(construct_detail("entity.tracking.invalid_id", f"Entity with id {haid} is not being tracked."))
        
    
    @post("/entities/tracked/{haid:str}", guards=[guard_has_permission], opt={"scope": "settings", "allowed": ["edit"]})
    async def track_entity(self, app_state: AppState, haid: str, data: list[dict[str, Any]]) -> TrackedEntity:
        try:
            track = EntityModel.from_hass(app_state.home_assistant.rest.get_state(haid), True)
        except:
            raise NotFoundException(construct_detail("entity.invalid_id", f"Entity with id {haid} does not exist."))
        if len(EntityConfigEntry.load(app_state.db, {"group": "entity", "haid": haid})) > 0:
            raise MethodNotAllowedException(construct_detail("entity.tracking.already_tracked", message="That entity is already being tracked."))
        new_entry = EntityConfigEntry(app_state.db, haid=haid, name=track.name, type=track.type, tracked_values=data)
        new_entry.save()
        return TrackedEntity.from_entity(new_entry)
    
    @delete("/entities/tracked/{haid:str}", guards=[guard_has_permission], opt={"scope": "settings", "allowed": ["edit"]})
    async def delete_entity(self, app_state: AppState, haid: str) -> None:
        results: list[EntityConfigEntry] = EntityConfigEntry.load(app_state.db, {"group": "entity", "haid": haid})
        if len(results) > 0:
            results[0].destroy()
            return
        else:
            raise NotFoundException(construct_detail("entity.tracking.invalid_id", f"Entity with id {haid} is not being tracked."))
    
    @get("/domains")
    async def get_domains(self, app_state: AppState) -> list[Domain]:
        return app_state.home_assistant.rest.get_services()
    
    @get("/domains/{domain:str}")
    async def get_domain(self, app_state: AppState, domain: str) -> Domain:
        results = [i for i in app_state.home_assistant.rest.get_services() if i.domain == domain]
        if len(results) == 0:
            raise NotFoundException(construct_detail("domain.not_found", f"Domain {domain} does not exist"))
        return results[0]
    
    @post("/domains/{domain:str}/{service:str}", guards=[guard_has_permission], opt={"scope": "settings", "allowed": ["edit"]})
    async def post_service(self, app_state: AppState, domain: str, service: str, data: dict[str, Any]) -> list[EntityModel]:
        try:
            result = app_state.home_assistant.rest.call_service(domain, service, data=data)
            return [EntityModel.from_hass(i, False) for i in result]
        except Exception as e:
            raise MethodNotAllowedException(construct_detail("domain.service_call.invalid", message=f"Failed to call {domain}.{service}", data={"data": data, "error": str(e)}))
    
    @post("/entities/tracked/{haid:str}/values", guards=[guard_has_permission], opt={"scope": "settings", "allowed": ["edit"]})
    async def start_tracking_value(self, app_state: AppState, haid: str, data: dict[str, Any], channels: ChannelsPlugin) -> TrackedEntity:
        results: list[EntityConfigEntry] = EntityConfigEntry.load(app_state.db, {"group": "entity", "haid": haid})
        if len(results) > 0:
            results[0].tracked_values = [i for i in results[0].tracked_values if not i["field"] == data["field"]]
            results[0].tracked_values.append(data)
            results[0].save()
            event(channels, f"entity.tracked.{haid}", TrackedEntity.from_entity(results[0]).dict())
            return TrackedEntity.from_entity(results[0])
        else:
            raise NotFoundException(construct_detail("entity.tracking.invalid_id", f"Entity with id {haid} is not being tracked."))
    
    @post("/entities/tracked/{haid:str}/values/{field:str}/logging", guards=[guard_has_permission], opt={"scope": "settings", "allowed": ["edit"]})
    async def start_logging(self, app_state: AppState, haid: str, field: str, channels: ChannelsPlugin) -> None:
        results: list[EntityConfigEntry] = EntityConfigEntry.load(app_state.db, {"group": "entity", "haid": haid})
        if len(results) > 0:
            old_tracked = [i for i in results[0].tracked_values if i["field"] == field][0]
            old_tracked["logging"] = True
            results[0].tracked_values = [i for i in results[0].tracked_values if not i["field"] == field]
            results[0].tracked_values.append(old_tracked)
            results[0].save()
            event(channels, f"entity.tracked.{haid}", TrackedEntity.from_entity(results[0]).dict())
            return None
        else:
            raise NotFoundException(construct_detail("entity.tracking.invalid_id", f"Entity with id {haid} is not being tracked."))
    
    @delete("/entities/tracked/{haid:str}/values/{field:str}/logging", guards=[guard_has_permission], opt={"scope": "settings", "allowed": ["edit"]})
    async def stop_logging(self, app_state: AppState, haid: str, field: str, channels: ChannelsPlugin) -> None:
        results: list[EntityConfigEntry] = EntityConfigEntry.load(app_state.db, {"group": "entity", "haid": haid})
        if len(results) > 0:
            old_tracked = [i for i in results[0].tracked_values if i["field"] == field][0]
            old_tracked["logging"] = False
            results[0].tracked_values = [i for i in results[0].tracked_values if not i["field"] == field]
            results[0].tracked_values.append(old_tracked)
            results[0].save()
            event(channels, f"entity.tracked.{haid}", TrackedEntity.from_entity(results[0]).dict())
            return None
        else:
            raise NotFoundException(construct_detail("entity.tracking.invalid_id", f"Entity with id {haid} is not being tracked."))
