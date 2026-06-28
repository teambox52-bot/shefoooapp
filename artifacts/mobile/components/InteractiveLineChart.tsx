import React from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { AppText } from '@/components/ui/AppText';

type InteractiveLineChartProps<T> = {
  data: T[];
  color: string;
  unit?: string;
  getLabel?: (item: T) => string;
  getValue?: (item: T) => number;
  formatTooltip?: (item: T) => string;
  formatValue?: (value: number, item: T) => string;
};

export function InteractiveLineChart<T>({
  data,
  color,
  unit,
  getLabel,
  getValue,
  formatTooltip,
  formatValue,
}: InteractiveLineChartProps<T>) {
  const colors = useColors();
  const { width: windowWidth } = useWindowDimensions();
  const [selectedIndex, setSelectedIndex] = React.useState(Math.max(data.length - 1, 0));
  const [layoutWidth, setLayoutWidth] = React.useState(0);
  const chartHeight = 118;
  const horizontalPadding = 16;
  const verticalPadding = 14;
  const previousLength = React.useRef(data.length);

  React.useEffect(() => {
    if (previousLength.current !== data.length) {
      previousLength.current = data.length;
      setSelectedIndex(Math.max(data.length - 1, 0));
      return;
    }

    if (selectedIndex > data.length - 1) {
      setSelectedIndex(Math.max(data.length - 1, 0));
    }
  }, [data.length, selectedIndex]);

  if (!data.length) {
    return (
      <View style={styles.empty}>
        <AppText variant="bodySm" color={colors.onSurfaceVariant}>
          No trend readings yet.
        </AppText>
      </View>
    );
  }

  const labelFor = (item: T) => getLabel?.(item) ?? String((item as { day?: string }).day ?? '');
  const valueFor = (item: T) => getValue?.(item) ?? Number((item as { value?: number }).value ?? 0);
  const chartData = data
    .map((item) => ({ item, label: labelFor(item), value: valueFor(item) }))
    .filter((point) => Number.isFinite(point.value));

  if (!chartData.length) {
    return (
      <View style={styles.empty}>
        <AppText variant="bodySm" color={colors.onSurfaceVariant}>
          No plottable trend readings yet.
        </AppText>
      </View>
    );
  }

  const safeSelectedIndex = Math.min(selectedIndex, chartData.length - 1);
  const values = chartData.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = max === min
    ? Math.max(2, Math.round(Math.abs(max || 1) * 0.05))
    : Math.max(2, Math.round((max - min) * 0.25));
  const yMin = min - padding;
  const yMax = max + padding;
  const yRange = yMax - yMin || 1;
  const chartWidth = Math.max(layoutWidth || windowWidth - 64, 240);
  const plotWidth = Math.max(chartWidth - horizontalPadding * 2, 1);
  const xStep = chartData.length > 1 ? plotWidth / (chartData.length - 1) : 0;
  const singlePointX = horizontalPadding + plotWidth / 2;

  const points = chartData.map((point, index) => {
    const x = chartData.length > 1 ? horizontalPadding + index * xStep : singlePointX;
    const y = verticalPadding + ((yMax - point.value) / yRange) * (chartHeight - verticalPadding * 2);
    return { ...point, x, y };
  });

  const selected = points[safeSelectedIndex] ?? points[points.length - 1];
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(' ');
  const defaultValue = formatValue
    ? formatValue(selected.value, selected.item)
    : `${selected.value}${unit ? ` ${unit}` : ''}`;
  const tooltipText = formatTooltip?.(selected.item) ?? `${selected.label} • ${defaultValue}`;

  return (
    <View
      style={styles.wrap}
      onLayout={(event) => setLayoutWidth(event.nativeEvent.layout.width)}
    >
      <View style={[styles.tooltip, { backgroundColor: color + '14', borderColor: color + '25' }]}>
        <AppText variant="labelMd" color={color} style={styles.tooltipText}>
          {tooltipText}
        </AppText>
      </View>
      <View style={styles.svgWrap}>
        {chartWidth > 0 && (
          <Svg width={chartWidth} height={chartHeight}>
            {[0, 1, 2].map((lineIndex) => {
              const y = verticalPadding + lineIndex * ((chartHeight - verticalPadding * 2) / 2);
              return (
                <Line
                  key={lineIndex}
                  x1={horizontalPadding}
                  y1={y}
                  x2={chartWidth - horizontalPadding}
                  y2={y}
                  stroke={colors.outlineVariant + '25'}
                  strokeWidth={1}
                />
              );
            })}
            <Polyline
              points={pointsString}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((point, index) => {
              const selectedPoint = index === safeSelectedIndex;
              return (
                <Circle
                  key={`${point.label}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={selectedPoint ? 7 : 5}
                  fill={selectedPoint ? color : colors.surfaceCard}
                  stroke={color}
                  strokeWidth={selectedPoint ? 3 : 2}
                  onPress={() => setSelectedIndex(index)}
                />
              );
            })}
          </Svg>
        )}
      </View>
      <View style={styles.labels}>
        {points.map((point, index) => (
          <TouchableOpacity
            key={`${point.label}-${index}`}
            activeOpacity={0.75}
            onPress={() => setSelectedIndex(index)}
            style={styles.labelCol}
          >
            <AppText
              variant="labelMd"
              color={index === safeSelectedIndex ? color : colors.onSurfaceVariant}
              style={styles.label}
            >
              {point.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  empty: { minHeight: 118, alignItems: 'center', justifyContent: 'center' },
  tooltip: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  tooltipText: { textTransform: 'none', letterSpacing: 0, fontSize: 11 },
  svgWrap: { height: 118, width: '100%' },
  labels: { flexDirection: 'row', gap: 5 },
  labelCol: { flex: 1, alignItems: 'center' },
  label: { fontSize: 9, textTransform: 'none', letterSpacing: 0 },
});
