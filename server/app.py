from dotenv import load_dotenv

load_dotenv()
import os
from util import HomeAssistant, dep_app_state
from litestar import Litestar, MediaType, Request, Response, get
from litestar.di import Provide
from litestar.status_codes import *
from litestar.datastructures import State
from pymongo.mongo_client import MongoClient
import time
import logging
from models import CoreConfigEntry

from controllers import *

client = MongoClient(os.getenv("MONGO_ADDR"))
database = client[os.getenv("MONGO_DATABASE", "ham")]

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


app = Litestar(
    route_handlers=[root, HomeAssistantController, ConfigController],
    dependencies={"app_state": Provide(dep_app_state)},
    state=State(
        {
            "db": client[os.getenv("MONGO_DATABASE", "ham")],
            "home_assistant": HomeAssistant(config.home_assistant_address, config.home_assistant_token) if config else None,
        }
    ),
    exception_handlers={HTTP_500_INTERNAL_SERVER_ERROR: internal_exc_handler},
)
