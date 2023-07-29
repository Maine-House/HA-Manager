import { Group, Modal, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Entity, TrackedEntity } from "../../types/entity";
import "./emm.scss";
import { MdSettings } from "react-icons/md";
import { useEntityState, useEvent } from "../../util/events";
import { useEffect, useState } from "react";
import { useApi } from "../../util/api/func";
import { EntityValue } from "./valueItem";

export function EntityManagementModal({
    open,
    setOpen,
    entity,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    entity: Entity;
}) {
    const { get } = useApi();
    const entityState = useEntityState(entity.id);
    const [tracking, setTracking] = useState<TrackedEntity | null>(null);

    useEffect(() => {
        get<TrackedEntity>(`/ha/entities/tracked/${entity.id}`).then((result) =>
            result.success ? setTracking(result.value) : setTracking(null)
        );
    }, [entity.id, entityState?.entityId, entityState?.state]);

    useEvent<TrackedEntity>(
        `entity.tracking.${entity.id}`,
        `entity.tracked.${entity.id}`,
        setTracking
    );

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
        >
            <Stack spacing={"md"}>
                <Title order={3}>Fields</Title>
                <SimpleGrid
                    cols={3}
                    spacing="sm"
                    breakpoints={[
                        { maxWidth: "lg", cols: 2, spacing: "sm" },
                        { maxWidth: "md", cols: 1, spacing: "sm" },
                    ]}
                >
                    {[
                        "state",
                        ...Object.keys(
                            entityState?.attributes ?? entity.attributes
                        ),
                    ].map((attribute) => (
                        <EntityValue
                            field={attribute}
                            entity={entity}
                            updatedState={entityState}
                            tracked={tracking}
                            key={attribute}
                        />
                    ))}
                </SimpleGrid>
            </Stack>
        </Modal>
    );
}
