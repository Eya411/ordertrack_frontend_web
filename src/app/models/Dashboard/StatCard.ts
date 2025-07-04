export interface StatCard {
    type: 'entreprises' | 'clients' | 'commandes';
    title: string;
    icon: string;
    values: { label: string; value: number; highlight: boolean }[];
}
