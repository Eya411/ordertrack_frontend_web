export interface Transaction {
    id: number;
    entreprise_id: number;
    montant: number;
    description: string;
    type: 'Crédit' | 'Débit';
    statut?: string;
    mode_paiement?: string;
    reference_transaction: string;
    commentaire?: string;
    frais_transaction?: number;
    date_transaction: string;
    created_at?: string;
    updated_at?: string;
}