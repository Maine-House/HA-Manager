export type EntityTypes = "sensor" | "switch" | "light";
export const EntityTypeArray: EntityTypes[] = ["sensor", "light", "switch"];

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

export type TrackedEntityField = {
    field: string | "state";
    value: any;
    value_type: "option" | "boolean" | "number";
    value_options?: { [key: string]: any };
};

export type TrackedEntity = {
    id: string;
    last_update: number;
    haid: string;
    name: string;
    type: string;
    tracked_values: TrackedEntityField[];
};
