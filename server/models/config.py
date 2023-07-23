import os
from pymongo.database import Database
from util import ORM
from typing import *
import time
import datetime
import hashlib

CONFIG_GROUP = Literal["core", "user"]
HASH_ITERS = 500000

class ConfigEntry(ORM):
    collection_name = "config"

    def __init__(
        self,
        db: Database,
        id: str = None,
        group: CONFIG_GROUP = None,
        last_update: float = 0,
        **kwargs
    ):
        super().__init__(db, id, **kwargs)
        self.group = group
        self.last_update = last_update

    @property
    def last_update_datetime(self) -> datetime.datetime:
        return datetime.datetime.fromtimestamp(self.last_update)

    def save(self):
        self.last_update = time.time()
        return super().save()


class CoreConfigEntry(ConfigEntry):
    def __init__(
        self, 
        db: Database, 
        last_update: float = 0,
        initialized: bool = False,
        home_assistant_address: str = None,
        home_assistant_token: str = None,
        location_name: str = "",
        **kwargs
    ):
        super().__init__(db, "core", "core", last_update, **kwargs)
        self.initialized = initialized
        self.home_assistant_address = home_assistant_address
        self.home_assistant_token = home_assistant_token
        self.location_name = location_name

    @classmethod
    def load(cls, db: Database) -> "CoreConfigEntry":
        return super().load(db, {"id": "core"})[0]

class UserConfigEntry(ConfigEntry):
    def __init__(
        self, 
        db: Database, 
        id: str = None, 
        last_update: float = 0, 
        username: str = "",
        password_hash: str = "",
        password_salt: str = "",
        **kwargs
    ):
        super().__init__(db, id, "user", last_update, **kwargs)
        self.username = username
        self.password_hash = password_hash
        self.password_salt = password_salt
    
    @classmethod
    def create(cls, db: Database, username: str, password: str) -> "UserConfigEntry":
        existing = cls.load(db, {"username": username})
        if len(existing) > 0:
            raise RuntimeError("User exists")
        salt = os.urandom(32)
        hashed_password = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, HASH_ITERS).decode()
        return UserConfigEntry(db, last_update=time.time(), username=username, password_hash=hashed_password, password_salt=salt.decode())
    
    @classmethod
    def load_username(cls, db: Database, username: str) -> "UserConfigEntry":
        return cls.load(db, {"username": username})[0]
    
    def verify(self, password: str) -> bool:
        hashed_password = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), self.password_salt.encode("utf-8"), HASH_ITERS).decode()
        return hashed_password == self.password_hash
    

