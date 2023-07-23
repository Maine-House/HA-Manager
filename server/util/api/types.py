from typing import *

class EntityDataContext(TypedDict):
    id: str
    parent_id: Union[str, None]
    user_id: Union[str, None]

class EntityData(TypedDict):
    entity_id: str
    state: str
    attributes: dict[str, Any]
    last_changed: Optional[str]
    last_updated: Optional[str]
    context: Optional[EntityDataContext]

class AreaData(TypedDict):
    id: str
    name: str
    entities: list[str]
    devices: list[str]

class Config(TypedDict):
    components: list[str]
    config_dir: str
    config_source: str
    elevation: float
    latitude: float
    longitude: float
    location_name: str
    time_zone: str
    unit_system: dict[str, str]
    version: str
    whitelist_external_dirs: list[str]
    allowlist_external_dirs: list[str]
    allowlist_external_urls: list[str]
    state: str
    external_url: Union[str, None]
    internal_url: Union[str, None]
    currency: str
    country: str
    language: str
