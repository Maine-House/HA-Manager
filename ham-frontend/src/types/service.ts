export type ServiceTarget = {
    entity?: { domain: string[] }[];
};

export type ServiceFieldSelector = {
    text?: null;
    object?: null;
    theme?: null;
    boolean?: null;
    addon?: null;
    backup_location?: null;
    conversation_agent?: null;
    time?: null;
    entity?: null | { domain?: string; integration?: string };
    select?: {
        options: { label: string; value: string }[] | string[];
    };
    number?: {
        min: number;
        max: number;
        step?: number;
        unit_of_measurement?: string;
        mode?: string;
    };
};

export type ServiceField = {
    description: string;
    example: string | null;
    name: string;
    required: boolean | null;
    selector: ServiceFieldSelector;
};

export type Service = {
    name: string;
    description: string;
    fields: ServiceField;
    target: ServiceTarget | null;
};

export type ServiceDomain = {
    domain: string;
    services: { [key: string]: Service };
};
