from requests import post
from dotenv import load_dotenv
load_dotenv()
import os
from util import HomeAssistant, dep_app_state
from litestar import Litestar, get
from litestar.di import Provide
from pymongo.mongo_client import MongoClient
import time

client = MongoClient(os.getenv("MONGO_ADDR"))

@get("/")
async def root() -> dict:
    return {"time": time.ctime()}

app = Litestar(route_handlers=[root], dependencies={"app_state": Provide(dep_app_state)}, state={
    "db": client[os.getenv("MONGO_DATABASE", "ham")],
    "home_assistant": HomeAssistant(os.environ["HA_ADDR"], os.environ["HA_TOKEN"])
})