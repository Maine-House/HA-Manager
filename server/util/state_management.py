from typing import Any, Union
from pymongo.database import Database
from pymongo.collection import Collection
from lowhass import HASS
from litestar.datastructures import State


class AppState:
    def __init__(self, data: dict[str, Any]):
        self.db: Union[Database, None] = data.get("db", None)
        self.home_assistant: Union[HASS, None] = data.get(
            "home_assistant", None
        )

    def collection(self, name: str) -> Collection:
        if self.db:
            return self.db[name]
        else:
            raise RuntimeError("DB not initialized")


async def dep_app_state(state: State) -> AppState:
    return AppState(state.dict())
