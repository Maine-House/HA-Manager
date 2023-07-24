import {
    Accordion,
    Box,
    Button,
    Group,
    Space,
    Stack,
    TextInput,
    Title,
} from "@mantine/core";
import { useAccount } from "../../util/api/account";
import "./account_settings.scss";
import { MdLock, MdPerson, MdSave, MdSecurity } from "react-icons/md";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { User } from "../../types/user";
import { useApi } from "../../util/api/func";

export function AccountSettings() {
    const { account, reload } = useAccount();
    const { post } = useApi();
    const [opened, setOpened] = useState<string[]>(["info"]);

    const accountValues: User =
        account.status === 2
            ? (account as User)
            : {
                  username: "",
                  id: "",
                  permissions: {
                      data: "disabled",
                      settings: "disabled",
                      accounts: "disabled",
                      areas: "disabled",
                      rules: "disabled",
                  },
              };

    const infoForm = useForm({
        initialValues: {
            username: account.status === 2 ? account.username : "",
        },
        validate: {
            username: (value) =>
                value.length > 0 ? null : "Please enter a username",
        },
    });

    useEffect(() => {
        infoForm.setValues({ username: accountValues.username });
    }, [accountValues.username]);

    return (
        <Box className="account-settings-container" p="md">
            <Title order={2} className="title">
                Account Management
            </Title>
            <Space h="md" />
            <Accordion
                className="settings-sections"
                variant="contained"
                multiple
                value={opened}
                onChange={setOpened}
            >
                <Accordion.Item value="info">
                    <Accordion.Control icon={<MdPerson size={20} />}>
                        Account Info
                    </Accordion.Control>
                    <Accordion.Panel>
                        <form
                            onSubmit={infoForm.onSubmit((values) =>
                                post<User>("/account/me/settings", {
                                    data: values,
                                }).then((result) => {
                                    if (result.success) {
                                        reload();
                                    }
                                })
                            )}
                        >
                            <Stack spacing="sm">
                                <TextInput
                                    label="Username"
                                    placeholder="Home Assistant"
                                    {...infoForm.getInputProps("username")}
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
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="password">
                    <Accordion.Control icon={<MdLock size={20} />}>
                        Password
                    </Accordion.Control>
                    <Accordion.Panel></Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="permissions">
                    <Accordion.Control icon={<MdSecurity size={20} />}>
                        Permissions
                    </Accordion.Control>
                    <Accordion.Panel></Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Box>
    );
}
