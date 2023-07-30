import { Accordion, Group, Modal, Stack, Text } from "@mantine/core";
import { Entity, TrackedEntity } from "../../types/entity";
import "./emm.scss";
import { MdBarChart, MdSettings } from "react-icons/md";
import { BasicState, useEntityState, useEvent } from "../../util/events";
import { memo, useEffect, useState } from "react";
import { useApi } from "../../util/api/func";
import { EntityValue } from "./valueItem";
import { Masonry } from "masonic";
import { ServicePanel } from "./servicePanel";

const CardWrapper = memo(
    ({
        data,
    }: {
        index: number;
        data: {
            attribute: string;
            entity: Entity;
            entityState: BasicState | null;
            tracking: TrackedEntity | null;
        };
        width: number;
    }) => (
        <EntityValue
            field={data.attribute}
            entity={data.entity}
            updatedState={data.entityState}
            tracked={data.tracking}
            key={data.attribute}
        />
    )
);

export function EntityManagementModal({
    open,
    setOpen,
    entity,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    entity: Entity;
}) {
    const { get } = useApi();
    const entityState = useEntityState(entity.id);
    const [tracking, setTracking] = useState<TrackedEntity | null>(null);

    useEffect(() => {
        get<TrackedEntity>(`/ha/entities/tracked/${entity.id}`).then((result) =>
            result.success ? setTracking(result.value) : setTracking(null)
        );
    }, [entity.id, entityState?.entityId, entityState?.state]);

    useEvent<TrackedEntity>(
        `entity.tracking.${entity.id}`,
        `entity.tracked.${entity.id}`,
        setTracking
    );

    const [panel, setPanel] = useState<string | null>("fields");

    return (
        <Modal
            className="entity-management-modal"
            size="100%"
            opened={open}
            onClose={() => setOpen(false)}
            title={
                <Group spacing="md">
                    <MdSettings size={24} />
                    <Text fw="500">{entity.name}</Text>
                </Group>
            }
        >
            <Stack spacing={"md"}>
                <Accordion
                    className="sections"
                    variant="separated"
                    value={panel}
                    onChange={setPanel}
                >
                    <Accordion.Item value="fields" className="section fields">
                        <Accordion.Control>
                            <Group spacing="md">
                                <MdBarChart size={20} /> Fields
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel className="section-panel">
                            <Masonry
                                render={CardWrapper}
                                items={[
                                    "state",
                                    ...Object.keys(
                                        entityState?.attributes ??
                                            entity.attributes
                                    ),
                                ].map((attribute) => ({
                                    attribute,
                                    entity,
                                    entityState,
                                    tracking,
                                }))}
                                columnGutter={12}
                                maxColumnCount={3}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                    <ServicePanel id={entity.id} state={entityState} />
                </Accordion>
            </Stack>
        </Modal>
    );
}
