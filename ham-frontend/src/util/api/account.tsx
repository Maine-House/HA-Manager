import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { useApi } from "./func";
import { User } from "../../types/user";

export enum AccountStatus {
    waiting = 0,
    loggedOut = 1,
    loggedIn = 2,
}

export type AccountData =
    | ({
          status: AccountStatus.loggedIn;
      } & User)
    | {
          status: AccountStatus.loggedOut;
      }
    | {
          status: AccountStatus.waiting;
      };

export type AccountContextType = {
    account: AccountData;
    reload: () => Promise<AccountData>;
    login: (username: string, password: string) => Promise<AccountData>;
    logout: () => Promise<null>;
};

const AccountContext = createContext<AccountContextType>(null as any);

export function AccountProvider({
    children,
}: {
    children: ReactNode | ReactNode[] | undefined;
}) {
    const [account, setAccount] = useState<AccountData>({
        status: AccountStatus.waiting,
    });
    const { get, post, config, token } = useApi();

    useEffect(() => {
        if (!token || !config || !config.initialized) {
            return;
        }
        get<User>("/account/me").then((result) => {
            if (result.success) {
                setAccount({
                    status: AccountStatus.loggedIn,
                    ...result.value,
                });
            } else {
                setAccount({
                    status: AccountStatus.loggedOut,
                });
            }
        });
    }, [token, config?.initialized]);

    return (
        <AccountContext.Provider
            value={{
                account,
                login: async (username: string, password: string) => {
                    const result = await post<User>("/auth/login", {
                        data: { username, password },
                    });
                    if (result.success) {
                        setAccount({
                            status: AccountStatus.loggedIn,
                            ...result.value,
                        });
                        return {
                            status: AccountStatus.loggedIn,
                            ...result.value,
                        };
                    } else {
                        setAccount({
                            status: AccountStatus.loggedOut,
                        });
                        return {
                            status: AccountStatus.loggedOut,
                        };
                    }
                },
                logout: async () => {
                    await post<null>("/auth/logout");
                    setAccount({
                        status: AccountStatus.loggedOut,
                    });
                    return null;
                },
                reload: async () => {
                    const result = await get<User>("/account/me");
                    let value: AccountData;
                    if (result.success) {
                        value = {
                            status: AccountStatus.loggedIn,
                            ...result.value,
                        };
                    } else {
                        value = {
                            status: AccountStatus.loggedOut,
                        };
                    }
                    setAccount(value);
                    return value;
                },
            }}
        >
            {children}
        </AccountContext.Provider>
    );
}

export function useAccount(): AccountContextType {
    const context = useContext(AccountContext);
    return (
        context ?? {
            account: null,
            login: () => {},
            logout: () => {},
        }
    );
}
