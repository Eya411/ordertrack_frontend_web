export interface AdresseLivraison {
    rue: string;
    complement?: string; // Champ optionnel
    ville: string;
    code_postal: string;
    pays: string;
    instructions_livraison?: string; // Champ optionnel
}

export interface Commande {
    id: number;
    numero_commande: string;
    entreprise_id: number;
    client_id: number | null;
    statut: string;
    montant_total: number;
    avance_payee: number;
    commentaires: string | null;
    adresse_livraison: AdresseLivraison | null;
    created_at: string | Date; // Peut être typé comme Date si vous convertissez les strings
    updated_at: string | Date;
    
    // Ces propriétés pourraient être ajoutées si vous les utilisez dans le front
    // (Elles seraient calculées à partir des données existantes)
    readonly reste_a_payer?: number;
    readonly est_livree?: boolean;
    readonly est_annulee?: boolean;
}