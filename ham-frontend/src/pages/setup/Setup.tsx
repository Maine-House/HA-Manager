import {
    Accordion,
    Button,
    PasswordInput,
    Stack,
    TextInput,
} from "@mantine/core";
import { useApi } from "../../util/api/func";
import { useForm } from "@mantine/form";
import { SiHomeassistant } from "react-icons/si";
import { MdPerson } from "react-icons/md";
import "./setup.scss";
import { CoreConfig } from "../../types/config";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

const IP_REGEX =
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]+$/;

export function Setup() {
    const { post, setConfig } = useApi();
    const nav = useNavigate();
    const form = useForm({
        initialValues: {
            location_name: "",
            ha_address: "",
            ha_token: "",
            username: "",
            password: "",
            confirmPassword: "",
        },
        validate: {
            password: (value, values) =>
                value.length > 0 && value === values.confirmPassword
                    ? null
                    : "Passwords must match.",
            confirmPassword: (value, values) =>
                value.length > 0 && value === values.password
                    ? null
                    : "Passwords must match.",
            username: (value) =>
                value.length > 0 ? null : "Please enter a username.",
            ha_token: (value) =>
                value.length > 0 ? null : "Please enter an API token.",
            ha_address: (value) =>
                IP_REGEX.test(value) ? null : "Enter a valid IP address.",
            location_name: (value) =>
                value.length > 0 ? null : "Please enter a location name.",
        },
    });

    return (
        <Stack className="setup" spacing={"md"}>
            <form
                onSubmit={form.onSubmit((values) =>
                    post<CoreConfig>("/config/setup", { data: values }).then(
                        (result) => {
                            if (result.success) {
                                notifications.show({
                                    withCloseButton: true,
                                    title: "Application Setup Successful!",
                                    message: `Home Assistant Manager for ${result.value.location_name} is now running. Home Assistant is hosted at ${result.value.homeassistant_address}`,
                                    color: "green",
                                });
                                setConfig(result.value);
                                nav("/");
                            } else {
                                notifications.show({
                                    withCloseButton: true,
                                    title: "Application Setup Failed.",
                                    message:
                                        result.errorMessage ?? "Unknown error.",
                                    color: "red",
                                });
                            }
                        }
                    )
                )}
            >
                <Accordion
                    className="sections"
                    multiple
                    value={["homeassistant", "user"]}
                    variant="contained"
                >
                    <Accordion.Item value="homeassistant">
                        <Accordion.Control
                            icon={<SiHomeassistant />}
                            chevron={<></>}
                        >
                            Home Assistant Setup
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Stack spacing={"sm"}>
                                <TextInput
                                    label="Location Name"
                                    placeholder="My House"
                                    withAsterisk
                                    {...form.getInputProps("location_name")}
                                />
                                <TextInput
                                    label="Home Assistant IP"
                                    placeholder="192.168.0.0:1000"
                                    withAsterisk
                                    {...form.getInputProps("ha_address")}
                                />
                                <TextInput
                                    label="Home Assistant API Token"
                                    placeholder="API Token"
                                    withAsterisk
                                    {...form.getInputProps("ha_token")}
                                />
                            </Stack>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="user">
                        <Accordion.Control icon={<MdPerson />} chevron={<></>}>
                            First User Setup
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Stack spacing={"sm"}>
                                <TextInput
                                    label="Username"
                                    placeholder="Admin"
                                    withAsterisk
                                    {...form.getInputProps("username")}
                                />
                                <PasswordInput
                                    label="Password"
                                    withAsterisk
                                    {...form.getInputProps("password")}
                                />
                                <PasswordInput
                                    label="Confirm Password"
                                    withAsterisk
                                    {...form.getInputProps("confirmPassword")}
                                />
                            </Stack>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
                <Button
                    className="setup-finish"
                    variant="filled"
                    fullWidth
                    type="submit"
                >
                    Finish
                </Button>
            </form>
        </Stack>
    );
}
