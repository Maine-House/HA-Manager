from models import Session, UserConfigEntry, CoreConfigEntry
from util import AppState
from litestar.datastructures import Headers

async def depends_session(app_state: AppState, headers: Headers) -> Session:
    return Session.load_id(app_state.db, headers["Authorization"])

async def depends_user(session: Session) -> UserConfigEntry:
    return session.user

async def depends_config(app_state: AppState) -> CoreConfigEntry:
    try:
        return CoreConfigEntry.load(app_state.db)
    except:
        return None
