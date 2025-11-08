import { DashboardConfig } from '../types/dashboard';
import exampleDashboard from './example-dashboard.json';
import minimalDashboard from './minimal-dashboard.json';
import networkDashboard from './network-dashboard.json';

export type DashboardRegistry = {
  [key: string]: DashboardConfig;
};

export const dashboards: DashboardRegistry = {
  'system-metrics': exampleDashboard as DashboardConfig,
  'minimal': minimalDashboard as DashboardConfig,
  'network': networkDashboard as DashboardConfig,
};

export const defaultDashboardKey = 'system-metrics';

export const getDashboardKeys = (): string[] => Object.keys(dashboards);

export const getDashboard = (key: string): DashboardConfig | undefined => {
  return dashboards[key];
};

export const getDashboardName = (key: string): string => {
  return dashboards[key]?.name || key;
};
