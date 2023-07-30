import {
    Accordion,
    Button,
    Card,
    Group,
    JsonInput,
    NumberInput,
    Popover,
    Select,
    Stack,
    Switch,
    Text,
    TextInput,
} from "@mantine/core";
import { MdCheck, MdClose, MdTune } from "react-icons/md";
import { BasicState } from "../../util/events";
import { useEffect, useState } from "react";
import { Service, ServiceDomain, ServiceField } from "../../types/service";
import { useApi } from "../../util/api/func";
import Masonry from "react-masonry-css";
import { startCase } from "lodash";
import { DateTimePicker } from "@mantine/dates";
import { Entity } from "../../types/entity";
import { notifications } from "@mantine/notifications";

function ServiceField({
    id,
    field,
    value,
    onChange,
}: {
    id: string;
    field: ServiceField | null;
    value: any;
    onChange: (value: any) => void;
}) {
    const [openDesc, setOpenDesc] = useState(false);
    if (!field) {
        return <></>;
    }
    if (
        field.selector.text !== undefined ||
        field.selector.theme !== undefined ||
        field.selector.addon !== undefined ||
        field.selector.backup_location !== undefined ||
        field.selector.conversation_agent !== undefined ||
        field.selector.entity !== undefined
    ) {
        return (
            <Popover
                opened={openDesc && field.description ? true : false}
                width="target"
                withArrow
            >
                <Popover.Target>
                    <TextInput
                        onMouseEnter={() => setOpenDesc(true)}
                        onMouseLeave={() => setOpenDesc(false)}
                        label={startCase(
                            (field.name ?? "").length > 0 ? field.name : id
                        )}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder={field.example ?? ""}
                    />
                </Popover.Target>
                <Popover.Dropdown>{field.description}</Popover.Dropdown>
            </Popover>
        );
    }
    if (field.selector.number) {
        return (
            <Popover
                opened={openDesc && field.description ? true : false}
                width="target"
                withArrow
            >
                <Popover.Target>
                    <NumberInput
                        onMouseEnter={() => setOpenDesc(true)}
                        onMouseLeave={() => setOpenDesc(false)}
                        label={startCase(
                            (field.name ?? "").length > 0 ? field.name : id
                        )}
                        value={value}
                        onChange={(value) => onChange(value)}
                        placeholder={field.example ?? ""}
                        min={field.selector.number.min}
                        max={field.selector.number.max}
                        step={field.selector.number.step}
                    />
                </Popover.Target>
                <Popover.Dropdown>{field.description}</Popover.Dropdown>
            </Popover>
        );
    }
    if (field.selector.time !== undefined) {
        return (
            <Popover
                opened={openDesc && field.description ? true : false}
                width="target"
                withArrow
            >
                <Popover.Target>
                    <DateTimePicker
                        onMouseEnter={() => setOpenDesc(true)}
                        onMouseLeave={() => setOpenDesc(false)}
                        label={startCase(
                            (field.name ?? "").length > 0 ? field.name : id
                        )}
                        value={value}
                        onChange={(value) => onChange(value)}
                        placeholder={field.example ?? ""}
                    />
                </Popover.Target>
                <Popover.Dropdown>{field.description}</Popover.Dropdown>
            </Popover>
        );
    }
    if (field.selector.select) {
        return (
            <Popover
                opened={openDesc && field.description ? true : false}
                width="target"
                withArrow
            >
                <Popover.Target>
                    <Select
                        onMouseEnter={() => setOpenDesc(true)}
                        onMouseLeave={() => setOpenDesc(false)}
                        label={startCase(
                            (field.name ?? "").length > 0 ? field.name : id
                        )}
                        value={value}
                        onChange={(value) => onChange(value)}
                        placeholder={field.example ?? ""}
                        data={field.selector.select.options}
                    />
                </Popover.Target>
                <Popover.Dropdown>{field.description}</Popover.Dropdown>
            </Popover>
        );
    }
    if (field.selector.boolean !== undefined) {
        return (
            <Popover
                opened={openDesc && field.description ? true : false}
                width="target"
                withArrow
            >
                <Popover.Target>
                    <Switch
                        onMouseEnter={() => setOpenDesc(true)}
                        onMouseLeave={() => setOpenDesc(false)}
                        label={startCase(
                            (field.name ?? "").length > 0 ? field.name : id
                        )}
                        checked={value}
                        onChange={(event) => onChange(event.target.checked)}
                    />
                </Popover.Target>
                <Popover.Dropdown>{field.description}</Popover.Dropdown>
            </Popover>
        );
    }
    if (field.selector.object !== undefined) {
        return (
            <Popover
                opened={openDesc && field.description ? true : false}
                width="target"
                withArrow
            >
                <Popover.Target>
                    <JsonInput
                        onMouseEnter={() => setOpenDesc(true)}
                        onMouseLeave={() => setOpenDesc(false)}
                        label={startCase(
                            (field.name ?? "").length > 0 ? field.name : id
                        )}
                        value={value}
                        onChange={(value) => onChange(value)}
                        placeholder={field.example ?? ""}
                        formatOnBlur
                        validationError="Invalid JSON"
                    />
                </Popover.Target>
                <Popover.Dropdown>{field.description}</Popover.Dropdown>
            </Popover>
        );
    }
    return <></>;
}

function useServiceFields(): {
    values: { [key: string]: any };
    setValue: (key: string, value: any) => void;
    clear: () => void;
} {
    const [values, setValues] = useState<{ [key: string]: any }>({});

    return {
        values,
        setValue: (key, value) =>
            setValues((old) => ({ ...old, [key]: value })),
        clear: () => setValues({}),
    };
}

function ServiceItem({
    service,
    id,
    domain,
    state,
}: {
    service: Service;
    id: string;
    domain: string;
    state: BasicState | null;
}) {
    const { values, setValue, clear } = useServiceFields();
    const { post } = useApi();
    return (
        <Card className="service-item" shadow="sm">
            <Stack spacing="md">
                <Stack spacing="2px" align="left">
                    <Text fw={600}>
                        {service.name.length > 0 ? service.name : startCase(id)}
                    </Text>
                    <Text fw={400} size="sm" color="dimmed">
                        {service.description}
                    </Text>
                </Stack>
                {Object.entries(service.fields).map(([id, field]) => (
                    <ServiceField
                        key={id}
                        value={values[id] ?? ""}
                        onChange={(value) => setValue(id, value)}
                        id={id}
                        field={field}
                    />
                ))}
                <Group spacing="md" position="right">
                    <Button
                        color="red"
                        leftIcon={<MdClose size={20} />}
                        variant="subtle"
                        onClick={() => clear()}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        leftIcon={<MdCheck size={20} />}
                        variant="filled"
                        onClick={() =>
                            post<Entity[]>(`/ha/domains/${domain}/${id}`, {
                                data: {
                                    ...values,
                                    entity_id: service.target
                                        ? state?.entityId
                                        : undefined,
                                },
                            }).then((result) => {
                                if (result.success) {
                                    notifications.show({
                                        color: "green",
                                        title: "Success!",
                                        message: `Successfully executed ${domain}.${id}.`,
                                    });
                                    clear();
                                } else {
                                    notifications.show({
                                        color: "red",
                                        title: "Failed to call service.",
                                        message: result.errorExtras?.error,
                                    });
                                }
                            })
                        }
                    >
                        Activate
                    </Button>
                </Group>
            </Stack>
        </Card>
    );
}

export function ServicePanel({
    id,
    state,
}: {
    id: string;
    state: BasicState | null;
}) {
    const [domain, setDomain] = useState<ServiceDomain | null>(null);
    const { get } = useApi();

    useEffect(() => {
        get<ServiceDomain>(`/ha/domains/${id.split(".")[0]}`).then((result) =>
            result.success ? setDomain(result.value) : setDomain(null)
        );
    }, [id]);

    return (
        <Accordion.Item value="services" className="section services">
            <Accordion.Control>
                <Group spacing="md">
                    <MdTune size={20} /> Services
                </Group>
            </Accordion.Control>
            <Accordion.Panel className="section-panel">
                {domain ? (
                    <Masonry
                        className="masonry masonry-services"
                        columnClassName="masonry-column"
                        breakpointCols={3}
                    >
                        {Object.entries(domain.services).map(([key, data]) => (
                            <ServiceItem
                                service={data}
                                key={key}
                                id={key}
                                domain={domain.domain}
                                state={state}
                            />
                        ))}
                    </Masonry>
                ) : (
                    <Stack className="no-services" align="center" spacing="md">
                        <MdTune size={64} />
                        <Text fw={600}>No Available Services</Text>
                    </Stack>
                )}
            </Accordion.Panel>
        </Accordion.Item>
    );
}
