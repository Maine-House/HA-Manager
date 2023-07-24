import { useNavigate } from "react-router-dom";
import { AccountStatus, useAccount } from "../../util/api/account";
import {
    Button,
    Group,
    Paper,
    PasswordInput,
    Stack,
    TextInput,
    Title,
} from "@mantine/core";
import "./login.scss";
import { useForm } from "@mantine/form";
import {
    MdAccountCircle,
    MdLock,
    MdVisibility,
    MdVisibilityOff,
} from "react-icons/md";
import { notifications } from "@mantine/notifications";

export function Login() {
    const { account, login } = useAccount();
    const nav = useNavigate();
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
        },
        validate: {
            username: (value) =>
                value.length === 0 ? "Please enter a username" : null,
            password: (value) =>
                value.length === 0 ? "Please enter a password" : null,
        },
    });

    return (
        <Paper p="md" shadow="md" className="login-container">
            <form
                onSubmit={form.onSubmit(({ username, password }) =>
                    login(username, password).then((result) => {
                        if (result.status === AccountStatus.loggedIn) {
                            notifications.show({
                                color: "green",
                                title: "Logged In!",
                                message: `Logged into account "${result.username}".`,
                            });
                            nav("/");
                        } else {
                            notifications.show({
                                color: "red",
                                title: "Login Failed.",
                                message: "Incorrect username or password.",
                            });
                        }
                    })
                )}
            >
                <Stack spacing={"md"}>
                    <Group position="center">
                        <Title order={3} className="login-title">
                            Login
                        </Title>
                    </Group>
                    <Stack spacing={"sm"}>
                        <TextInput
                            label="Username"
                            icon={<MdAccountCircle />}
                            withAsterisk
                            {...form.getInputProps("username")}
                        />
                        <PasswordInput
                            visibilityToggleIcon={({ reveal, size }) =>
                                reveal ? (
                                    <MdVisibilityOff size={size} />
                                ) : (
                                    <MdVisibility size={size} />
                                )
                            }
                            label="Password"
                            icon={<MdLock />}
                            withAsterisk
                            {...form.getInputProps("password")}
                        />
                    </Stack>
                    <Button type="submit">Log In</Button>
                </Stack>
            </form>
        </Paper>
    );
}
