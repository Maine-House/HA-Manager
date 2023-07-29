import { Group, Modal, Text } from "@mantine/core";
import { Entity } from "../../types/entity";
import "./emm.scss";
import { MdSettings } from "react-icons/md";
import { useEntityState } from "../../util/events";

export function EntityManagementModal({
    open,
    setOpen,
    entity,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    entity: Entity;
}) {
    const entityState = useEntityState(entity.id);
    console.log(entityState);
    return (
        <Modal
            className="entity-management-modal"
            size="100%"
            opened={open}
            onClose={() => setOpen(false)}
            title={
                <Group spacing="md">
                    <MdSettings size={24} />
                    <Text fw="500">{entity.name}</Text>
                </Group>
            }
        ></Modal>
    );
}
