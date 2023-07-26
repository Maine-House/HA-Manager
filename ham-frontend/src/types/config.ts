export type CoreConfig = {
    initialized: boolean;
    homeassistant_address: string | null;
    location_name: string | null;
};

export type FullConfig = CoreConfig & { homeassistant_token: string | null };
