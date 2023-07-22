from requests import post
from dotenv import load_dotenv
load_dotenv()
import os
from lib.api import HomeAssistant

api = HomeAssistant(os.getenv("HA_ADDRESS"), os.getenv("HA_TOKEN"))
print({k: v.state for k, v in api.entities().items()})