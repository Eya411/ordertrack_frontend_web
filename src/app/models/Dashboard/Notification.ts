export interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    type: 'info' | 'warning' | 'critical';
    read: boolean;
}  