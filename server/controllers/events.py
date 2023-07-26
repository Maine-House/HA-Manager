from litestar import Controller, get, Request
from util import guard_hasSession, depends_session, ASGISourceResponse, EventSourceResponse, Session
import asyncio
import time
from litestar.channels import ChannelsPlugin
from litestar.di import Provide

class EventController(Controller):
    path = "/events"

    @get("/", guards=[guard_hasSession], dependencies={"session": Provide(depends_session)})
    async def test_events(self, request: Request, channels: ChannelsPlugin, session: Session) -> EventSourceResponse:
        async def sub_events():
            subscriber = await channels.subscribe(["events"])
            try:
                async for message in subscriber.iter_events():
                    yield message.decode()
            finally:
                await channels.unsubscribe(subscriber)
        
        return ASGISourceResponse(sub_events(), request)