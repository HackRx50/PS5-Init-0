import { ResponsiveRadar } from "@nivo/radar";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { mockRadarData as data } from "../data/mockData";

const RadarChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <ResponsiveRadar
      data={data}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
      }}
      keys={["chardonay", "carmenere", "syrah"]}
      indexBy="taste"
      margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
      colors={{ scheme: "nivo" }}
      borderColor={{ from: "color" }}
      gridLevels={5}
      gridShape="circular"
      gridLabelOffset={36}
      enableDots={true}
      dotSize={10}
      dotColor={{ theme: "background" }}
      dotBorderWidth={2}
      dotBorderColor={{ from: "color" }}
      dotLabel="value"
      dotLabelYOffset={-12}
      fillOpacity={0.25}
      blendMode="multiply"
      motionConfig="wobbly"
      legends={[
        {
          anchor: "top-left",
          direction: "column",
          translateX: -50,
          translateY: -40,
          itemWidth: 80,
          itemHeight: 20,
          itemTextColor: colors.grey[100],
          symbolSize: 12,
          symbolShape: "circle",
        },
      ]}
    />
  );
};

export default RadarChart;
