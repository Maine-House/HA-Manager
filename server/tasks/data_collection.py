from litestar import Litestar
from litestar.channels import ChannelsPlugin
from util import event
from lowhass import HASS
from models import DataEntry, EntityConfigEntry
import asyncio

LOG_INTERVAL = 30

async def task_collect_data(app: Litestar, channels: ChannelsPlugin):
    while True:
        try:
            hass: HASS = app.state.home_assistant
            if hass:
                updates = []
                all_states = {i.entity_id:i for i in hass.rest.get_states()}
                tracked_entities = {i.haid:i for i in EntityConfigEntry.all(app.state.db)}

                for eid, entity in tracked_entities.items():
                    for value in entity.tracked_values:
                        if "logging" in value.keys() and value["logging"] and eid in all_states:
                            DataEntry.create(app.state.db, eid, value["field"], (all_states[eid].state if value["field"] == "state" else all_states[eid].attributes[value["field"]]))
                            updates.append(f"{eid}.{value['field']}")
                event(channels, "data", {"updates": updates})
        except SyntaxError:
            pass
        await asyncio.sleep(LOG_INTERVAL)

