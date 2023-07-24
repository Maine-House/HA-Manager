from models import Session, UserConfigEntry
from litestar import Controller, get, post
from litestar.exceptions import *
from litestar.datastructures import Headers
from litestar.di import Provide
from util import (
    AppState,
    guard_hasSession,
    depends_session,
    depends_user,
    guard_loggedIn,
    construct_detail,
)
from pydantic import BaseModel
from typing import Union


class TokenResponse(BaseModel):
    token: str
    uid: Union[str, None]


class LoginModel(BaseModel):
    username: str
    password: str


class UserModel(BaseModel):
    id: str
    username: str

    @classmethod
    def from_entry(cls, entry: UserConfigEntry):
        return UserModel(username=entry.username, id=entry.id)


class AuthController(Controller):
    path = "/auth"

    @get("/token")
    async def get_token(self, app_state: AppState, headers: Headers) -> TokenResponse:
        session: Session = None
        if "Authorization" in headers.keys() and headers["Authorization"] != "null":
            session = Session.load_id(app_state.db, headers["Authorization"])
        if not session:
            session = Session(app_state.db)
        session.update()
        return TokenResponse(token=session.id, uid=session.uid)

    @get(
        "/me",
        guards=[guard_hasSession, guard_loggedIn],
        dependencies={
            "session": Provide(depends_session),
            "user": Provide(depends_user),
        },
    )
    async def get_self(self, user: UserConfigEntry) -> UserModel:
        return UserModel.from_entry(user)

    @post(
        "/login",
        guards=[guard_hasSession],
        dependencies={"session": Provide(depends_session)},
    )
    async def login(self, session: Session, data: LoginModel) -> UserModel:
        result = session.login(data.username, data.password)
        if not result:
            raise NotFoundException(
                construct_detail(
                    "auth.login.invalid", "Username or password is incorrect."
                )
            )
        return UserModel.from_entry(result)

    @post(
        "/logout",
        guards=[guard_hasSession, guard_loggedIn],
        dependencies={"session": Provide(depends_session)},
    )
    async def logout(self, session: Session) -> None:
        session.logout()
        return None
