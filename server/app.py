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

from controllers import *

client = MongoClient(os.getenv("MONGO_ADDR"))


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
    route_handlers=[root, HomeAssistantController],
    dependencies={"app_state": Provide(dep_app_state)},
    state=State(
        {
            "db": client[os.getenv("MONGO_DATABASE", "ham")],
            "home_assistant": HomeAssistant(
                os.environ["HA_ADDR"], os.environ["HA_TOKEN"]
            ),
        }
    ),
    exception_handlers={HTTP_500_INTERNAL_SERVER_ERROR: internal_exc_handler},
)
