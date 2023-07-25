import { MantineThemeOverride } from "@mantine/core";
import { customColors } from "./colors";
import { MdVisibilityOff, MdVisibility } from "react-icons/md";

export function useTheme(scheme: "light" | "dark"): MantineThemeOverride {
    const isDark = scheme === "dark";
    return {
        colors: {
            ...customColors,
        },
        defaultRadius: "sm",
        primaryColor: "primary",
        primaryShade: isDark ? 6 : 4,
        colorScheme: scheme,
        components: {
            PasswordInput: {
                defaultProps: {
                    visibilityToggleIcon: ({
                        reveal,
                        size,
                    }: {
                        reveal: boolean;
                        size: number;
                    }) =>
                        reveal ? (
                            <MdVisibilityOff size={size} />
                        ) : (
                            <MdVisibility size={size} />
                        ),
                },
            },
        },
    };
}
