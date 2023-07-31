from litestar import Controller, get, post
from litestar.exceptions import *
from util import guard_has_permission, guard_loggedIn, AppState, event, construct_detail
from models import View, ViewField, ViewRange, DataEntry
from pydantic import BaseModel
from litestar.channels import ChannelsPlugin
from typing import Any


class CreateViewModel(BaseModel):
    name: str
    type: str
    fields: list[ViewField]
    range: ViewRange


class ViewModel(BaseModel):
    id: str
    name: str
    type: str
    fields: list[ViewField]
    range: ViewRange

    @classmethod
    def from_view(cls, view: View) -> "ViewModel":
        return ViewModel(
            id=view.id,
            name=view.name,
            type=view.type,
            fields=view.fields,
            range=view.range,
        )
    
class DataEntryModel(BaseModel):
    id: str
    entity: str
    field: str
    value: Any
    time: float

    @classmethod
    def from_entry(cls, entry: DataEntry) -> "DataEntryModel":
        return DataEntryModel(
            id=entry.id,
            entity=entry.entity,
            field=entry.field,
            value=entry.value,
            time=entry.time
        )


class ViewController(Controller):
    path = "/views"
    opt = {"scope": "data", "allowed": ["view", "edit"]}
    guards = [guard_loggedIn, guard_has_permission]

    @post("/", opt={"scope": "data", "allowed": ["edit"]})
    async def create_view(
        self, app_state: AppState, data: CreateViewModel, channels: ChannelsPlugin
    ) -> ViewModel:
        created = View(
            app_state.db,
            name=data.name,
            type=data.type,
            fields=data.fields,
            range=data.range,
        )
        created.save()
        event(channels, "views", {"id": created.id})
        return ViewModel.from_view(created)

    @get("/")
    async def list_views(self, app_state: AppState) -> list[ViewModel]:
        return [
            ViewModel.from_view(View.from_dict(app_state.db, v))
            for v in app_state.db[View.collection_name].find()
        ]
    
    @get("/{view:str}/data")
    async def get_view_data(self, app_state: AppState, view: str) -> list[DataEntryModel]:
        loaded_view: View = View.load_id(app_state.db, view)
        if not loaded_view:
            raise NotFoundException(construct_detail("view.not_found", message="View not found"))
        return [DataEntryModel.from_entry(d) for d in loaded_view.get_view_data()]
