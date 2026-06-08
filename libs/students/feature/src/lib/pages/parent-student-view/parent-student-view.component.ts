import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { StudentsStore } from '@sms/students/data-access';
import { SkeletonCardComponent } from '@sms/shared/ui';

@Component({
  selector: 'sms-parent-student-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, SkeletonCardComponent],
  template: `
<div class="p-4 max-w-2xl mx-auto">

  <!-- Header -->
  <div class="flex items-center gap-3 mb-5">
    <a routerLink="/dashboard"
       class="flex items-center justify-center w-9 h-9 rounded-xl hover:opacity-70 transition-opacity"
       style="background: var(--surface-2); color: var(--text-secondary)">
      <mat-icon style="font-size: 20px; height: 20px; width: 20px">arrow_back</mat-icon>
    </a>
    <div>
      <h1 class="text-xl font-bold" style="color: var(--text-primary)">Mon enfant</h1>
      <p class="text-xs" style="color: var(--text-secondary)">Suivi scolaire</p>
    </div>
  </div>

  @if (store.loading()) {
    <sms-skeleton-card />
  }

  @if (store.selectedStudent(); as s) {

    <!-- Profile card -->
    <div class="sms-card p-5 mb-4">
      <div class="flex items-center gap-4">
        <!-- Avatar -->
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
             style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
          {{ s.firstName[0] }}{{ s.lastName[0] }}
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-bold truncate" style="color: var(--text-primary)">
            {{ s.firstName }} {{ s.lastName }}
          </h2>
          <p class="text-sm" style="color: var(--text-secondary)">{{ s.classeLibelle ?? 'Classe non assignée' }}</p>
          <span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                [style.background]="statutBg(s.statut)"
                [style.color]="statutColor(s.statut)">
            {{ statutLabel(s.statut) }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mt-4 pt-4 border-t" style="border-color: var(--border-color)">
        <div>
          <p class="text-xs" style="color: var(--text-muted)">Matricule</p>
          <p class="text-sm font-semibold mt-0.5" style="color: var(--text-primary)">{{ s.matricule }}</p>
        </div>
        <div>
          <p class="text-xs" style="color: var(--text-muted)">Date de naissance</p>
          <p class="text-sm font-semibold mt-0.5" style="color: var(--text-primary)">
            {{ s.dateNaissance | date:'dd/MM/yyyy' }}
          </p>
        </div>
        @if (s.niveauLibelle) {
          <div>
            <p class="text-xs" style="color: var(--text-muted)">Niveau</p>
            <p class="text-sm font-semibold mt-0.5" style="color: var(--text-primary)">{{ s.niveauLibelle }}</p>
          </div>
        }
        @if (s.filiereLibelle) {
          <div>
            <p class="text-xs" style="color: var(--text-muted)">Filière</p>
            <p class="text-sm font-semibold mt-0.5" style="color: var(--text-primary)">{{ s.filiereLibelle }}</p>
          </div>
        }
      </div>
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <a routerLink="/academic"
         class="sms-card p-4 flex flex-col items-center gap-2 text-center hover:opacity-80 transition-opacity">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center"
             style="background: rgba(99,102,241,0.1)">
          <mat-icon style="color: #6366f1">grade</mat-icon>
        </div>
        <p class="text-sm font-semibold" style="color: var(--text-primary)">Notes & Bulletins</p>
        <p class="text-xs" style="color: var(--text-secondary)">Résultats scolaires</p>
      </a>
      <a routerLink="/finance/mes-paiements"
         class="sms-card p-4 flex flex-col items-center gap-2 text-center hover:opacity-80 transition-opacity">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center"
             style="background: rgba(22,163,74,0.1)">
          <mat-icon style="color: #16a34a">account_balance_wallet</mat-icon>
        </div>
        <p class="text-sm font-semibold" style="color: var(--text-primary)">Paiements</p>
        <p class="text-xs" style="color: var(--text-secondary)">Factures & frais</p>
      </a>
      <a routerLink="/schedule"
         class="sms-card p-4 flex flex-col items-center gap-2 text-center hover:opacity-80 transition-opacity">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center"
             style="background: rgba(8,145,178,0.1)">
          <mat-icon style="color: #0891b2">calendar_month</mat-icon>
        </div>
        <p class="text-sm font-semibold" style="color: var(--text-primary)">Emploi du temps</p>
        <p class="text-xs" style="color: var(--text-secondary)">Planning semaine</p>
      </a>
      <a routerLink="/communication"
         class="sms-card p-4 flex flex-col items-center gap-2 text-center hover:opacity-80 transition-opacity">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center"
             style="background: rgba(245,158,11,0.1)">
          <mat-icon style="color: #d97706">chat_bubble_outline</mat-icon>
        </div>
        <p class="text-sm font-semibold" style="color: var(--text-primary)">Messagerie</p>
        <p class="text-xs" style="color: var(--text-secondary)">Contacter l'école</p>
      </a>
    </div>

    <!-- Contacts & parents -->
    @if (s.parents && s.parents.length > 0) {
      <div class="sms-card overflow-hidden">
        <div class="px-4 py-3 border-b font-semibold text-sm" style="border-color: var(--border-color); color: var(--text-primary)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px; vertical-align: -3px; margin-right: 6px; color: var(--accent)">family_restroom</mat-icon>
          Responsables légaux
        </div>
        <div class="divide-y" style="border-color: var(--border-color)">
          @for (parent of s.parents; track parent.publicId) {
            <div class="px-4 py-3 flex items-center gap-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                   style="background: var(--accent)">
                {{ parent.prenom[0] }}{{ parent.nom[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold truncate" style="color: var(--text-primary)">
                  {{ parent.prenom }} {{ parent.nom }}
                </p>
                <p class="text-xs" style="color: var(--text-secondary)">{{ parent.relation }}</p>
              </div>
              @if (parent.telephone) {
                <a [href]="'tel:' + parent.telephone"
                   class="flex items-center justify-center w-9 h-9 rounded-xl hover:opacity-70 transition-opacity"
                   style="background: rgba(22,163,74,0.1); color: #16a34a">
                  <mat-icon style="font-size: 18px; height: 18px; width: 18px">call</mat-icon>
                </a>
              }
            </div>
          }
        </div>
      </div>
    }
  }

</div>
  `,
})
export class ParentStudentViewComponent implements OnInit {
  readonly store = inject(StudentsStore);

  ngOnInit(): void {
    const students = this.store.students();
    if (students.length > 0 && !this.store.selectedStudent()) {
      this.store.loadStudent(students[0].publicId);
    } else if (!this.store.selectedStudent()) {
      this.store.loadStudents();
    }
  }

  statutBg(statut: string): string {
    const map: Record<string, string> = {
      ACTIF: 'rgba(22,163,74,0.12)', INACTIF: 'rgba(107,114,128,0.12)',
      PRE_INSCRIT: 'rgba(245,158,11,0.12)', INSCRIT: 'rgba(59,130,246,0.12)',
      INSCRIPTION_VALIDEE: 'rgba(16,185,129,0.12)',
    };
    return map[statut] ?? 'rgba(107,114,128,0.12)';
  }

  statutColor(statut: string): string {
    const map: Record<string, string> = {
      ACTIF: '#16a34a', INACTIF: '#6b7280',
      PRE_INSCRIT: '#d97706', INSCRIT: '#2563eb',
      INSCRIPTION_VALIDEE: '#059669',
    };
    return map[statut] ?? '#6b7280';
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      ACTIF: 'Actif', INACTIF: 'Inactif',
      PRE_INSCRIT: 'Pré-inscrit', INSCRIT: 'Inscrit',
      INSCRIPTION_VALIDEE: 'Inscription validée',
      INSCRIPTION_ANNULEE: 'Annulée', SUSPENDU: 'Suspendu',
    };
    return map[statut] ?? statut;
  }
}
