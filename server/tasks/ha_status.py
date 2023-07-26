from util import HomeAssistant, event, HAException
from asyncio import sleep
from litestar import Litestar
from litestar.channels import ChannelsPlugin

async def task_check_status(app: Litestar, channels: ChannelsPlugin):
    while True:
        if app.state.home_assistant:
            try:
                status = {
                    "online": True,
                    "config": app.state.home_assistant.get_config()
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