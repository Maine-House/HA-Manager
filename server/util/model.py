from pymongo.database import Database
from uuid import uuid4
from typing import Any

class ORM:
    collection_name: str

    def __init__(self, db: Database, id: str = None, **kwargs):
        self.db = db
        self.collection = db[self.collection_name]
        self.id = id if id else uuid4().hex

    def to_dict(self) -> dict[str, Any]:
        return {k:v for k, v in self.__dict__.items() if not k in ["collection", "db"]}
    
    @classmethod
    def from_dict(cls, db: Database, data: dict[str, Any]):
        return cls(db, **data)
    
    @classmethod
    def load(cls, db: Database, query: dict) -> list:
        return [cls.from_dict(db, item) for item in db[cls.collection_name].find(query)]
    
    @classmethod
    def load_id(cls, db: Database, id: str):
        result = cls.load(db, {"id": id})
        if len(result) > 0:
            return result[0]
        else:
            return None
    
    def save(self):
        self.collection.replace_one({"id": self.id}, self.to_dict(), upsert=True)
    
    def destroy(self):
        self.collection.delete_one({"id": self.id})
