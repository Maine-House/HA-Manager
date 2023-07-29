import {
    MdLightbulb,
    MdMap,
    MdQuestionMark,
    MdSensors,
    MdSpeed,
    MdSunny,
    MdToggleOn,
} from "react-icons/md";
import {
    Entity,
    EntityTypes,
    FieldMetadataTypes,
    FieldMetadataTypesArray,
    TrackedFieldType,
} from "../../types/entity";
import { IconBaseProps } from "react-icons";
import { BasicState } from "../../util/events";
import { Badge, Button, Code, Group, Text } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { useMemo } from "react";

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
        case "weather":
            return <MdSunny {...iconProps} />;
        case "zone":
            return <MdMap {...iconProps} />;
        default:
            return <MdQuestionMark {...iconProps} />;
    }
}

const boolMap: { [key: string]: [string, string, boolean] } = {
    yes: ["Yes", "No", true],
    no: ["Yes", "No", false],
    true: ["True", "False", true],
    false: ["True", "False", false],
    on: ["On", "Off", true],
    off: ["On", "Off", false],
};

export function guessFieldType(
    field: string,
    entity: Entity | BasicState
): TrackedFieldType {
    const val: string = (
        field === "state" ? entity.state : entity.attributes[field]
    ).toString();
    const originalVal: any =
        field === "state" ? entity.state : entity.attributes[field];
    if (FieldMetadataTypesArray.includes(field.toLowerCase())) {
        return {
            field,
            type: "metadata",
            metaType: field as FieldMetadataTypes,
        };
    }
    if (
        ["yes", "no", "true", "false", "on", "off"].includes(val.toLowerCase())
    ) {
        return {
            field,
            type: "boolean",
            trueName: boolMap[val.toLowerCase()][0],
            falseName: boolMap[val.toLowerCase()][1],
        };
    }
    if (!isNaN(new Date(val).valueOf())) {
        return {
            field,
            type: "timestamp",
        };
    }
    if (field.toLowerCase() === "unit_of_measurement") {
        return {
            field,
            type: "unit",
            for: "state",
        };
    }
    if (field.toLowerCase().includes("_unit")) {
        return {
            field,
            type: "unit",
            for: field.toLowerCase().split("_unit").join(""),
        };
    }
    if (
        !isNaN(Number(val)) &&
        (field.toLowerCase() === "latitude" ||
            field.toLowerCase() === "longitude")
    ) {
        return {
            field,
            type: "location",
            coordinate: field.toLowerCase() as any,
        };
    }
    if (!isNaN(Number(val))) {
        return {
            field,
            type: "measurement",
            unit:
                field === "state"
                    ? entity.attributes.unit_of_measurement ?? "units"
                    : entity.attributes[field + "_unit"] ?? "units",
        };
    }
    if (val === originalVal) {
        return {
            field,
            type: "string",
        };
    }
    try {
        JSON.stringify(originalVal);
        return {
            field,
            type: "json",
        };
    } catch {
        return {
            field,
            type: "generic",
        };
    }
}

export function ValueRenderer({
    value,
    type,
    entity,
}: {
    value: any;
    type: TrackedFieldType;
    entity: BasicState | Entity;
}) {
    const toRender = useMemo(() => {
        switch (type.type) {
            case "boolean":
                return (
                    boolMap[value]
                        ? boolMap[value][2]
                        : value.toLowerCase() === type.trueName.toLowerCase()
                ) ? (
                    <Badge color="green">{type.trueName}</Badge>
                ) : (
                    <Badge color="red">{type.falseName}</Badge>
                );
            case "generic":
                return <Code>{value.toString()}</Code>;
            case "json":
                return (
                    <Prism
                        language="json"
                        style={{
                            display: "block",
                            width: "100%",
                            maxHeight: "256px",
                            overflowY: "auto",
                        }}
                    >
                        {JSON.stringify(value, undefined, 4)}
                    </Prism>
                );
            case "measurement":
                return (
                    <Group spacing="sm">
                        <MdSpeed
                            size={20}
                            style={{ transform: "translate(0, -2px)" }}
                        />
                        <Text>
                            {value} {type.unit}
                        </Text>
                    </Group>
                );
            case "location":
                return (
                    <Button
                        size="sm"
                        leftIcon={<MdMap />}
                        onClick={() =>
                            window.open(
                                `https://www.google.com/maps/@${entity.attributes.latitude},${entity.attributes.longitude},13z`,
                                "_blank"
                            )
                        }
                        disabled={
                            !entity.attributes.latitude ||
                            !entity.attributes.longitude
                        }
                        variant="outline"
                    >
                        <Group spacing="sm">
                            <Text
                                fw={type.coordinate === "latitude" ? 600 : 400}
                            >
                                {entity.attributes.latitude ?? "?"} °
                            </Text>
                            <Text>, </Text>
                            <Text
                                fw={type.coordinate === "longitude" ? 600 : 400}
                            >
                                {entity.attributes.longitude ?? "?"} °
                            </Text>
                        </Group>
                    </Button>
                );
            case "metadata":
                return (
                    <Badge size="md" variant="dot">
                        {type.metaType.replace("_", " ") + ": " + value}
                    </Badge>
                );
            case "string":
                return <Text>{value}</Text>;
            case "unit":
                return (
                    <Badge size="md" variant="dot">
                        {type.for} : {value}
                    </Badge>
                );
            case "timestamp":
                return <Code>{new Date(value).toLocaleString()}</Code>;
        }
    }, [
        value,
        type.type,
        entity.attributes[type.field],
        entity.state,
        type.field,
        type,
    ]);
    return toRender;
}
