from models import CoreConfigEntry, UserConfigEntry
from litestar import Controller, get, post
from util import AppState
from typing import *
from pydantic import BaseModel

class ConfigModel(BaseModel):
    initialized: bool
    homeassistant_address: Union[str, None]
    location_name: Union[str, None]

    @classmethod
    def from_entry(cls, entry: CoreConfigEntry):
        return ConfigModel(initialized=entry.initialized, homeassistant_address=entry.home_assistant_address, location_name=entry.location_name)

class ConfigController(Controller):
    path = "/config"

    @get("/")
    async def get_core_config(self, app_state: AppState) -> ConfigModel:
        try:
            return ConfigModel.from_entry(CoreConfigEntry.load(app_state.db))
        except:
            return ConfigModel(initialized=False, homeassistant_address=None, location_name=None)