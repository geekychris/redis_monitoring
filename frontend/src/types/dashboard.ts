export type WidgetType = 'counter' | 'gauge' | 'line-chart' | 'bar-chart';

export type MetricWidget = {
  id: string;
  title: string;
  redisKey: string;
  type: WidgetType;
  unit?: string;
  format?: 'number' | 'percentage' | 'milliseconds';
  min?: number;
  max?: number;
  width?: number; // Grid columns (1-12)
  height?: number; // Grid rows
};

export type DashboardConfig = {
  name: string;
  refreshInterval?: number;
  widgets: MetricWidget[];
};
