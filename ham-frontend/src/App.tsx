import { MantineProvider } from "@mantine/core";
import { useTheme } from "./theme";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./pages/layout/Layout";
import { ColorMode, ModeContext } from "./util/colorMode";
import { useState } from "react";

export default function App() {
    const [mode, setMode] = useState<ColorMode>("dark");
    const theme = useTheme(mode);
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
        },
    ]);
    return (
        <ModeContext.Provider value={[mode, setMode]}>
            <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
                <RouterProvider router={router} />
            </MantineProvider>
        </ModeContext.Provider>
    );
}
