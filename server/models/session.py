from typing import Union
from pymongo.database import Database
from util.model import ORM
from .config import UserConfigEntry
import time


class Session(ORM):
    collection_name = "sessions"
    EXPIRE_TIME = 7 * 24 * 3600 # Time to expire token w/o activity

    def __init__(
        self, 
        db: Database, 
        id: str = None, 
        uid: Union[str, None] = None,
        last_seen: float = 0,
        **kwargs
    ):
        super().__init__(db, id=id)
        self.uid = uid
        self.last_seen = last_seen
    
    @property
    def user(self) -> Union[UserConfigEntry, None]:
        if self.uid:
            return UserConfigEntry.load_id(self.db, self.uid)
        return None
    
    def update(self):
        self.last_seen = time.time()
        self.save()
    
    def login(self, username: str, password: str) -> Union[UserConfigEntry, None]:
        try:
            user = UserConfigEntry.load_username(self.db, username)
        except:
            return None
        
        if user.verify(password):
            self.uid = user.id
            self.update()
            return user
        return None
    
    def logout(self) -> None:
        self.uid = None
        self.update()
    
    @property
    def active(self) -> bool:
        return time.time() <= self.last_seen + self.EXPIRE_TIME