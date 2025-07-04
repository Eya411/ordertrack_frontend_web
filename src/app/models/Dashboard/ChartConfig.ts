import { ChartData } from 'chart.js';

export interface ChartConfig {
    data: ChartData<'line'>;
    title: string;
}
