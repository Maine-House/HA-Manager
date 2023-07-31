import {
    ActionIcon,
    Box,
    Card,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Title,
    Tooltip,
} from "@mantine/core";
import { useEvent } from "../../util/events";
import "./views.scss";
import { MdAdd } from "react-icons/md";
import { CreateViewModal } from "./CreateViewModal";
import { useCallback, useEffect, useState } from "react";
import { View } from "../../types/data";
import { useApi } from "../../util/api/func";
import { ViewIcon } from "./util";
import { ViewGraph } from "./ViewGraph";

function ViewItem({ view }: { view: View }) {
    return (
        <Card>
            <Stack spacing="md">
                <Group spacing="md">
                    <ViewIcon type={view.type} size={24} />
                    <Title order={3}>{view.name}</Title>
                </Group>
                <Paper p="sm" shadow="md" h={"480px"}>
                    <ViewGraph view={view} hideLabels />
                </Paper>
            </Stack>
        </Card>
    );
}

export function DataPage() {
    const [creating, setCreating] = useState(false);
    const [views, setViews] = useState<View[]>([]);
    const { get } = useApi();

    const loadViews = useCallback(
        () =>
            get<View[]>("/views").then(
                (result) => result.success && setViews(result.value)
            ),
        []
    );

    useEvent<{ id: string }>("view-listener", "views", loadViews);
    useEffect(() => {
        loadViews();
    }, []);

    return (
        <Box className="data-views">
            <Title order={2}>Data Views</Title>
            <Paper className="view-container" shadow="sm" p="sm">
                <SimpleGrid cols={2} className="view-grid">
                    {views.map((view) => (
                        <ViewItem view={view} key={view.id} />
                    ))}
                </SimpleGrid>
                <Tooltip label="Create New View" position="left" color="dark">
                    <ActionIcon
                        size="xl"
                        radius="xl"
                        variant="gradient"
                        className="new-view-btn"
                        onClick={() => setCreating(true)}
                    >
                        <MdAdd size={32} />
                    </ActionIcon>
                </Tooltip>
            </Paper>
            <CreateViewModal open={creating} setOpen={setCreating} />
        </Box>
    );
}
