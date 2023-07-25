import { ReactElement, cloneElement, useEffect, useState } from "react";
import { PermissionType, UserPermissions } from "../../types/user";
import { useApi } from "../../util/api/func";
import {
    Box,
    Center,
    Group,
    SegmentedControl,
    Stack,
    Text,
} from "@mantine/core";
import { MdEdit, MdVisibility, MdVisibilityOff } from "react-icons/md";
import "./style.scss";

export function PermissionSwitch({
    account,
    permission,
    icon,
    label,
    disabled,
}: {
    account: "me" | string;
    permission: keyof UserPermissions;
    icon: ReactElement;
    label: string;
    disabled?: boolean;
}) {
    const [value, setValue] = useState<PermissionType>("disabled");
    const { get } = useApi();

    useEffect(() => {
        get<PermissionType>(
            `/account/${account}/permissions/${permission}`
        ).then((result) => {
            if (result.success) {
                setValue(result.value);
            }
        });
    }, [account, permission]);

    return (
        <Stack spacing="xs" className="permission-switch">
            <Group spacing="sm" className="permission-label">
                {cloneElement(icon, { size: 20 })}
                <Text>{label}</Text>
            </Group>
            <SegmentedControl
                className="permission-input"
                fullWidth
                value={value}
                onChange={(newValue: PermissionType) => {
                    setValue(newValue);
                }}
                disabled={disabled}
                data={[
                    {
                        label: (
                            <Center>
                                <MdVisibilityOff size={20} />
                                <Box ml={10}>Disabled</Box>
                            </Center>
                        ),
                        value: "disabled",
                    },
                    {
                        label: (
                            <Center>
                                <MdVisibility size={20} />
                                <Box ml={10}>View</Box>
                            </Center>
                        ),
                        value: "view",
                    },
                    {
                        label: (
                            <Center>
                                <MdEdit size={20} />
                                <Box ml={10}>Edit</Box>
                            </Center>
                        ),
                        value: "edit",
                    },
                ]}
            />
        </Stack>
    );
}
