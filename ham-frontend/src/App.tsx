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
import { AccountSettings } from "./pages/account/AccountSettings";
import { SettingsPage } from "./pages/settings";
import { EventsProvider } from "./util/events";

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
                {
                    path: "/account",
                    element: <AccountSettings />,
                },
                {
                    path: "/settings",
                    element: <SettingsPage />,
                },
            ],
        },
    ]);
    return (
        <ApiProvider>
            <AccountProvider>
                <EventsProvider>
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
                </EventsProvider>
            </AccountProvider>
        </ApiProvider>
    );
}
