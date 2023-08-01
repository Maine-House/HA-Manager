import { memo } from "react";
import { ViewType } from "../../types/data";
import { IconBaseProps } from "react-icons";
import { MdBarChart, MdLineAxis, MdStackedBarChart } from "react-icons/md";

export const ViewIcon = memo(
    ({ type, ...iconProps }: { type: ViewType } & IconBaseProps) => {
        switch (type) {
            case "frequency":
                return <MdBarChart {...iconProps} />;
            case "linear":
                return <MdLineAxis {...iconProps} />;
            case "valueTime":
                return <MdStackedBarChart {...iconProps} />;
        }
    }
);

export function guessTimeUnit(seconds: number): string {
    if (seconds < 60) return `${2 * Math.ceil(seconds / 60)} seconds`;
    if (seconds < 3600) return `${2 * Math.ceil(seconds / 3600)} minutes`;
    if (seconds < 86400) return `${2 * Math.ceil(seconds / 86400)} hours`;
    if (seconds < 604800) return `${2 * Math.ceil(seconds / 604800)} days`;
    if (seconds < 2628000) return `${2 * Math.ceil(seconds / 2628000)} weeks`;
    if (seconds < 31540000)
        return `${2 * Math.ceil(seconds / 31540000)} months`;
    return "1 year";
}
