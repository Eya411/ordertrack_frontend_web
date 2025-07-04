export interface Alerte {
    id: number;
    message: string;
    niveau: string; // anciennement gravite ?
    date: string;   // anciennement date_creation ?
    [key: string]: any;
}
