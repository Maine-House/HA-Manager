from util import event
from asyncio import sleep
from litestar import Litestar
from litestar.channels import ChannelsPlugin
from lowhass import HASS

async def task_check_status(app: Litestar, channels: ChannelsPlugin):
    while True:
        if app.state.home_assistant:
            hass: HASS = app.state.home_assistant
            try:
                status = {
                    "online": True,
                    "config": hass.rest.get_config().dict()
                }
            except Exception as exc:
                status = {
                    "online": False,
                    "error": {
                        "code": exc.status,
                        "description": exc.reason
                    }
                }
        else:
            status = {
                "online": False,
                "error": {
                    "code": 0,
                    "description": "Not initialized"
                }
            }
        event(channels, "ha_status", status)
        await sleep(15)