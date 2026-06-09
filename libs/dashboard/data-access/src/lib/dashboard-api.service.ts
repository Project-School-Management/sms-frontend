import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_CONFIG_SNAPSHOT } from '@sms/config-system/data-access';
import { MOCK_STUDENTS } from '@sms/students/data-access';

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
    // ── Computed from referential + student mock data ─────────────────────────
    const classes  = MOCK_CONFIG_SNAPSHOT.classes.filter(c => c.active);
    const matieres = MOCK_CONFIG_SNAPSHOT.matieres.filter(m => m.active);
    const salles   = MOCK_CONFIG_SNAPSHOT.salles.filter(s => s.active);

    const totalEffectif = classes.reduce((s, c) => s + c.effectif, 0);
    const totalCapacite = classes.reduce((s, c) => s + c.capacite, 0);
    const tauxRemplissage = totalCapacite > 0
      ? Math.round((totalEffectif / totalCapacite) * 100)
      : 0;

    const activeStudents = MOCK_STUDENTS.filter(s =>
      ['ACTIF', 'INSCRIT', 'INSCRIPTION_VALIDEE', 'PRE_INSCRIT'].includes(s.statut)
    ).length;
    const prevStudents = Math.round(activeStudents * 0.96);

    // Finance — computed from classe effectifs × frais scolarité moyen
    const avgFrais = MOCK_CONFIG_SNAPSHOT.typesFrais
      .filter(f => f.active && f.categorie === 'SCOLARITE')
      .reduce((s, f, _, a) => s + f.montant / a.length, 0);
    const totalBudgetEst = Math.round(totalEffectif * avgFrais);
    const totalPaye      = Math.round(totalBudgetEst * 0.62);
    const totalAttente   = Math.round(totalBudgetEst * 0.24);
    const totalRetard    = Math.round(totalBudgetEst * 0.08);
    const totalPartiel   = totalBudgetEst - totalPaye - totalAttente - totalRetard;
    const tauxRecouvrement = Math.round((totalPaye / totalBudgetEst) * 100);
    const nbRetard = Math.round(totalEffectif * 0.08);

    const fmt = (n: number) => n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
      : `${Math.round(n / 1000)}k`;

    // Promotion stats from config-system classes
    const promotionStats: IPromotionStat[] = classes
      .filter(c => c.cyclePublicId === 'cyc-003' || c.cyclePublicId === 'cyc-002')
      .slice(0, 5)
      .map(c => ({
        libelle:      `${c.libelle} (${c.filiereLibelle ?? c.niveauLibelle})`,
        effectif:     c.effectif,
        tauxReussite: Math.round(65 + Math.random() * 30),
        moyenne:      Math.round((10 + Math.random() * 5) * 10) / 10,
      }));

    return {
      kpis: [
        {
          id: 'etudiants', label: 'Étudiants inscrits',
          sublabel: `vs ${prevStudents} le mois dernier`,
          value: activeStudents, valueDisplay: String(activeStudents),
          prev: prevStudents, prevDisplay: String(prevStudents),
          change: Math.round(((activeStudents - prevStudents) / prevStudents) * 1000) / 10,
          changeStr: `+${Math.round(((activeStudents - prevStudents) / prevStudents) * 1000) / 10}%`,
          trendPositive: true,
          icon: 'group', color: '#6366f1', colorBg: 'rgba(99,102,241,0.10)',
          sparkline: [42, 48, 45, 55, 60, 62, 68, 72, 78, 83, 90, 100],
        },
        {
          id: 'classes', label: 'Classes actives',
          sublabel: `${totalCapacite} places · ${tauxRemplissage}% rempli`,
          value: classes.length, valueDisplay: String(classes.length),
          prev: classes.length - 1, prevDisplay: String(classes.length - 1),
          change: 0, changeStr: '—', trendPositive: true,
          icon: 'school', color: '#8b5cf6', colorBg: 'rgba(139,92,246,0.10)',
          sparkline: [75, 76, 78, 78, 80, 82, 84, 86, 88, 90, 94, 100],
        },
        {
          id: 'recouvrement', label: 'Taux de recouvrement',
          sublabel: `vs ${tauxRecouvrement - 3}% le mois dernier`,
          value: tauxRecouvrement, valueDisplay: `${tauxRecouvrement}%`,
          prev: tauxRecouvrement - 3, prevDisplay: `${tauxRecouvrement - 3}%`,
          change: 3, changeStr: '+3%', trendPositive: true,
          icon: 'account_balance_wallet', color: '#10b981', colorBg: 'rgba(16,185,129,0.10)',
          sparkline: [60, 63, 65, 68, 70, 72, 74, 76, 78, 80, 82, 100],
        },
        {
          id: 'retards', label: 'Factures en retard',
          sublabel: `vs ${Math.round(nbRetard * 1.3)} le mois dernier`,
          value: nbRetard, valueDisplay: String(nbRetard),
          prev: Math.round(nbRetard * 1.3), prevDisplay: String(Math.round(nbRetard * 1.3)),
          change: -25.8, changeStr: '-25.8%', trendPositive: true,
          icon: 'receipt_long', color: '#f59e0b', colorBg: 'rgba(245,158,11,0.10)',
          sparkline: [100, 94, 88, 82, 76, 70, 65, 60, 56, 52, 48, 45],
        },
      ],

      evolution: [
        { month: 'Janv', value: Math.round(totalEffectif * 0.85), pct: 85 },
        { month: 'Févr', value: Math.round(totalEffectif * 0.88), pct: 88 },
        { month: 'Mars', value: Math.round(totalEffectif * 0.91), pct: 91 },
        { month: 'Avr',  value: Math.round(totalEffectif * 0.94), pct: 94 },
        { month: 'Mai',  value: Math.round(totalEffectif * 0.97), pct: 97 },
        { month: 'Juin', value: totalEffectif,                     pct: 100 },
      ],

      financeSegments: [
        { label: 'Payées',       amount: totalPaye,    display: fmt(totalPaye),    pct: 62, color: '#10b981' },
        { label: 'En attente',   amount: totalAttente, display: fmt(totalAttente), pct: 24, color: '#f59e0b' },
        { label: 'En retard',    amount: totalRetard,  display: fmt(totalRetard),  pct:  8, color: '#ef4444' },
        { label: 'Part. payées', amount: totalPartiel, display: fmt(totalPartiel), pct:  6, color: '#6366f1' },
      ],
      totalBudget: totalBudgetEst,
      totalBudgetDisplay: `${fmt(totalBudgetEst)} XOF`,

      activities: [
        {
          id: 'act-1', icon: 'person_add', color: '#6366f1', colorBg: 'rgba(99,102,241,0.10)',
          text: `Nouvelle inscription — ${MOCK_STUDENTS[0].firstName} ${MOCK_STUDENTS[0].lastName}`,
          subtext: `${MOCK_STUDENTS[0].classeLibelle ?? 'Classe'} · 2025-2026`,
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
          text: `Notes saisies — ${matieres[0]?.libelle ?? 'Mathématiques'}`,
          subtext: `${classes[0]?.effectif ?? 0} étudiants évalués`,
          time: 'Il y a 1h 12min', type: 'note',
        },
        {
          id: 'act-4', icon: 'warning_amber', color: '#ef4444', colorBg: 'rgba(239,68,68,0.10)',
          text: `Facture en retard — ${MOCK_STUDENTS[1].firstName} ${MOCK_STUDENTS[1].lastName}`,
          subtext: '175 000 XOF · Échéance dépassée de 18j',
          time: 'Il y a 2h', type: 'alerte',
        },
        {
          id: 'act-5', icon: 'calendar_month', color: '#f59e0b', colorBg: 'rgba(245,158,11,0.10)',
          text: 'Emploi du temps mis à jour — Sem. 24',
          subtext: `3 créneaux modifiés · ${classes[0]?.libelle ?? 'Terminale'}`,
          time: 'Il y a 3h', type: 'planning',
        },
        {
          id: 'act-6', icon: 'campaign', color: '#06b6d4', colorBg: 'rgba(6,182,212,0.10)',
          text: 'Annonce — Conseil de classe Terminale',
          subtext: `Envoyée à ${Math.round(totalEffectif * 0.45)} parents · 89% d\'ouvertures`,
          time: 'Hier, 16h30', type: 'message',
        },
      ],

      alerts: [
        {
          id: 'alert-1', icon: 'access_time', iconColor: '#dc2626',
          title: 'Factures en retard critiques',
          desc: 'Dépassement de 60+ jours — action requise',
          count: String(Math.round(nbRetard * 0.35)),
          bg: 'rgba(239,68,68,0.07)', textColor: '#dc2626',
          badgeBg: 'rgba(239,68,68,0.15)', priority: 'critical', route: '/finance/invoices',
        },
        {
          id: 'alert-2', icon: 'person_off', iconColor: '#d97706',
          title: 'Absences non justifiées',
          desc: `Semaine en cours · ${classes.length} classes concernées`,
          count: String(Math.round(totalEffectif * 0.13)),
          bg: 'rgba(245,158,11,0.07)', textColor: '#d97706',
          badgeBg: 'rgba(245,158,11,0.15)', priority: 'high', route: '/students',
        },
        {
          id: 'alert-3', icon: 'assignment_late', iconColor: '#7c3aed',
          title: 'Notes manquantes à saisir',
          desc: `Fin de période dans 5 jours · ${matieres.length} matières`,
          count: String(Math.round(matieres.length * 0.85)),
          bg: 'rgba(139,92,246,0.07)', textColor: '#7c3aed',
          badgeBg: 'rgba(139,92,246,0.15)', priority: 'medium', route: '/academic',
        },
      ],

      promotionStats,

      agenda: [
        { id: 'ev-1', dayLabel: 'LUN', day:  9, title: `Conseil pédagogique ${classes[0]?.libelle ?? 'Terminale'}`, time: '09h00 – 11h00', color: '#6366f1', type: 'conseil'   },
        { id: 'ev-2', dayLabel: 'MAR', day: 10, title: `Examens blancs ${classes[1]?.libelle ?? '1ère D'}`,         time: '08h00 – 12h00', color: '#ef4444', type: 'examen'    },
        { id: 'ev-3', dayLabel: 'MER', day: 11, title: `Réunion parents – ${classes[4]?.libelle ?? '3ème B'}`,      time: '15h30 – 17h00', color: '#10b981', type: 'reunion'   },
        { id: 'ev-4', dayLabel: 'JEU', day: 12, title: 'Formation enseignants · Maths',                             time: '14h00 – 16h00', color: '#f59e0b', type: 'formation' },
        { id: 'ev-5', dayLabel: 'VEN', day: 13, title: 'Remise des bulletins S1',                                   time: '08h00 – 12h00', color: '#8b5cf6', type: 'bulletin'  },
      ],

      quickStats: [
        { label: 'Cours aujourd\'hui', value: String(Math.round(classes.length * 1.8)), icon: 'menu_book',    color: '#6366f1', colorBg: 'rgba(99,102,241,0.10)'  },
        { label: 'Messages non lus',   value: '7',                                      icon: 'chat_bubble',  color: '#06b6d4', colorBg: 'rgba(6,182,212,0.10)'   },
        { label: 'Taux de présence',   value: '94%',                                    icon: 'how_to_reg',   color: '#10b981', colorBg: 'rgba(16,185,129,0.10)'  },
        { label: 'Matières au prog.',  value: String(matieres.length),                  icon: 'library_books',color: '#8b5cf6', colorBg: 'rgba(139,92,246,0.10)'  },
      ],

      systemHealth: 98,
    };
  }
}
