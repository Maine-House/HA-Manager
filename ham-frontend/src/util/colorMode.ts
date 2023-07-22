import { createContext, useContext } from "react";

export type ColorMode = "dark" | "light";
export const ModeContext = createContext<
    [ColorMode, (mode: ColorMode) => void]
>(["dark", () => []]);

export function useColorMode(): [ColorMode, (mode: ColorMode) => void] {
    const ctx = useContext(ModeContext);
    return ctx;
}
