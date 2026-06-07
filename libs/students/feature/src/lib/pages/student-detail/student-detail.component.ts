import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { StudentsStore } from '@sms/students/data-access';

type TabKey = 'infos' | 'notes' | 'factures' | 'documents';

@Component({
  selector: 'sms-student-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm mb-6" style="color: var(--text-secondary)">
        <a routerLink="/students" class="hover:underline" style="color: var(--accent)">Étudiants</a>
        <mat-icon style="font-size: 14px; height: 14px; width: 14px">chevron_right</mat-icon>
        <span style="color: var(--text-primary)">Fiche étudiant</span>
      </nav>

      @if (store.loading()) {
        <div class="flex items-center justify-center py-16" style="color: var(--text-secondary)">
          <mat-icon class="animate-spin">refresh</mat-icon>&nbsp;Chargement...
        </div>
      }

      @if (store.selectedStudent(); as s) {
        <!-- Profile Card -->
        <div class="sms-card p-6 mb-6">
          <div class="flex flex-col sm:flex-row items-start gap-5">
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
                 [style.background]="s.genre === 'F' ? '#ec4899' : '#6366f1'">
              {{ s.firstName[0] }}{{ s.lastName[0] }}
            </div>
            <div class="flex-1">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="text-xl font-bold" style="color: var(--text-primary)">{{ s.firstName }} {{ s.lastName }}</h2>
                  <p class="font-mono text-sm mt-0.5" style="color: var(--text-secondary)">{{ s.matricule }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngStyle]="statutStyle(s.statut)">
                      {{ s.statut }}
                    </span>
                    <span class="text-xs" style="color: var(--text-muted)">{{ promoLabel(s.classePublicId) }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <a [routerLink]="['/students', s.publicId, 'edit']"
                     class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border hover:opacity-80 transition-opacity"
                     style="border-color: var(--border-color); color: var(--text-primary); background: var(--surface-2)">
                    <mat-icon style="font-size: 14px; height: 14px; width: 14px">edit</mat-icon>
                    Modifier
                  </a>
                  <a routerLink="/finance/invoices"
                     class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-80 transition-opacity"
                     style="background: var(--accent)">
                    <mat-icon style="font-size: 14px; height: 14px; width: 14px">receipt</mat-icon>
                    Factures
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 mb-4">
          @for (tab of tabs; track tab.key) {
            <button (click)="activeTab.set(tab.key)"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [style.background]="activeTab() === tab.key ? 'var(--accent)' : 'var(--surface-2)'"
              [style.color]="activeTab() === tab.key ? '#fff' : 'var(--text-secondary)'">
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- Tab Content -->
        @if (activeTab() === 'infos') {
          <div class="sms-card p-6">
            <h3 class="font-semibold mb-4" style="color: var(--text-primary)">Informations personnelles</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              @for (field of infoFields(s); track field.label) {
                <div>
                  <p class="text-xs uppercase font-medium mb-1" style="color: var(--text-muted)">{{ field.label }}</p>
                  <p class="text-sm font-medium" style="color: var(--text-primary)">{{ field.value }}</p>
                </div>
              }
            </div>
          </div>
        }

        @if (activeTab() === 'notes') {
          <div class="sms-card p-6">
            <h3 class="font-semibold mb-4" style="color: var(--text-primary)">Notes & résultats</h3>
            <div class="flex flex-col items-center justify-center py-12 gap-3">
              <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">grade</mat-icon>
              <p style="color: var(--text-secondary)">Voir les notes dans le module Académique</p>
              <a routerLink="/academic" class="px-4 py-2 rounded-lg text-sm font-medium text-white" style="background: var(--accent)">
                Accéder aux notes
              </a>
            </div>
          </div>
        }

        @if (activeTab() === 'factures') {
          <div class="sms-card p-6">
            <h3 class="font-semibold mb-4" style="color: var(--text-primary)">Factures & paiements</h3>
            <div class="flex flex-col items-center justify-center py-12 gap-3">
              <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">receipt_long</mat-icon>
              <p style="color: var(--text-secondary)">Voir les factures dans le module Finance</p>
              <a routerLink="/finance/invoices" class="px-4 py-2 rounded-lg text-sm font-medium text-white" style="background: var(--accent)">
                Accéder aux factures
              </a>
            </div>
          </div>
        }

        @if (activeTab() === 'documents') {
          <div class="sms-card p-6">
            <h3 class="font-semibold mb-4" style="color: var(--text-primary)">Documents</h3>
            <div class="flex flex-col items-center justify-center py-12 gap-3">
              <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">folder_open</mat-icon>
              <p style="color: var(--text-secondary)">Aucun document disponible</p>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class StudentDetailComponent implements OnInit {
  readonly store = inject(StudentsStore);
  private route = inject(ActivatedRoute);
  readonly activeTab = signal<TabKey>('infos');

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'infos', label: 'Infos personnelles' },
    { key: 'notes', label: 'Notes' },
    { key: 'factures', label: 'Factures' },
    { key: 'documents', label: 'Documents' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.loadStudent(id);
  }

  infoFields(s: any): { label: string; value: string }[] {
    return [
      { label: 'Prénom', value: s.firstName },
      { label: 'Nom', value: s.lastName },
      { label: 'Date de naissance', value: s.dateNaissance ? new Date(s.dateNaissance).toLocaleDateString('fr-FR') : '—' },
      { label: 'Genre', value: s.genre === 'M' ? 'Masculin' : 'Féminin' },
      { label: 'Email', value: s.email ?? '—' },
      { label: 'Téléphone', value: s.phone ?? '—' },
      { label: 'Matricule', value: s.matricule },
      { label: 'Promotion', value: this.promoLabel(s.classePublicId) },
      { label: 'Statut', value: s.statut },
      { label: 'Année académique', value: '2025-2026' },
    ];
  }

  promoLabel(id?: string): string {
    const map: Record<string, string> = {
      'promo-001': 'Licence 3 GL 2025', 'promo-002': 'Licence 2 GL 2025',
      'promo-003': 'Master 1 RI 2025', 'promo-004': 'Licence 1 GL 2025', 'promo-005': 'Master 2 RI 2025',
    };
    return id ? (map[id] ?? id) : '—';
  }

  statutStyle(statut: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      ACTIF:     { background: '#dcfce7', color: '#16a34a' },
      INACTIF:   { background: '#f3f4f6', color: '#6b7280' },
      DIPLOME:   { background: '#dbeafe', color: '#2563eb' },
      EXCLUS:    { background: '#fee2e2', color: '#dc2626' },
      TRANSFERE: { background: '#fef3c7', color: '#d97706' },
    };
    return map[statut] ?? { background: '#f3f4f6', color: '#6b7280' };
  }
}
