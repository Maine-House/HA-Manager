from sse_starlette.sse import EventSourceResponse
from starlette.requests import Request
from httpagentparser import detect
import json
from litestar.channels import ChannelsPlugin


"""async def _flush(request: Request):
    await request.send(
        {
            "type": "http.response.body",
            "body": f": {'.' * 2048 ** 2}\n\n".encode(),
            "more_body": True,
        }
    )"""

__all__ = ["ASGISourceResponse"]


def ASGISourceResponse(generator, request: Request, **kwargs) -> EventSourceResponse:
    async def _publisher(request: Request):
        ua = detect(request.headers["User-Agent"], fill_none=True)
        try:
            yield json.dumps({"event": None})
            if (
                ua["browser"]
                and ua["browser"]["name"]
                and ua["browser"]["name"].lower() == "firefox"
            ):
                pass
            async for event in generator:
                if not request.is_connected:
                    break
                yield event
        except Exception as e:
            raise e

    return EventSourceResponse(
        _publisher(request),
        headers={"Cache-Control": "public, max-age=29, no-transform"},
        media_type="text/event-stream;charset=utf-8",
        **kwargs
    )

def event(channels: ChannelsPlugin, event_type: str, event_data: dict):
    channels.publish(dict(EventType=event_type, **event_data), ["events"])