from litestar import Controller, get
from util import AppState
from litestar.exceptions import NotFoundException
from pydantic import BaseModel
from datetime import datetime
from typing import *


class HomeAssistantController(Controller):
    path = "/ha"

    
