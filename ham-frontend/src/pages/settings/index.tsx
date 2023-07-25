import { Box, Title, Space, Accordion } from "@mantine/core";
import { useState } from "react";
import { RiHomeWifiFill } from "react-icons/ri";

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
                <Accordion.Item value="deployment">
                    <Accordion.Control icon={<RiHomeWifiFill size={20} />}>
                        Deployment Settings
                    </Accordion.Control>
                </Accordion.Item>
            </Accordion>
        </Box>
    );
}
