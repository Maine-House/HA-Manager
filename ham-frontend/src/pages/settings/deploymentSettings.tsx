import {
    Accordion,
    Stack,
    Card,
    Group,
    Loader,
    ColorSwatch,
    Title,
    useMantineTheme,
    Text,
    TextInput,
    PasswordInput,
    Button,
} from "@mantine/core";
import { RiHomeWifiFill } from "react-icons/ri";
import "./settings.scss";
import { useEvent } from "../../util/events";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { useApi } from "../../util/api/func";
import { FullConfig } from "../../types/config";
import { MdSave, MdToken } from "react-icons/md";
import { IP_REGEX } from "../../util/constants";

const PLACEHOLDER_CONFIG: FullConfig = {
    initialized: false,
    homeassistant_address: "",
    homeassistant_token: "",
    location_name: "",
};

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

export function DeploymentSettings() {
    const [status, setStatus] = useState<DeploymentStatus>("waiting");
    const theme = useMantineTheme();
    useEvent<DeploymentStatus>(
        "ha-status-monitor-settings",
        "ha_status",
        setStatus
    );
    useEvent<any>("state-update", "states", console.log);
    const { get, post, setConfig } = useApi();
    const form = useForm({
        initialValues: {
            locationName: "",
            homeassistantAddress: "",
            homeassistantToken: "",
        },
        validate: {
            homeassistantToken: (value) =>
                value.length > 0 ? null : "Please enter an API token.",
            homeassistantAddress: (value) =>
                IP_REGEX.test(value) ? null : "Enter a valid IP address.",
            locationName: (value) =>
                value.length > 0 ? null : "Please enter a location name.",
        },
    });

    async function load(): Promise<FullConfig> {
        const result = await get<FullConfig>("/config/full");
        if (result.success) {
            return result.value;
        }
        return PLACEHOLDER_CONFIG;
    }

    useEffect(() => {
        load().then((value) => {
            form.setValues({
                locationName: value.location_name ?? "",
                homeassistantAddress: value.homeassistant_address ?? "",
                homeassistantToken: value.homeassistant_token ?? "",
            });
        });
    }, []);

    return (
        <Accordion.Item value="deployment">
            <Accordion.Control icon={<RiHomeWifiFill size={20} />}>
                Deployment Settings
            </Accordion.Control>
            <Accordion.Panel>
                <Stack spacing="md">
                    <Card className="deployment-status" withBorder shadow="sm">
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
                                    <Title order={4} className="status-text">
                                        Loading...
                                    </Title>
                                ) : status.online ? (
                                    <Title order={4} className="status-text">
                                        Online
                                    </Title>
                                ) : (
                                    <Title order={4} className="status-text">
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
                                            <Text>{status.config.version}</Text>
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
                    <form
                        onSubmit={form.onSubmit((values) =>
                            post<FullConfig>("/config/full", {
                                data: {
                                    location_name: values.locationName,
                                    homeassistant_address:
                                        values.homeassistantAddress,
                                    homeassistant_token:
                                        values.homeassistantToken,
                                },
                            }).then((result) => {
                                if (result.success) {
                                    const value = result.value;
                                    form.setValues({
                                        locationName: value.location_name ?? "",
                                        homeassistantAddress:
                                            value.homeassistant_address ?? "",
                                        homeassistantToken:
                                            value.homeassistant_token ?? "",
                                    });
                                    setConfig({
                                        initialized: true,
                                        location_name:
                                            value.location_name ?? "",
                                        homeassistant_address:
                                            value.homeassistant_address ?? "",
                                    });
                                }
                            })
                        )}
                    >
                        <Stack spacing="sm">
                            <TextInput
                                label="Location Name"
                                placeholder="HAM House"
                                withAsterisk
                                {...form.getInputProps("locationName")}
                            />
                            <TextInput
                                label="Home Assistant IP"
                                placeholder="192.168.0.0:1000"
                                withAsterisk
                                {...form.getInputProps("homeassistantAddress")}
                            />
                            <PasswordInput
                                label="Home Assistant Token"
                                icon={<MdToken />}
                                withAsterisk
                                {...form.getInputProps("homeassistantToken")}
                            />
                            <Group position="right">
                                <Button
                                    type="submit"
                                    leftIcon={<MdSave size={20} />}
                                >
                                    Apply
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
