import {
    ActionIcon,
    Box,
    Paper,
    SimpleGrid,
    Title,
    Tooltip,
} from "@mantine/core";
import { useEvent } from "../../util/events";
import "./views.scss";
import { MdAdd } from "react-icons/md";

export function DataPage() {
    useEvent("data-listener", "data", console.log);

    return (
        <Box className="data-views">
            <Title order={2}>Data Views</Title>
            <Paper className="view-container" shadow="sm" p="sm">
                <SimpleGrid cols={4} className="view-grid"></SimpleGrid>
                <Tooltip label="Create New View" position="left" color="dark">
                    <ActionIcon
                        size="xl"
                        radius="xl"
                        variant="gradient"
                        className="new-view-btn"
                    >
                        <MdAdd size={32} />
                    </ActionIcon>
                </Tooltip>
            </Paper>
        </Box>
    );
}
