import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// ── Data models ───────────────────────────────────────────────────────────────

export interface IKpiCard {
  id:            string;
  label:         string;
  sublabel:      string;
  value:         number;
  valueDisplay:  string;
  prev:          number;
  prevDisplay:   string;
  change:        number;
  changeStr:     string;
  trendPositive: boolean;
  icon:          string;
  color:         string;
  colorBg:       string;
  sparkline:     number[];
}

export interface IEvolutionPoint {
  month: string;
  value: number;
  pct:   number;
}

export interface IFinanceSegment {
  label:   string;
  amount:  number;
  display: string;
  pct:     number;
  color:   string;
}

export interface IActivity {
  id:      string;
  icon:    string;
  color:   string;
  colorBg: string;
  text:    string;
  subtext: string;
  time:    string;
  type:    'inscription' | 'paiement' | 'note' | 'alerte' | 'planning' | 'message' | 'autre';
}

export interface IAlert {
  id:        string;
  icon:      string;
  iconColor: string;
  title:     string;
  desc:      string;
  count:     string;
  bg:        string;
  textColor: string;
  badgeBg:   string;
  priority:  'critical' | 'high' | 'medium';
  route:     string;
}

export interface IPromotionStat {
  libelle:      string;
  effectif:     number;
  tauxReussite: number;
  moyenne:      number;
}

export interface IAgendaEvent {
  id:       string;
  dayLabel: string;
  day:      number;
  title:    string;
  time:     string;
  color:    string;
  type:     string;
}

export interface IQuickStat {
  label:   string;
  value:   string;
  icon:    string;
  color:   string;
  colorBg: string;
}

export interface IDashboardData {
  kpis:               IKpiCard[];
  evolution:          IEvolutionPoint[];
  financeSegments:    IFinanceSegment[];
  activities:         IActivity[];
  alerts:             IAlert[];
  promotionStats:     IPromotionStat[];
  agenda:             IAgendaEvent[];
  quickStats:         IQuickStat[];
  totalBudget:        number;
  totalBudgetDisplay: string;
  systemHealth:       number;
}

// ── Backward-compat exports (used by existing store) ─────────────────────────
export type IDashboardSummary      = IDashboardData;
export type IActiviteRecente       = IActivity;
export type IEvolutionInscription  = IEvolutionPoint;
export type IAlerte                = IAlert;

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DashboardApiService {

  getData(): Observable<IDashboardData> {
    return of(this._mock()).pipe(delay(550));
  }

  /** @deprecated use getData() */
  getSummary(): Observable<IDashboardData> {
    return this.getData();
  }

  private _mock(): IDashboardData {
    return {
      kpis: [
        {
          id: 'etudiants', label: 'Étudiants inscrits', sublabel: 'vs 813 le mois dernier',
          value: 847, valueDisplay: '847', prev: 813, prevDisplay: '813',
          change: 4.2, changeStr: '+4.2%', trendPositive: true,
          icon: 'group', color: '#6366f1', colorBg: 'rgba(99,102,241,0.10)',
          sparkline: [42, 48, 45, 55, 60, 62, 68, 72, 78, 83, 90, 100],
        },
        {
          id: 'enseignants', label: 'Enseignants actifs', sublabel: 'vs 51 le mois dernier',
          value: 54, valueDisplay: '54', prev: 51, prevDisplay: '51',
          change: 5.9, changeStr: '+5.9%', trendPositive: true,
          icon: 'school', color: '#8b5cf6', colorBg: 'rgba(139,92,246,0.10)',
          sparkline: [75, 76, 78, 78, 80, 82, 84, 86, 88, 90, 94, 100],
        },
        {
          id: 'recouvrement', label: 'Taux de recouvrement', sublabel: 'vs 79% le mois dernier',
          value: 82, valueDisplay: '82%', prev: 79, prevDisplay: '79%',
          change: 3.8, changeStr: '+3.8%', trendPositive: true,
          icon: 'account_balance_wallet', color: '#10b981', colorBg: 'rgba(16,185,129,0.10)',
          sparkline: [60, 63, 65, 68, 70, 72, 74, 76, 78, 80, 82, 100],
        },
        {
          id: 'retards', label: 'Factures en retard', sublabel: 'vs 31 le mois dernier',
          value: 23, valueDisplay: '23', prev: 31, prevDisplay: '31',
          change: -25.8, changeStr: '-25.8%', trendPositive: true,
          icon: 'receipt_long', color: '#f59e0b', colorBg: 'rgba(245,158,11,0.10)',
          sparkline: [100, 94, 88, 82, 76, 70, 65, 60, 56, 52, 48, 45],
        },
      ],

      evolution: [
        { month: 'Janv', value: 720, pct: 72 },
        { month: 'Févr', value: 745, pct: 74.5 },
        { month: 'Mars', value: 768, pct: 76.8 },
        { month: 'Avr',  value: 790, pct: 79 },
        { month: 'Mai',  value: 815, pct: 81.5 },
        { month: 'Juin', value: 847, pct: 100 },
      ],

      financeSegments: [
        { label: 'Payées',         amount: 318_500_000, display: '318,5M', pct: 62, color: '#10b981' },
        { label: 'En attente',     amount: 125_000_000, display: '125M',   pct: 24, color: '#f59e0b' },
        { label: 'En retard',      amount:  42_000_000, display: '42M',    pct:  8, color: '#ef4444' },
        { label: 'Part. payées',   amount:  30_000_000, display: '30M',    pct:  6, color: '#6366f1' },
      ],
      totalBudget: 515_500_000,
      totalBudgetDisplay: '515,5M XOF',

      activities: [
        {
          id: 'act-1', icon: 'person_add', color: '#6366f1', colorBg: 'rgba(99,102,241,0.10)',
          text: 'Nouvelle inscription — Mariame Koné',
          subtext: 'L3 Informatique de Gestion · 2025-2026',
          time: 'Il y a 5 min', type: 'inscription',
        },
        {
          id: 'act-2', icon: 'payments', color: '#10b981', colorBg: 'rgba(16,185,129,0.10)',
          text: 'Paiement reçu — FACT-2025-1247',
          subtext: '250 000 XOF via Mobile Money (Orange)',
          time: 'Il y a 23 min', type: 'paiement',
        },
        {
          id: 'act-3', icon: 'grade', color: '#8b5cf6', colorBg: 'rgba(139,92,246,0.10)',
          text: 'Notes saisies — Mathématiques S5',
          subtext: 'Prof. Adama Touré · 38 étudiants évalués',
          time: 'Il y a 1h 12min', type: 'note',
        },
        {
          id: 'act-4', icon: 'warning_amber', color: '#ef4444', colorBg: 'rgba(239,68,68,0.10)',
          text: 'Facture en retard — Kofi Mensah',
          subtext: '175 000 XOF · Échéance dépassée de 18j',
          time: 'Il y a 2h', type: 'alerte',
        },
        {
          id: 'act-5', icon: 'calendar_month', color: '#f59e0b', colorBg: 'rgba(245,158,11,0.10)',
          text: 'Emploi du temps mis à jour — Sem. 24',
          subtext: '3 créneaux modifiés · Terminale D',
          time: 'Il y a 3h', type: 'planning',
        },
        {
          id: 'act-6', icon: 'campaign', color: '#06b6d4', colorBg: 'rgba(6,182,212,0.10)',
          text: 'Annonce — Conseil de classe Terminale',
          subtext: 'Envoyée à 156 parents · 89% d\'ouvertures',
          time: 'Hier, 16h30', type: 'message',
        },
      ],

      alerts: [
        {
          id: 'alert-1', icon: 'access_time', iconColor: '#dc2626',
          title: 'Factures en retard critiques',
          desc: 'Dépassement de 60+ jours — action requise',
          count: '8', bg: 'rgba(239,68,68,0.07)', textColor: '#dc2626',
          badgeBg: 'rgba(239,68,68,0.15)', priority: 'critical', route: '/finance/invoices',
        },
        {
          id: 'alert-2', icon: 'person_off', iconColor: '#d97706',
          title: 'Absences non justifiées',
          desc: 'Semaine en cours · 12 classes concernées',
          count: '47', bg: 'rgba(245,158,11,0.07)', textColor: '#d97706',
          badgeBg: 'rgba(245,158,11,0.15)', priority: 'high', route: '/students',
        },
        {
          id: 'alert-3', icon: 'assignment_late', iconColor: '#7c3aed',
          title: 'Notes manquantes à saisir',
          desc: 'Fin de période dans 5 jours · Semestre 1',
          count: '12', bg: 'rgba(139,92,246,0.07)', textColor: '#7c3aed',
          badgeBg: 'rgba(139,92,246,0.15)', priority: 'medium', route: '/academic',
        },
      ],

      promotionStats: [
        { libelle: 'Terminale D (Scientifique)', effectif:  67, tauxReussite: 91, moyenne: 14.1 },
        { libelle: 'Terminale A (Littéraire)',   effectif:  42, tauxReussite: 85, moyenne: 13.2 },
        { libelle: 'Première D',                 effectif:  78, tauxReussite: 79, moyenne: 12.8 },
        { libelle: 'Première A',                 effectif:  61, tauxReussite: 74, moyenne: 12.2 },
        { libelle: 'Seconde (toutes séries)',    effectif: 124, tauxReussite: 68, moyenne: 11.7 },
      ],

      agenda: [
        { id: 'ev-1', dayLabel: 'LUN', day:  9, title: 'Conseil pédagogique Terminale', time: '09h00 – 11h00', color: '#6366f1', type: 'conseil'   },
        { id: 'ev-2', dayLabel: 'MAR', day: 10, title: 'Examens blancs 1ère D',         time: '08h00 – 12h00', color: '#ef4444', type: 'examen'    },
        { id: 'ev-3', dayLabel: 'MER', day: 11, title: 'Réunion parents – 3ème A',      time: '15h30 – 17h00', color: '#10b981', type: 'reunion'   },
        { id: 'ev-4', dayLabel: 'JEU', day: 12, title: 'Formation enseignants · Maths', time: '14h00 – 16h00', color: '#f59e0b', type: 'formation' },
        { id: 'ev-5', dayLabel: 'VEN', day: 13, title: 'Remise des bulletins S1',       time: '08h00 – 12h00', color: '#8b5cf6', type: 'bulletin'  },
      ],

      quickStats: [
        { label: 'Cours aujourd\'hui', value: '18',  icon: 'menu_book',    color: '#6366f1', colorBg: 'rgba(99,102,241,0.10)'  },
        { label: 'Messages non lus',   value: '7',   icon: 'chat_bubble',  color: '#06b6d4', colorBg: 'rgba(6,182,212,0.10)'   },
        { label: 'Taux de présence',   value: '94%', icon: 'how_to_reg',   color: '#10b981', colorBg: 'rgba(16,185,129,0.10)'  },
        { label: 'Matières au prog.',  value: '24',  icon: 'library_books',color: '#8b5cf6', colorBg: 'rgba(139,92,246,0.10)'  },
      ],

      systemHealth: 98,
    };
  }
}
