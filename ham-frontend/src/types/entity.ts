export type EntityTypes = "sensor" | "switch" | "light";
export const EntityTypeArray: EntityTypes[] = ["sensor", "light", "switch"];

export type UnmanagedEntityType = {
    id: string;
    name: string;
    type: EntityTypes;
    state: string;
    attributes: { [key: string]: any };
    last_changed?: string | null;
    last_updated?: string | null;
};
