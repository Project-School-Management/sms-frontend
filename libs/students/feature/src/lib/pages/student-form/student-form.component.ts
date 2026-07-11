import {
  ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule }                                        from '@angular/common';
import { RouterLink, Router, ActivatedRoute }                  from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators }        from '@angular/forms';
import { FormsModule }                                         from '@angular/forms';
import { MatIconModule }                                       from '@angular/material/icon';
import { StudentsStore, MOCK_STUDENTS }                        from '@sms/students/data-access';
import { ReferenceStore, getFraisScolariteByNiveauLibelle }    from '@sms/config-system/data-access';
import { generateMatricule, workspaceTypeFromNiveauLibelle }   from '@sms/shared/util';

// ── Données locales non-référentiels ─────────────────────────────────────────
const REGIMES = [
  { value: 'EXTERNE',           label: 'Externe',          desc: 'Sans repas',      icon: 'directions_walk' },
  { value: 'DEMI_PENSIONNAIRE', label: 'Demi-pensionnaire', desc: 'Déjeuner inclus', icon: 'restaurant'      },
  { value: 'INTERNE',           label: 'Pensionnaire',      desc: 'Logé & nourri',   icon: 'home'            },
];

const GROUPES = ['Groupe A', 'Groupe B', 'Groupe C', 'Groupe D'];

// FRAIS_INSCRIPTION et FRAIS_SCOLARITE proviennent maintenant du ReferenceStore

const TYPE_BOURSES = [
  { value: 'MERITE',    label: 'Mérite',    desc: 'Excellence scolaire' },
  { value: 'SOCIALE',   label: 'Sociale',   desc: 'Situation familiale' },
  { value: 'ETAT',      label: "État",      desc: "Bourse d'État"       },
  { value: 'PARTIELLE', label: 'Partielle', desc: 'Aide partielle'      },
];

const STEPS = [
  { index: 0, label: 'Identité',   icon: 'person',          color: '#6366f1', desc: 'Informations personnelles'   },
  { index: 1, label: 'Scolarité',  icon: 'school',          color: '#f59e0b', desc: 'Affectation académique'      },
  { index: 2, label: 'Famille',    icon: 'family_restroom', color: '#3b82f6', desc: 'Parents & contacts urgence'  },
  { index: 3, label: 'Finance',    icon: 'payments',        color: '#10b981', desc: 'Frais, bourse & documents'   },
  { index: 4, label: 'Validation', icon: 'fact_check',      color: '#8b5cf6', desc: 'Récapitulatif & confirmation'},
];

// ── Component ──────────────────────────────────────────────────────────────────
@Component({
  selector:        'sms-student-form',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatIconModule],
  template: `
<div class="min-h-screen" style="background:var(--content-bg)">

  <!-- ══════════════════════════════════════════════════════════
       HEADER STICKY
  ══════════════════════════════════════════════════════════ -->
  <div class="sticky top-0 z-30 border-b" style="background:var(--topbar-bg);border-color:var(--border-color)">
    <div class="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
      <a routerLink="/students"
         class="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
         style="background:var(--surface-2);color:var(--text-secondary)">
        <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
      </a>
      <div class="flex-1 min-w-0">
        <h1 class="text-base font-bold leading-none" style="color:var(--text-primary)">
          {{ isEditMode() ? "Modifier le dossier" : "Nouvelle inscription" }}
        </h1>
        <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
          @if (isEditMode()) {
            {{ store.selectedStudent()?.firstName }} {{ store.selectedStudent()?.lastName }}
            · {{ store.selectedStudent()?.matricule }}
          } @else {
            Étape {{ currentStep() + 1 }}/{{ steps.length }} — {{ steps[currentStep()].label }}
          }
        </p>
      </div>

      <!-- Progress bar -->
      <div class="hidden sm:flex items-center gap-3 flex-1 max-w-xs">
        <div class="flex-1 rounded-full h-1.5" style="background:var(--border-color)">
          <div class="h-1.5 rounded-full transition-all duration-500"
               style="background:var(--accent)"
               [style.width]="formCompletionPct() + '%'"></div>
        </div>
        <span class="text-xs font-semibold tabular-nums" style="color:var(--accent)">
          {{ formCompletionPct() }}%
        </span>
      </div>

      <!-- Draft badge -->
      @if (draftSaved()) {
        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
             style="background:rgba(16,185,129,0.1);color:#10b981">
          <mat-icon style="font-size:13px;height:13px;width:13px">cloud_done</mat-icon>
          Brouillon sauvegardé
        </div>
      }
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       LAYOUT : SIDEBAR + CONTENU
  ══════════════════════════════════════════════════════════ -->
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:flex lg:gap-7 lg:items-start">

    <!-- ── SIDEBAR (desktop uniquement) ── -->
    <aside class="hidden lg:flex flex-col w-64 shrink-0 sticky top-20">

      <!-- Steps navigation -->
      <div class="sms-card overflow-hidden mb-4">
        @for (step of steps; track step.index) {
          <button type="button" (click)="goToStep(step.index)"
                  class="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:opacity-90"
                  [style.background]="currentStep() === step.index ? 'var(--accent-light)' : 'transparent'"
                  [style.border-left]="currentStep() === step.index ? '3px solid var(--accent)' : '3px solid transparent'">

            <!-- Step circle -->
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all"
                 [style.background]="stepIsComplete(step.index) ? 'rgba(16,185,129,0.15)' : currentStep() === step.index ? 'var(--accent)' : 'var(--surface-2)'"
                 [style.color]="stepIsComplete(step.index) ? '#10b981' : currentStep() === step.index ? '#fff' : 'var(--text-muted)'">
              @if (stepIsComplete(step.index)) {
                <mat-icon style="font-size:16px;height:16px;width:16px">check</mat-icon>
              } @else {
                <mat-icon style="font-size:16px;height:16px;width:16px">{{ step.icon }}</mat-icon>
              }
            </div>

            <!-- Label -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold"
                 [style.color]="currentStep() === step.index ? 'var(--accent)' : stepIsComplete(step.index) ? '#10b981' : 'var(--text-primary)'">
                {{ step.label }}
              </p>
              <p class="text-xs truncate" style="color:var(--text-muted)">{{ step.desc }}</p>
            </div>

            <!-- Complete badge -->
            @if (stepIsComplete(step.index)) {
              <mat-icon style="font-size:14px;height:14px;width:14px;color:#10b981;flex-shrink:0">check_circle</mat-icon>
            }
          </button>

          <!-- Connector line between steps -->
          @if (step.index < steps.length - 1) {
            <div class="ml-8 h-px" style="background:var(--border-color)"></div>
          }
        }
      </div>

      <!-- Completion card -->
      <div class="sms-card p-4">
        <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color:var(--text-muted)">Complétion du dossier</p>
        <div class="flex items-center gap-3 mb-2">
          <div class="flex-1 rounded-full h-2" style="background:var(--border-color)">
            <div class="h-2 rounded-full transition-all duration-500"
                 style="background:var(--accent)"
                 [style.width]="formCompletionPct() + '%'"></div>
          </div>
          <span class="text-sm font-bold" style="color:var(--accent)">{{ formCompletionPct() }}%</span>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          @if (form.value.firstName && form.value.lastName) {
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" style="background:rgba(16,185,129,0.1);color:#10b981">Identité ✓</span>
          }
          @if (form.value.classePublicId) {
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" style="background:rgba(16,185,129,0.1);color:#10b981">Scolarité ✓</span>
          }
          @if (form.value.tuteurNom && form.value.tuteurPhone) {
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" style="background:rgba(16,185,129,0.1);color:#10b981">Famille ✓</span>
          }
        </div>
        @if (!isEditMode()) {
          <div class="mt-4 pt-3 border-t" style="border-color:var(--border-color)">
            <p class="text-xs" style="color:var(--text-muted)">Matricule généré</p>
            <p class="text-xs font-mono font-semibold mt-0.5" style="color:var(--text-primary)">{{ generatedMatricule() }}</p>
          </div>
        }
      </div>
    </aside>

    <!-- ── CONTENU PRINCIPAL ── -->
    <div class="flex-1 min-w-0">

      <!-- Stepper mobile (sm/md) -->
      <div class="lg:hidden flex items-center gap-2 mb-5 px-1 overflow-x-auto">
        @for (step of steps; track step.index) {
          <button type="button" (click)="goToStep(step.index)"
                  class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  [style.background]="currentStep() === step.index ? 'var(--accent)' : stepIsComplete(step.index) ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)'"
                  [style.color]="currentStep() === step.index ? '#fff' : stepIsComplete(step.index) ? '#10b981' : 'var(--text-muted)'">
            @if (stepIsComplete(step.index)) {
              <mat-icon style="font-size:13px;height:13px;width:13px">check</mat-icon>
            } @else {
              <span>{{ step.index + 1 }}</span>
            }
            {{ step.label }}
          </button>
          @if (step.index < steps.length - 1) {
            <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted);flex-shrink:0">chevron_right</mat-icon>
          }
        }
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">

      <!-- ══════════════════════════════════════════════════════════
           ÉTAPE 0 — IDENTITÉ
      ══════════════════════════════════════════════════════════ -->
      @if (currentStep() === 0) {

        <!-- Recherche élève existant -->
        @if (!isEditMode()) {
          <div class="sms-card overflow-hidden mb-5">
            <div class="px-5 py-4 flex items-center gap-3 border-b"
                 style="border-color:var(--border-color);background:rgba(8,145,178,0.04)">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style="background:rgba(8,145,178,0.12)">
                <mat-icon style="color:#0891b2;font-size:18px;height:18px;width:18px">manage_search</mat-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold" style="color:var(--text-primary)">Élève déjà enregistré ?</p>
                <p class="text-xs" style="color:var(--text-secondary)">Recherchez pour pré-remplir automatiquement</p>
              </div>
              @if (selectedExisting()) {
                <button type="button" (click)="clearExisting()"
                        class="text-xs px-2.5 py-1 rounded-lg border hover:opacity-70 transition-opacity"
                        style="border-color:var(--border-color);color:var(--text-secondary)">
                  Effacer
                </button>
              }
            </div>
            <div class="p-4">
              <div class="relative">
                <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
                <input type="text" [(ngModel)]="searchQuery" [ngModelOptions]="{standalone:true}"
                       placeholder="Nom, prénom ou matricule…"
                       class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                       style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
              </div>
              @if (searchResults().length > 0 && searchQuery.length > 1) {
                <div class="mt-2 rounded-xl overflow-hidden" style="border:1px solid var(--border-color)">
                  @for (s of searchResults(); track s.publicId) {
                    <button type="button" (click)="selectExisting(s)"
                            class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:opacity-80 transition-opacity border-b last:border-b-0"
                            style="border-color:var(--border-color);background:var(--surface-1)">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                           [style.background]="s.genre === 'F' ? '#ec4899' : '#6366f1'">
                        {{ s.firstName[0] }}{{ s.lastName[0] }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ s.firstName }} {{ s.lastName }}</p>
                        <p class="text-xs" style="color:var(--text-secondary)">{{ s.matricule }} · {{ s.classeLibelle }}</p>
                      </div>
                      <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                            style="background:rgba(22,163,74,0.1);color:#16a34a">Réinscrire</span>
                    </button>
                  }
                </div>
              }
              @if (selectedExisting()) {
                <div class="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl"
                     style="background:rgba(8,145,178,0.06);border:1px solid rgba(8,145,178,0.2)">
                  <mat-icon style="color:#0891b2;font-size:18px;height:18px;width:18px;flex-shrink:0">check_circle</mat-icon>
                  <span class="text-sm" style="color:var(--text-primary)">
                    <strong>{{ selectedExisting()!.firstName }} {{ selectedExisting()!.lastName }}</strong>
                    — formulaire pré-rempli
                  </span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Identité card -->
        <div class="sms-card overflow-hidden mb-5">
          <div class="px-6 py-4 border-b flex items-center gap-3"
               style="border-color:var(--border-color);background:var(--surface-2)">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style="background:rgba(99,102,241,0.12)">
              <mat-icon style="color:#6366f1;font-size:20px;height:20px;width:20px">badge</mat-icon>
            </div>
            <div>
              <h3 class="font-semibold" style="color:var(--text-primary)">Identité civile</h3>
              <p class="text-xs" style="color:var(--text-secondary)">Informations personnelles de l'élève</p>
            </div>
          </div>
          <div class="p-6">

            <!-- Avatar + Photo upload -->
            <div class="flex items-center gap-5 mb-6 p-4 rounded-2xl" style="background:var(--surface-2);border:1px dashed var(--border-color)">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                   style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                {{ photoInitials() }}
              </div>
              <div>
                <p class="text-sm font-semibold" style="color:var(--text-primary)">Photo de l'élève</p>
                <p class="text-xs mt-0.5" style="color:var(--text-secondary)">JPG, PNG — max 2 MB</p>
                <button type="button" (click)="uploadPhoto()"
                        class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-70 transition-opacity"
                        style="border:1px solid var(--border-color);color:var(--text-secondary);background:var(--surface-1)">
                  <mat-icon style="font-size:14px;height:14px;width:14px">upload</mat-icon>
                  Choisir une photo
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <!-- Prénom -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">
                  Prénom <span style="color:#ef4444">*</span>
                </label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">person</mat-icon>
                  <input formControlName="firstName" type="text" placeholder="Ex : Awa"
                         class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                         [style.border-color]="isInvalid('firstName') ? '#ef4444' : 'var(--border-color)'"
                         style="background:var(--surface-2);color:var(--text-primary)">
                </div>
                @if (isInvalid('firstName')) {
                  <p class="flex items-center gap-1 mt-1.5 text-xs" style="color:#ef4444">
                    <mat-icon style="font-size:12px;height:12px;width:12px">error_outline</mat-icon>Prénom obligatoire
                  </p>
                }
              </div>

              <!-- Nom -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">
                  Nom de famille <span style="color:#ef4444">*</span>
                </label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">person_outline</mat-icon>
                  <input formControlName="lastName" type="text" placeholder="Ex : Diallo"
                         class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                         [style.border-color]="isInvalid('lastName') ? '#ef4444' : 'var(--border-color)'"
                         style="background:var(--surface-2);color:var(--text-primary)">
                </div>
                @if (isInvalid('lastName')) {
                  <p class="flex items-center gap-1 mt-1.5 text-xs" style="color:#ef4444">
                    <mat-icon style="font-size:12px;height:12px;width:12px">error_outline</mat-icon>Nom obligatoire
                  </p>
                }
              </div>

              <!-- Date naissance -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">
                  Date de naissance <span style="color:#ef4444">*</span>
                </label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">calendar_today</mat-icon>
                  <input formControlName="dateNaissance" type="date"
                         class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                         [style.border-color]="isInvalid('dateNaissance') ? '#ef4444' : 'var(--border-color)'"
                         style="background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>

              <!-- Genre -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">
                  Genre <span style="color:#ef4444">*</span>
                </label>
                <div class="flex gap-3">
                  @for (g of genres; track g.value) {
                    <label class="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                           [style.border]="form.get('genre')?.value === g.value ? '2px solid var(--accent)' : '1px solid var(--border-color)'"
                           [style.background]="form.get('genre')?.value === g.value ? 'var(--accent-light)' : 'var(--surface-2)'">
                      <input type="radio" formControlName="genre" [value]="g.value" class="sr-only">
                      <mat-icon style="font-size:18px;height:18px;width:18px"
                                [style.color]="form.get('genre')?.value === g.value ? 'var(--accent)' : 'var(--text-muted)'">{{ g.icon }}</mat-icon>
                      <span class="text-sm font-semibold"
                            [style.color]="form.get('genre')?.value === g.value ? 'var(--accent)' : 'var(--text-primary)'">{{ g.label }}</span>
                    </label>
                  }
                </div>
              </div>

              <!-- Lieu naissance -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Lieu de naissance</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">location_city</mat-icon>
                  <input formControlName="lieuNaissance" type="text" placeholder="Ex : Bamako"
                         class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>

              <!-- Nationalité -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Nationalité</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">flag</mat-icon>
                  <select formControlName="nationalite"
                          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm"
                          style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                    @for (n of nationalites; track n) { <option [value]="n">{{ n }}</option> }
                  </select>
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Email</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">email</mat-icon>
                  <input formControlName="email" type="email" placeholder="eleve@email.com"
                         class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                         [style.border-color]="isInvalid('email') ? '#ef4444' : 'var(--border-color)'"
                         style="background:var(--surface-2);color:var(--text-primary)">
                </div>
                @if (isInvalid('email')) {
                  <p class="mt-1.5 text-xs" style="color:#ef4444">Format email invalide</p>
                }
              </div>

              <!-- Téléphone -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Téléphone</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">phone</mat-icon>
                  <input formControlName="phone" type="tel" placeholder="+225 07 XX XX XX XX"
                         class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>

              <!-- Adresse -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Adresse de résidence</label>
                <div class="flex gap-3">
                  <div class="relative flex-1">
                    <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                              style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">home</mat-icon>
                    <input formControlName="adresse" type="text" placeholder="Quartier, rue…"
                           class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                           style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                  </div>
                  <input formControlName="ville" type="text" placeholder="Ville" class="w-28 px-3 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ══════════════════════════════════════════════════════════
           ÉTAPE 1 — SCOLARITÉ
      ══════════════════════════════════════════════════════════ -->
      @if (currentStep() === 1) {

        <!-- Alertes métier -->
        @if (isDuplicate()) {
          <div class="flex items-start gap-3 mb-4 p-4 rounded-xl"
               style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.25)">
            <mat-icon style="color:#dc2626;flex-shrink:0;font-size:18px;height:18px;width:18px;margin-top:1px">warning</mat-icon>
            <div>
              <p class="text-sm font-semibold" style="color:#dc2626">Doublon détecté</p>
              <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
                Cet élève est déjà inscrit pour l'année {{ form.value.anneeAcademique }}.
              </p>
            </div>
          </div>
        }
        @if (isClasseFull()) {
          <div class="flex items-start gap-3 mb-4 p-4 rounded-xl"
               style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25)">
            <mat-icon style="color:#d97706;flex-shrink:0;font-size:18px;height:18px;width:18px;margin-top:1px">info</mat-icon>
            <p class="text-sm" style="color:#d97706">Classe proche de sa capacité maximale.</p>
          </div>
        }

        <!-- Affectation académique -->
        <div class="sms-card overflow-hidden mb-5">
          <div class="px-6 py-4 border-b flex items-center gap-3"
               style="border-color:var(--border-color);background:var(--surface-2)">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style="background:rgba(245,158,11,0.12)">
              <mat-icon style="color:#f59e0b;font-size:20px;height:20px;width:20px">school</mat-icon>
            </div>
            <div>
              <h3 class="font-semibold" style="color:var(--text-primary)">Affectation académique</h3>
              <p class="text-xs" style="color:var(--text-secondary)">Année, classe, régime et type d'inscription</p>
            </div>
          </div>
          <div class="p-6">

            <!-- Année académique + Type inscription -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Année académique</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">date_range</mat-icon>
                  <select formControlName="anneeAcademique"
                          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm"
                          style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                    <option value="2025-2026">2025 – 2026 (en cours)</option>
                    <option value="2024-2025">2024 – 2025</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Type d'inscription</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">assignment</mat-icon>
                  <select formControlName="typeInscription"
                          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm"
                          style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                    <option value="NOUVELLE">Nouvelle inscription</option>
                    <option value="RENOUVELLEMENT">Renouvellement</option>
                    <option value="TRANSFERT">Transfert entrant</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Sélection de classe — Cards visuelles -->
            <div class="mb-6">
              <label class="block text-xs font-semibold uppercase tracking-wide mb-3" style="color:var(--text-secondary)">
                Classe <span style="color:#ef4444">*</span>
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                @for (c of classes; track c.id) {
                  <button type="button" (click)="setClasseId(c.id)"
                          class="p-4 rounded-xl text-left transition-all hover:opacity-90"
                          [style.border]="form.get('classePublicId')?.value === c.id ? '2px solid var(--accent)' : '1px solid var(--border-color)'"
                          [style.background]="form.get('classePublicId')?.value === c.id ? 'var(--accent-light)' : 'var(--surface-2)'">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <p class="text-sm font-bold leading-tight"
                         [style.color]="form.get('classePublicId')?.value === c.id ? 'var(--accent)' : 'var(--text-primary)'">
                        {{ c.libelle }}
                      </p>
                      @if (form.get('classePublicId')?.value === c.id) {
                        <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--accent);flex-shrink:0">check_circle</mat-icon>
                      }
                    </div>
                    <p class="text-xs" style="color:var(--text-secondary)">{{ c.niveau }} · {{ c.filiere }}</p>
                    <div class="flex items-center gap-1 mt-2">
                      <mat-icon style="font-size:12px;height:12px;width:12px;color:var(--text-muted)">people</mat-icon>
                      <span class="text-xs" style="color:var(--text-muted)">{{ c.capacite }} places</span>
                    </div>
                  </button>
                }
              </div>
              @if (isInvalid('classePublicId')) {
                <p class="flex items-center gap-1 mt-2 text-xs" style="color:#ef4444">
                  <mat-icon style="font-size:12px;height:12px;width:12px">error_outline</mat-icon>
                  Veuillez sélectionner une classe
                </p>
              }
            </div>

            <!-- Régime — Visual cards -->
            <div class="mb-6">
              <label class="block text-xs font-semibold uppercase tracking-wide mb-3" style="color:var(--text-secondary)">
                Régime <span style="color:#ef4444">*</span>
              </label>
              <div class="grid grid-cols-3 gap-3">
                @for (r of regimes; track r.value) {
                  <button type="button"
                          (click)="form.get('regime')?.setValue(r.value)"
                          class="p-3 rounded-xl text-center transition-all hover:opacity-90"
                          [style.border]="form.get('regime')?.value === r.value ? '2px solid var(--accent)' : '1px solid var(--border-color)'"
                          [style.background]="form.get('regime')?.value === r.value ? 'var(--accent-light)' : 'var(--surface-2)'">
                    <mat-icon style="font-size:22px;height:22px;width:22px;display:block;margin:0 auto 4px"
                              [style.color]="form.get('regime')?.value === r.value ? 'var(--accent)' : 'var(--text-muted)'">
                      {{ r.icon }}
                    </mat-icon>
                    <p class="text-xs font-semibold"
                       [style.color]="form.get('regime')?.value === r.value ? 'var(--accent)' : 'var(--text-primary)'">
                      {{ r.label }}
                    </p>
                    <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ r.desc }}</p>
                  </button>
                }
              </div>
            </div>

            <!-- Groupe + Statut + Établissement précédent -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Groupe</label>
                <select formControlName="groupe" class="w-full px-4 py-2.5 rounded-xl border text-sm"
                        style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                  <option value="">— Optionnel —</option>
                  @for (g of groupes; track g) { <option [value]="g">{{ g }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Statut initial</label>
                <select formControlName="statut" class="w-full px-4 py-2.5 rounded-xl border text-sm"
                        style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                  <option value="PRE_INSCRIT">Pré-inscrit</option>
                  <option value="INSCRIT">Inscrit</option>
                  <option value="INSCRIPTION_VALIDEE">Inscription validée</option>
                  <option value="ACTIF">Actif</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Établissement précédent</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">account_balance</mat-icon>
                  <input formControlName="etablissementPrecedent" type="text" placeholder="Nom de l'établissement précédent (optionnel)"
                         class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Observations</label>
                <textarea formControlName="observations" rows="2" placeholder="Besoins particuliers, informations complémentaires…"
                          class="w-full px-4 py-2.5 rounded-xl border text-sm resize-none outline-none"
                          style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </textarea>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ══════════════════════════════════════════════════════════
           ÉTAPE 2 — FAMILLE & CONTACTS
      ══════════════════════════════════════════════════════════ -->
      @if (currentStep() === 2) {

        <!-- Père + Mère côte à côte -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          <!-- Père -->
          <div class="sms-card overflow-hidden">
            <div class="px-5 py-3.5 border-b flex items-center gap-3"
                 style="border-color:var(--border-color);background:rgba(59,130,246,0.04)">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                   style="background:rgba(59,130,246,0.12)">
                <mat-icon style="color:#2563eb;font-size:18px;height:18px;width:18px">man</mat-icon>
              </div>
              <h3 class="font-semibold text-sm" style="color:var(--text-primary)">Père</h3>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Nom complet</label>
                <input formControlName="pereName" type="text" placeholder="Ex : Diallo Ibrahim"
                       class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                       style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Téléphone</label>
                  <div class="relative">
                    <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                              style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">phone</mat-icon>
                    <input formControlName="pereTel" type="tel" placeholder="+225…"
                           class="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                           style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Profession</label>
                  <input formControlName="pereProfession" type="text" placeholder="Ex : Médecin"
                         class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Email</label>
                <div class="relative">
                  <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">email</mat-icon>
                  <input formControlName="pereEmail" type="email" placeholder="pere@email.com"
                         class="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>
            </div>
          </div>

          <!-- Mère -->
          <div class="sms-card overflow-hidden">
            <div class="px-5 py-3.5 border-b flex items-center gap-3"
                 style="border-color:var(--border-color);background:rgba(236,72,153,0.04)">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                   style="background:rgba(236,72,153,0.12)">
                <mat-icon style="color:#ec4899;font-size:18px;height:18px;width:18px">woman</mat-icon>
              </div>
              <h3 class="font-semibold text-sm" style="color:var(--text-primary)">Mère</h3>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Nom complet</label>
                <input formControlName="mereName" type="text" placeholder="Ex : Koné Mariam"
                       class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                       style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Téléphone</label>
                  <div class="relative">
                    <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                              style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">phone</mat-icon>
                    <input formControlName="mereTel" type="tel" placeholder="+225…"
                           class="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                           style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Profession</label>
                  <input formControlName="mereProfession" type="text" placeholder="Ex : Enseignante"
                         class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Email</label>
                <div class="relative">
                  <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">email</mat-icon>
                  <input formControlName="mereEmail" type="email" placeholder="mere@email.com"
                         class="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tuteur légal + Contact urgence -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

          <!-- Tuteur -->
          <div class="sms-card overflow-hidden">
            <div class="px-5 py-3.5 border-b flex items-center gap-3"
                 style="border-color:var(--border-color);background:rgba(139,92,246,0.04)">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                   style="background:rgba(139,92,246,0.12)">
                <mat-icon style="color:#8b5cf6;font-size:18px;height:18px;width:18px">supervisor_account</mat-icon>
              </div>
              <div>
                <h3 class="font-semibold text-sm" style="color:var(--text-primary)">Tuteur légal</h3>
                <p class="text-xs" style="color:var(--text-muted)">Contact principal</p>
              </div>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">
                  Nom complet <span style="color:#ef4444">*</span>
                </label>
                <input formControlName="tuteurNom" type="text" placeholder="Nom complet"
                       class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                       [style.border-color]="isInvalid('tuteurNom') ? '#ef4444' : 'var(--border-color)'"
                       style="background:var(--surface-2);color:var(--text-primary)">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">
                    Téléphone <span style="color:#ef4444">*</span>
                  </label>
                  <div class="relative">
                    <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                              style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">phone</mat-icon>
                    <input formControlName="tuteurPhone" type="tel" placeholder="+225…"
                           class="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                           [style.border-color]="isInvalid('tuteurPhone') ? '#ef4444' : 'var(--border-color)'"
                           style="background:var(--surface-2);color:var(--text-primary)">
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Lien</label>
                  <select formControlName="tuteurRelation" class="w-full px-3 py-2.5 rounded-xl border text-sm"
                          style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                    <option value="PERE">Père</option>
                    <option value="MERE">Mère</option>
                    <option value="TUTEUR">Tuteur</option>
                    <option value="GRAND_PARENT">Grand-parent</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Email tuteur</label>
                <div class="relative">
                  <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">email</mat-icon>
                  <input formControlName="tuteurEmail" type="email" placeholder="parent@email.com"
                         class="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>
            </div>
          </div>

          <!-- Contact urgence -->
          <div class="sms-card overflow-hidden">
            <div class="px-5 py-3.5 border-b flex items-center gap-3"
                 style="border-color:var(--border-color);background:rgba(239,68,68,0.04)">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                   style="background:rgba(239,68,68,0.12)">
                <mat-icon style="color:#dc2626;font-size:18px;height:18px;width:18px">emergency</mat-icon>
              </div>
              <div>
                <h3 class="font-semibold text-sm" style="color:var(--text-primary)">Contact d'urgence</h3>
                <p class="text-xs" style="color:var(--text-muted)">En cas d'urgence médicale</p>
              </div>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Nom et prénom</label>
                <div class="relative">
                  <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">person</mat-icon>
                  <input formControlName="urgenceNom" type="text" placeholder="Ex : Koné Jean"
                         class="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Téléphone d'urgence</label>
                <div class="relative">
                  <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style="font-size:14px;height:14px;width:14px;color:#dc2626">phone</mat-icon>
                  <input formControlName="urgenceTel" type="tel" placeholder="+225 07 XX XX XX"
                         class="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              </div>
              <div class="flex items-start gap-3 p-3 rounded-xl" style="background:rgba(239,68,68,0.04);border:1px solid rgba(239,68,68,0.15)">
                <mat-icon style="color:#dc2626;font-size:16px;height:16px;width:16px;flex-shrink:0;margin-top:1px">info_outline</mat-icon>
                <p class="text-xs" style="color:var(--text-secondary)">
                  Ce numéro sera contacté en priorité en cas d'urgence médicale ou d'incident.
                </p>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ══════════════════════════════════════════════════════════
           ÉTAPE 3 — FINANCE & DOCUMENTS
      ══════════════════════════════════════════════════════════ -->
      @if (currentStep() === 3) {

        <!-- Frais de scolarité -->
        <div class="sms-card overflow-hidden mb-5">
          <div class="px-6 py-4 border-b flex items-center gap-3"
               style="border-color:var(--border-color);background:var(--surface-2)">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style="background:rgba(22,163,74,0.12)">
              <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">payments</mat-icon>
            </div>
            <div>
              <h3 class="font-semibold" style="color:var(--text-primary)">Frais de scolarité</h3>
              <p class="text-xs" style="color:var(--text-secondary)">Calcul automatique selon la classe sélectionnée</p>
            </div>
          </div>
          <div class="p-6">

            <!-- Breakdown des frais -->
            <div class="grid grid-cols-2 gap-4 mb-5">
              <div class="p-4 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
                <div class="flex items-center gap-2 mb-2">
                  <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">receipt</mat-icon>
                  <p class="text-xs font-semibold uppercase tracking-wide" style="color:var(--text-muted)">Inscription</p>
                </div>
                <p class="text-xl font-black" style="color:var(--text-primary)">{{ formatXOF(fraisInscription) }}</p>
                <p class="text-xs mt-0.5" style="color:var(--text-muted)">Frais fixes annuels</p>
              </div>
              <div class="p-4 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
                <div class="flex items-center gap-2 mb-2">
                  <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">school</mat-icon>
                  <p class="text-xs font-semibold uppercase tracking-wide" style="color:var(--text-muted)">Scolarité</p>
                </div>
                <p class="text-xl font-black" style="color:var(--text-primary)">{{ formatXOF(fraisScolarite()) }}</p>
                <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ selectedClasseInfo()?.niveau ?? '— Choisir une classe —' }}</p>
              </div>
            </div>

            <!-- Bourse toggle -->
            <div class="mb-5">
              <div class="flex items-center justify-between p-4 rounded-xl cursor-pointer"
                   style="background:var(--surface-2);border:1px solid var(--border-color)">
                <div class="flex items-center gap-3">
                  <mat-icon style="font-size:20px;height:20px;width:20px;color:#16a34a">card_giftcard</mat-icon>
                  <div>
                    <p class="text-sm font-semibold" style="color:var(--text-primary)">Bourse / Aide financière</p>
                    <p class="text-xs" style="color:var(--text-secondary)">Réduction ou aide accordée à l'élève</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" formControlName="bourseActif" class="sr-only peer">
                  <div class="w-10 h-5 rounded-full peer-checked:after:translate-x-5 after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                       [style.background]="form.value.bourseActif ? '#16a34a' : 'var(--border-color)'"></div>
                </label>
              </div>

              @if (form.value.bourseActif) {
                <div class="mt-3 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4"
                     style="background:rgba(22,163,74,0.04);border:1px solid rgba(22,163,74,0.2)">
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Type de bourse</label>
                    <select formControlName="typeBourse" class="w-full px-3 py-2 rounded-xl border text-sm"
                            style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                      @for (t of typeBourses; track t.value) { <option [value]="t.value">{{ t.label }}</option> }
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Montant (XOF)</label>
                    <input formControlName="montantBourse" type="number" min="0" placeholder="100 000"
                           class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                           style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color:var(--text-secondary)">Réduction (%)</label>
                    <input formControlName="reduction" type="number" min="0" max="100" placeholder="20"
                           class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                           style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                  </div>
                </div>
              }
            </div>

            <!-- Total -->
            <div class="flex items-center justify-between p-5 rounded-2xl"
                 style="background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08));border:1.5px solid var(--accent)">
              <div>
                <p class="text-sm font-semibold" style="color:var(--text-secondary)">Total à régler</p>
                @if (form.value.bourseActif && (form.value.montantBourse || 0) > 0) {
                  <p class="text-xs mt-0.5" style="color:#16a34a">
                    Après bourse de {{ formatXOF(+(form.value.montantBourse ?? 0)) }}
                  </p>
                }
              </div>
              <p class="text-3xl font-black" style="color:var(--accent)">{{ formatXOF(totalFrais()) }}</p>
            </div>
          </div>
        </div>

        <!-- Documents -->
        <div class="sms-card overflow-hidden">
          <div class="px-6 py-4 border-b flex items-center justify-between"
               style="border-color:var(--border-color);background:var(--surface-2)">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style="background:rgba(99,102,241,0.12)">
                <mat-icon style="color:#6366f1;font-size:20px;height:20px;width:20px">folder_open</mat-icon>
              </div>
              <div>
                <h3 class="font-semibold" style="color:var(--text-primary)">Documents du dossier</h3>
                <p class="text-xs" style="color:var(--text-secondary)">{{ docsFournis() }}/{{ documents.length }} documents fournis</p>
              </div>
            </div>
            <!-- Progress -->
            <div class="flex items-center gap-2">
              <div class="w-20 rounded-full h-1.5" style="background:var(--border-color)">
                <div class="h-1.5 rounded-full transition-all"
                     style="background:var(--accent)"
                     [style.width]="(docsFournis() / documents.length * 100) + '%'"></div>
              </div>
              <span class="text-xs font-bold" style="color:var(--accent)">
                {{ ((docsFournis() / documents.length) * 100).toFixed(0) }}%
              </span>
            </div>
          </div>
          <div class="divide-y" style="border-color:var(--border-color)">
            @for (doc of documents; track doc.label) {
              <div class="px-5 py-3.5 flex items-center gap-4">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                     [style.background]="doc.provided ? 'rgba(16,185,129,0.1)' : doc.required ? 'rgba(245,158,11,0.1)' : 'var(--surface-2)'">
                  <mat-icon [style.color]="doc.provided ? '#10b981' : doc.required ? '#f59e0b' : 'var(--text-muted)'"
                            style="font-size:18px;height:18px;width:18px">
                    {{ doc.provided ? 'check_circle' : doc.required ? 'pending' : 'radio_button_unchecked' }}
                  </mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ doc.label }}</p>
                  <p class="text-xs mt-0.5"
                     [style.color]="doc.required ? '#f59e0b' : 'var(--text-muted)'">
                    {{ doc.required ? '● Obligatoire' : '○ Optionnel' }}
                  </p>
                </div>
                <button type="button" (click)="toggleDoc(doc)"
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 flex-shrink-0"
                        [style.background]="doc.provided ? 'rgba(16,185,129,0.12)' : 'var(--surface-2)'"
                        [style.color]="doc.provided ? '#10b981' : 'var(--text-secondary)'"
                        [style.border]="'1px solid ' + (doc.provided ? 'rgba(16,185,129,0.3)' : 'var(--border-color)')">
                  <mat-icon style="font-size:13px;height:13px;width:13px">{{ doc.provided ? 'check' : 'upload' }}</mat-icon>
                  {{ doc.provided ? 'Fourni' : 'Marquer fourni' }}
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- ══════════════════════════════════════════════════════════
           ÉTAPE 4 — RÉCAPITULATIF & VALIDATION
      ══════════════════════════════════════════════════════════ -->
      @if (currentStep() === 4) {

        <!-- Alertes -->
        @if (isDuplicate()) {
          <div class="flex items-start gap-3 mb-4 p-4 rounded-xl"
               style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.3)">
            <mat-icon style="color:#dc2626;flex-shrink:0">error</mat-icon>
            <p class="text-sm" style="color:#dc2626">
              <strong>Attention :</strong> Cet élève est déjà inscrit pour {{ form.value.anneeAcademique }}.
            </p>
          </div>
        }

        <!-- Profil récap -->
        <div class="sms-card overflow-hidden mb-5">
          <!-- Header gradient -->
          <div class="px-6 py-5 flex items-center gap-5"
               style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                 style="background:rgba(255,255,255,0.2)">{{ photoInitials() }}</div>
            <div class="text-white">
              <h2 class="text-xl font-bold">{{ form.value.firstName }} {{ form.value.lastName }}</h2>
              <p class="text-sm opacity-85">{{ selectedClasseLabel() }} · {{ form.value.anneeAcademique }}</p>
              <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style="background:rgba(255,255,255,0.2);color:#fff">{{ form.value.statut }}</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style="background:rgba(255,255,255,0.15);color:#fff">{{ form.value.typeInscription }}</span>
              </div>
            </div>
            @if (!isEditMode()) {
              <div class="ml-auto text-right">
                <p class="text-xs opacity-70 text-white">Matricule</p>
                <p class="text-sm font-mono font-bold text-white">{{ generatedMatricule() }}</p>
              </div>
            }
          </div>

          <!-- Sections résumé -->
          <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x"
               style="border-color:var(--border-color)">
            <div class="p-5">
              <h4 class="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2"
                  style="color:var(--text-muted)">
                <mat-icon style="font-size:14px;height:14px;width:14px;color:#6366f1">person</mat-icon>Identité
              </h4>
              <div class="space-y-3">
                @for (f of summaryIdentite(); track f.label) {
                  @if (f.value) {
                    <div>
                      <p class="text-xs" style="color:var(--text-muted)">{{ f.label }}</p>
                      <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ f.value }}</p>
                    </div>
                  }
                }
              </div>
            </div>
            <div class="p-5">
              <h4 class="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2"
                  style="color:var(--text-muted)">
                <mat-icon style="font-size:14px;height:14px;width:14px;color:#f59e0b">school</mat-icon>Scolarité
              </h4>
              <div class="space-y-3">
                @for (f of summaryScolarite(); track f.label) {
                  @if (f.value) {
                    <div>
                      <p class="text-xs" style="color:var(--text-muted)">{{ f.label }}</p>
                      <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ f.value }}</p>
                    </div>
                  }
                }
              </div>
            </div>
            <div class="p-5">
              <h4 class="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2"
                  style="color:var(--text-muted)">
                <mat-icon style="font-size:14px;height:14px;width:14px;color:#3b82f6">family_restroom</mat-icon>Famille
              </h4>
              <div class="space-y-3">
                @for (f of summaryFamille(); track f.label) {
                  @if (f.value) {
                    <div>
                      <p class="text-xs" style="color:var(--text-muted)">{{ f.label }}</p>
                      <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ f.value }}</p>
                    </div>
                  }
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Finance + Documents côte à côte -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          <!-- Finance summary -->
          <div class="sms-card p-5">
            <h4 class="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style="color:var(--text-muted)">
              <mat-icon style="font-size:14px;height:14px;width:14px;color:#16a34a">payments</mat-icon>Finance
            </h4>
            <div class="space-y-2 text-sm mb-4">
              <div class="flex justify-between">
                <span style="color:var(--text-secondary)">Frais d'inscription</span>
                <span class="font-semibold" style="color:var(--text-primary)">{{ formatXOF(fraisInscription) }}</span>
              </div>
              <div class="flex justify-between">
                <span style="color:var(--text-secondary)">Frais de scolarité</span>
                <span class="font-semibold" style="color:var(--text-primary)">{{ formatXOF(fraisScolarite()) }}</span>
              </div>
              @if (form.value.bourseActif && (form.value.montantBourse || 0) > 0) {
                <div class="flex justify-between">
                  <span style="color:#16a34a">Bourse accordée</span>
                  <span class="font-semibold" style="color:#16a34a">- {{ formatXOF(+(form.value.montantBourse ?? 0)) }}</span>
                </div>
              }
              <div class="pt-2 mt-2 flex justify-between border-t" style="border-color:var(--border-color)">
                <span class="font-semibold" style="color:var(--text-primary)">Total</span>
                <span class="text-lg font-black" style="color:var(--accent)">{{ formatXOF(totalFrais()) }}</span>
              </div>
            </div>
          </div>

          <!-- Documents status -->
          <div class="sms-card p-5">
            <h4 class="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style="color:var(--text-muted)">
              <mat-icon style="font-size:14px;height:14px;width:14px;color:#6366f1">folder_open</mat-icon>
              Documents ({{ docsFournis() }}/{{ documents.length }})
            </h4>
            <div class="flex flex-wrap gap-2">
              @for (doc of documents; track doc.label) {
                <span class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                      [style.background]="doc.provided ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)'"
                      [style.color]="doc.provided ? '#10b981' : '#ef4444'">
                  <mat-icon style="font-size:12px;height:12px;width:12px">{{ doc.provided ? 'check_circle' : 'cancel' }}</mat-icon>
                  {{ doc.label }}
                </span>
              }
            </div>
            @if (hasRequiredDocsMissing()) {
              <div class="mt-3 flex items-start gap-2 p-3 rounded-xl"
                   style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25)">
                <mat-icon style="color:#d97706;font-size:15px;height:15px;width:15px;flex-shrink:0;margin-top:1px">warning</mat-icon>
                <p class="text-xs" style="color:var(--text-secondary)">
                  Certains documents obligatoires sont manquants. Ils devront être remis ultérieurement.
                </p>
              </div>
            }
          </div>
        </div>
      }

      <!-- ══════════════════════════════════════════════════════════
           NAVIGATION BAR (sticky bottom)
      ══════════════════════════════════════════════════════════ -->
      <div class="sticky bottom-0 z-20 mt-6">
        <div class="sms-card border-t-2 rounded-t-none px-6 py-4 flex items-center justify-between gap-4"
             style="border-top-color:var(--border-color)">

          <!-- Précédent -->
          <button type="button" (click)="prevStep()"
                  [disabled]="currentStep() === 0"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
                  style="border:1px solid var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
            <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
            Précédent
          </button>

          <!-- Dots indicator -->
          <div class="flex items-center gap-2">
            @for (step of steps; track step.index) {
              <button type="button" (click)="goToStep(step.index)"
                      class="rounded-full transition-all"
                      [style.width]="currentStep() === step.index ? '24px' : '8px'"
                      [style.height]="'8px'"
                      [style.background]="currentStep() === step.index ? 'var(--accent)' : stepIsComplete(step.index) ? '#10b981' : 'var(--border-color)'">
              </button>
            }
          </div>

          <!-- Actions droite -->
          <div class="flex items-center gap-3">
            <button type="button" (click)="saveDraft()"
                    class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium hover:opacity-70 transition-opacity"
                    style="border:1px solid var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
              <mat-icon style="font-size:15px;height:15px;width:15px">save_alt</mat-icon>
              Brouillon
            </button>

            @if (currentStep() === 4) {
              <button type="button" (click)="printPreview()"
                      class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium hover:opacity-70 transition-opacity"
                      style="border:1px solid var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
                <mat-icon style="font-size:15px;height:15px;width:15px">print</mat-icon>
                Prévisualiser
              </button>
              <button type="button" (click)="submitAndContinue()" [disabled]="store.saving()"
                      class="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
                      style="border:1px solid var(--accent);color:var(--accent);background:var(--accent-light)">
                <mat-icon style="font-size:15px;height:15px;width:15px">open_in_new</mat-icon>
                Inscrire et voir la fiche
              </button>
              <button type="submit" [disabled]="store.saving()"
                      class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style="background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 2px 8px rgba(16,185,129,0.3)">
                @if (store.saving()) {
                  <mat-icon class="animate-spin" style="font-size:18px;height:18px;width:18px">refresh</mat-icon>
                } @else {
                  <mat-icon style="font-size:18px;height:18px;width:18px">{{ isEditMode() ? 'save' : 'how_to_reg' }}</mat-icon>
                }
                {{ store.saving() ? 'Enregistrement…' : (isEditMode() ? 'Enregistrer' : "Confirmer l'inscription") }}
              </button>
            } @else {
              <button type="button" (click)="nextStep()"
                      class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                      style="background:var(--accent);box-shadow:0 2px 8px rgba(99,102,241,0.3)">
                Suivant
                <mat-icon style="font-size:18px;height:18px;width:18px">arrow_forward</mat-icon>
              </button>
            }
          </div>
        </div>
      </div>

      </form>

    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       ÉCRAN DE SUCCÈS
  ══════════════════════════════════════════════════════════ -->
  @if (submitted()) {
    <div class="fixed inset-0 flex items-center justify-center z-50"
         style="background:rgba(0,0,0,0.5);backdrop-filter:blur(6px)">
      <div class="sms-card p-8 max-w-md w-full mx-4 text-center overflow-hidden">

        <!-- Confetti band -->
        <div class="h-1 mb-6 rounded-full"
             style="background:linear-gradient(90deg,#6366f1,#10b981,#f59e0b,#ec4899)"></div>

        <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
             style="background:rgba(16,185,129,0.12)">
          <mat-icon style="font-size:40px;height:40px;width:40px;color:#10b981">check_circle</mat-icon>
        </div>

        <h2 class="text-2xl font-black mb-2" style="color:var(--text-primary)">
          {{ isEditMode() ? 'Dossier mis à jour !' : 'Inscription réussie !' }}
        </h2>
        <p class="text-sm mb-1" style="color:var(--text-secondary)">
          <strong>{{ form.value.firstName }} {{ form.value.lastName }}</strong>
          {{ isEditMode() ? 'a été mis(e) à jour avec succès.' : 'est maintenant inscrit(e).' }}
        </p>
        @if (!isEditMode()) {
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl mt-2 mb-2"
               style="background:var(--surface-2);border:1px solid var(--border-color)">
            <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--accent)">confirmation_number</mat-icon>
            <span class="text-xs font-mono font-semibold" style="color:var(--accent)">{{ generatedMatricule() }}</span>
          </div>
          <p class="text-xs" style="color:var(--text-muted)">
            {{ selectedClasseLabel() }} · {{ form.value.anneeAcademique }}
          </p>
        }

        <div class="flex gap-3 mt-6">
          <button (click)="goToList()"
                  class="flex-1 py-2.5 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
                  style="border:1px solid var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
            Liste des élèves
          </button>
          @if (!isEditMode()) {
            <button (click)="goToDetail()"
                    class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style="background:var(--accent)">
              Voir la fiche
            </button>
          }
          <button (click)="resetForm()"
                  class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style="background:#10b981">
            Nouvel élève
          </button>
        </div>
      </div>
    </div>
  }

</div>
  `,
})
export class StudentFormComponent implements OnInit, OnDestroy {
  readonly store    = inject(StudentsStore);
  readonly refStore = inject(ReferenceStore);
  private  fb       = inject(FormBuilder);
  private  router   = inject(Router);
  private  route    = inject(ActivatedRoute);

  // ── Mode & navigation ─────────────────────────────────────────────────────
  readonly isEditMode    = signal(false);
  readonly editPublicId  = signal('');
  readonly currentStep   = signal(0);
  readonly draftSaved    = signal(false);
  readonly submitted     = signal(false);
  readonly lastCreatedId = signal('');

  // ── Existing student search ───────────────────────────────────────────────
  searchQuery        = '';
  readonly selectedExisting = signal<typeof MOCK_STUDENTS[0] | null>(null);

  readonly searchResults = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (q.length < 2) return [];
    return MOCK_STUDENTS.filter(s =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.matricule.toLowerCase().includes(q)
    ).slice(0, 5);
  });

  // ── Static data ───────────────────────────────────────────────────────────
  readonly steps        = STEPS;
  readonly groupes      = GROUPES;
  readonly regimes      = REGIMES;
  readonly typeBourses  = TYPE_BOURSES;

  /** Classes provenant du ReferenceStore (source unique) */
  readonly classes = computed(() =>
    this.refStore.classesOptions().map(c => ({
      id:       c.id,
      libelle:  c.libelle,
      niveau:   c.niveau,
      filiere:  c.filiere,
      capacite: c.capacite,
    }))
  );

  /** Frais d'inscription depuis le ReferenceStore */
  readonly fraisInscription = computed(() => this.refStore.fraisInscriptionMontant());

  readonly genres = [
    { value: 'M', label: 'Masculin', icon: 'male' },
    { value: 'F', label: 'Féminin',  icon: 'female' },
  ];

  readonly nationalites = [
    'Ivoirienne','Sénégalaise','Malienne','Burkinabè','Guinéenne',
    'Ghanéenne','Togolaise','Béninoise','Nigériane','Camerounaise','Autre',
  ];

  readonly documents = [
    { label: 'Extrait de naissance',       required: true,  provided: false },
    { label: "Photo d'identité (x4)",      required: true,  provided: false },
    { label: 'Certificat de scolarité',    required: true,  provided: false },
    { label: 'Carnets scolaires (x2)',     required: false, provided: false },
    { label: 'Attestation de transfert',   required: false, provided: false },
    { label: 'Résultats du brevet / Bac',  required: false, provided: false },
    { label: 'Acte de naissance certifié', required: false, provided: false },
  ];

  // ── Form ──────────────────────────────────────────────────────────────────
  readonly form = this.fb.group({
    firstName:              ['', Validators.required],
    lastName:               ['', Validators.required],
    dateNaissance:          ['', Validators.required],
    genre:                  ['M', Validators.required],
    lieuNaissance:          [''],
    nationalite:            ['Ivoirienne'],
    email:                  ['', Validators.email],
    phone:                  [''],
    adresse:                [''],
    ville:                  [''],
    anneeAcademique:        ['2025-2026'],
    classePublicId:         ['', Validators.required],
    groupe:                 [''],
    regime:                 ['EXTERNE', Validators.required],
    typeInscription:        ['NOUVELLE'],
    statut:                 ['PRE_INSCRIT'],
    etablissementPrecedent: [''],
    observations:           [''],
    pereName:               [''],
    pereTel:                [''],
    pereEmail:              [''],
    pereProfession:         [''],
    mereName:               [''],
    mereTel:                [''],
    mereEmail:              [''],
    mereProfession:         [''],
    tuteurNom:              ['', Validators.required],
    tuteurRelation:         ['PERE'],
    tuteurPhone:            ['', Validators.required],
    tuteurEmail:            [''],
    urgenceNom:             [''],
    urgenceTel:             [''],
    bourseActif:            [false],
    typeBourse:             ['MERITE'],
    montantBourse:          [0],
    reduction:              [0],
  });

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly photoInitials = computed(() => {
    const f = this.form.get('firstName')?.value ?? '';
    const l = this.form.get('lastName')?.value ?? '';
    return ((f[0] ?? '') + (l[0] ?? '')).toUpperCase() || 'NE';
  });

  readonly selectedClasseLabel = computed(() => {
    const id = this.form.get('classePublicId')?.value;
    return this.classes().find(c => c.id === id)?.libelle ?? '—';
  });

  readonly selectedClasseInfo = computed(() => {
    const id = this.form.get('classePublicId')?.value;
    return this.classes().find(c => c.id === id) ?? null;
  });

  readonly generatedMatricule = computed(() => {
    const niveau = this.selectedClasseInfo()?.niveau ?? '';
    const workspaceType = workspaceTypeFromNiveauLibelle(niveau);
    return generateMatricule('ML', workspaceType, new Date().getFullYear(), 'CSH', `preview-${MOCK_STUDENTS.length + 1}`);
  });

  readonly fraisScolarite = computed(() => {
    const niveau = this.selectedClasseInfo()?.niveau;
    return niveau ? this.refStore.getFraisScolariteByNiveauLibelle(niveau) : 0;
  });

  readonly totalFrais = computed(() => {
    const base   = this.fraisInscription() + this.fraisScolarite();
    const bourse = this.form.value.bourseActif ? +(this.form.value.montantBourse ?? 0) : 0;
    const pct    = this.form.value.bourseActif ? +(this.form.value.reduction ?? 0) : 0;
    const remise = Math.round(base * pct / 100);
    return Math.max(0, base - bourse - remise);
  });

  readonly isDuplicate = computed(() => {
    if (!this.form.value.firstName || !this.form.value.lastName) return false;
    const annee = this.form.value.anneeAcademique;
    const fn = this.form.value.firstName?.toLowerCase();
    const ln = this.form.value.lastName?.toLowerCase();
    return MOCK_STUDENTS.some(s =>
      s.firstName.toLowerCase() === fn &&
      s.lastName.toLowerCase() === ln &&
      (s as any).anneeAcademique === annee
    );
  });

  readonly isClasseFull = computed(() => {
    const cls = this.selectedClasseInfo();
    if (!cls) return false;
    const enrolled = MOCK_STUDENTS.filter(s => s.classePublicId === cls.id).length;
    return enrolled >= cls.capacite * 0.9;
  });

  /** Overall form completion percentage (based on key required fields) */
  readonly formCompletionPct = computed(() => {
    const checks = [
      !!this.form.get('firstName')?.value,
      !!this.form.get('lastName')?.value,
      !!this.form.get('dateNaissance')?.value,
      !!this.form.get('classePublicId')?.value,
      !!this.form.get('regime')?.value,
      !!this.form.get('tuteurNom')?.value,
      !!this.form.get('tuteurPhone')?.value,
      this.docsFournis() > 0,
    ];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  });

  // ── Step-level required fields ────────────────────────────────────────────
  private readonly stepFields: Record<number, string[]> = {
    0: ['firstName', 'lastName', 'dateNaissance', 'genre'],
    1: ['classePublicId', 'regime'],
    2: ['tuteurNom', 'tuteurPhone'],
    3: [],
    4: [],
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  private draftInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const mode     = this.route.snapshot.data['mode'] as string;
    const publicId = this.route.snapshot.paramMap.get('publicId');

    if (mode === 'edit' && publicId) {
      this.isEditMode.set(true);
      this.editPublicId.set(publicId);
      this.store.loadStudent(publicId);
      const tryFill = () => {
        const s = this.store.selectedStudent();
        if (s && s.publicId === publicId) {
          this.form.patchValue({
            firstName: s.firstName, lastName: s.lastName,
            dateNaissance: s.dateNaissance, genre: s.genre,
            lieuNaissance: s.lieuNaissance ?? '', nationalite: s.nationalite ?? 'Ivoirienne',
            email: s.email ?? '', phone: s.phone ?? '',
            adresse: s.adresse ?? '', ville: s.ville ?? '',
            pereName:  s.parents?.find(p => p.relation === 'PERE')?.nom ?? '',
            pereTel:   s.parents?.find(p => p.relation === 'PERE')?.telephone ?? '',
            mereName:  s.parents?.find(p => p.relation === 'MERE')?.nom ?? '',
            mereTel:   s.parents?.find(p => p.relation === 'MERE')?.telephone ?? '',
            tuteurNom: s.parents?.[0]?.nom ?? '',
            tuteurRelation: s.parents?.[0]?.relation ?? 'PERE',
            tuteurPhone: s.parents?.[0]?.telephone ?? '',
            tuteurEmail: s.parents?.[0]?.email ?? '',
            classePublicId: s.classePublicId ?? '', statut: s.statut,
            observations: s.observations ?? '',
          });
        } else {
          setTimeout(tryFill, 100);
        }
      };
      tryFill();
    }

    this.draftInterval = setInterval(() => {
      if (!this.submitted()) {
        this.draftSaved.set(true);
        setTimeout(() => this.draftSaved.set(false), 2000);
      }
    }, 30_000);
  }

  ngOnDestroy(): void {
    if (this.draftInterval) clearInterval(this.draftInterval);
  }

  // ── Search ────────────────────────────────────────────────────────────────
  selectExisting(s: typeof MOCK_STUDENTS[0]): void {
    this.selectedExisting.set(s);
    this.searchQuery = '';
    this.form.patchValue({
      firstName: s.firstName, lastName: s.lastName,
      dateNaissance: s.dateNaissance, genre: s.genre,
      email: s.email ?? '', phone: s.phone ?? '',
      nationalite: (s as any).nationalite ?? 'Ivoirienne',
      lieuNaissance: (s as any).lieuNaissance ?? '',
      adresse: (s as any).adresse ?? '', ville: (s as any).ville ?? '',
      pereName:    (s.parents as any)?.find((p: any) => p.relation === 'PERE')?.nom ?? '',
      pereTel:     (s.parents as any)?.find((p: any) => p.relation === 'PERE')?.telephone ?? '',
      mereName:    (s.parents as any)?.find((p: any) => p.relation === 'MERE')?.nom ?? '',
      mereTel:     (s.parents as any)?.find((p: any) => p.relation === 'MERE')?.telephone ?? '',
      tuteurNom:   (s.parents as any)?.[0]?.nom ?? '',
      tuteurPhone: (s.parents as any)?.[0]?.telephone ?? '',
      typeInscription: 'RENOUVELLEMENT',
    });
  }

  clearExisting(): void {
    this.selectedExisting.set(null);
    this.searchQuery = '';
  }

  // ── Classe & Régime selection ─────────────────────────────────────────────
  setClasseId(id: string): void {
    this.form.get('classePublicId')?.setValue(id);
    this.onClasseChange();
  }

  onClasseChange(): void {
    // Placeholder for future class-change side-effects
  }

  // ── Step helpers ──────────────────────────────────────────────────────────
  stepIsComplete(step: number): boolean {
    const fields = this.stepFields[step] ?? [];
    return fields.length > 0 && fields.every(f => this.form.get(f)?.valid);
  }

  goToStep(index: number): void {
    // Allow going back freely, or to completed steps
    if (index <= this.currentStep() || this.stepIsComplete(this.currentStep())) {
      this.currentStep.set(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ── Photo upload (simulate) ───────────────────────────────────────────────
  uploadPhoto(): void {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = 'image/*';
    input.click();
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  nextStep(): void {
    const fields = this.stepFields[this.currentStep()] ?? [];
    fields.forEach(f => this.form.get(f)?.markAsTouched());
    const valid = fields.every(f => this.form.get(f)?.valid);
    if (valid) {
      this.currentStep.update(s => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    this.currentStep.update(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveDraft(): void {
    this.draftSaved.set(true);
    setTimeout(() => this.draftSaved.set(false), 3000);
  }

  toggleDoc(doc: { provided: boolean }): void {
    doc.provided = !doc.provided;
  }

  // ── Summary helpers ───────────────────────────────────────────────────────
  summaryIdentite() {
    const v = this.form.value;
    return [
      { label: 'Prénom',            value: v.firstName ?? '' },
      { label: 'Nom',               value: v.lastName ?? '' },
      { label: 'Date de naissance', value: v.dateNaissance ? new Date(v.dateNaissance).toLocaleDateString('fr-FR') : '' },
      { label: 'Genre',             value: v.genre === 'M' ? 'Masculin' : 'Féminin' },
      { label: 'Nationalité',       value: v.nationalite ?? '' },
      { label: 'Email',             value: v.email ?? '' },
      { label: 'Téléphone',         value: v.phone ?? '' },
    ];
  }

  summaryScolarite() {
    return [
      { label: 'Classe',     value: this.selectedClasseLabel() },
      { label: 'Niveau',     value: this.selectedClasseInfo()?.niveau ?? '' },
      { label: 'Filière',    value: this.selectedClasseInfo()?.filiere ?? '' },
      { label: 'Régime',     value: REGIMES.find(r => r.value === this.form.value.regime)?.label ?? '' },
      { label: 'Année',      value: this.form.value.anneeAcademique ?? '' },
      { label: 'Inscription',value: this.form.value.typeInscription ?? '' },
    ];
  }

  summaryFamille() {
    const v = this.form.value;
    return [
      { label: 'Père',         value: v.pereName ?? '' },
      { label: 'Tél. père',    value: v.pereTel ?? '' },
      { label: 'Mère',         value: v.mereName ?? '' },
      { label: 'Tél. mère',    value: v.mereTel ?? '' },
      { label: 'Tuteur légal', value: v.tuteurNom ?? '' },
      { label: 'Tél. tuteur',  value: v.tuteurPhone ?? '' },
    ];
  }

  hasRequiredDocsMissing(): boolean {
    return this.documents.some(d => d.required && !d.provided);
  }

  docsFournis(): number {
    return this.documents.filter(d => d.provided).length;
  }

  // ── Validation helpers ────────────────────────────────────────────────────
  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  // ── Format ────────────────────────────────────────────────────────────────
  formatXOF(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' XOF';
  }

  // ── Print preview ─────────────────────────────────────────────────────────
  printPreview(): void {
    const v = this.form.value;
    const win = window.open('', '_blank', 'width=700,height=900');
    if (!win) return;
    win.document.write(`
      <html><head><title>Fiche d'inscription — ${v.firstName} ${v.lastName}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 24px; color: #0f172a; }
        h1 { font-size: 22px; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
        h2 { font-size: 14px; color: #6366f1; margin-top: 20px; margin-bottom: 8px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .label { color: #64748b; } .value { font-weight: 600; }
        .total { font-size: 18px; font-weight: 800; color: #6366f1; margin-top: 12px; }
        @media print { body { padding: 12px; } }
      </style></head><body>
      <h1>Fiche d'inscription — ${v.firstName} ${v.lastName}</h1>
      <p style="color:#64748b;font-size:13px">Lycée International · ${v.anneeAcademique} · Imprimé le ${new Date().toLocaleDateString('fr-FR')}</p>
      <h2>Identité</h2>
      <div class="grid">
        <div class="row"><span class="label">Prénom</span><span class="value">${v.firstName}</span></div>
        <div class="row"><span class="label">Nom</span><span class="value">${v.lastName}</span></div>
        <div class="row"><span class="label">Date naissance</span><span class="value">${v.dateNaissance ? new Date(v.dateNaissance).toLocaleDateString('fr-FR') : '—'}</span></div>
        <div class="row"><span class="label">Genre</span><span class="value">${v.genre === 'M' ? 'Masculin' : 'Féminin'}</span></div>
        <div class="row"><span class="label">Nationalité</span><span class="value">${v.nationalite}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${v.email || '—'}</span></div>
      </div>
      <h2>Scolarité</h2>
      <div class="grid">
        <div class="row"><span class="label">Classe</span><span class="value">${this.selectedClasseLabel()}</span></div>
        <div class="row"><span class="label">Régime</span><span class="value">${REGIMES.find(r => r.value === v.regime)?.label || '—'}</span></div>
        <div class="row"><span class="label">Type</span><span class="value">${v.typeInscription}</span></div>
        <div class="row"><span class="label">Statut</span><span class="value">${v.statut}</span></div>
      </div>
      <h2>Finance</h2>
      <div class="row"><span class="label">Frais d'inscription</span><span class="value">${this.formatXOF(this.fraisInscription())}</span></div>
      <div class="row"><span class="label">Frais de scolarité</span><span class="value">${this.formatXOF(this.fraisScolarite())}</span></div>
      ${v.bourseActif ? `<div class="row"><span class="label">Bourse</span><span class="value">- ${this.formatXOF(+(v.montantBourse ?? 0))}</span></div>` : ''}
      <div class="total">Total : ${this.formatXOF(this.totalFrais())}</div>
      <script>window.onload = () => { window.print(); }<\/script>
      </body></html>`);
    win.document.close();
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  private buildPayload() {
    const v = this.form.value;
    const parents: any[] = [];
    if (v.pereName)  parents.push({ nom: v.pereName,  relation: 'PERE',   telephone: v.pereTel ?? '',   email: v.pereEmail ?? '',   profession: v.pereProfession ?? '' });
    if (v.mereName)  parents.push({ nom: v.mereName,  relation: 'MERE',   telephone: v.mereTel ?? '',   email: v.mereEmail ?? '',   profession: v.mereProfession ?? '' });
    if (v.tuteurNom) parents.push({ nom: v.tuteurNom, relation: v.tuteurRelation ?? 'TUTEUR', telephone: v.tuteurPhone ?? '', email: v.tuteurEmail ?? '' });
    return {
      ...v,
      classeLibelle:  this.selectedClasseLabel(),
      niveauLibelle:  this.selectedClasseInfo()?.niveau ?? '',
      filiereLibelle: this.selectedClasseInfo()?.filiere ?? '',
      parents,
      dateInscription: new Date().toISOString().split('T')[0],
    };
  }

  submit(): void {
    this.form.markAllAsTouched();
    const requiredFields = ['firstName', 'lastName', 'dateNaissance', 'genre', 'classePublicId', 'regime', 'tuteurNom', 'tuteurPhone'];
    const allValid = requiredFields.every(f => this.form.get(f)?.valid);
    if (!allValid) {
      if (!this.form.get('firstName')?.valid || !this.form.get('lastName')?.valid || !this.form.get('dateNaissance')?.valid) {
        this.currentStep.set(0);
      } else if (!this.form.get('classePublicId')?.valid || !this.form.get('regime')?.valid) {
        this.currentStep.set(1);
      } else {
        this.currentStep.set(2);
      }
      return;
    }
    const payload = this.buildPayload();
    if (this.isEditMode()) {
      this.store.updateStudent({ publicId: this.editPublicId(), data: payload as any });
    } else {
      this.store.createStudent(payload as any);
    }
    this.submitted.set(true);
  }

  submitAndContinue(): void {
    this.form.markAllAsTouched();
    const payload = this.buildPayload();
    if (this.isEditMode()) {
      this.store.updateStudent({ publicId: this.editPublicId(), data: payload as any });
      setTimeout(() => this.router.navigate(['/students', this.editPublicId()]), 350);
    } else {
      this.store.createStudent(payload as any);
      setTimeout(() => {
        const last = this.store.students().at(-1);
        if (last) this.router.navigate(['/students', last.publicId]);
        else this.goToList();
      }, 400);
    }
  }

  goToList():   void { this.router.navigate(['/students']); }

  goToDetail(): void {
    const last = this.store.students().at(-1);
    if (last) this.router.navigate(['/students', last.publicId]);
    else this.goToList();
  }

  resetForm(): void {
    this.form.reset({
      genre: 'M', nationalite: 'Ivoirienne',
      anneeAcademique: '2025-2026', regime: 'EXTERNE',
      typeInscription: 'NOUVELLE', statut: 'PRE_INSCRIT',
      bourseActif: false, montantBourse: 0, reduction: 0,
    });
    this.currentStep.set(0);
    this.submitted.set(false);
    this.selectedExisting.set(null);
    this.searchQuery = '';
    this.documents.forEach(d => d.provided = false);
  }
}
