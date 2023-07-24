import { MantineProvider } from "@mantine/core";
import { useTheme } from "./theme";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./pages/layout/Layout";
import { ColorMode, ModeContext } from "./util/colorMode";
import { useState } from "react";
import { ApiProvider } from "./util/api";
import { Setup } from "./pages/setup/Setup";
import { Notifications } from "@mantine/notifications";
import { Index } from "./pages/index/Index";
import { AccountProvider } from "./util/api/account";
import { Login } from "./pages/login/Login";

export default function App() {
    const [mode, setMode] = useState<ColorMode>("dark");
    const theme = useTheme(mode);
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <Index />,
                },
                {
                    path: "/setup",
                    element: <Setup />,
                },
                {
                    path: "/login",
                    element: <Login />,
                },
            ],
        },
    ]);
    return (
        <ApiProvider>
            <AccountProvider>
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
            </AccountProvider>
        </ApiProvider>
    );
}
