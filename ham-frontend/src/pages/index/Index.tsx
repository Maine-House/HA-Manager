import { Box, Paper } from "@mantine/core";
import "./index.scss";

export function Index() {
    return (
        <Box className="index-container" p="sm">
            <Paper className="managed-area" p="sm" shadow="sm"></Paper>
            <Box className="areas"></Box>
        </Box>
    );
}
