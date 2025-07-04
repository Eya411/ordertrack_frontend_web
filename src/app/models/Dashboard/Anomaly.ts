
export interface Anomaly {
    id: number;
    title: string;
    message: string;
    date: string;
    severity: 'low' | 'medium' | 'high';
    resolved: boolean;
  }