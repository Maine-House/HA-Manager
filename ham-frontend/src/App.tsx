import { MantineProvider } from "@mantine/core";
import { useTheme } from "./theme";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./pages/layout/Layout";
import { ColorMode, ModeContext } from "./util/colorMode";
import { useState } from "react";
import { ApiProvider } from "./util/api";
import { Setup } from "./pages/setup/Setup";
import { Notifications } from "@mantine/notifications";

export default function App() {
    const [mode, setMode] = useState<ColorMode>("dark");
    const theme = useTheme(mode);
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    path: "/setup",
                    element: <Setup />,
                },
            ],
        },
    ]);
    return (
        <ApiProvider>
            <ModeContext.Provider value={[mode, setMode]}>
                <MantineProvider
                    withGlobalStyles
                    withNormalizeCSS
                    theme={theme}
                >
                    <Notifications autoClose={5000} />
                    <RouterProvider router={router} />
                </MantineProvider>
            </ModeContext.Provider>
        </ApiProvider>
    );
}
