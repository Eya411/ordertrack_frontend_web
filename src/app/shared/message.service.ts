import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root' // Important pour les applications Standalone
})
export class MessageService {
    private messages: string[] = [];

    add(message: string) {
        this.messages.push(message);
        console.log('Message added:', message); // Optionnel - pour le debug
    }

    clear() {
        this.messages = [];
    }

    getMessages(): string[] {
        return this.messages;
    }

    // Méthode pour afficher des notifications (peut être étendue avec Toast, Snackbar, etc.)
    showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
        this.add(message);
        // Ici vous pourrez intégrer PrimeNG Toast ou autre système de notification
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}