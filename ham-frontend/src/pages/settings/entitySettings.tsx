import {
    Accordion,
    ActionIcon,
    Button,
    Card,
    Divider,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { MdAdd, MdInfo, MdRefresh, MdSearch, MdSensors } from "react-icons/md";
import { EntityTypeArray, UnmanagedEntityType } from "../../types/entity";
import { useApi } from "../../util/api/func";
import { EntityIcon } from "../../components/entities/entityUtils";
import { modals } from "@mantine/modals";
import { Prism } from "@mantine/prism";

function UnmanagedEntity({ entity }: { entity: UnmanagedEntityType }) {
    return (
        <Card withBorder className="entity unmanaged">
            <Stack spacing="sm">
                <Group spacing="md" position="apart">
                    <EntityIcon type={entity.type} size={24} />
                    <Text fw={600}>{entity.name}</Text>
                    <ActionIcon
                        radius="xl"
                        onClick={() =>
                            modals.open({
                                title: entity.name,
                                children: (
                                    <Stack spacing="xs">
                                        <Divider inset={0} />
                                        <Text fw={600}>Attributes</Text>
                                        <Prism language="json">
                                            {JSON.stringify(
                                                entity.attributes,
                                                undefined,
                                                4
                                            )}
                                        </Prism>
                                    </Stack>
                                ),
                                centered: true,
                            })
                        }
                    >
                        <MdInfo size={24} />
                    </ActionIcon>
                </Group>
                <Paper shadow="sm" p="xs">
                    <Group spacing="sm">
                        <Text fw={600}>State:</Text>
                        <Text fw={300} color="dimmed">
                            {entity.state}{" "}
                            {entity.attributes.unit_of_measurement ??
                                entity.attributes.unit ??
                                ""}
                        </Text>
                    </Group>
                </Paper>
                <Group position="right">
                    <Button leftIcon={<MdAdd size={20} />} variant="light">
                        Track Entity
                    </Button>
                </Group>
            </Stack>
        </Card>
    );
}

export function EntitySettings() {
    const [unmanagedEntities, setUnmanagedEntities] = useState<
        UnmanagedEntityType[]
    >([]);
    const { get } = useApi();
    const [search, setSearch] = useState<string>("");

    function loadEntities() {
        get<{ [key: string]: UnmanagedEntityType }>("/ha/entities").then(
            (result) => {
                if (result.success) {
                    setUnmanagedEntities(
                        Object.values(result.value)
                            .filter(({ type }) =>
                                EntityTypeArray.includes(type)
                            )
                            .map((entity) => ({
                                ...entity,
                                name:
                                    entity.attributes.friendly_name ??
                                    entity.name,
                            }))
                    );
                }
            }
        );
    }

    useEffect(() => {
        loadEntities();
    }, []);
    return (
        <Accordion.Item value="entities">
            <Accordion.Control icon={<MdSensors size={20} />}>
                <Group position="apart">
                    <Text>Devices & Sensors</Text>
                    <ActionIcon
                        radius="xl"
                        onClick={(ev) => {
                            ev.stopPropagation();
                            loadEntities();
                        }}
                    >
                        <MdRefresh size={20} />
                    </ActionIcon>
                </Group>
            </Accordion.Control>
            <Accordion.Panel>
                <Stack spacing="md">
                    <TextInput
                        icon={<MdSearch size={24} />}
                        placeholder="Search"
                        size="lg"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <SimpleGrid
                        spacing="sm"
                        cols={3}
                        breakpoints={[
                            { maxWidth: "lg", cols: 2, spacing: "sm" },
                            { maxWidth: "md", cols: 1, spacing: "sm" },
                        ]}
                    >
                        {unmanagedEntities
                            .filter(
                                (entity) =>
                                    search.length === 0 ||
                                    search
                                        .toLowerCase()
                                        .includes(entity.name.toLowerCase()) ||
                                    entity.name
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                            )
                            .map((entity) => (
                                <UnmanagedEntity
                                    entity={entity}
                                    key={entity.id}
                                />
                            ))}
                    </SimpleGrid>
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
