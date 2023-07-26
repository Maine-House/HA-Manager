import {
    MdLightbulb,
    MdQuestionMark,
    MdSensors,
    MdToggleOn,
} from "react-icons/md";
import { EntityTypes } from "../../types/entity";
import { IconBaseProps } from "react-icons";

export function EntityIcon({
    type,
    ...iconProps
}: { type: EntityTypes } & Partial<IconBaseProps>) {
    switch (type) {
        case "sensor":
            return <MdSensors {...iconProps} />;
        case "light":
            return <MdLightbulb {...iconProps} />;
        case "switch":
            return <MdToggleOn {...iconProps} />;
        default:
            return <MdQuestionMark {...iconProps} />;
    }
}
