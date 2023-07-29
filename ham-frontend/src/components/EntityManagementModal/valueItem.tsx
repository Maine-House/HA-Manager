import {
    Card,
    Stack,
    Group,
    Title,
    Button,
    Badge,
    Text,
    Paper,
    TextInput,
    Select,
    ActionIcon,
} from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    MdStar,
    MdDeveloperBoard,
    MdBarChart,
    MdCancel,
    MdSave,
} from "react-icons/md";
import {
    Entity,
    TrackedEntity,
    TrackedFieldType,
    TrackedFieldTypeArguments,
} from "../../types/entity";
import { useApi } from "../../util/api/func";
import { BasicState } from "../../util/events";
import { guessFieldType, ValueRenderer } from "../entities/entityUtils";

function FieldTypeInput({
    field,
    type,
    onSubmit,
}: {
    field: string;
    type: TrackedFieldType;
    onSubmit: (type: TrackedFieldType) => void;
}) {
    const [selected, setSelected] = useState(type.type);
    const [fields, updateFields] = useState<{ [key: string]: string }>({});

    const refreshFields = useCallback(() => {
        setSelected(type.type);
        updateFields(() => {
            const newFields: { [key: string]: string } = {};
            for (const field of TrackedFieldTypeArguments[type.type]) {
                newFields[field.argument] = (type as any)[field.argument];
            }
            return newFields;
        });
    }, [type.type, type.field]);

    useEffect(refreshFields, [type.type, type.field]);

    return (
        <Paper p="sm">
            <Stack spacing="md">
                <Group position="apart">
                    <Text fw={600}>Field Type</Text>
                    <Group spacing="sm">
                        <ActionIcon
                            color="red"
                            variant="filled"
                            onClick={refreshFields}
                        >
                            <MdCancel />
                        </ActionIcon>
                        <ActionIcon
                            variant="filled"
                            color="primary"
                            onClick={() =>
                                onSubmit({
                                    type: selected,
                                    field: field,
                                    ...fields,
                                } as any)
                            }
                        >
                            <MdSave />
                        </ActionIcon>
                    </Group>
                </Group>
                <Select
                    value={selected}
                    onChange={(value) =>
                        value && setSelected(value as TrackedFieldType["type"])
                    }
                    data={[
                        {
                            value: "boolean",
                            label: "True or False",
                        },
                        {
                            value: "measurement",
                            label: "Measurement",
                        },
                        {
                            value: "string",
                            label: "Text",
                        },
                        {
                            value: "metadata",
                            label: "Entity Metadata",
                        },
                        {
                            value: "unit",
                            label: "Unit",
                        },
                        {
                            value: "generic",
                            label: "Generic Data",
                        },
                        {
                            value: "json",
                            label: "JSON",
                        },
                        {
                            value: "timestamp",
                            label: "Date/Time",
                        },
                        {
                            value: "location",
                            label: "Latitude/Longitude",
                        },
                    ]}
                    label="Data Type"
                />
                {TrackedFieldTypeArguments[selected]?.map((arg, i) =>
                    arg.type === "string" ? (
                        <TextInput
                            key={i}
                            value={fields[arg.argument]}
                            onChange={(event) =>
                                updateFields((uf) => ({
                                    ...uf,
                                    [arg.argument]: event.target.value,
                                }))
                            }
                            label={arg.label}
                        />
                    ) : (
                        <Select
                            key={i}
                            clearable={false}
                            value={fields[arg.argument]}
                            onChange={(value) =>
                                updateFields((uf) => ({
                                    ...uf,
                                    [arg.argument]: value ?? uf[arg.argument],
                                }))
                            }
                            label={arg.label}
                            data={arg.options}
                        />
                    )
                )}
            </Stack>
        </Paper>
    );
}

export function EntityValue({
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
    const { post, del } = useApi();
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
            return (
                tracked?.tracked_values.find(
                    (entityField) => entityField.field === field
                ) ?? guessFieldType(field, updatedState ?? entity)
            );
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
        tracked?.tracked_values,
    ]);

    return (
        <Card className="entity-field" shadow="sm">
            <Stack spacing="md">
                <Group spacing="sm" position="apart">
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
                    {isTracked ? (
                        <Button
                            variant="subtle"
                            color="red"
                            leftIcon={<MdBarChart size={20} />}
                            onClick={() =>
                                del<null>(
                                    `/ha/entities/tracked/${entity.id}/values/${field}`
                                )
                            }
                        >
                            Stop Logging
                        </Button>
                    ) : (
                        <Button
                            variant="subtle"
                            color="green"
                            leftIcon={<MdBarChart size={20} />}
                            onClick={() =>
                                post<TrackedEntity>(
                                    `/ha/entities/tracked/${entity.id}/values`,
                                    { data: typeData }
                                )
                            }
                        >
                            Start Logging
                        </Button>
                    )}
                </Group>
                <Group spacing="sm" position="apart">
                    <Text>Value:</Text>
                    <ValueRenderer
                        entity={updatedState ?? entity}
                        value={fieldValue}
                        type={typeData}
                    />
                </Group>
                {isTracked ? (
                    <FieldTypeInput
                        type={typeData}
                        onSubmit={(type) =>
                            post<TrackedEntity>(
                                `/ha/entities/tracked/${entity.id}/values`,
                                { data: type }
                            )
                        }
                        field={field}
                    />
                ) : (
                    <Group spacing="sm" position="apart">
                        <Text>Type:</Text>
                        <Badge variant="dot">{typeData.type}</Badge>
                    </Group>
                )}
            </Stack>
        </Card>
    );
}
