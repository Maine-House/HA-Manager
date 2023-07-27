from litestar import Controller, get
from util import AppState, construct_detail
from litestar.exceptions import NotFoundException, MethodNotAllowedException
from pydantic import BaseModel
from datetime import datetime
from typing import *
from lowhass import State


class EntityModel(BaseModel):
    id: str
    name: str
    type: str
    state: str
    attributes: dict[str, Any]
    last_changed: Union[str, None]
    last_updated: Union[str, None]

    @classmethod
    def from_hass(cls, state: State) -> "EntityModel":
        return EntityModel(
            id=state.entity_id,
            name=state.entity_id.split(".", maxsplit=1)[1],
            type=state.entity_id.split(".", maxsplit=1)[0],
            attributes=state.attributes,
            last_changed=state.last_changed.ctime() if state.last_changed else None,
            last_updated=state.last_updated.ctime() if state.last_updated else None,
            state=state.state
        )


class HomeAssistantController(Controller):
    path = "/ha"

    @get("/entities")
    async def get_entities(self, app_state: AppState) -> list[EntityModel]:
        if app_state.home_assistant:
            return [EntityModel.from_hass(s) for s in app_state.home_assistant.rest.get_states()]
        else:
            raise MethodNotAllowedException(construct_detail("ha.not_initialized", message="Home Assistant is not initialized"))
