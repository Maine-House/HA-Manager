from litestar import Controller, get
from util import AppState, Config, Entity, HAException, Area
from litestar.exceptions import NotFoundException
from pydantic import BaseModel
from datetime import datetime
from typing import *


class EntityModel(BaseModel):
    id: str
    name: str
    type: str
    state: str
    attributes: dict[str, Any]
    last_changed: Optional[Union[None, datetime]]
    last_updated: Optional[Union[None, datetime]]
    area: Optional[Union[None, "AreaModel"]]

    @classmethod
    def from_entity(cls, entity: Entity) -> "EntityModel":
        return cls(
            id=entity.entity_id,
            name=entity.name,
            type=entity.type,
            state=entity.state,
            attributes=entity.attributes,
            last_changed=entity.last_changed,
            last_updated=entity.last_updated,
        )
    
    @classmethod
    def from_entity_include_area(cls, entity: Entity) -> "EntityModel":
        if entity.area_id:
            area = AreaModel.from_area(entity.ha.area(entity.area_id))
        else:
            area = None
        return cls(
            id=entity.entity_id,
            name=entity.name,
            type=entity.type,
            state=entity.state,
            attributes=entity.attributes,
            last_changed=entity.last_changed,
            last_updated=entity.last_updated,
            area=area
        )


class AreaModel(BaseModel):
    id: str
    name: str
    entity_ids: list[str]
    device_ids: list[str]

    @classmethod
    def from_area(cls, area: Area) -> "AreaModel":
        return cls(
            id=area.id,
            name=area.name,
            entity_ids=area.entity_ids,
            device_ids=area.device_ids,
        )


class FilledAreaModel(BaseModel):
    id: str
    name: str
    entity_ids: list[str]
    device_ids: list[str]
    entities: dict[str, EntityModel]

    @classmethod
    def from_area(cls, area: Area) -> "FilledAreaModel":
        return cls(
            id=area.id,
            name=area.name,
            entity_ids=area.entity_ids,
            device_ids=area.device_ids,
            entities={
                k: EntityModel.from_entity(v) for k, v in area.entities().items()
            },
        )


class HomeAssistantController(Controller):
    path = "/ha"

    @get("/config")
    async def get_config(self, app_state: AppState) -> Config:
        return app_state.home_assistant.get_config()

    @get("/entities")
    async def get_entities(self, app_state: AppState) -> dict[str, EntityModel]:
        return {
            k: EntityModel.from_entity(v)
            for k, v in app_state.home_assistant.entities().items()
        }

    @get("/entities/{entity:str}")
    async def get_specific_entity(
        self, app_state: AppState, entity: str
    ) -> EntityModel:
        try:
            result = app_state.home_assistant.entity(entity)
            if result and result.data:
                return EntityModel.from_entity_include_area(result)
            raise NotFoundException(f"Entity {entity} not found.")
        except HAException:
            raise NotFoundException(f"Entity {entity} not found.")

    @get("/areas")
    async def get_areas(self, app_state: AppState) -> dict[str, AreaModel]:
        return {
            k: AreaModel.from_area(v)
            for k, v in app_state.home_assistant.areas().items()
        }
    
    @get("/areas/{area:str}")
    async def get_area(self, app_state: AppState, area: str) -> AreaModel:
        try:
            result = app_state.home_assistant.area(area)
            if result and result.data:
                return FilledAreaModel.from_area(result)
            raise NotFoundException(f"Area {area} not found.")
        except HAException:
            raise NotFoundException(f"Area {area} not found.")
    
    @get("/services")
    async def get_services(self, app_state: AppState) -> list:
        return app_state.home_assistant.get_services()
