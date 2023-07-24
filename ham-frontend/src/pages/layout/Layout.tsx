import {
    AppShell,
    Avatar,
    Box,
    Group,
    Header,
    LoadingOverlay,
    Switch,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { RiHomeWifiFill } from "react-icons/ri";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import "./layout.scss";
import { useColorMode } from "../../util/colorMode";
import { useApi } from "../../util/api/func";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AccountStatus, useAccount } from "../../util/api/account";

export function Layout() {
    const theme = useMantineTheme();
    const [mode, setMode] = useColorMode();
    const { config } = useApi();
    const { account } = useAccount();
    const nav = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (config && !config.initialized && location.pathname !== "/setup") {
            nav("/setup");
            return;
        }
        if (
            config &&
            config.initialized &&
            location.pathname !== "/login" &&
            account.status === AccountStatus.loggedOut
        ) {
            nav("/login");
        }
    }, [config, config?.initialized, account]);

    return (
        <Box className="layout-container">
            <LoadingOverlay visible={config === null}></LoadingOverlay>
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
                        <Title className="header-title">
                            {config?.location_name ?? "HAM"}
                        </Title>
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
                                    setMode(
                                        event.target.checked ? "light" : "dark"
                                    )
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
                <Box className="content">
                    <Outlet />
                </Box>
            </AppShell>
        </Box>
    );
}
