import os
from pydantic import BaseModel
from pymongo.database import Database
from util import ORM
from typing import *
import time
import datetime
import hashlib

CONFIG_GROUP = Literal["core", "user"]
HASH_ITERS = 500000

PERMISSION_TYPES = Literal["disabled", "view", "edit"]
PERMISSION_SCOPES_ARRAY = ["data", "settings", "accounts", "areas", "rules"]
PERMISSION_SCOPES = Literal["data", "settings", "accounts", "areas", "rules"]
USER_PERMISSIONS = dict[PERMISSION_SCOPES, PERMISSION_TYPES]


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
        super().__init__(db, "core", "core", last_update)
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
        permissions: USER_PERMISSIONS = {},
        **kwargs
    ):
        super().__init__(db, id, "user", last_update)
        self.username = username
        self.password_hash = password_hash
        self.password_salt = password_salt
        self.permissions = permissions

    @classmethod
    def create(cls, db: Database, username: str, password: str) -> "UserConfigEntry":
        salt = os.urandom(32)
        hashed_password = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt, HASH_ITERS
        ).hex()
        return UserConfigEntry(
            db,
            last_update=time.time(),
            username=username,
            password_hash=hashed_password,
            password_salt=salt.hex(),
            permissions={"data": "view"},
        )

    @classmethod
    def load_username(
        cls, db: Database, username: str
    ) -> Union["UserConfigEntry", None]:
        result = cls.load(db, {"username": username})
        if len(result) == 0:
            return None
        return result[0]

    def verify(self, password: str) -> bool:
        hashed_password = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(self.password_salt),
            HASH_ITERS,
        ).hex()
        return hashed_password == self.password_hash

    @property
    def absolute_permissions(self) -> USER_PERMISSIONS:
        return {
            permission: self.permissions.get(permission, "disabled")
            for permission in PERMISSION_SCOPES_ARRAY
        }

    def permission(self, permission: PERMISSION_SCOPES) -> PERMISSION_TYPES:
        return self.absolute_permissions[permission]
    
    def update_password(self, new_password: str):
        salt = os.urandom(32)
        self.password_hash = hashlib.pbkdf2_hmac(
            "sha256", new_password.encode("utf-8"), salt, HASH_ITERS
        ).hex()
        self.password_salt = salt.hex()
    
class UserModel(BaseModel):
    id: str
    username: str
    permissions: USER_PERMISSIONS

    @classmethod
    def from_entry(cls, entry: UserConfigEntry):
        return UserModel(
            username=entry.username, id=entry.id, permissions=entry.absolute_permissions
        )
