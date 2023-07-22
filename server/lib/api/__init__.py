import requests
import typing
import datetime

class HAException(Exception):
    def __init__(self, status: int, reason: str, *args: object) -> None:
        super().__init__(*args)
        self.status = status
        self.reason = reason
    
    def __str__(self) -> str:
        return f"HomeAssistant Exception:\n\tCode: {self.status}\n\tReason: {self.reason}"

class EntityDataContext(typing.TypedDict):
    id: str
    parent_id: typing.Union[str, None]
    user_id: typing.Union[str, None]

class EntityData(typing.TypedDict):
    entity_id: str
    state: str
    attributes: dict[str, typing.Any]
    last_changed: typing.Optional[str]
    last_updated: typing.Optional[str]
    context: typing.Optional[EntityDataContext]

class Entity:
    def __init__(self, ha: "HomeAssistant", data: EntityData):
        self.ha = ha
        self.data = data

    @property
    def entity_id(self) -> str:
        return self.data["entity_id"]
    
    @property
    def unique_id(self) -> typing.Union[str, None]:
        return self.data["context"]["id"] if "context" in self.data.keys() else None

    @property
    def state(self) -> str:
        return self.data["state"]

    @property
    def attributes(self) -> dict[str, typing.Any]:
        return self.data["attributes"]
    
    @property
    def last_changed(self) -> typing.Union[None, datetime.datetime]:
        return datetime.datetime.fromisoformat(self.data["last_changed"]) if "last_changed" in self.data.keys() else None
    
    @property
    def last_updated(self) -> typing.Union[None, datetime.datetime]:
        return datetime.datetime.fromisoformat(self.data["last_updated"]) if "last_updated" in self.data.keys() else None
    
    @property
    def type(self) -> str:
        return self.entity_id.split(".", maxsplit=1)[0]
    
    @property
    def name(self) -> str:
        return self.entity_id.split(".", maxsplit=1)[1]

class HomeAssistant:
    def __init__(self, address: str, token: str, https: bool = False):
        self.session = requests.Session()
        self.session.headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        self.address = address
        self.root = f"{'https' if https else 'http'}://{self.address}/api"
    
    def url(self, endpoint: str) -> str:
        return self.root + endpoint
    
    def entities(self) -> dict[str, Entity]:
        response = self.session.get(self.url("/states"))
        if response.status_code == 200:
            return {entity["entity_id"]:Entity(self, entity) for entity in response.json()}
        else:
            raise HAException(response.status_code, response.text)