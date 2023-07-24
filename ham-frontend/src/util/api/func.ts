import { createContext, useContext } from "react";
import { CoreConfig } from "../../types/config";

export const API_ROOT = "/api";

export type HTTPMethods = "get" | "post" | "put" | "delete" | "patch";
export type RequestOptions = {
    headers?: { [key: string]: string };
    urlParams?: { [key: string]: string };
    data?: any;
};

export type ApiResponse<T> = (
    | {
          success: true;
          value: T;
      }
    | {
          success: false;
          errorCode?: string;
          errorMessage?: string;
          errorExtras?: { [key: string]: string };
      }
) & {
    code: number;
};

export type UserInfo = {
    username: string;
};

export type ApiContextType = {
    request: <T>(
        method: HTTPMethods,
        url: string,
        options?: RequestOptions
    ) => Promise<ApiResponse<T>>;
    get: <T>(
        url: string,
        options?: Omit<RequestOptions, "data">
    ) => Promise<ApiResponse<T>>;
    del: <T>(
        url: string,
        options?: Omit<RequestOptions, "data">
    ) => Promise<ApiResponse<T>>;
    post: <T>(url: string, options?: RequestOptions) => Promise<ApiResponse<T>>;
    put: <T>(url: string, options?: RequestOptions) => Promise<ApiResponse<T>>;
    patch: <T>(
        url: string,
        options?: RequestOptions
    ) => Promise<ApiResponse<T>>;
    config: CoreConfig | null;
    setConfig: (config: CoreConfig | null) => void;
};

export const ApiContext = createContext<ApiContextType>(null as any);

export function useApi(): ApiContextType {
    const context = useContext(ApiContext);
    return (
        context ?? {
            request: () => {},
            get: () => {},
            del: () => {},
            post: () => {},
            put: () => {},
            patch: () => {},
            config: {},
        }
    );
}
