import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule }        from '@angular/common';
import { RouterLink }          from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule }       from '@angular/material/icon';
import { UsersStore }          from '@sms/users/data-access';
import { IAnneeAcademique, StatutAnnee } from '@sms/shared/models';

// ── Statut helpers ────────────────────────────────────────────────────────────
function statutOf(a: IAnneeAcademique): StatutAnnee {
  const now = new Date();
  if (a.active) return 'EN_COURS';
  if (new Date(a.dateDebut) > now) return 'A_VENIR';
  return 'CLOTUREE';
}

const STATUT_CFG: Record<StatutAnnee, { label: string; bg: string; color: string; icon: string }> = {
  EN_COURS: { label: 'En cours',  bg: 'rgba(22,163,74,0.12)',  color: '#16a34a', icon: 'play_circle'  },
  A_VENIR:  { label: 'À venir',   bg: 'rgba(245,158,11,0.12)', color: '#d97706', icon: 'upcoming'     },
  CLOTUREE: { label: 'Clôturée',  bg: 'rgba(107,114,128,0.12)',color: '#6b7280', icon: 'lock_clock'   },
};

type FormMode = 'create' | 'edit';

@Component({
  selector:        'sms-annees',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
<div class="p-6 max-w-5xl mx-auto">

  <!-- ── Header ── -->
  <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Années académiques</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Gestion des années scolaires — {{ store.annees().length }} année(s) enregistrée(s)
      </p>
    </div>
    <div class="flex items-center gap-2">
      <a routerLink="/admin"
         class="flex items-center gap-1 text-sm hover:opacity-80" style="color:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        Administration
      </a>
      <button (click)="openCreate()"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
        Nouvelle année
      </button>
    </div>
  </div>

  <!-- ── KPI Cards ── -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:var(--accent-light)">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">calendar_month</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color:var(--text-primary)">{{ store.annees().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Total</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(22,163,74,0.10)">
        <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">play_circle</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color:var(--text-primary)">{{ store.activeAnnee() ? 1 : 0 }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">En cours</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(107,114,128,0.10)">
        <mat-icon style="color:#6b7280;font-size:20px;height:20px;width:20px">lock_clock</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color:var(--text-primary)">{{ store.anneesCloturees().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Clôturées</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(245,158,11,0.10)">
        <mat-icon style="color:#d97706;font-size:20px;height:20px;width:20px">upcoming</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color:var(--text-primary)">{{ store.anneesAVenir().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">À venir</p>
      </div>
    </div>
  </div>

  <!-- ── Active year hero ── -->
  @if (store.activeAnnee(); as active) {
    <div class="rounded-2xl p-6 mb-6 overflow-hidden relative"
         style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #7c3aed 100%)">
      <div class="absolute inset-0 opacity-10"
           style="background: repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 16px)">
      </div>
      <div class="relative flex flex-wrap items-start justify-between gap-6">
        <!-- Left -->
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
               style="background:rgba(255,255,255,0.20)">
            <mat-icon style="color:#fff;font-size:28px;height:28px;width:28px">school</mat-icon>
          </div>
          <div>
            <p class="text-white/70 text-sm font-medium">Année académique en cours</p>
            <h2 class="text-3xl font-black text-white mt-0.5">{{ active.libelle }}</h2>
            @if (active.description) {
              <p class="text-white/70 text-sm mt-1">{{ active.description }}</p>
            }
            <p class="text-white/60 text-xs mt-2 flex items-center gap-1">
              <mat-icon style="font-size:13px;height:13px;width:13px">event</mat-icon>
              {{ active.dateDebut | date:'dd MMMM yyyy' }}
              <mat-icon style="font-size:13px;height:13px;width:13px">arrow_forward</mat-icon>
              {{ active.dateFin | date:'dd MMMM yyyy' }}
            </p>
          </div>
        </div>
        <!-- Stats -->
        <div class="flex flex-wrap gap-4">
          @if (active.nbEtudiants) {
            <div class="text-center">
              <p class="text-2xl font-black text-white">{{ active.nbEtudiants | number }}</p>
              <p class="text-white/70 text-xs">Étudiants</p>
            </div>
          }
          @if (active.nbEnseignants) {
            <div class="text-center">
              <p class="text-2xl font-black text-white">{{ active.nbEnseignants }}</p>
              <p class="text-white/70 text-xs">Enseignants</p>
            </div>
          }
          @if (active.nbCours) {
            <div class="text-center">
              <p class="text-2xl font-black text-white">{{ active.nbCours }}</p>
              <p class="text-white/70 text-xs">Cours</p>
            </div>
          }
          @if (active.tauxReussite) {
            <div class="text-center">
              <p class="text-2xl font-black text-white">{{ active.tauxReussite }}%</p>
              <p class="text-white/70 text-xs">Taux réussite</p>
            </div>
          }
        </div>
      </div>

      <!-- Progress bar (days elapsed) -->
      <div class="relative mt-5">
        <div class="flex items-center justify-between text-white/60 text-xs mb-1.5">
          <span>Début</span>
          <span class="font-semibold text-white">{{ progressPct(active) }}% écoulé</span>
          <span>Fin</span>
        </div>
        <div class="w-full rounded-full h-2" style="background:rgba(255,255,255,0.20)">
          <div class="h-2 rounded-full transition-all" style="background:rgba(255,255,255,0.85)"
               [style.width.%]="progressPct(active)"></div>
        </div>
        <p class="text-white/50 text-xs mt-1.5 text-center">
          {{ daysRemaining(active) }} jour(s) restant(s) avant la fin de l'année
        </p>
      </div>
    </div>
  }

  <!-- ── Form panel (create / edit) ── -->
  @if (showForm()) {
    <div class="sms-card p-6 mb-6" style="border:2px solid var(--accent)">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:var(--accent-light)">
          <mat-icon style="color:var(--accent);font-size:18px;height:18px;width:18px">
            {{ formMode() === 'create' ? 'add_circle' : 'edit' }}
          </mat-icon>
        </div>
        <div>
          <h3 class="font-bold" style="color:var(--text-primary)">
            {{ formMode() === 'create' ? 'Nouvelle année académique' : 'Modifier l\'année' }}
          </h3>
          <p class="text-xs" style="color:var(--text-secondary)">
            {{ formMode() === 'create' ? 'Renseignez les informations de la nouvelle année scolaire' : 'Modifiez les informations de l\'année sélectionnée' }}
          </p>
        </div>
        <button (click)="closeForm()" class="ml-auto p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                style="color:var(--text-muted);background:var(--surface-2)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submitForm()" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Libellé -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-primary)">
            Libellé <span style="color:#ef4444">*</span>
          </label>
          <input formControlName="libelle" type="text" placeholder="Ex: 2026-2027"
                 class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                 [style.border-color]="isInvalid('libelle') ? '#ef4444' : 'var(--border-color)'"
                 style="background:var(--surface-2);color:var(--text-primary)">
          @if (isInvalid('libelle')) {
            <p class="text-xs mt-1.5 flex items-center gap-1" style="color:#ef4444">
              <mat-icon style="font-size:12px;height:12px;width:12px">error_outline</mat-icon>
              Le libellé est obligatoire (ex: 2026-2027)
            </p>
          }
        </div>

        <!-- Date début -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-primary)">
            Date de début <span style="color:#ef4444">*</span>
          </label>
          <input formControlName="dateDebut" type="date"
                 class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                 [style.border-color]="isInvalid('dateDebut') ? '#ef4444' : 'var(--border-color)'"
                 style="background:var(--surface-2);color:var(--text-primary)">
          @if (isInvalid('dateDebut')) {
            <p class="text-xs mt-1.5" style="color:#ef4444">Date de début obligatoire</p>
          }
        </div>

        <!-- Date fin -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-primary)">
            Date de fin <span style="color:#ef4444">*</span>
          </label>
          <input formControlName="dateFin" type="date"
                 class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                 [style.border-color]="isInvalid('dateFin') ? '#ef4444' : 'var(--border-color)'"
                 style="background:var(--surface-2);color:var(--text-primary)">
          @if (isInvalid('dateFin')) {
            <p class="text-xs mt-1.5" style="color:#ef4444">Date de fin obligatoire</p>
          }
          @if (form.hasError('dateOrder')) {
            <p class="text-xs mt-1.5 flex items-center gap-1" style="color:#ef4444">
              <mat-icon style="font-size:12px;height:12px;width:12px">error_outline</mat-icon>
              La date de fin doit être postérieure à la date de début
            </p>
          }
        </div>

        <!-- Description -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-primary)">
            Description / Notes
          </label>
          <textarea formControlName="description" rows="2"
                    placeholder="Informations complémentaires sur cette année académique…"
                    class="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                    style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </textarea>
        </div>

        <!-- Actions -->
        <div class="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
          <button type="button" (click)="closeForm()"
                  class="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                  style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
            Annuler
          </button>
          <button type="submit" [disabled]="store.saving()"
                  class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  style="background:var(--accent)">
            @if (store.saving()) {
              <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
            } @else {
              <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
            }
            {{ store.saving() ? 'Enregistrement…' : (formMode() === 'create' ? 'Créer l\'année' : 'Enregistrer') }}
          </button>
        </div>
      </form>
    </div>
  }

  <!-- ── List ── -->
  @if (store.loading()) {
    <div class="flex items-center justify-center py-12 gap-2" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
    </div>
  } @else {
    <div class="flex flex-col gap-3">
      @for (annee of store.annees(); track annee.publicId) {
        @let s = statut(annee);
        <div class="sms-card overflow-hidden transition-all"
             [style.border-left]="annee.active ? '4px solid var(--accent)' : '4px solid transparent'">
          <div class="p-5 flex flex-wrap items-start gap-4">

            <!-- Icon -->
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                 [style.background]="s.bg">
              <mat-icon [style.color]="s.color" style="font-size:22px;height:22px;width:22px">
                {{ s.icon }}
              </mat-icon>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h3 class="text-lg font-bold" style="color:var(--text-primary)">{{ annee.libelle }}</h3>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      [style.background]="s.bg" [style.color]="s.color">
                  <mat-icon style="font-size:11px;height:11px;width:11px">{{ s.icon }}</mat-icon>
                  {{ s.label }}
                </span>
              </div>

              <p class="text-sm flex items-center gap-2 mb-1.5" style="color:var(--text-secondary)">
                <mat-icon style="font-size:14px;height:14px;width:14px">event</mat-icon>
                {{ annee.dateDebut | date:'dd MMMM yyyy' }}
                <mat-icon style="font-size:12px;height:12px;width:12px">arrow_forward</mat-icon>
                {{ annee.dateFin | date:'dd MMMM yyyy' }}
                <span class="text-xs" style="color:var(--text-muted)">
                  ({{ durationMonths(annee) }} mois)
                </span>
              </p>

              @if (annee.description) {
                <p class="text-xs" style="color:var(--text-muted)">{{ annee.description }}</p>
              }

              <!-- Stats row -->
              @if (annee.nbEtudiants) {
                <div class="flex flex-wrap gap-5 mt-3">
                  <div class="flex items-center gap-1.5 text-xs" style="color:var(--text-secondary)">
                    <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--accent)">people</mat-icon>
                    <span><strong style="color:var(--text-primary)">{{ annee.nbEtudiants | number }}</strong> étudiants</span>
                  </div>
                  @if (annee.nbEnseignants) {
                    <div class="flex items-center gap-1.5 text-xs" style="color:var(--text-secondary)">
                      <mat-icon style="font-size:14px;height:14px;width:14px;color:#8b5cf6">school</mat-icon>
                      <span><strong style="color:var(--text-primary)">{{ annee.nbEnseignants }}</strong> enseignants</span>
                    </div>
                  }
                  @if (annee.nbCours) {
                    <div class="flex items-center gap-1.5 text-xs" style="color:var(--text-secondary)">
                      <mat-icon style="font-size:14px;height:14px;width:14px;color:#0891b2">menu_book</mat-icon>
                      <span><strong style="color:var(--text-primary)">{{ annee.nbCours }}</strong> cours</span>
                    </div>
                  }
                  @if (annee.tauxReussite) {
                    <div class="flex items-center gap-1.5 text-xs" style="color:var(--text-secondary)">
                      <mat-icon style="font-size:14px;height:14px;width:14px;color:#16a34a">trending_up</mat-icon>
                      <span><strong [style.color]="annee.tauxReussite >= 75 ? '#16a34a' : '#d97706'">{{ annee.tauxReussite }}%</strong> réussite</span>
                    </div>
                  }
                </div>
              }

              <!-- Progress bar for active or recent years -->
              @if (annee.active || statut(annee).label === 'À venir') {
                <div class="mt-3 max-w-xs">
                  <div class="flex items-center justify-between text-xs mb-1" style="color:var(--text-muted)">
                    <span>Progression</span>
                    <span>{{ progressPct(annee) }}%</span>
                  </div>
                  <div class="w-full rounded-full h-1.5" style="background:var(--border-color)">
                    <div class="h-1.5 rounded-full transition-all"
                         [style.background]="annee.active ? 'var(--accent)' : '#d97706'"
                         [style.width.%]="progressPct(annee)"></div>
                  </div>
                </div>
              }
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 flex-shrink-0">
              @if (!annee.active && statut(annee).label !== 'À venir') {
                <button (click)="confirmActivation(annee)"
                        class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                        style="background:var(--accent-light);color:var(--accent)">
                  <mat-icon style="font-size:15px;height:15px;width:15px">play_arrow</mat-icon>
                  Activer
                </button>
              }
              @if (annee.active) {
                <div class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                     style="background:rgba(22,163,74,0.10);color:#16a34a">
                  <mat-icon style="font-size:14px;height:14px;width:14px">verified</mat-icon>
                  Année active
                </div>
              }
              <button (click)="openEdit(annee)"
                      class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                      style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
                <mat-icon style="font-size:15px;height:15px;width:15px">edit</mat-icon>
                Modifier
              </button>
            </div>
          </div>
        </div>
      } @empty {
        <div class="sms-card flex flex-col items-center justify-center py-16 gap-3">
          <mat-icon style="font-size:48px;height:48px;width:48px;color:var(--text-muted)">calendar_month</mat-icon>
          <p style="color:var(--text-secondary)">Aucune année académique enregistrée</p>
          <button (click)="openCreate()"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
                  style="background:var(--accent)">
            <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
            Créer la première année
          </button>
        </div>
      }
    </div>
  }

</div>

<!-- ══ DIALOG : Confirmation activation ══ -->
@if (confirmTarget()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
       style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px)">
    <div class="sms-card w-full max-w-md overflow-hidden">

      <div class="px-6 py-5 border-b flex items-center gap-3" style="border-color:var(--border-color)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:var(--accent-light)">
          <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">swap_horiz</mat-icon>
        </div>
        <div>
          <p class="font-bold" style="color:var(--text-primary)">Changer l'année active</p>
          <p class="text-sm" style="color:var(--text-secondary)">Cette action affecte tout le système</p>
        </div>
      </div>

      <div class="px-6 py-5">
        <div class="flex items-start gap-3 mb-5 p-4 rounded-xl"
             style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25)">
          <mat-icon style="color:#d97706;font-size:18px;height:18px;width:18px;flex-shrink:0;margin-top:2px">warning</mat-icon>
          <div>
            <p class="text-sm font-semibold" style="color:#d97706">Opération critique</p>
            <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
              Activer l'année <strong>{{ confirmTarget()?.libelle }}</strong> va désactiver l'année en cours.
              Toutes les inscriptions, notes et factures seront associées à la nouvelle année active.
            </p>
          </div>
        </div>

        <!-- Recap: from / to -->
        <div class="flex items-center gap-3 justify-center">
          <div class="text-center p-3 rounded-xl flex-1" style="background:rgba(239,68,68,0.06)">
            <p class="text-xs" style="color:var(--text-muted)">Actuellement active</p>
            <p class="font-bold mt-0.5" style="color:#dc2626">{{ store.activeAnnee()?.libelle ?? '—' }}</p>
          </div>
          <mat-icon style="color:var(--text-muted)">arrow_forward</mat-icon>
          <div class="text-center p-3 rounded-xl flex-1" style="background:rgba(22,163,74,0.06)">
            <p class="text-xs" style="color:var(--text-muted)">Nouvelle année active</p>
            <p class="font-bold mt-0.5" style="color:#16a34a">{{ confirmTarget()?.libelle }}</p>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t flex gap-3 justify-end" style="border-color:var(--border-color)">
        <button (click)="confirmTarget.set(null)"
                class="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
          Annuler
        </button>
        <button (click)="doActivate()"
                [disabled]="store.saving()"
                class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style="background:var(--accent)">
          @if (store.saving()) {
            <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
            Activation…
          } @else {
            <mat-icon style="font-size:16px;height:16px;width:16px">play_arrow</mat-icon>
            Confirmer l'activation
          }
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class AnneesComponent implements OnInit {
  protected readonly store = inject(UsersStore);
  private  readonly fb    = inject(FormBuilder);

  // ── UI state ──────────────────────────────────────────────────────────────
  readonly showForm     = signal(false);
  readonly formMode     = signal<FormMode>('create');
  readonly editPublicId = signal('');
  readonly confirmTarget = signal<IAnneeAcademique | null>(null);

  // ── Form ──────────────────────────────────────────────────────────────────
  readonly form = this.fb.group({
    libelle:     ['', Validators.required],
    dateDebut:   ['', Validators.required],
    dateFin:     ['', Validators.required],
    description: [''],
  }, { validators: this.dateOrderValidator.bind(this) });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadAnnees();
  }

  // ── Statut helpers ────────────────────────────────────────────────────────
  statut(a: IAnneeAcademique) {
    return STATUT_CFG[statutOf(a)];
  }

  // ── Progress helpers ──────────────────────────────────────────────────────
  progressPct(a: IAnneeAcademique): number {
    const debut = new Date(a.dateDebut).getTime();
    const fin   = new Date(a.dateFin).getTime();
    const now   = Date.now();
    if (now <= debut) return 0;
    if (now >= fin)   return 100;
    return Math.round(((now - debut) / (fin - debut)) * 100);
  }

  daysRemaining(a: IAnneeAcademique): number {
    const diff = new Date(a.dateFin).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  }

  durationMonths(a: IAnneeAcademique): number {
    const debut = new Date(a.dateDebut);
    const fin   = new Date(a.dateFin);
    return Math.round(
      (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth())
    );
  }

  // ── Form validation ───────────────────────────────────────────────────────
  private dateOrderValidator(group: ReturnType<typeof this.fb.group>) {
    const debut = group.get('dateDebut')?.value;
    const fin   = group.get('dateFin')?.value;
    if (debut && fin && new Date(fin) <= new Date(debut)) {
      return { dateOrder: true };
    }
    return null;
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  // ── Create / Edit ─────────────────────────────────────────────────────────
  openCreate(): void {
    this.formMode.set('create');
    this.editPublicId.set('');
    this.form.reset();
    this.showForm.set(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  openEdit(a: IAnneeAcademique): void {
    this.formMode.set('edit');
    this.editPublicId.set(a.publicId);
    this.form.patchValue({
      libelle:     a.libelle,
      dateDebut:   a.dateDebut,
      dateFin:     a.dateFin,
      description: a.description ?? '',
    });
    this.showForm.set(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.form.reset();
  }

  submitForm(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const val = this.form.value;

    if (this.formMode() === 'create') {
      this.store.createAnnee(val as any);
    } else {
      this.store.updateAnnee({ publicId: this.editPublicId(), data: val as any });
    }
    setTimeout(() => { if (!this.store.error()) this.closeForm(); }, 350);
  }

  // ── Activation ────────────────────────────────────────────────────────────
  confirmActivation(a: IAnneeAcademique): void {
    this.confirmTarget.set(a);
  }

  doActivate(): void {
    const target = this.confirmTarget();
    if (!target) return;
    this.store.activerAnnee(target.publicId);
    setTimeout(() => { if (!this.store.error()) this.confirmTarget.set(null); }, 450);
  }
}
