import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        angular({
            jit: true, // Active la compilation JIT pour le développement
            tsconfig: 'tsconfig.json' // Chemin vers votre tsconfig
        })
    ],
    optimizeDeps: {
        include: ['@angular/common', '@angular/forms']
    },
    server: {
        port: 4200, // Port par défaut d'Angular 
        strictPort: true,
        hmr: {
            timeout: 90000  // Augmentez si nécessaire
        }
    },
    build: {
        target: 'es2020',
        outDir: 'dist' // Dossier de sortie
        
    }
});