from litestar.channels import ChannelsPlugin
from litestar import Litestar
from lowhass import HASS
import asyncio
from util import event

async def hass_websocket_manager(app: Litestar, channels: ChannelsPlugin, loop: asyncio.AbstractEventLoop):
    def state_handler(data):
        event(channels, "states", data)

    while True:
        if app.state.home_assistant:
            _hass: HASS = app.state.home_assistant
            _addr = _hass.address
            _token = _hass.token
            _hass.ws.handlers = [
                {
                    "type": "event",
                    "event": "state_changed",
                    "function": state_handler
                }
            ]
            task: asyncio.Task = loop.create_task(_hass.ws.run())
            while app.state.home_assistant and app.state.home_assistant.address == _addr and app.state.home_assistant.token == _token:
                await asyncio.sleep(0.1)
            task.cancel()
        await asyncio.sleep(1)