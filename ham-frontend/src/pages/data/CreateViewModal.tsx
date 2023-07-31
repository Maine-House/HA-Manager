import {
    ActionIcon,
    Button,
    ColorInput,
    Group,
    Modal,
    NumberInput,
    Paper,
    SegmentedControl,
    Select,
    Stack,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import {
    MdAdd,
    MdAddChart,
    MdBarChart,
    MdCheck,
    MdDelete,
    MdEdit,
    MdSchedule,
} from "react-icons/md";
import { View } from "../../types/data";
import { TrackedEntity, TrackedFieldType } from "../../types/entity";
import { useEffect, useMemo, useState } from "react";
import { startCase } from "lodash";
import { useApi } from "../../util/api/func";
import "./viewModal.scss";
import { DateTimePicker } from "@mantine/dates";

type ViewRangeUnit =
    | "seconds"
    | "minutes"
    | "hours"
    | "days"
    | "weeks"
    | "months"
    | "years";

type ViewForm = {
    name: string;
    type: View["type"];
    fields: {
        field: `${string}:${string}`;
        name: string;
        color: string;
    }[];
    range: {
        mode: "delta" | "absolute";
        start: number | Date;
        startUnit: ViewRangeUnit;
        end: number | Date;
        endUnit: ViewRangeUnit;
        resolution: number;
        resolutionUnit: ViewRangeUnit;
    };
};

function UnitSelect({
    ip,
}: {
    ip: {
        value: any;
        onChange: any;
        checked?: any;
        error?: any;
        onFocus?: any;
        onBlur?: any;
    };
}) {
    return (
        <Select
            icon={<MdSchedule size={20} />}
            data={[
                {
                    label: "Seconds",
                    value: "seconds",
                },
                {
                    label: "Minutes",
                    value: "minutes",
                },
                {
                    label: "Hours",
                    value: "hours",
                },
                {
                    label: "Days",
                    value: "days",
                },
                {
                    label: "Weeks",
                    value: "weeks",
                },
                {
                    label: "Months",
                    value: "months",
                },
                {
                    label: "Years",
                    value: "years",
                },
            ]}
            label={"Unit"}
            withAsterisk
            {...ip}
        />
    );
}

type ViewConstraint = { entity: TrackedEntity; field: TrackedFieldType };

function ViewFieldFormItem({
    form,
    index,
    constraints,
}: {
    form: UseFormReturnType<ViewForm, (values: ViewForm) => ViewForm>;
    index: number;
    constraints: ViewConstraint[];
}) {
    const data = useMemo(
        () =>
            constraints.map((constraint) => ({
                value: constraint.entity.haid + ":" + constraint.field.field,
                label:
                    startCase(constraint.entity.name) +
                    " - " +
                    startCase(constraint.field.field),
                group: startCase(constraint.entity.name),
            })),
        [constraints]
    );
    return (
        <Paper shadow="sm" p="sm" withBorder className="view-field-item">
            <ActionIcon
                color="red"
                className="delete-field"
                onClick={() => form.removeListItem("fields", index)}
            >
                <MdDelete />
            </ActionIcon>
            <Stack spacing="sm">
                <Select
                    data={data}
                    label="Field"
                    {...form.getInputProps(`fields.${index}.field`)}
                    withAsterisk
                    clearable
                    maxDropdownHeight={180}
                    searchable
                />
                <TextInput
                    label="Field Name"
                    withAsterisk
                    placeholder="New Field"
                    {...form.getInputProps(`fields.${index}.name`)}
                />
                <ColorInput
                    label="Field Color"
                    withAsterisk
                    placeholder="#ffffff"
                    {...form.getInputProps(`fields.${index}.color`)}
                />
            </Stack>
        </Paper>
    );
}

function useViewConstraints(
    form: UseFormReturnType<ViewForm, (values: ViewForm) => ViewForm>,
    entities: TrackedEntity[]
): ViewConstraint[] {
    const results = useMemo(() => {
        let constrained: ViewConstraint[] = entities
            .flatMap((entity) =>
                entity.tracked_values.map((field) => ({ entity, field }))
            )
            .filter((constraint) => constraint.field.logging);
        switch (form.values.type) {
            case "frequency":
                constrained = constrained.filter(({ field }) =>
                    ["boolean", "string", "metadata", "unit"].includes(
                        field.type
                    )
                );
                break;
            case "linear":
                constrained = constrained.filter(({ field }) =>
                    ["measurement"].includes(field.type)
                );
                break;
            case "valueTime":
                constrained = constrained.filter(({ field }) =>
                    ["boolean", "string", "metadata", "unit"].includes(
                        field.type
                    )
                );
                break;
        }

        if (
            form.values.fields.filter((f) => f.field !== null).length > 0 &&
            form.values.type === "linear"
        ) {
            const unitCheck = form.values.fields.find(
                (field) => field.field !== null
            );
            if (unitCheck) {
                const requiredUnit = (
                    entities
                        .find(
                            (entity) =>
                                entity.haid === unitCheck.field.split(":")[0]
                        )
                        ?.tracked_values.find(
                            (field) =>
                                field.field === unitCheck.field.split(":")[1]
                        ) as any
                ).unit;
                constrained = constrained.filter(
                    ({ field }) =>
                        (field as any).unit === (requiredUnit ?? "") ||
                        !requiredUnit
                );
            }
        }

        return constrained;
    }, [form.values.type, form.values.fields, entities]);
    return results;
}

export function CreateViewModal({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const form = useForm<ViewForm>({
        initialValues: {
            name: "",
            type: "linear",
            fields: [],
            range: {
                mode: "delta",
                start: 0,
                startUnit: "days",
                end: 0,
                endUnit: "days",
                resolution: 1,
                resolutionUnit: "minutes",
            },
        },
    });
    const { get } = useApi();

    const [entities, setEntities] = useState<TrackedEntity[]>([]);

    useEffect(() => {
        if (open) {
            get<TrackedEntity[]>("/ha/entities/tracked").then(
                (result) => result.success && setEntities(result.value)
            );
        }
    }, [open]);

    const constraints = useViewConstraints(form, entities);
    const [prevMode, setPrevMode] = useState<"delta" | "absolute">("delta");

    useEffect(() => {
        form.setValues({
            range: {
                mode: form.values.range.mode,
                start: 0,
                startUnit: "days",
                end: 0,
                endUnit: "days",
                resolution: 1,
                resolutionUnit: "minutes",
            },
        });
        setPrevMode(form.values.range.mode);
    }, [form.values.range.mode]);

    return (
        <Modal
            opened={open}
            onClose={() => setOpen(false)}
            className="create-view-modal"
            size="xl"
            centered
            title={
                <Group spacing="md">
                    <MdAddChart size={24} />
                    <Title order={3}>Create View</Title>
                </Group>
            }
        >
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
                <Stack spacing="md">
                    <TextInput
                        icon={<MdEdit />}
                        label="Name"
                        placeholder="New View"
                        withAsterisk
                        {...form.getInputProps("name")}
                    />
                    <Select
                        icon={<MdBarChart />}
                        label="View Type"
                        withAsterisk
                        data={[
                            {
                                value: "linear",
                                label: "Line Chart",
                            },
                            {
                                value: "frequency",
                                label: "Frequency Bars",
                            },
                            {
                                value: "valueTime",
                                label: "Time-Indexed Values",
                            },
                        ]}
                        {...form.getInputProps("type")}
                    />
                    <Stack spacing="sm" className="field-items">
                        {form.values.fields.map((_, index) => (
                            <ViewFieldFormItem
                                index={index}
                                form={form}
                                constraints={constraints}
                                key={index}
                            />
                        ))}
                        <Button
                            leftIcon={<MdAdd size={20} />}
                            fullWidth
                            onClick={() =>
                                form.insertListItem("fields", {
                                    field: null,
                                    name: "New Field",
                                    color: "#ff0000",
                                })
                            }
                        >
                            New Field
                        </Button>
                    </Stack>
                    <SegmentedControl
                        data={[
                            {
                                label: "Relative Time",
                                value: "delta",
                            },
                            {
                                label: "Absolute Time",
                                value: "absolute",
                            },
                        ]}
                        fullWidth
                        {...form.getInputProps("range.mode")}
                    />
                    {form.values.range.mode === "absolute"
                        ? form.values.range.mode === prevMode && (
                              <Stack spacing="md">
                                  <DateTimePicker
                                      label="Start Time"
                                      dropdownType="modal"
                                      withAsterisk
                                      {...form.getInputProps("range.start")}
                                  />
                                  <DateTimePicker
                                      label="End Time"
                                      dropdownType="modal"
                                      withAsterisk
                                      {...form.getInputProps("range.end")}
                                  />
                                  <Group spacing="sm">
                                      <NumberInput
                                          label="Data Point Resolution"
                                          min={0}
                                          withAsterisk
                                          style={{ flexGrow: 1 }}
                                          {...form.getInputProps(
                                              "range.resolution"
                                          )}
                                      />
                                      <UnitSelect
                                          ip={form.getInputProps(
                                              "range.resolutionUnit"
                                          )}
                                      />
                                  </Group>
                              </Stack>
                          )
                        : form.values.range.mode === prevMode && (
                              <Stack spacing="md">
                                  <Group spacing="sm">
                                      <NumberInput
                                          label="Start Time"
                                          withAsterisk
                                          style={{ flexGrow: 1 }}
                                          {...form.getInputProps("range.start")}
                                      />
                                      <UnitSelect
                                          ip={form.getInputProps(
                                              "range.startUnit"
                                          )}
                                      />
                                  </Group>
                                  <Group spacing="sm">
                                      <NumberInput
                                          label="End Time"
                                          withAsterisk
                                          style={{ flexGrow: 1 }}
                                          {...form.getInputProps("range.end")}
                                      />
                                      <UnitSelect
                                          ip={form.getInputProps(
                                              "range.endUnit"
                                          )}
                                      />
                                  </Group>
                                  <Group spacing="sm">
                                      <NumberInput
                                          label="Data Point Resolution"
                                          min={0}
                                          withAsterisk
                                          style={{ flexGrow: 1 }}
                                          {...form.getInputProps(
                                              "range.resolution"
                                          )}
                                      />
                                      <UnitSelect
                                          ip={form.getInputProps(
                                              "range.resolutionUnit"
                                          )}
                                      />
                                  </Group>
                              </Stack>
                          )}
                    <Group position="right">
                        <Button type="submit" leftIcon={<MdCheck size={20} />}>
                            Create
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
