import {
    Avatar,
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import "./index.scss";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
    MdBarChart,
    MdDashboard,
    MdManageAccounts,
    MdMap,
    MdRule,
    MdSettings,
} from "react-icons/md";

function IndexLink({
    icon,
    title,
    tooltip,
    target,
}: {
    icon: ReactNode;
    title: string;
    tooltip: string;
    target: string;
}) {
    const nav = useNavigate();
    return (
        <Tooltip label={tooltip} withArrow color="dark" position="right">
            <Paper
                radius="sm"
                className="index-link"
                onClick={() => nav(target)}
                p="sm"
            >
                {icon}
                <Text className="title">{title}</Text>
            </Paper>
        </Tooltip>
    );
}

export function Index() {
    return (
        <Box className="index-container" p="sm">
            <Box className="options">
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
                <Group className="account" spacing={"sm"} position="apart">
                    <Avatar className="account-icon" variant="filled">
                        E
                    </Avatar>
                    <Button>Log Out</Button>
                </Group>
            </Box>
            <Paper className="managed-area" p="sm" shadow="sm"></Paper>
            <Box className="areas"></Box>
        </Box>
    );
}
