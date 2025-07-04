export interface DashboardStats {
    totalOrders: number;
    monthlyOrders: number;
    totalClients: number;
    newClients: number;
    totalCompanies: number;
    newCompanies: number;
    totalTransactions: number;
    totalTransactionsThisMonth: number;
    [key: string]: any; // Ajouter cette ligne si vous voulez des clés dynamiques
}
