from pymongo.database import Database
from util.model import ORM
from typing import Any, Literal, TypedDict
import time


class DataEntry(ORM):
    collection_name = "data"

    def __init__(
        self,
        db: Database,
        id: str = None,
        entity: str = None,
        field: str = None,
        time: float = 0,
        value: Any = None,
        **kwargs
    ):
        super().__init__(db, id, **kwargs)
        self.entity = entity
        self.field = field
        self.time = time
        self.value = value

    @classmethod
    def load_data(
        cls,
        db: Database,
        entity: str,
        field: str = None,
        start: float = -1,
        end: float = -1,
    ) -> list["DataEntry"]:
        query = {"entity": entity}
        if field:
            query["field"] = field
        if start > -1 or end > -1:
            query["time"] = {}

            if start > -1:
                query["time"]["$gte"] = start
            if end > -1:
                query["time"]["$lte"] = end

        return [DataEntry.from_dict(db, i) for i in db[cls.collection_name].find(query)]

    @classmethod
    def create(cls, db: Database, entity: str, field: str, value: Any) -> "DataEntry":
        entry = DataEntry(db, entity=entity, field=field, time=time.time(), value=value)
        entry.save()
        return entry


VIEW_DATA_TYPE = Literal["linear", "frequency", "valueTime"]


class ViewField(TypedDict):
    entity: str
    field: str
    name: str
    color: str


class ViewRange(TypedDict):
    mode: Literal["delta", "absolute"]
    start: float
    end: float
    resolution: float


class View(ORM):
    collection_name = "views"

    def __init__(
        self,
        db: Database,
        id: str = None,
        name: str = None,
        type: VIEW_DATA_TYPE = "valueTime",
        fields: list[ViewField] = [],
        range: ViewRange = None,
        **kwargs
    ):
        super().__init__(db, id, **kwargs)
        self.name = name
        self.type = type
        self.fields = fields
        self.range = range

    def get_view_data(self) -> list[DataEntry]:
        entities = [f["entity"] for f in self.fields]
        fields = [f["field"] for f in self.fields]
        start = (
            self.range["start"]
            if self.range["mode"] == "absolute"
            else time.time() + self.range["start"]
        )
        end = (
            self.range["end"]
            if self.range["mode"] == "absolute"
            else time.time() + self.range["end"]
        )
        full_results: list[DataEntry] = sorted(
            DataEntry.load(
                self.db,
                {
                    "entity": {"$in": entities},
                    "field": {"$in": fields},
                    "time": {"$lte": end, "$gte": start},
                },
            ),
            key=lambda e: e.time,
        )
        resolution_pointers = {f["entity"] + ":" + f["field"]: 0 for f in self.fields}
        pruned_results: list[DataEntry] = []
        for r in full_results:
            if (
                resolution_pointers[r.entity + ":" + r.field] + self.range["resolution"]
                < r.time
            ):
                resolution_pointers[r.entity + ":" + r.field] = r.time
                pruned_results.append(r)
        return sorted(pruned_results, key=lambda e: e.time)
