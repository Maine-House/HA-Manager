from pymongo.database import Database
from util.model import ORM
from typing import Any
import time

class DataEntry(ORM):
    collection_name = "data"

    def __init__(self, db: Database, id: str = None, entity: str = None, field: str = None, time: float = 0, value: Any = None, **kwargs):
        super().__init__(db, id, **kwargs)
        self.entity = entity
        self.field = field
        self.time = time
        self.value = value

    @classmethod
    def load_data(cls, db: Database, entity: str, field: str = None, start: float = -1, end: float = -1) -> list["DataEntry"]:
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