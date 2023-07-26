import { Box, Title, Space, Accordion } from "@mantine/core";
import { useState } from "react";
import "./settings.scss";
import { DeploymentSettings } from "./deploymentSettings";
import { EntitySettings } from "./entitySettings";

export function SettingsPage() {
    const [opened, setOpened] = useState<string[]>(["deployment"]);

    return (
        <Box className="settings-container" p="md">
            <Title order={2} className="title">
                HAM Settings
            </Title>
            <Space h="md" />
            <Accordion
                className="settings-sections"
                variant="contained"
                multiple
                value={opened}
                onChange={setOpened}
            >
                <DeploymentSettings />
                <EntitySettings />
            </Accordion>
        </Box>
    );
}
