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
