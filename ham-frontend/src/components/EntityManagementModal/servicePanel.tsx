import { Accordion, Group, Stack, Text } from "@mantine/core";
import { MdTune } from "react-icons/md";
import { BasicState } from "../../util/events";
import { useEffect, useState } from "react";
import { ServiceDomain } from "../../types/service";
import { useApi } from "../../util/api/func";

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
                    <></>
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
