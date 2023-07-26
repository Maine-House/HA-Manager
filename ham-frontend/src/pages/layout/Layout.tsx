import {
    ActionIcon,
    AppShell,
    Avatar,
    Box,
    Button,
    Group,
    Header,
    LoadingOverlay,
    Paper,
    Stack,
    Switch,
    Text,
    Title,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { RiHomeWifiFill } from "react-icons/ri";
import {
    MdLightMode,
    MdDarkMode,
    MdBarChart,
    MdDashboard,
    MdManageAccounts,
    MdMap,
    MdRule,
    MdSettings,
    MdChevronLeft,
    MdChevronRight,
    MdLogout,
} from "react-icons/md";
import "./layout.scss";
import { useColorMode } from "../../util/colorMode";
import { useApi } from "../../util/api/func";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { AccountStatus, useAccount } from "../../util/api/account";
import { useEvent } from "../../util/events";

function IndexLink({
    icon,
    title,
    tooltip,
    target,
    toTop,
}: {
    icon: ReactNode;
    title: string;
    tooltip: string;
    target: string;
    toTop?: boolean;
}) {
    const nav = useNavigate();
    const location = useLocation();
    return (
        <Tooltip
            label={tooltip}
            withArrow
            color="dark"
            position={toTop ? "top" : "right"}
        >
            <Paper
                radius="sm"
                className="index-link"
                onClick={() => nav(target)}
                p="sm"
                bg={target === location.pathname ? "primary" : undefined}
            >
                {icon}
                <Text className="title">{title}</Text>
            </Paper>
        </Tooltip>
    );
}

export function Layout() {
    const theme = useMantineTheme();
    const [mode, setMode] = useColorMode();
    const { config } = useApi();
    const { account, logout } = useAccount();
    const nav = useNavigate();
    const location = useLocation();
    const [expanded, setExpanded] = useState<boolean>(false);
    useEvent("test-listener", "test", console.log);

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
                    {!["/setup", "/login"].includes(location.pathname) && (
                        <Box
                            className={
                                "options" + (expanded ? " expanded" : "")
                            }
                            p="sm"
                        >
                            <Stack className="pages" spacing={"sm"}>
                                <IndexLink
                                    icon={<MdDashboard />}
                                    title="Dashboard"
                                    tooltip="Quick access to basic controls"
                                    target="/"
                                />
                                <IndexLink
                                    icon={<MdBarChart />}
                                    title="Data"
                                    tooltip="View current & historical sensor data"
                                    target="/data"
                                />
                                <IndexLink
                                    icon={<MdSettings />}
                                    title="Settings"
                                    tooltip="Home Assistant Manager settings"
                                    target="/settings"
                                />
                                <IndexLink
                                    icon={<MdManageAccounts />}
                                    title="Users"
                                    tooltip="Manage user accounts"
                                    target="/settings/users"
                                />
                                <IndexLink
                                    icon={<MdMap />}
                                    title="Areas"
                                    tooltip="Manage areas & associated entities"
                                    target="/settings/areas"
                                />
                                <IndexLink
                                    icon={<MdRule />}
                                    title="Rules"
                                    tooltip="Manage automation rules"
                                    target="/settings/rules"
                                />
                            </Stack>
                            {expanded && (
                                <Group
                                    className="account"
                                    spacing={"sm"}
                                    position="left"
                                >
                                    <IndexLink
                                        icon={
                                            <Avatar
                                                className="account-icon"
                                                size="sm"
                                                variant="gradient"
                                            >
                                                {account.status ===
                                                    AccountStatus.loggedIn &&
                                                    account.username[0].toUpperCase()}
                                            </Avatar>
                                        }
                                        title={
                                            account.status ===
                                            AccountStatus.loggedIn
                                                ? account.username
                                                : ""
                                        }
                                        tooltip="Manage your account"
                                        target="/account"
                                        toTop
                                    />
                                    <Button
                                        className="logout-button"
                                        onClick={() => logout()}
                                        size="md"
                                        leftIcon={<MdLogout size={20} />}
                                    >
                                        Log Out
                                    </Button>
                                    <ActionIcon
                                        variant="filled"
                                        className="sidebar-expansion"
                                        color={
                                            mode === "dark" ? "dark" : "gray.5"
                                        }
                                        onClick={() => setExpanded(!expanded)}
                                    >
                                        {expanded ? (
                                            <MdChevronLeft size={20} />
                                        ) : (
                                            <MdChevronRight size={20} />
                                        )}
                                    </ActionIcon>
                                </Group>
                            )}
                            {!expanded && (
                                <Stack spacing={"sm"} className="account">
                                    <Tooltip
                                        label="Manage your account"
                                        withArrow
                                        color="dark"
                                        position="right"
                                    >
                                        <Avatar
                                            className="account-icon"
                                            size="md"
                                            variant="gradient"
                                            onClick={() => nav("/account")}
                                        >
                                            {account.status ===
                                                AccountStatus.loggedIn &&
                                                account.username[0].toUpperCase()}
                                        </Avatar>
                                    </Tooltip>
                                    <ActionIcon
                                        variant="filled"
                                        className="sidebar-expansion"
                                        color="primary"
                                        onClick={() => logout()}
                                    >
                                        <MdLogout size={20} />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="filled"
                                        className="sidebar-expansion"
                                        color={
                                            mode === "dark" ? "dark" : "gray.5"
                                        }
                                        onClick={() => setExpanded(!expanded)}
                                    >
                                        {expanded ? (
                                            <MdChevronLeft size={20} />
                                        ) : (
                                            <MdChevronRight size={20} />
                                        )}
                                    </ActionIcon>
                                </Stack>
                            )}
                        </Box>
                    )}
                    <Box className="page-content">
                        <Outlet />
                    </Box>
                </Box>
            </AppShell>
        </Box>
    );
}
