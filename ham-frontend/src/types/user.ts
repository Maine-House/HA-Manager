export type PermissionType = "disabled" | "view" | "edit";
export type UserPermissions = {
    data: PermissionType;
    settings: PermissionType;
    accounts: PermissionType;
    areas: PermissionType;
    rules: PermissionType;
};

export type User = {
    id: string;
    username: string;
    permissions: UserPermissions;
};
