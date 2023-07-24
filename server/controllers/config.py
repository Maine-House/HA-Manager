from models import CoreConfigEntry, UserConfigEntry
from litestar import Controller, get, post
from litestar.exceptions import *
from util import AppState
from typing import *
from pydantic import BaseModel
import time

class ConfigModel(BaseModel):
    initialized: bool
    homeassistant_address: Union[str, None]
    location_name: Union[str, None]

    @classmethod
    def from_entry(cls, entry: CoreConfigEntry):
        return ConfigModel(initialized=entry.initialized, homeassistant_address=entry.home_assistant_address, location_name=entry.location_name)

class SetupModel(BaseModel):
    location_name: str
    ha_address: str
    ha_token: str
    username: str
    password: str

class ConfigController(Controller):
    path = "/config"

    @get("/")
    async def get_core_config(self, app_state: AppState) -> ConfigModel:
        try:
            return ConfigModel.from_entry(CoreConfigEntry.load(app_state.db))
        except:
            return ConfigModel(initialized=False, homeassistant_address=None, location_name=None)
    
    @post("/setup")
    async def setup_configuration(self, app_state: AppState, data: SetupModel) -> ConfigModel:
        try:
            currentConfig = CoreConfigEntry.load()
        except:
            currentConfig = ConfigModel(initialized=False, homeassistant_address=None, location_name=None)
        
        if currentConfig.initialized:
            raise MethodNotAllowedException(detail="Configuration is already initialized.")
        new_core = CoreConfigEntry(app_state.db, time.time(), True, data.ha_address, data.ha_token, data.location_name)
        new_user = UserConfigEntry.create(app_state.db, data.username, data.password)
        new_core.save()
        new_user.save()
        return ConfigModel.from_entry(new_core)