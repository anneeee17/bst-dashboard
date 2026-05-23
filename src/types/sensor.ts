export interface SensorData {
  tegangan_bst: number;
  adc_ads1115: number;
  lux_bh1750: number;
  status_cahaya: string;
  timestamp: number;
}

export interface ChartPoint {
  time: string;
  value: number;
}
