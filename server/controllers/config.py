from models import CoreConfigEntry, UserConfigEntry, Session, PERMISSION_SCOPES_ARRAY
from litestar import Controller, get, post
from litestar.datastructures import State
from litestar.di import Provide
from litestar.exceptions import *
from util import AppState, guard_hasSession, depends_session, construct_detail, guard_has_permission, HomeAssistant
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
    
class FullConfigModel(BaseModel):
    initialized: bool
    homeassistant_address: Union[str, None]
    homeassistant_token: Union[str, None]
    location_name: Union[str, None]

    @classmethod
    def from_entry(cls, entry: CoreConfigEntry):
        return FullConfigModel(initialized=entry.initialized, homeassistant_address=entry.home_assistant_address, location_name=entry.location_name, homeassistant_token=entry.home_assistant_token)

class SetupModel(BaseModel):
    location_name: str
    ha_address: str
    ha_token: str
    username: str
    password: str

class UpdateConfigModel(BaseModel):
    homeassistant_address: str
    homeassistant_token: str
    location_name: str

class ConfigController(Controller):
    path = "/config"
    guards = [guard_hasSession]
    dependencies = {"session": Provide(depends_session)}

    @get("/")
    async def get_core_config(self, app_state: AppState) -> ConfigModel:
        try:
            return ConfigModel.from_entry(CoreConfigEntry.load(app_state.db))
        except:
            return ConfigModel(initialized=False, homeassistant_address=None, location_name=None)
    
    @post("/setup")
    async def setup_configuration(self, app_state: AppState, data: SetupModel, session: Session) -> ConfigModel:
        try:
            currentConfig = CoreConfigEntry.load(app_state.db)
        except IndexError:
            currentConfig = ConfigModel(initialized=False, homeassistant_address=None, location_name=None)
        if currentConfig.initialized:
            raise MethodNotAllowedException(construct_detail("config.setup.done", message="Configuration is already initialized."))
        new_core = CoreConfigEntry(app_state.db, time.time(), True, data.ha_address, data.ha_token, data.location_name)
        new_user = UserConfigEntry.create(app_state.db, data.username, data.password)
        new_user.permissions = {p: "edit" for p in PERMISSION_SCOPES_ARRAY}
        new_core.save()
        new_user.save()
        session.uid = new_user.id
        session.update()
        return ConfigModel.from_entry(new_core)
    
    @get("/full", guards=[guard_has_permission], opt={"scope": "settings", "allowed": ["view", "edit"]})
    async def get_full_config(self, app_state: AppState) -> FullConfigModel:
        cfg = CoreConfigEntry.load(app_state.db)
        return FullConfigModel.from_entry(cfg)
    
    @post("/full", guards=[guard_has_permission], opt={"scope": "settings", "allowed": ["edit"]})
    async def update_config(self, app_state: AppState, data: UpdateConfigModel, state: State) -> FullConfigModel:
        cfg = CoreConfigEntry.load(app_state.db)
        cfg.location_name = data.location_name
        cfg.home_assistant_address = data.homeassistant_address
        cfg.home_assistant_token = data.homeassistant_token
        state.home_assistant = HomeAssistant(data.homeassistant_address, data.homeassistant_token)
        cfg.save()
        return FullConfigModel.from_entry(cfg)