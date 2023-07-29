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
