from models import Session, UserConfigEntry
from litestar.connection import ASGIConnection
from litestar.handlers.base import BaseRouteHandler
from litestar.exceptions import *
from .error_functions import construct_detail

def guard_hasSession(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    if not "Authorization" in connection.headers.keys():
        raise ValidationException(construct_detail("auth.session.not_present", message="Authorization header is required but not included."))
    if connection.headers["Authorization"] == "null":
        raise PermissionDeniedException(construct_detail("auth.session.empty", message="A session token is required to access this endpoint."))
    session: Session = Session.load_id(connection.app.state.db, connection.headers["Authorization"])
    if session == None:
        raise NotAuthorizedException(construct_detail("auth.session.invalid", message="Invalid session token."))
    if not session.active:
        session.destroy()
        raise NotAuthorizedException(construct_detail("auth.session.invalid", message="Invalid session token."))
    session.update()

def guard_loggedIn(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    session: Session = Session.load_id(connection.app.state.db, connection.headers["Authorization"])
    if not session.uid:
        raise NotAuthorizedException(construct_detail("auth.user.logged_out", message="You must be logged in to access this endpoint."))