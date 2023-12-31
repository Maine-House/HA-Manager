from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import *
from util import (
    guard_hasSession,
    guard_loggedIn,
    depends_session,
    depends_user,
    AppState,
    construct_detail
)
from models import UserConfigEntry, UserModel, PERMISSION_TYPES, PERMISSION_SCOPES
from pydantic import BaseModel

class AccountSettingsModel(BaseModel):
    username: str

class AccountPasswordModel(BaseModel):
    current: str
    new: str

class AccountController(Controller):
    path = "/account"
    guards = [guard_hasSession, guard_loggedIn]
    dependencies = {"session": Provide(depends_session), "user": Provide(depends_user)}

    @get("/me")
    async def get_self(self, user: UserConfigEntry) -> UserModel:
        return UserModel.from_entry(user)
    
    @post("/me/settings")
    async def post_user_settings(self, app_state: AppState, user: UserConfigEntry, data: AccountSettingsModel) -> UserModel:
        existence_check = UserConfigEntry.load_username(app_state.db, data.username)
        if existence_check and existence_check.id != user.id:
            raise MethodNotAllowedException(construct_detail("account.exists", f"Another account with name {data.username} already exists."))
        user.username = data.username
        user.save()
        return UserModel.from_entry(user)
    
    @post("/me/settings/password")
    async def post_update_password(self, user: UserConfigEntry, data: AccountPasswordModel) -> UserModel:
        if not user.verify(data.current):
            raise PermissionDeniedException(construct_detail("auth.login.password", message="Incorrect password entered"))
        user.update_password(data.new)
        user.save()
        return UserModel.from_entry(user)
    
    @get("/me/permissions/{permission:str}")
    async def get_permission(self, user: UserConfigEntry, permission: PERMISSION_SCOPES) -> PERMISSION_TYPES:
        try:
            return user.permission(permission)
        except KeyError:
            raise NotFoundException(construct_detail("account.permission.invalid", message=f"Permission {permission} is not supported."))
