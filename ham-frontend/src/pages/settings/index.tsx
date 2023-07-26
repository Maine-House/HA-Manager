import {
    Box,
    Title,
    Space,
    Accordion,
    Card,
    Stack,
    Group,
    Loader,
    ColorSwatch,
    useMantineTheme,
    Text,
} from "@mantine/core";
import { useState } from "react";
import { RiHomeWifiFill } from "react-icons/ri";
import { useEvent } from "../../util/events";
import "./settings.scss";

type DeploymentStatus =
    | {
          online: true;
          config: any;
      }
    | {
          online: false;
          error: {
              code: number;
              description: string;
          };
      }
    | "waiting";

export function SettingsPage() {
    const [opened, setOpened] = useState<string[]>(["deployment"]);
    const [status, setStatus] = useState<DeploymentStatus>("waiting");
    const theme = useMantineTheme();
    useEvent<DeploymentStatus>(
        "ha-status-monitor-settings",
        "ha_status",
        setStatus
    );

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
                    <Accordion.Panel>
                        <Card
                            className="deployment-status"
                            withBorder
                            shadow="sm"
                        >
                            <Stack spacing="md">
                                <Group spacing="md" className="online-status">
                                    {status === "waiting" ? (
                                        <Loader size="sm" />
                                    ) : status.online ? (
                                        <ColorSwatch
                                            color={theme.colors["green"][6]}
                                        />
                                    ) : (
                                        <ColorSwatch
                                            color={theme.colors["red"][6]}
                                        />
                                    )}
                                    {status === "waiting" ? (
                                        <Title
                                            order={4}
                                            className="status-text"
                                        >
                                            Loading...
                                        </Title>
                                    ) : status.online ? (
                                        <Title
                                            order={4}
                                            className="status-text"
                                        >
                                            Online
                                        </Title>
                                    ) : (
                                        <Title
                                            order={4}
                                            className="status-text"
                                        >
                                            Offline
                                        </Title>
                                    )}
                                </Group>
                                {status !== "waiting" &&
                                    (status.online ? (
                                        <Stack spacing="sm">
                                            <Group spacing="sm">
                                                <Text fw={600}>
                                                    HomeAssistant Version:
                                                </Text>
                                                <Text>
                                                    {status.config.version}
                                                </Text>
                                            </Group>
                                            <Group spacing="sm">
                                                <Text fw={600}>Time Zone:</Text>
                                                <Text>
                                                    {status.config.time_zone}
                                                </Text>
                                            </Group>
                                        </Stack>
                                    ) : (
                                        <Group spacing="sm">
                                            <Text>{status.error.code}:</Text>
                                            <Text color="dimmed">
                                                {status.error.description}
                                            </Text>
                                        </Group>
                                    ))}
                            </Stack>
                        </Card>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Box>
    );
}
