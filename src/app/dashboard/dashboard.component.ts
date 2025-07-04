import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CategoryScale, Chart, ChartConfiguration, LinearScale, registerables } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    NgChartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.95)', opacity: 0 }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  // Données principales
  statCards = signal<any[]>([]);
  activities = signal<any[]>([]);
  pendingActions = signal<any>({});
  orderTimeline = signal<any[]>([]);
  performanceIndicators = signal<any>({});

  public pieChartType: 'pie' = 'pie';

  // Graphiques
  currentChartType = 'commandes';
  chartView = 'month';
  currentChartTitle = 'Évolution des Commandes';
  currentChartData: ChartConfiguration<'line'>['data'];
  // Modales
  showModal = signal(false);
  modalContent = signal<any>(null);
  modalData: any = null;



  // Options des graphiques
  lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          usePointStyle: true
        }
      },
      tooltip: {
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          precision: 0,
          stepSize: 1
        }
      }
    }
  };

  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['En attente', 'Terminées', 'Annulées'],
    datasets: [{
      data: [0, 0, 0], // Initialiser avec des zéros par défaut
      backgroundColor: [
        'rgba(66, 165, 245, 0.8)',
        'rgba(102, 187, 106, 0.8)',
        'rgba(239, 83, 80, 0.8)'
      ],
      borderColor: [
        'rgba(66, 165, 245, 1)',
        'rgba(102, 187, 106, 1)',
        'rgba(239, 83, 80, 1)'
      ],
      borderWidth: 1,
      hoverBackgroundColor: [
        'rgba(66, 165, 245, 1)',
        'rgba(102, 187, 106, 1)',
        'rgba(239, 83, 80, 1)'
      ]
    }]
  };

  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 14
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((Number(value) / Number(total)) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {
    Chart.register(...registerables, LinearScale, CategoryScale);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        // Statistiques
        this.statCards.set([
          {
            type: 'entreprises',
            icon: 'business',
            title: 'Entreprises',
            values: [
              { label: 'Total', value: data.statistiques.entreprises.total },
              { label: 'Actives', value: data.statistiques.entreprises.actives },
              { label: 'Inactives', value: data.statistiques.entreprises.inactives },
              { label: 'Nouvelles ce mois', value: data.statistiques.entreprises.nouvelles_ce_mois, highlight: true }
            ]
          },
          {
            type: 'clients',
            icon: 'groups',
            title: 'Clients',
            values: [
              { label: 'Total', value: data.statistiques.clients.total },
              { label: 'Actifs', value: data.statistiques.clients.actifs },
              { label: 'Inactifs', value: data.statistiques.clients.inactifs },
              { label: 'Nouveaux ce mois', value: data.statistiques.clients.nouveaux_ce_mois, highlight: true }
            ]
          },
          {
            type: 'commandes',
            icon: 'shopping_cart',
            title: 'Commandes',
            values: [
              { label: 'Total', value: data.statistiques.commandes.total },
              { label: 'Terminées', value: data.statistiques.commandes.terminees },
              { label: 'En attente', value: data.statistiques.commandes.en_attente },
              { label: 'Aujourd\'hui', value: data.statistiques.commandes.nouvelles_aujourdhui, highlight: true }
            ]
          }
        ]);

        // Activités récentes
        this.activities.set(data.activites_recentes || []);

        // Actions en attente
        this.pendingActions.set(data.actions_en_attente || {});

        // Timeline des commandes
        this.orderTimeline.set(data.timeline_commandes || []);

        // Indicateurs de performance
        this.performanceIndicators.set(data.indicateurs_performance || {});

        // Données pour le graphique circulaire
        this.pieChartData.datasets[0].data = [
          data.statistiques.commandes.en_attente,
          data.statistiques.commandes.terminees,
          data.statistiques.commandes.annulees
        ];
        this.pieChartData = { ...this.pieChartData };
        // Données pour le graphique d'évolution
        this.updateEvolutionChart(data.donnees_evolution.commandes);
      },
      error: (err) => console.error('Erreur dashboard:', err)
    });
  }

  updateEvolutionChart(evolutionData: any): void {
    this.currentChartData = {
      labels: evolutionData.labels,
      datasets: [
        {
          data: evolutionData.data,
          label: this.currentChartTitle,
          fill: false,
          tension: 0.3,
          borderColor: '#3f51b5',
          backgroundColor: 'rgba(73, 6, 88, 0.57)'
        }
      ]
    };
  }

  toggleChartType(type: string): void {
    this.currentChartType = type;
    this.currentChartTitle = `Évolution des ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    this.dashboardService.getChartData(type, this.chartView).subscribe({
      next: (data) => this.updateEvolutionChart(data),
      error: (err) => console.error('Erreur graphique:', err)
    });
  }

  toggleChartView(view: string): void {
    this.chartView = view;
    this.dashboardService.getChartData(this.currentChartType, view).subscribe({
      next: (data) => this.updateEvolutionChart(data),
      error: (err) => console.error('Erreur graphique:', err)
    });
  }

  openModal(title: string, content: any): void {
    this.modalContent.set({
      title,
      details: content
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.modalContent.set(null);
  }



  getOrderStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'en attente': return 'status-pending';
      case 'en cours': return 'status-progress';
      case 'livré': return 'status-completed';
      case 'annulé': return 'status-canceled';
      default: return 'status-default';
    }
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }



  showDetails(type: string): void {
    this.dashboardService.getCardDetails(type).subscribe({
      next: (details) => {
        let modalTitle = '';
        let modalContent: any[] = [];


        switch (type) {
          case 'entreprises':
            modalTitle = 'Détails des Entreprises';
            modalContent = [
              { 'Total': details.total },
              { 'Actives': details.actives },
              { 'Inactives': details.inactives },
              { 'Nouvelles ce mois': details.nouvelles_ce_mois },
              { 'Nouvelles aujourd\'hui': details.nouvelles_aujourdhui },
          
              { 'Nombre total d\'employés': details.employes_total },
              { 'Top Secteurs fréquents': details.secteurs_frequents.join(', ') },
              { 'Dernière entreprise inscrite': details.derniere_inscrite }
            ];
            break;


          case 'clients':
            modalTitle = 'Détails des Clients';
            modalContent = [
              { 'Total': details.total },
              { 'Actifs': details.actifs },
              { 'Inactifs': details.inactifs },
              { 'Nouveaux ce mois': details.nouveaux_ce_mois },
              { 'Nouveaux aujourd\'hui': details.nouveaux_aujourdhui },
              { 'Moyenne de commandes par client': details.moyenne_commandes_par_client },
              { 'Taux d\'activité': details.taux_activite },
              { 'Ancienneté moyenne': details.anciennete_moyenne },
              { 'Dernier client inscrit': details.dernier_inscrit }
            ];
            break;


          case 'commandes':
            modalTitle = 'Détails des Commandes';
            modalContent = [
              { 'Total': details.total },
              { 'Terminées': details.terminées },
              { 'En attente': details.en_attente },
              { 'Annulées': details.annulées },
              { 'Nouvelles aujourd\'hui': details.nouvelles_aujourdhui },
              { 'Montant moyen par commande': details.montant_moyen_commande },
              { 'Avance totale reçue': details.avance_totale_recue },
              { 'Pourcentage de commandes livrées': details.pourcentage_livrees }
            ];
            break;

            case 'performance':
              modalTitle = 'Détails de Performance';
              modalContent = [
                { 'Temps moyen de traitement': `${details.temps_moyen_traitement} heures` },
                { 'Taux de complétion': `${details.taux_completion}%` },
                { 'Taux d’annulation': `${details.taux_annulation}%` },
                { 'Commandes en cours > 48h': details.commandes_en_cours_plus_48h },
                { 'Temps de réponse moyen': `${details.temps_reponse_moyen} heures` },
                { 'Satisfaction client': `${details.satisfaction_client}/5` },
                { 'Commandes totales': details.commandes_total },
                { 'Commandes livrées': details.commandes_livrees },
                {
                  'Top 5 clients les plus actifs':
                    (details.top_5_clients_actifs as { client: string; commandes: number }[])
                      .map((c: { client: string; commandes: number }) => `${c.client} (${c.commandes})`)
                      .join(', ')
                },
                {
                  'Commandes par entreprise':
                    (details.commandes_par_entreprise as { entreprise: string; commandes: number }[])
                      .map((e: { entreprise: string; commandes: number }) => `${e.entreprise} (${e.commandes})`)
                      .join(', ')
                }
              ];
              break;
            
            
        }

        this.modalContent.set({
          title: modalTitle,
          details: modalContent
        });
        this.showModal.set(true);
      },
      error: (err) => console.error(`Erreur détails ${type}:`, err)
    });
  }

  // Ajoutez cette méthode utilitaire si elle n'existe pas déjà
  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
}