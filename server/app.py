import asyncio
from dotenv import load_dotenv

load_dotenv()
import os
from util import dep_app_state
from lowhass import HASS
from litestar import Litestar, MediaType, Request, Response, get
from litestar.di import Provide
from litestar.status_codes import *
from litestar.datastructures import State
from pymongo.mongo_client import MongoClient
import time
import logging
from models import CoreConfigEntry
from litestar.channels import ChannelsPlugin
from litestar.channels.backends.memory import MemoryChannelsBackend

from controllers import *
from tasks import *

client = MongoClient(os.getenv("MONGO_ADDR"))
database = client[os.getenv("MONGO_DATABASE", "ham")]
channels = ChannelsPlugin(
    channels=["events"],
    backend=MemoryChannelsBackend(),
    subscriber_max_backlog=10000,
    subscriber_backlog_strategy="dropleft"
)

try:
    config = CoreConfigEntry.load(database)
except:
    config = None


@get("/")
async def root() -> dict:
    return {"time": time.ctime()}


def internal_exc_handler(request: Request, exc: Exception) -> Response:
    logging.exception("Error encountered:\n")
    return Response(
        media_type=MediaType.TEXT,
        content=f"server error: {exc}",
        status_code=500,
    )

async def start_tasks(app: Litestar):
    loop = asyncio.get_event_loop()
    loop.create_task(task_check_status(app, channels))
    loop.create_task(hass_websocket_manager(app, channels, loop))

app = Litestar(
    route_handlers=[root, ConfigController, AuthController, AccountController, EventController, HAController],
    dependencies={"app_state": Provide(dep_app_state)},
    state=State(
        {
            "db": client[os.getenv("MONGO_DATABASE", "ham")],
            "home_assistant": HASS(config.home_assistant_address, config.home_assistant_token) if config else None,
        }
    ),
    exception_handlers={HTTP_500_INTERNAL_SERVER_ERROR: internal_exc_handler},
    plugins=[channels],
    on_startup=[start_tasks]
)
