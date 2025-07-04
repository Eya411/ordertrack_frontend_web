export interface ClientOrder {
    id: number;
    date: string; // ou Date, selon ton API
    statut: string;
    montant: number;
}
