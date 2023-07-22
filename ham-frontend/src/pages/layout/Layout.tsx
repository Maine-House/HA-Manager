import {
    AppShell,
    Avatar,
    Group,
    Header,
    Switch,
    useMantineTheme,
} from "@mantine/core";
import { RiHomeWifiFill } from "react-icons/ri";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import "./layout.scss";
import { useColorMode } from "../../util/colorMode";

export function Layout() {
    const theme = useMantineTheme();
    const [mode, setMode] = useColorMode();
    return (
        <AppShell
            className="ham-app"
            padding={"sm"}
            header={
                <Header height={48} p="xs" className="ham-header">
                    <Avatar
                        color="primary"
                        radius="xl"
                        className="header-icon"
                        variant="filled"
                    >
                        <RiHomeWifiFill />
                    </Avatar>
                    <Group className="mode-switch">
                        <Switch
                            size="md"
                            color={
                                theme.colorScheme === "dark"
                                    ? "dark.8"
                                    : "gray.1"
                            }
                            onLabel={
                                <MdLightMode
                                    size="1rem"
                                    stroke={2.5}
                                    color={theme.colors.yellow[5]}
                                />
                            }
                            offLabel={
                                <MdDarkMode
                                    size="1rem"
                                    stroke={2.5}
                                    color={theme.colors.blue[6]}
                                />
                            }
                            checked={mode === "light"}
                            onChange={(event) =>
                                setMode(event.target.checked ? "light" : "dark")
                            }
                        />
                    </Group>
                </Header>
            }
            styles={(theme) => ({
                main: {
                    backgroundColor:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[8]
                            : theme.colors.gray[0],
                },
            })}
        >
            <></>
        </AppShell>
    );
}
