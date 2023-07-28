import {
    Accordion,
    ActionIcon,
    Button,
    Card,
    Divider,
    Group,
    Pagination,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useState, useEffect, useMemo } from "react";
import {
    MdAdd,
    MdChevronLeft,
    MdChevronRight,
    MdInfo,
    MdRefresh,
    MdSearch,
    MdSensors,
    MdSort,
} from "react-icons/md";
import { EntityTypeArray, Entity } from "../../types/entity";
import { useApi } from "../../util/api/func";
import { EntityIcon } from "../../components/entities/entityUtils";
import { modals } from "@mantine/modals";
import { Prism } from "@mantine/prism";

function EntityRenderer({ entity }: { entity: Entity }) {
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

type SortField = "name" | "type" | "last_updated";

function useEntities(): {
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
    search: string;
    setSearch: (search: string) => void;
    sortMode: SortField;
    setSortMode: (mode: SortField) => void;
    allEntities: Entity[];
    renderedEntities: Entity[];
    reload: () => void;
} {
    const [entities, setEntities] = useState<Entity[]>([]);
    const { get } = useApi();
    const [search, setSearch] = useState("");
    const [sortMode, setSortMode] = useState<SortField>("name");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    function reload() {
        get<Entity[]>("/ha/entities").then((result) => {
            if (result.success) {
                setEntities(
                    result.value
                        .filter(({ type }) => EntityTypeArray.includes(type))
                        .map((entity) => ({
                            ...entity,
                            name:
                                entity.attributes.friendly_name ?? entity.name,
                        }))
                );
            }
        });
    }

    useEffect(() => reload(), []);

    const sortedEntities = useMemo(
        () =>
            entities
                .filter(
                    (entity) =>
                        search.length === 0 ||
                        search
                            .toLowerCase()
                            .includes(entity.name.toLowerCase()) ||
                        entity.name.toLowerCase().includes(search.toLowerCase())
                )
                .sort((a, b) =>
                    (a[sortMode] ?? "").localeCompare(b[sortMode] ?? "")
                ),
        [entities, search, sortMode]
    );

    const renderedEntities = useMemo(
        () => sortedEntities.slice(page * pageSize, (page + 1) * pageSize),
        [sortedEntities, page, pageSize]
    );

    return {
        page,
        setPage,
        pageSize,
        setPageSize,
        search,
        setSearch,
        sortMode,
        setSortMode,
        allEntities: sortedEntities,
        renderedEntities,
        reload,
    };
}

export function EntitySettings() {
    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        search,
        setSearch,
        sortMode,
        setSortMode,
        allEntities,
        renderedEntities,
        reload,
    } = useEntities();

    return (
        <Accordion.Item value="entities" className="entity-discovery">
            <Accordion.Control icon={<MdSensors size={20} />}>
                <Group position="apart">
                    <Text>Devices & Sensors</Text>
                    <ActionIcon
                        component="div"
                        radius="xl"
                        onClick={(ev) => {
                            ev.stopPropagation();
                            reload();
                        }}
                    >
                        <MdRefresh size={20} />
                    </ActionIcon>
                </Group>
            </Accordion.Control>
            <Accordion.Panel>
                <Stack spacing="md">
                    <Group spacing={"sm"}>
                        <TextInput
                            icon={<MdSearch size={24} />}
                            placeholder="Search"
                            size="lg"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="entity-search"
                        />
                        <Select
                            icon={<MdSort size={24} />}
                            data={[
                                { value: "name", label: "Name" },
                                { value: "type", label: "Entity Type" },
                                { value: "last_updated", label: "Last Update" },
                            ]}
                            value={sortMode}
                            onChange={(value) => setSortMode(value as any)}
                            clearable={false}
                            size="lg"
                        />
                    </Group>
                    <Paper className="entity-display" p="xs">
                        <SimpleGrid
                            spacing="sm"
                            cols={3}
                            breakpoints={[
                                { maxWidth: "lg", cols: 2, spacing: "sm" },
                                { maxWidth: "md", cols: 1, spacing: "sm" },
                            ]}
                        >
                            {renderedEntities.map((entity) => (
                                <EntityRenderer
                                    entity={entity}
                                    key={entity.id}
                                />
                            ))}
                        </SimpleGrid>
                    </Paper>
                    <Group spacing="md" position="right">
                        <Select
                            data={[
                                { value: "10", label: "10" },
                                { value: "25", label: "25" },
                                { value: "50", label: "50" },
                            ]}
                            value={pageSize.toString()}
                            onChange={(value) =>
                                setPageSize(Number(value ?? "10"))
                            }
                            clearable={false}
                            variant="filled"
                        />
                        <Pagination
                            nextIcon={MdChevronRight}
                            previousIcon={MdChevronLeft}
                            total={Math.ceil(allEntities.length / pageSize)}
                            value={page + 1}
                            onChange={(v) => setPage(v - 1)}
                        />
                    </Group>
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
