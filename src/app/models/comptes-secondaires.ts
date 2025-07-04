export interface CompteSecondaire {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    password?: string;
    role: 'commercial' | 'chef_atelier';
    entreprise_id: number;
    statut: 'actif' | 'inactif' | 'en_attente' | 'bloque'; // Changé de "bloqué" à "bloque"
}
