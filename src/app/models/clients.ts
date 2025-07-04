export interface Client {
    id?: number;
    nom: string;
    email: string;
    adresse_physique?: string;
    telephone?: string;
    entreprise_id: number;
    statut: 'actif' | 'inactif' | 'en_attente' | 'suspendu';

    password?: string;
    date_inscription?: string;
    nombre_commandes?: number;
    entreprise?: any;
    commandes?: any[];
    historique?: any[];
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface ClientFilter {
    nom?: string;
    entreprise_id?: number;
    statut?: string;
    nombre_commandes?: number;
    date_inscription?: string;
}