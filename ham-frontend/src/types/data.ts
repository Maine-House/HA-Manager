export type DataEntry = {
    id: string;
    entity: string;
    field: string;
    value: any;
    time: number;
};

export type ViewType = "linear" | "frequency";

export type ViewField = {
    entity: string;
    field: string;
    name: string;
    color: string;
};

export type ViewRange = {
    mode: "delta" | "absolute";
    start: number;
    end: number;
    resolution: number;
};

export type View = {
    id: string;
    name: string;
    type: ViewType;
    fields: ViewField[];
    range: ViewRange;
};
