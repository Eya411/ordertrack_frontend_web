export interface Activity {
    id: number;
    type: 'login' | 'commande' | 'update' | 'entreprise' | string;
    description: string;
    date: string;
    status: 'success' | 'warning' | 'error';
    company?: string;
    client?: string;
    user?: string;
  }