export interface Admin {
    id?: number;
    nom: string;
    email: string;
    role: string;
    statut?: string;
    password?: string;
    password_confirmation?: string;
    deleted_at?: string;
    date_creation?: string;
    date_derniere_connexion?: string;
}
