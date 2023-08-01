import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { DataEntry, View } from "../../types/data";
import { useApi } from "../../util/api/func";
import { useEvent } from "../../util/events";
import { ResponsiveLine } from "@nivo/line";
import { Box, useMantineTheme } from "@mantine/core";
import { useColorMode } from "../../util/colorMode";
import { guessTimeUnit } from "./util";
import { ResponsiveBar } from "@nivo/bar";

function useData(view: View): DataEntry[] {
    const [data, setData] = useState<DataEntry[]>([]);
    const { get } = useApi();
    const loadData = useCallback(() => {
        get<DataEntry[]>(`/views/${view.id}/data`).then(
            (result) => result.success && setData(result.value)
        );
    }, [view.id]);
    useEvent<string[]>(`data-listener-${view.id}`, "data", loadData);

    useEffect(() => loadData(), []);

    return data;
}

type GraphTypeProps = {
    data: DataEntry[];
    view: View;
};

const GraphTypeLinear = memo(({ data, view }: GraphTypeProps) => {
    const [mode] = useColorMode();
    const theme = useMantineTheme();
    const transformedData = useMemo(() => {
        return view.fields.map((field) => ({
            id: field.name,
            color: field.color,
            data: data
                .filter(
                    (entry) =>
                        entry.entity === field.entity &&
                        entry.field === field.field &&
                        !isNaN(Number(entry.value))
                )
                .map((entry) => ({
                    x: new Date(entry.time * 1000),
                    y: Number(entry.value),
                })),
        }));
    }, [data, view.fields]);

    return (
        <ResponsiveLine
            data={transformedData ?? []}
            animate
            theme={{
                textColor: mode === "dark" ? "#cccccc" : "#333333",
                grid: {
                    line: {
                        stroke: mode === "dark" ? "#cccccc44" : "#33333344",
                    },
                },
                tooltip: {
                    container: {
                        backgroundColor:
                            mode === "dark"
                                ? theme.colors.dark[6]
                                : theme.colors.gray[1],
                    },
                },
            }}
            axisBottom={{
                format: "%m/%d %H:%M",
                legendOffset: -12,
                tickValues: 10,
                tickRotation: 45,
            }}
            axisLeft={{
                legendOffset: 24,
            }}
            margin={{ top: 8, right: 48, bottom: 64, left: 24 }}
            xFormat="time:%Y-%m-%d %H:%M:%S.%L"
            xScale={{
                format: "native",
                precision: "second",
                type: "time",
            }}
            yScale={{
                type: "linear",
            }}
            yFormat={(val) => val + "%"}
            pointSize={4}
            pointColor={{ from: "color" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "color" }}
            enableSlices="x"
            curve="monotoneX"
            colors={(transformedData ?? []).map(({ color }) => color)}
        />
    );
});

const GraphTypeFrequency = memo(({ data, view }: GraphTypeProps) => {
    const [mode] = useColorMode();
    const theme = useMantineTheme();
    const transformedData: any[] = useMemo(() => {
        const fields: { [key: string]: [string, string] } = view.fields.reduce(
            (previous, current) => ({
                ...previous,
                [current.entity + ":" + current.field]: [
                    current.name,
                    current.color,
                ],
            }),
            {}
        );
        return Object.values(
            data.reduce(
                (previous, current) => ({
                    ...previous,
                    [current.value.toString().toLowerCase()]: {
                        ...(previous[current.value.toString().toLowerCase()] ??
                            {}),
                        key: current.value.toString().toLowerCase(),
                        [fields[current.entity + ":" + current.field][0]]:
                            ((previous[
                                current.value.toString().toLowerCase()
                            ] ?? {})[
                                fields[current.entity + ":" + current.field][0]
                            ] ?? 0) + 1,
                        [fields[current.entity + ":" + current.field][0] +
                        "-color"]:
                            fields[current.entity + ":" + current.field][1],
                    },
                }),
                {} as any
            )
        );
    }, [data, view.fields]);

    console.log(transformedData);

    return (
        <ResponsiveBar
            data={transformedData ?? []}
            animate
            theme={{
                textColor: mode === "dark" ? "#cccccc" : "#333333",
                grid: {
                    line: {
                        stroke: mode === "dark" ? "#cccccc44" : "#33333344",
                    },
                },
                tooltip: {
                    container: {
                        backgroundColor:
                            mode === "dark"
                                ? theme.colors.dark[6]
                                : theme.colors.gray[1],
                    },
                },
            }}
            keys={view.fields.map((v) => v.name)}
            indexBy="key"
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Value",
                legendPosition: "middle",
                legendOffset: 32,
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Frequency",
                legendPosition: "middle",
                legendOffset: -40,
            }}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            margin={{ top: 8, right: 48, bottom: 64, left: 24 }}
            colors={view.fields.map((field) => field.color)}
        />
    );
});

export function ViewGraph({ view }: { view: View }) {
    const data = useData(view);

    return (
        <Box className="view-graph" h={"100%"}>
            {view.type === "linear" && (
                <GraphTypeLinear data={data} view={view} />
            )}
            {view.type === "frequency" && (
                <GraphTypeFrequency data={data} view={view} />
            )}
        </Box>
    );
}
