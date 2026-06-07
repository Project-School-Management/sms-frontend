import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule }            from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule }           from '@angular/material/icon';
import { StudentsStore }           from '@sms/students/data-access';

type Tab = 'infos' | 'notes' | 'factures' | 'absences';

@Component({
  selector:        'sms-student-detail',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6 max-w-5xl mx-auto">

  <!-- Breadcrumb -->
  <div class="flex items-center gap-2 mb-6 text-sm">
    <a routerLink="/students" class="hover:opacity-70 transition-opacity" style="color: var(--accent)">Élèves</a>
    <mat-icon style="font-size: 16px; height: 16px; width: 16px; color: var(--text-muted)">chevron_right</mat-icon>
    <span style="color: var(--text-secondary)">Fiche étudiant</span>
  </div>

  @if (store.loading()) {
    <div class="flex items-center justify-center py-16 gap-2" style="color: var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement...
    </div>
  } @else if (store.selectedStudent()) {
    @if (store.selectedStudent(); as s) {

    <!-- Profile Header Card -->
    <div class="sms-card p-6 mb-6">
      <div class="flex flex-wrap items-start gap-6">
        <!-- Avatar -->
        <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
             style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
          {{ s.firstName[0] }}{{ s.lastName[0] }}
        </div>

        <!-- Name + meta -->
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold" style="color: var(--text-primary)">
              {{ s.firstName }} {{ s.lastName }}
            </h1>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  [style.background]="statutBg(s.statut)"
                  [style.color]="statutColor(s.statut)">
              {{ s.statut }}
            </span>
          </div>
          <p class="font-mono text-sm mb-3" style="color: var(--text-secondary)">{{ s.matricule }}</p>
          <div class="flex flex-wrap gap-4 text-sm" style="color: var(--text-secondary)">
            <span class="flex items-center gap-1.5">
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">school</mat-icon>
              {{ s.classePublicId ?? 'Non affecté' }}
            </span>
            <span class="flex items-center gap-1.5">
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">cake</mat-icon>
              {{ s.dateNaissance | date:'dd/MM/yyyy' }}
            </span>
            <span class="flex items-center gap-1.5">
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">person</mat-icon>
              {{ s.genre === 'M' ? 'Masculin' : 'Féminin' }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 flex-shrink-0">
          <button class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                  style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">print</mat-icon>
            Carte étudiant
          </button>
          <button class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                  style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">edit</mat-icon>
            Modifier
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 p-1 rounded-xl" style="background: var(--surface-2); border: 1px solid var(--border-color)">
      @for (tab of tabs; track tab.key) {
        <button (click)="activeTab.set(tab.key)"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all"
                [style.background]="activeTab() === tab.key ? 'var(--surface-1)' : 'transparent'"
                [style.color]="activeTab() === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)'"
                [style.box-shadow]="activeTab() === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">{{ tab.icon }}</mat-icon>
          {{ tab.label }}
        </button>
      }
    </div>

    <!-- Tab: Infos personnelles -->
    @if (activeTab() === 'infos') {
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="sms-card p-5">
          <h3 class="font-semibold mb-4" style="color: var(--text-primary)">Informations personnelles</h3>
          <div class="space-y-3">
            @for (field of infoFields(s); track field.label) {
              <div class="flex items-start justify-between py-2" style="border-bottom: 1px solid var(--border-color)">
                <span class="text-sm" style="color: var(--text-secondary)">{{ field.label }}</span>
                <span class="text-sm font-medium text-right" style="color: var(--text-primary)">{{ field.value || '—' }}</span>
              </div>
            }
          </div>
        </div>

        <div class="space-y-4">
          <div class="sms-card p-5">
            <h3 class="font-semibold mb-4" style="color: var(--text-primary)">Contact</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: rgba(99,102,241,0.1)">
                  <mat-icon style="font-size: 16px; height: 16px; width: 16px; color: #6366f1">email</mat-icon>
                </div>
                <div>
                  <p class="text-xs" style="color: var(--text-muted)">Email</p>
                  <p class="text-sm font-medium" style="color: var(--text-primary)">{{ s.email || '—' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: rgba(16,185,129,0.1)">
                  <mat-icon style="font-size: 16px; height: 16px; width: 16px; color: #10b981">phone</mat-icon>
                </div>
                <div>
                  <p class="text-xs" style="color: var(--text-muted)">Téléphone</p>
                  <p class="text-sm font-medium" style="color: var(--text-primary)">{{ s.phone || '—' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="sms-card p-5">
            <h3 class="font-semibold mb-4" style="color: var(--text-primary)">Scolarité</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm" style="color: var(--text-secondary)">Année académique</span>
                <span class="text-sm font-medium" style="color: var(--text-primary)">2025–2026</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm" style="color: var(--text-secondary)">Établissement</span>
                <span class="text-sm font-medium" style="color: var(--text-primary)">Lycée International</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm" style="color: var(--text-secondary)">Classe</span>
                <span class="text-sm font-medium" style="color: var(--text-primary)">{{ s.classePublicId ?? '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Tab: Notes -->
    @if (activeTab() === 'notes') {
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 flex items-center justify-between" style="border-bottom: 1px solid var(--border-color)">
          <h3 class="font-semibold" style="color: var(--text-primary)">Dernières notes</h3>
          <a routerLink="/academic" class="text-sm font-medium" style="color: var(--accent)">Voir toutes →</a>
        </div>
        <table class="w-full text-sm">
          <thead style="background: var(--surface-2)">
            <tr>
              @for (h of ['Matière','Note /20','Statut','Date']; track h) {
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (note of mockNotes; track note.matiere) {
              <tr style="border-top: 1px solid var(--border-color)">
                <td class="px-4 py-3 font-medium" style="color: var(--text-primary)">{{ note.matiere }}</td>
                <td class="px-4 py-3 font-bold tabular-nums" [style.color]="noteColor(note.valeur)">{{ note.valeur }}/20</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background: rgba(22,163,74,0.12); color: #16a34a">VALIDÉE</span>
                </td>
                <td class="px-4 py-3" style="color: var(--text-secondary)">{{ note.date }}</td>
              </tr>
            }
          </tbody>
        </table>
        <div class="px-5 py-3 flex items-center justify-between" style="border-top: 1px solid var(--border-color); background: var(--surface-2)">
          <span class="text-sm" style="color: var(--text-secondary)">Moyenne générale</span>
          <span class="text-lg font-bold" style="color: var(--accent)">13.4/20</span>
        </div>
      </div>
    }

    <!-- Tab: Facturation -->
    @if (activeTab() === 'factures') {
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 flex items-center justify-between" style="border-bottom: 1px solid var(--border-color)">
          <h3 class="font-semibold" style="color: var(--text-primary)">Factures</h3>
          <a routerLink="/finance/invoices" class="text-sm font-medium" style="color: var(--accent)">Voir toutes →</a>
        </div>
        <table class="w-full text-sm">
          <thead style="background: var(--surface-2)">
            <tr>
              @for (h of ['Numéro','Montant','Payé','Statut','Échéance']; track h) {
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (f of mockFactures; track f.numero) {
              <tr style="border-top: 1px solid var(--border-color)">
                <td class="px-4 py-3 font-mono text-xs" style="color: var(--text-secondary)">{{ f.numero }}</td>
                <td class="px-4 py-3 font-medium" style="color: var(--text-primary)">{{ f.montant }}</td>
                <td class="px-4 py-3" [style.color]="f.statut === 'PAYEE' ? '#16a34a' : '#d97706'">{{ f.paye }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="f.statut === 'PAYEE' ? 'rgba(22,163,74,0.12)' : 'rgba(245,158,11,0.12)'"
                        [style.color]="f.statut === 'PAYEE' ? '#16a34a' : '#d97706'">
                    {{ f.statut === 'PAYEE' ? 'Payée' : 'En attente' }}
                  </span>
                </td>
                <td class="px-4 py-3" style="color: var(--text-secondary)">{{ f.echeance }}</td>
              </tr>
            }
          </tbody>
        </table>
        <div class="px-5 py-3 flex items-center justify-between" style="border-top: 1px solid var(--border-color); background: var(--surface-2)">
          <span class="text-sm" style="color: var(--text-secondary)">Solde restant</span>
          <span class="text-lg font-bold" style="color: #ef4444">175 000 XOF</span>
        </div>
      </div>
    }

    <!-- Tab: Absences -->
    @if (activeTab() === 'absences') {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        @for (stat of absenceStats; track stat.label) {
          <div class="sms-card p-5 flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" [style.background]="stat.bg">
              <mat-icon [style.color]="stat.color" style="font-size: 20px; height: 20px; width: 20px">{{ stat.icon }}</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ stat.value }}</p>
              <p class="text-sm" style="color: var(--text-secondary)">{{ stat.label }}</p>
            </div>
          </div>
        }
      </div>

      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4" style="border-bottom: 1px solid var(--border-color)">
          <h3 class="font-semibold" style="color: var(--text-primary)">Historique des absences</h3>
        </div>
        <table class="w-full text-sm">
          <thead style="background: var(--surface-2)">
            <tr>
              @for (h of ['Date','Matière','Type','Justification']; track h) {
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (a of mockAbsences; track a.date) {
              <tr style="border-top: 1px solid var(--border-color)">
                <td class="px-4 py-3" style="color: var(--text-primary)">{{ a.date }}</td>
                <td class="px-4 py-3 font-medium" style="color: var(--text-primary)">{{ a.matiere }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="a.justifie ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)'"
                        [style.color]="a.justifie ? '#16a34a' : '#dc2626'">
                    {{ a.justifie ? 'Justifiée' : 'Non justifiée' }}
                  </span>
                </td>
                <td class="px-4 py-3" style="color: var(--text-secondary)">{{ a.motif || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    } <!-- end @if selectedStudent as s -->
  } @else {
    <div class="flex flex-col items-center justify-center py-16 gap-3">
      <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">person_off</mat-icon>
      <p style="color: var(--text-secondary)">Étudiant non trouvé</p>
      <a routerLink="/students" class="text-sm font-medium" style="color: var(--accent)">← Retour à la liste</a>
    </div>
  }
</div>
  `,
})
export class StudentDetailComponent implements OnInit {
  protected readonly store = inject(StudentsStore);
  private  readonly route = inject(ActivatedRoute);

  protected readonly activeTab = signal<Tab>('infos');

  protected readonly tabs = [
    { key: 'infos'    as Tab, label: 'Infos personnelles', icon: 'person'       },
    { key: 'notes'    as Tab, label: 'Notes',              icon: 'grade'        },
    { key: 'factures' as Tab, label: 'Facturation',        icon: 'receipt_long' },
    { key: 'absences' as Tab, label: 'Absences',           icon: 'event_busy'   },
  ];

  protected readonly absenceStats = [
    { label: 'Total absences',     value: '8',  icon: 'event_busy',    color: '#6366f1', bg: 'rgba(99,102,241,0.10)'  },
    { label: 'Non justifiées',     value: '3',  icon: 'warning_amber', color: '#ef4444', bg: 'rgba(239,68,68,0.10)'   },
    { label: 'Justifiées',         value: '5',  icon: 'check_circle',  color: '#10b981', bg: 'rgba(16,185,129,0.10)'  },
  ];

  protected readonly mockNotes = [
    { matiere: 'Mathématiques', valeur: 15.5, date: '15/05/2026' },
    { matiere: 'Français',      valeur: 12.0, date: '12/05/2026' },
    { matiere: 'Anglais',       valeur: 14.5, date: '10/05/2026' },
    { matiere: 'Physique-Chimie', valeur: 9.5, date: '08/05/2026' },
    { matiere: 'SVT',           valeur: 16.0, date: '05/05/2026' },
  ];

  protected readonly mockFactures = [
    { numero: 'FACT-2025-0123', montant: '350 000 XOF', paye: '350 000 XOF', statut: 'PAYEE',     echeance: '31/01/2026' },
    { numero: 'FACT-2025-0247', montant: '350 000 XOF', paye: '175 000 XOF', statut: 'EN_ATTENTE', echeance: '30/04/2026' },
    { numero: 'FACT-2025-0389', montant: '50 000 XOF',  paye: '0 XOF',       statut: 'EN_ATTENTE', echeance: '30/06/2026' },
  ];

  protected readonly mockAbsences = [
    { date: '20/05/2026', matiere: 'Mathématiques', justifie: false, motif: null },
    { date: '15/05/2026', matiere: 'Anglais',       justifie: true,  motif: 'Rendez-vous médical' },
    { date: '10/05/2026', matiere: 'Physique',      justifie: false, motif: null },
    { date: '03/05/2026', matiere: 'SVT',           justifie: true,  motif: 'Maladie' },
    { date: '28/04/2026', matiere: 'Français',      justifie: true,  motif: 'Convocation famille' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.loadStudent(id);
  }

  protected infoFields(s: { dateNaissance: string; genre: string; email?: string; phone?: string }) {
    return [
      { label: 'Date de naissance', value: s.dateNaissance ? new Date(s.dateNaissance).toLocaleDateString('fr-FR') : '' },
      { label: 'Genre',             value: s.genre === 'M' ? 'Masculin' : 'Féminin' },
      { label: 'Nationalité',       value: 'Ivoirienne' },
      { label: 'Lieu de naissance', value: 'Abidjan, Côte d\'Ivoire' },
      { label: 'Tuteur légal',      value: 'Diallo Ibrahim · +225 07 00 11 22' },
    ];
  }

  protected statutBg(s: string): string {
    const m: Record<string, string> = { ACTIF: 'rgba(22,163,74,0.12)', INACTIF: 'rgba(107,114,128,0.12)', DIPLOME: 'rgba(99,102,241,0.12)', EXCLUS: 'rgba(239,68,68,0.12)' };
    return m[s] ?? 'rgba(107,114,128,0.12)';
  }
  protected statutColor(s: string): string {
    const m: Record<string, string> = { ACTIF: '#16a34a', INACTIF: '#6b7280', DIPLOME: '#6366f1', EXCLUS: '#dc2626' };
    return m[s] ?? '#6b7280';
  }
  protected noteColor(v: number): string {
    return v >= 14 ? '#16a34a' : v >= 10 ? '#d97706' : '#dc2626';
  }
}
