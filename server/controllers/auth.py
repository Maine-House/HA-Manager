from models import Session, UserConfigEntry
from litestar import Controller, get, post
from litestar.datastructures import Headers
from util import AppState
from pydantic import BaseModel
from typing import Union

class TokenResponse(BaseModel):
    token: str
    uid: Union[str, None]

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
