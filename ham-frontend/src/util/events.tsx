import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useApi } from "./api/func";
import { Entity } from "../types/entity";
import { v4 } from "uuid";

export interface ServerEvent {
    type: string;
}

export type ServerEventHandler = <T>(
    id: string,
    event: string,
    handler: (event: T) => void
) => void;

export type EventContextType = {
    addHandler: ServerEventHandler;
    removeHandler: (id: string) => void;
};

const EventContext = createContext<EventContextType>({
    addHandler: () => {},
    removeHandler: () => {},
});

type HandlerItem = {
    event: string;
    handler: (event: any) => void;
};

type HandlerMap = { [key: string]: HandlerItem };

export function EventsProvider({
    children,
}: {
    children: ReactNode | ReactNode[] | undefined;
}) {
    const [handlers, setHandlers] = useState<HandlerMap>({});
    const { token } = useApi();

    useEffect(() => {
        const controller = new AbortController();
        if (!token) {
            return;
        }
        fetchEventSource("/api/events", {
            method: "GET",
            headers: {
                Authorization: token,
            },
            signal: controller.signal,
            onmessage(ev) {
                if (ev.data && ev.data.length > 0) {
                    try {
                        const decoded = JSON.parse(ev.data);
                        if (decoded.EventType) {
                            const { EventType, ...data } = decoded;
                            Object.values(handlers).map(
                                ({ event, handler }) => {
                                    if (event === EventType) {
                                        handler(data);
                                    }
                                }
                            );
                        }
                    } catch (e) {
                        console.warn("Failed to parse incoming event:", e);
                    }
                }
            },
        });
        return () => controller.abort();
    }, [token, handlers]);

    return (
        <EventContext.Provider
            value={{
                addHandler: (id, event, handler) =>
                    setHandlers((curHandlers) => ({
                        ...curHandlers,
                        [id]: { event, handler },
                    })),
                removeHandler: (id) => {
                    const removed = Object.keys(handlers).reduce(
                        (prev, current) =>
                            current === id
                                ? prev
                                : { ...prev, [current]: handlers[current] },
                        {}
                    );
                    setHandlers(removed);
                },
            }}
        >
            {children}
        </EventContext.Provider>
    );
}

export function useEvent<T>(
    id: string,
    type: string,
    handler: (event: T) => void
) {
    const { addHandler, removeHandler } = useContext(EventContext);

    useEffect(() => {
        addHandler(id, type, handler);
        return () => removeHandler(id);
    }, [type, handler]);
}

export type BasicState = {
    entityId: string;
    state: any;
    attributes: { [key: string]: any };
};

export function useEntityState(entityId: string): BasicState | null {
    const [entity, setEntity] = useState<BasicState | null>(null);
    const uuid = useMemo(() => v4(), [entityId]);
    const { get } = useApi();

    useEffect(() => {
        get<Entity>(`/ha/entities/${entityId}`).then((result) =>
            result.success
                ? setEntity({
                      entityId: result.value.id,
                      state: result.value.state,
                      attributes: result.value.attributes,
                  })
                : setEntity(null)
        );
    }, [entityId]);

    const stateUpdateFunc = useCallback(
        (event: any) => {
            if (event?.data?.entity_id === entityId && event?.data?.new_state) {
                const newState = event.data.new_state;
                setEntity({
                    entityId: newState.entity_id,
                    state: newState.state,
                    attributes: newState.attributes,
                });
            }
        },
        [entityId]
    );

    useEvent<any>(`watch-state-${uuid}-${entityId}`, "states", stateUpdateFunc);

    return entity;
}
