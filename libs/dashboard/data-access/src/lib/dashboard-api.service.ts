import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface IDashboardSummary {
  totalEtudiants:     number;
  totalEnseignants:   number;
  tauxReussite:       number;
  tauxRecouvrement:   number;
  nbNotifications:    number;
  nbFacturesEnRetard: number;
}

export interface IActiviteRecente {
  id: string;
  icon: string;
  iconColor: string;
  texte: string;
  description: string;
  timestamp: string;
}

export interface IEvolutionInscription {
  mois: string;
  count: number;
}

export interface IAlerte {
  id: string;
  niveau: 'URGENT' | 'AVERTISSEMENT' | 'INFO';
  titre: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
}

const MOCK_SUMMARY: IDashboardSummary = {
  totalEtudiants:     847,
  totalEnseignants:   54,
  tauxReussite:       78,
  tauxRecouvrement:   82,
  nbNotifications:    7,
  nbFacturesEnRetard: 23,
};

const MOCK_ACTIVITES: IActiviteRecente[] = [
  { id: 'act-001', icon: 'person_add', iconColor: '#6366f1', texte: 'Nouvel étudiant inscrit', description: 'Fatoumata Kourouma — Promo L3 GL 2025', timestamp: '2026-06-07T08:30:00' },
  { id: 'act-002', icon: 'payments', iconColor: '#16a34a', texte: 'Paiement confirmé', description: '250 000 XOF via Wave — Awa Diallo', timestamp: '2026-06-07T07:45:00' },
  { id: 'act-003', icon: 'grade', iconColor: '#d97706', texte: 'Notes saisies', description: 'Algorithmique — L3 GL 2025 (32 notes)', timestamp: '2026-06-06T17:20:00' },
  { id: 'act-004', icon: 'cancel_schedule_send', iconColor: '#dc2626', texte: 'Séance annulée', description: 'Base de données — Lundi 09/06 — Enseignant absent', timestamp: '2026-06-06T16:00:00' },
  { id: 'act-005', icon: 'description', iconColor: '#2563eb', texte: 'Bulletins publiés', description: 'S1 2026 — Promotion L2 GL 2025 (28 bulletins)', timestamp: '2026-06-06T14:30:00' },
];

const MOCK_EVOLUTION: IEvolutionInscription[] = [
  { mois: 'Jan', count: 102 },
  { mois: 'Fév', count: 215 },
  { mois: 'Mar', count: 389 },
  { mois: 'Avr', count: 612 },
  { mois: 'Mai', count: 780 },
  { mois: 'Jun', count: 847 },
];

const MOCK_ALERTES: IAlerte[] = [
  { id: 'alr-001', niveau: 'URGENT', titre: '23 factures en retard', description: 'Des factures dépassent leur échéance depuis plus de 30 jours. Action requise.', actionLabel: 'Voir les factures', actionUrl: '/finance/invoices' },
  { id: 'alr-002', niveau: 'URGENT', titre: 'Emploi du temps incomplet', description: '3 créneaux sans enseignant assigné pour la semaine prochaine.', actionLabel: 'Gérer l\'EDT', actionUrl: '/schedule' },
  { id: 'alr-003', niveau: 'AVERTISSEMENT', titre: 'Notes manquantes S1', description: '12 étudiants n\'ont pas de notes pour 2 matières ou plus.', actionLabel: 'Voir les notes', actionUrl: '/academic' },
];

@Injectable({ providedIn: 'root' })
export class DashboardApiService {

  getSummary(): Observable<IDashboardSummary> {
    return of(MOCK_SUMMARY).pipe(delay(400));
  }

  getActiviteRecente(): Observable<IActiviteRecente[]> {
    return of(MOCK_ACTIVITES).pipe(delay(300));
  }

  getEvolutionInscriptions(): Observable<IEvolutionInscription[]> {
    return of(MOCK_EVOLUTION).pipe(delay(300));
  }

  getAlertes(): Observable<IAlerte[]> {
    return of(MOCK_ALERTES).pipe(delay(200));
  }
}
