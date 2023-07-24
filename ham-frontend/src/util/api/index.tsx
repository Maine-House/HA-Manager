import { ReactNode, useEffect, useMemo, useState } from "react";
import { CoreConfig } from "../../types/config";
import {
    HTTPMethods,
    RequestOptions,
    ApiResponse,
    API_ROOT,
    ApiContext,
} from "./func";
import { TokenResponse } from "../../types/session";

export function ApiProvider({
    children,
}: {
    children: ReactNode | ReactNode[];
}) {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );

    const [config, setConfig] = useState<CoreConfig | null>(null);

    async function request<T>(
        method: HTTPMethods,
        url: string,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        const headers = {
            Authorization: token ?? "null",
            ...(options && options.headers ? options.headers : {}),
        };

        const fullUrl =
            API_ROOT +
            url +
            (options && options.urlParams
                ? "?" + new URLSearchParams(options.urlParams)
                : "");

        const result = await fetch(fullUrl, {
            method: method.toUpperCase(),
            headers,
            body: options?.data ? JSON.stringify(options.data) : undefined,
        });

        if (result.status === 204) {
            return {
                success: true,
                value: null as any,
                code: result.status,
            };
        }
        const data = await result.text();
        if (result.status < 400) {
            try {
                return {
                    success: true,
                    value: JSON.parse(data),
                    code: result.status,
                };
            } catch (e) {
                return {
                    success: true,
                    value: data as any,
                    code: result.status,
                };
            }
        } else {
            try {
                const detailRaw = JSON.parse(data);
                if (Object.keys(detailRaw).includes("detail")) {
                    try {
                        const fullDetails = JSON.parse(detailRaw.detail);
                        return {
                            success: false,
                            code: result.status,
                            errorCode: fullDetails.code,
                            errorMessage: fullDetails.message ?? undefined,
                            errorExtras: fullDetails.data ?? undefined,
                        };
                    } catch (e) {
                        return {
                            success: false,
                            code: result.status,
                        };
                    }
                } else {
                    return {
                        success: false,
                        code: result.status,
                    };
                }
            } catch (e) {
                return {
                    success: false,
                    code: result.status,
                };
            }
        }
    }

    async function get<T>(
        url: string,
        options?: Omit<RequestOptions, "data">
    ): Promise<ApiResponse<T>> {
        return await request<T>("get", url, options);
    }

    async function del<T>(
        url: string,
        options?: Omit<RequestOptions, "data">
    ): Promise<ApiResponse<T>> {
        return await request<T>("delete", url, options);
    }

    async function post<T>(
        url: string,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return await request<T>("post", url, options);
    }

    async function put<T>(
        url: string,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return await request<T>("put", url, options);
    }

    async function patch<T>(
        url: string,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return await request<T>("patch", url, options);
    }

    useEffect(() => {
        if (token) {
            get<CoreConfig>("/config").then((result) => {
                if (result.success) {
                    setConfig(result.value);
                }
            });
        }
    }, [token]);

    useMemo(() => {
        get<TokenResponse>("/auth/token").then((result) => {
            if (result.success) {
                setToken(result.value.token);
                localStorage.setItem("token", result.value.token);
            }
        });
    }, []);

    return (
        <ApiContext.Provider
            value={{ request, get, del, post, put, patch, config, setConfig }}
        >
            {children}
        </ApiContext.Provider>
    );
}
