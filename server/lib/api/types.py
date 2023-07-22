import typing

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

class AreaData(typing.TypedDict):
    id: str
    name: str
    entities: list[str]
    devices: list[str]