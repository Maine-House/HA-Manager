export type EntityTypes = "sensor" | "switch" | "light" | "weather" | "zone";
export const EntityTypeArray: EntityTypes[] = [
    "sensor",
    "light",
    "switch",
    "weather",
    "zone",
];

export type Entity = {
    id: string;
    name: string;
    type: EntityTypes;
    state: string;
    attributes: { [key: string]: any };
    last_changed?: string | null;
    last_updated?: string | null;
    tracked: boolean;
};

export const FieldMetadataTypesArray = [
    "device_class",
    "state_class",
    "friendly_name",
    "icon",
    "attribution",
];
export type FieldMetadataTypes =
    | "device_class"
    | "state_class"
    | "friendly_name"
    | "icon"
    | "attribution";

export type TrackedFieldType = { field: string } & (
    | {
          type: "boolean";
          trueName: string;
          falseName: string;
      }
    | {
          type: "measurement";
          unit: string;
      }
    | {
          type: "string";
      }
    | {
          type: "metadata";
          metaType: FieldMetadataTypes;
      }
    | {
          type: "unit";
          for: string;
      }
    | {
          type: "generic";
      }
    | {
          type: "json";
      }
    | {
          type: "timestamp";
      }
    | {
          type: "location";
          coordinate: "latitude" | "longitude";
      }
);

export type TrackedEntity = {
    id: string;
    last_update: number;
    haid: string;
    name: string;
    type: string;
    tracked_values: TrackedFieldType[];
};

export type FieldTypeArgument =
    | { type: "string"; argument: string; label: string }
    | {
          type: "selection";
          argument: string;
          label: string;
          options: { value: string; label: string }[];
      };

export const TrackedFieldTypeArguments: {
    [key in TrackedFieldType["type"]]: FieldTypeArgument[];
} = {
    boolean: [
        { type: "string", argument: "trueName", label: "Value If True" },
        { type: "string", argument: "falseName", label: "Value If False" },
    ],
    measurement: [{ type: "string", argument: "unit", label: "Unit" }],
    string: [],
    metadata: [
        {
            type: "selection",
            argument: "metaType",
            label: "Metadata Type",
            options: [
                {
                    value: "device_class",
                    label: "Device Class",
                },
                {
                    value: "state_class",
                    label: "State Class",
                },
                {
                    value: "friendly_name",
                    label: "Friendly Name",
                },
                {
                    value: "icon",
                    label: "Icon",
                },
                {
                    value: "attribution",
                    label: "Attribution",
                },
            ],
        },
    ],
    unit: [{ type: "string", argument: "for", label: "Unit is For:" }],
    generic: [],
    json: [],
    timestamp: [],
    location: [
        {
            type: "selection",
            argument: "coordinate",
            label: "Coordinate Part",
            options: [
                { value: "latitude", label: "Latitude" },
                { value: "longitude", label: "Longitude" },
            ],
        },
    ],
};
