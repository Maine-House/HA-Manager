import { MantineThemeOverride } from "@mantine/core";
import { customColors } from "./colors";

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
    };
}
