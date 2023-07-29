import {
    Badge,
    Card,
    Group,
    Modal,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { Entity, TrackedEntity, TrackedFieldType } from "../../types/entity";
import "./emm.scss";
import { MdDeveloperBoard, MdSettings, MdStar } from "react-icons/md";
import { BasicState, useEntityState } from "../../util/events";
import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../util/api/func";
import { ValueRenderer, guessFieldType } from "../entities/entityUtils";

function EntityValue({
    field,
    entity,
    updatedState,
    tracked,
}: {
    field: string | "state";
    entity: Entity;
    updatedState: BasicState | null;
    tracked: TrackedEntity | null;
}) {
    const fieldValue = useMemo(
        () =>
            field === "state"
                ? updatedState?.state ?? entity.state
                : updatedState?.attributes[field] ??
                  entity.attributes[field] ??
                  null,
        [
            updatedState?.state,
            entity.state,
            updatedState?.attributes[field],
            field,
            entity.attributes[field],
        ]
    );
    const isTracked = useMemo(
        () =>
            tracked
                ? tracked.tracked_values.find(
                      (entityField) => entityField.field === field
                  )
                    ? true
                    : false
                : false,
        [tracked?.tracked_values]
    );

    const typeData: TrackedFieldType = useMemo(() => {
        if (isTracked) {
            return {
                field,
                type: "generic",
            };
        } else {
            return guessFieldType(field, updatedState ?? entity);
        }
    }, [
        isTracked,
        fieldValue,
        field,
        entity,
        updatedState?.state,
        entity.state,
        updatedState?.attributes[field],
        entity.attributes[field],
    ]);

    return (
        <Card className="entity-field">
            <Stack spacing="md">
                <Group spacing="sm">
                    {field === "state" ? (
                        <MdStar size={20} />
                    ) : (
                        <MdDeveloperBoard size={20} />
                    )}
                    <Title order={4}>
                        {field === "state" ? "State" : field}
                    </Title>
                </Group>
                <Group spacing="sm" position="apart">
                    <Text>Value:</Text>
                    <ValueRenderer
                        entity={updatedState ?? entity}
                        value={fieldValue}
                        type={typeData}
                    />
                </Group>
                <Group spacing="sm" position="apart">
                    <Text>Type:</Text>
                    <Badge variant="dot">{typeData.type}</Badge>
                </Group>
            </Stack>
        </Card>
    );
}

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
