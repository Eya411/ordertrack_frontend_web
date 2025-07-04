export interface Entreprise {
    id: number;
    matricule_fiscal: string;
    registre_commerce: string;
    forme_juridique: string;
    capital_social: number;
    statut_juridique: string;
    nom: string;
    raison_sociale: string;
    secteur_activite: string;
    description: string;
    adresse: string;
    telephone: string;
    email: string;
    pays_region: string;
    numero_compte: string;
    nom_banque: string;
    devise: string;
    tva_applicable: boolean;
    methode_paiement: string;
    nom_dirigeant: string;
    nom_representant_legal: string;
    nombre_employes: number;
    date_creation: string;
    identifiant_unique: string;
    statut_entreprise: string;
    superadmin_assigne: string | number;
    date_inscription: string;
    created_at: string;
    updated_at: string;
    secteur?: string; // Optional temporary field for UI purposes
}