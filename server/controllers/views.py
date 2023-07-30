from litestar import Controller, get, post
from util import guard_has_permission, guard_loggedIn, AppState
from models import View, ViewField, ViewRange
from pydantic import BaseModel

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
            range=view.range
        )

class ViewController(Controller):
    path = "/views"
    opt = {"scope": "data", "allowed": ["view", "edit"]}
    guards = [guard_loggedIn, guard_has_permission]

    @post("/", opt={"scope": "data", "allowed": ["edit"]})
    async def create_view(self, app_state: AppState, data: CreateViewModel) -> ViewModel:
        created = View(app_state.db, name=data.name, type=data.type, fields=data.fields, range=data.range)
        created.save()
        return ViewModel.from_view(created)