import requests
import typing
import datetime
from .types import *
import json

class HAException(Exception):
    def __init__(self, status: int, reason: str, *args: object) -> None:
        super().__init__(*args)
        self.status = status
        self.reason = reason
    
    def __str__(self) -> str:
        return f"HomeAssistant Exception:\n\tCode: {self.status}\n\tReason: {self.reason}"

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
    
    @property
    def area_id(self) -> typing.Union[str, None]:
        raw_resp = self.ha.call_template(f"area_id('{self.entity_id}')")
        return raw_resp.strip("'")

class Area:
    def __init__(self, ha: "HomeAssistant", data: AreaData) -> None:
        self.ha = ha
        self.data = data

    @property
    def id(self) -> str:
        return self.data["id"]
    
    @property
    def name(self) -> str:
        return self.data["name"]
    
    @property
    def entity_ids(self) -> list[str]:
        return self.data["entities"]
    
    @property
    def device_ids(self) -> list[str]:
        return self.data["devices"]
    
    def entities(self) -> dict[str, Entity]:
        return {k: v for k, v in self.ha.entities().items() if k in self.entity_ids}

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
        
    def entity(self, entity_id: str) -> typing.Union[Entity, None]:
        response = self.session.get(self.url(f"/states/{entity_id}"))
        if response.status_code == 200:
            return Entity(self, response.json())
        else:
            raise HAException(response.status_code, response.text)
    
    def call_template(self, template_function: str) -> typing.Any:
        response = self.session.post(self.url("/template"), json={"template": "{{ "+template_function+" }}"})
        if response.status_code == 200:
            return response.text
        else:
            raise HAException(response.status_code, response.text)
    
    def mapped_template(self, mapping: dict[str, str]) -> dict[str, str]:
        template = "&".join([k + "={{ " + v + " }}" for k, v in mapping.items()])
        response = self.session.post(self.url("/template"), json={"template": template})
        if response.status_code == 200:
            items = {}
            for item in response.text.split("&"):
                try:
                    items[item.split("=", maxsplit=1)[0]] = eval(item.split("=", maxsplit=1)[1])
                except:
                    items[item.split("=", maxsplit=1)[0]] = item.split("=", maxsplit=1)[1]
            return items
        else:
            raise HAException(response.status_code, response.text)
    
    def area_ids(self) -> list[str]:
        return json.loads(self.call_template("areas()").replace("'", '"'))
    
    def areas(self) -> dict[str, Area]:
        ids = self.area_ids()
        template_map = {}
        for i in ids:
            template_map[f"{i}.name"] = f"area_name('{i}')"
            template_map[f"{i}.entities"] = f"area_entities('{i}')"
            template_map[f"{i}.devices"] = f"area_devices('{i}')"
        raw_output = self.mapped_template(template_map)
        mapped_output = {}
        for k, v in raw_output.items():
            if not k.split(".")[0] in mapped_output.keys():
                mapped_output[k.split(".")[0]] = {}
            mapped_output[k.split(".")[0]][k.split(".")[1]] = v

        return {k: Area(self, dict(**v, id=k)) for k, v in mapped_output.items()}
                
    
    def area(self, name: str) -> Area:
        raw_output = self.mapped_template({"name": f"area_name('{name}')", "entities": f"area_entities('{name}')", "devices": f"area_devices('{name}')"})
        raw_output["id"] = name
        return Area(self, raw_output)