import {
  ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule }                                        from '@angular/common';
import { RouterLink, Router, ActivatedRoute }                  from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators }        from '@angular/forms';
import { FormsModule }                                         from '@angular/forms';
import { MatIconModule }                                       from '@angular/material/icon';
import { StudentsStore, MOCK_STUDENTS }                        from '@sms/students/data-access';

// ── Référentiel des classes (aligné sur les mocks académiques) ─────────────────
const CLASSES_DATA = [
  { id: 'promo-001', libelle: 'Terminale S1', niveau: 'Terminale', filiere: 'Scientifique', capacite: 45 },
  { id: 'promo-002', libelle: 'Terminale A1', niveau: 'Terminale', filiere: 'Littéraire',   capacite: 40 },
  { id: 'promo-003', libelle: 'Première D',   niveau: 'Première',  filiere: 'Scientifique', capacite: 48 },
  { id: 'promo-004', libelle: 'Seconde A',    niveau: 'Seconde',   filiere: 'Générale',     capacite: 52 },
  { id: 'promo-005', libelle: '3ème B',       niveau: '3ème',      filiere: 'Collège',      capacite: 50 },
];

const REGIMES = [
  { value: 'EXTERNE',           label: 'Externe — sans repas'   },
  { value: 'DEMI_PENSIONNAIRE', label: 'Demi-pensionnaire'       },
  { value: 'INTERNE',           label: 'Pensionnaire complet'    },
];

const GROUPES = ['Groupe A', 'Groupe B', 'Groupe C', 'Groupe D'];

const FRAIS_INSCRIPTION = 50_000;
const FRAIS_SCOLARITE: Record<string, number> = {
  Terminale: 750_000, 'Première': 700_000, Seconde: 650_000, '3ème': 600_000,
};

const TYPE_BOURSES = [
  { value: 'MERITE',   label: 'Bourse mérite (excellence)' },
  { value: 'SOCIALE',  label: 'Bourse sociale (situation familiale)' },
  { value: 'ETAT',     label: 'Bourse d\'État' },
  { value: 'PARTIELLE',label: 'Aide partielle' },
];

// ── Steps ──────────────────────────────────────────────────────────────────────
const STEPS = [
  { index: 0, label: 'Identité',    icon: 'person',          desc: 'Informations personnelles & contact' },
  { index: 1, label: 'Scolarité',   icon: 'school',          desc: 'Affectation académique'              },
  { index: 2, label: 'Famille',     icon: 'family_restroom', desc: 'Parents et contacts d\'urgence'      },
  { index: 3, label: 'Finance',     icon: 'payments',        desc: 'Frais, bourse & documents'           },
  { index: 4, label: 'Validation',  icon: 'fact_check',      desc: 'Récapitulatif et confirmation'       },
];

// ── Component ──────────────────────────────────────────────────────────────────
@Component({
  selector:        'sms-student-form',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatIconModule],
  template: `
<div class="min-h-full" style="background: var(--content-bg)">
<div class="max-w-4xl mx-auto p-6">

  <!-- ── Header ── -->
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/students"
       class="w-9 h-9 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
       style="background: var(--surface-1); border: 1px solid var(--border-color)">
      <mat-icon style="font-size:18px;height:18px;width:18px;color:var(--text-secondary)">arrow_back</mat-icon>
    </a>
    <div class="flex-1">
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">
        {{ isEditMode() ? "Modifier l'élève" : "Inscription d'un élève" }}
      </h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        @if (isEditMode()) {
          {{ store.selectedStudent()?.firstName }} {{ store.selectedStudent()?.lastName }}
          — {{ store.selectedStudent()?.matricule }}
        } @else {
          Étape {{ currentStep() + 1 }} sur {{ steps.length }}
        }
      </p>
    </div>
    @if (draftSaved()) {
      <div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
           style="background:rgba(16,185,129,0.1);color:#10b981">
        <mat-icon style="font-size:14px;height:14px;width:14px">cloud_done</mat-icon>
        Brouillon sauvegardé
      </div>
    }
  </div>

  <!-- ── Step Indicator ── -->
  <div class="sms-card p-4 mb-6">
    <div class="flex items-center">
      @for (step of steps; track step.index) {
        <div class="flex flex-col items-center" [class.flex-1]="step.index < steps.length - 1">
          <div class="flex items-center w-full">
            <div class="w-10 h-10 rounded-full font-bold text-sm transition-all flex items-center justify-center shrink-0"
                 [style.background]="stepBg(step.index)"
                 [style.color]="stepColor(step.index)"
                 [style.border]="stepBorder(step.index)">
              @if (step.index < currentStep()) {
                <mat-icon style="font-size:18px;height:18px;width:18px">check</mat-icon>
              } @else {
                {{ step.index + 1 }}
              }
            </div>
            @if (step.index < steps.length - 1) {
              <div class="flex-1 h-0.5 mx-1 transition-all"
                   [style.background]="step.index < currentStep() ? '#10b981' : 'var(--border-color)'"></div>
            }
          </div>
          <p class="text-xs font-semibold mt-1.5 hidden md:block"
             [style.color]="currentStep() === step.index ? 'var(--accent)' : step.index < currentStep() ? '#10b981' : 'var(--text-muted)'">
            {{ step.label }}
          </p>
        </div>
      }
    </div>
  </div>

  <form [formGroup]="form" (ngSubmit)="submit()">

  <!-- ══════════════════════════════════════════════════════════
       ÉTAPE 0 — IDENTITÉ
  ══════════════════════════════════════════════════════════ -->
  @if (currentStep() === 0) {

    <!-- Recherche élève existant -->
    @if (!isEditMode()) {
      <div class="sms-card p-5 mb-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(8,145,178,0.1)">
            <mat-icon style="color:#0891b2;font-size:18px;height:18px;width:18px">manage_search</mat-icon>
          </div>
          <div>
            <p class="font-semibold text-sm" style="color:var(--text-primary)">Élève déjà enregistré ?</p>
            <p class="text-xs" style="color:var(--text-secondary)">Recherchez pour pré-remplir automatiquement le formulaire</p>
          </div>
          @if (selectedExisting()) {
            <button type="button" (click)="clearExisting()"
                    class="ml-auto text-xs px-2 py-1 rounded-lg border hover:opacity-70"
                    style="border-color:var(--border-color);color:var(--text-secondary)">
              Effacer la sélection
            </button>
          }
        </div>
        <div class="relative">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2"
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
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:opacity-80 transition-opacity border-b"
                      style="border-color:var(--border-color);background:var(--surface-1)">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                     [style.background]="s.genre === 'F' ? '#ec4899' : '#6366f1'">
                  {{ s.firstName[0] }}{{ s.lastName[0] }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ s.firstName }} {{ s.lastName }}</p>
                  <p class="text-xs" style="color:var(--text-secondary)">{{ s.matricule }} · {{ s.classeLibelle }}</p>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full"
                      style="background:rgba(22,163,74,0.1);color:#16a34a">
                  Réinscrire
                </span>
              </button>
            }
          </div>
        }
        @if (selectedExisting()) {
          <div class="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl"
               style="background:rgba(8,145,178,0.06);border:1px solid rgba(8,145,178,0.2)">
            <mat-icon style="color:#0891b2;flex-shrink:0">check_circle</mat-icon>
            <span class="text-sm" style="color:var(--text-primary)">
              <strong>{{ selectedExisting()!.firstName }} {{ selectedExisting()!.lastName }}</strong>
              sélectionné — formulaire pré-rempli automatiquement
            </span>
          </div>
        }
      </div>
    }

    <!-- Photo + Identité -->
    <div class="sms-card p-6 mb-4">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:var(--accent-light)">
          <mat-icon style="color:var(--accent);font-size:18px;height:18px;width:18px">person</mat-icon>
        </div>
        <div>
          <h3 class="font-semibold" style="color:var(--text-primary)">Informations personnelles</h3>
          <p class="text-xs" style="color:var(--text-secondary)">Identité civile de l'élève</p>
        </div>
      </div>

      <!-- Photo + initiales -->
      <div class="flex items-center gap-5 mb-6 p-4 rounded-xl" style="background:var(--surface-2);border:1px dashed var(--border-color)">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
             style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
          {{ photoInitials() }}
        </div>
        <div>
          <p class="text-sm font-semibold" style="color:var(--text-primary)">Photo de profil</p>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary)">JPG, PNG — max 2 MB</p>
          <button type="button"
                  class="mt-2 flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                  style="border:1px solid var(--border-color);color:var(--text-secondary);background:var(--surface-1)"
                  (click)="uploadPhoto()">
            <mat-icon style="font-size:14px;height:14px;width:14px">upload</mat-icon>
            Choisir une photo
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Prénom -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Prénom <span style="color:#ef4444">*</span>
          </label>
          <input formControlName="firstName" type="text" placeholder="Ex : Awa"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 [style.border-color]="isInvalid('firstName') ? '#ef4444' : 'var(--border-color)'"
                 style="background:var(--surface-2);color:var(--text-primary)">
          @if (isInvalid('firstName')) {
            <p class="text-xs mt-1 flex items-center gap-1" style="color:#ef4444">
              <mat-icon style="font-size:12px;height:12px;width:12px">error_outline</mat-icon>Prénom obligatoire
            </p>
          }
        </div>
        <!-- Nom -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Nom de famille <span style="color:#ef4444">*</span>
          </label>
          <input formControlName="lastName" type="text" placeholder="Ex : Diallo"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 [style.border-color]="isInvalid('lastName') ? '#ef4444' : 'var(--border-color)'"
                 style="background:var(--surface-2);color:var(--text-primary)">
          @if (isInvalid('lastName')) {
            <p class="text-xs mt-1" style="color:#ef4444">Nom obligatoire</p>
          }
        </div>
        <!-- Date naissance -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Date de naissance <span style="color:#ef4444">*</span>
          </label>
          <input formControlName="dateNaissance" type="date"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 [style.border-color]="isInvalid('dateNaissance') ? '#ef4444' : 'var(--border-color)'"
                 style="background:var(--surface-2);color:var(--text-primary)">
        </div>
        <!-- Genre -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Genre <span style="color:#ef4444">*</span></label>
          <div class="flex gap-3">
            @for (g of genres; track g.value) {
              <label class="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                     [style.border]="form.get('genre')?.value === g.value ? '2px solid var(--accent)' : '1px solid var(--border-color)'"
                     [style.background]="form.get('genre')?.value === g.value ? 'var(--accent-light)' : 'var(--surface-2)'">
                <input type="radio" formControlName="genre" [value]="g.value" class="sr-only">
                <mat-icon style="font-size:18px;height:18px;width:18px"
                          [style.color]="form.get('genre')?.value === g.value ? 'var(--accent)' : 'var(--text-muted)'">{{ g.icon }}</mat-icon>
                <span class="text-sm font-medium"
                      [style.color]="form.get('genre')?.value === g.value ? 'var(--accent)' : 'var(--text-primary)'">{{ g.label }}</span>
              </label>
            }
          </div>
        </div>
        <!-- Lieu naissance -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Lieu de naissance</label>
          <input formControlName="lieuNaissance" type="text" placeholder="Ex : Abidjan"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <!-- Nationalité -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Nationalité</label>
          <select formControlName="nationalite" class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            @for (n of nationalites; track n) { <option [value]="n">{{ n }}</option> }
          </select>
        </div>
        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Email</label>
          <input formControlName="email" type="email" placeholder="eleve@email.com"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 [style.border-color]="isInvalid('email') ? '#ef4444' : 'var(--border-color)'"
                 style="background:var(--surface-2);color:var(--text-primary)">
          @if (isInvalid('email')) {
            <p class="text-xs mt-1" style="color:#ef4444">Format email invalide</p>
          }
        </div>
        <!-- Téléphone -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Téléphone</label>
          <input formControlName="phone" type="tel" placeholder="+225 07 XX XX XX XX"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <!-- Adresse -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Adresse de résidence</label>
          <div class="grid grid-cols-3 gap-3">
            <input formControlName="adresse" type="text" placeholder="Quartier, rue…" class="col-span-2 px-3 py-2.5 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <input formControlName="ville" type="text" placeholder="Ville" class="px-3 py-2.5 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>
      </div>
    </div>
  }

  <!-- ══════════════════════════════════════════════════════════
       ÉTAPE 1 — SCOLARITÉ
  ══════════════════════════════════════════════════════════ -->
  @if (currentStep() === 1) {
    <div class="sms-card p-6 mb-4">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(245,158,11,0.1)">
          <mat-icon style="color:#f59e0b;font-size:18px;height:18px;width:18px">school</mat-icon>
        </div>
        <div>
          <h3 class="font-semibold" style="color:var(--text-primary)">Informations académiques</h3>
          <p class="text-xs" style="color:var(--text-secondary)">Affectation dans l'établissement pour l'année en cours</p>
        </div>
      </div>

      <!-- Alertes métier -->
      @if (isDuplicate()) {
        <div class="flex items-start gap-3 mb-4 p-4 rounded-xl"
             style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.25)">
          <mat-icon style="color:#dc2626;flex-shrink:0;font-size:18px;height:18px;width:18px;margin-top:1px">warning</mat-icon>
          <div>
            <p class="text-sm font-semibold" style="color:#dc2626">Doublon détecté</p>
            <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
              Cet élève est déjà inscrit pour l'année académique {{ form.value.anneeAcademique }}.
              Vérifiez les données avant de continuer.
            </p>
          </div>
        </div>
      }
      @if (isClasseFull()) {
        <div class="flex items-start gap-3 mb-4 p-4 rounded-xl"
             style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25)">
          <mat-icon style="color:#d97706;flex-shrink:0;font-size:18px;height:18px;width:18px;margin-top:1px">info</mat-icon>
          <div>
            <p class="text-sm font-semibold" style="color:#d97706">Classe proche de sa capacité</p>
            <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
              La classe sélectionnée a atteint 90% de sa capacité maximale. Vérifiez la disponibilité.
            </p>
          </div>
        </div>
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Année académique -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Année académique</label>
          <select formControlName="anneeAcademique" class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="2025-2026">2025 – 2026 (en cours)</option>
            <option value="2024-2025">2024 – 2025</option>
          </select>
        </div>
        <!-- Classe -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Classe <span style="color:#ef4444">*</span>
          </label>
          <select formControlName="classePublicId" (change)="onClasseChange()"
                  class="w-full px-3 py-2.5 rounded-xl border text-sm font-medium"
                  [style.border-color]="isInvalid('classePublicId') ? '#ef4444' : 'var(--border-color)'"
                  style="background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Choisir une classe —</option>
            @for (c of classes; track c.id) {
              <option [value]="c.id">{{ c.libelle }} ({{ c.filiere }})</option>
            }
          </select>
          @if (isInvalid('classePublicId')) {
            <p class="text-xs mt-1" style="color:#ef4444">La classe est obligatoire</p>
          }
          @if (selectedClasseInfo()) {
            <p class="text-xs mt-1 flex items-center gap-1" style="color:var(--text-muted)">
              <mat-icon style="font-size:12px;height:12px;width:12px">people</mat-icon>
              Capacité : {{ selectedClasseInfo()!.capacite }} élèves · Niveau : {{ selectedClasseInfo()!.niveau }}
            </p>
          }
        </div>
        <!-- Groupe -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Groupe</label>
          <select formControlName="groupe" class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Optionnel —</option>
            @for (g of groupes; track g) { <option [value]="g">{{ g }}</option> }
          </select>
        </div>
        <!-- Régime -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Régime <span style="color:#ef4444">*</span>
          </label>
          <select formControlName="regime" class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  [style.border-color]="isInvalid('regime') ? '#ef4444' : 'var(--border-color)'"
                  style="background:var(--surface-2);color:var(--text-primary)">
            @for (r of regimes; track r.value) { <option [value]="r.value">{{ r.label }}</option> }
          </select>
        </div>
        <!-- Type inscription -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Type d'inscription</label>
          <select formControlName="typeInscription" class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="NOUVELLE">Nouvelle inscription</option>
            <option value="RENOUVELLEMENT">Renouvellement</option>
            <option value="TRANSFERT">Transfert entrant</option>
          </select>
        </div>
        <!-- Statut initial -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Statut initial</label>
          <select formControlName="statut" class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="PRE_INSCRIT">Pré-inscrit</option>
            <option value="INSCRIT">Inscrit</option>
            <option value="INSCRIPTION_VALIDEE">Inscription validée</option>
            <option value="ACTIF">Actif</option>
          </select>
        </div>
        <!-- Établissement précédent -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Établissement précédent</label>
          <input formControlName="etablissementPrecedent" type="text" placeholder="Nom de l'établissement précédent (optionnel)"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <!-- Observations -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Observations</label>
          <textarea formControlName="observations" rows="2" placeholder="Besoins particuliers, informations complémentaires…"
                    class="w-full px-3 py-2.5 rounded-xl border text-sm resize-none outline-none"
                    style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </textarea>
        </div>
      </div>
    </div>
  }

  <!-- ══════════════════════════════════════════════════════════
       ÉTAPE 2 — FAMILLE & CONTACTS
  ══════════════════════════════════════════════════════════ -->
  @if (currentStep() === 2) {
    <!-- Père -->
    <div class="sms-card p-6 mb-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(59,130,246,0.1)">
          <mat-icon style="color:#2563eb;font-size:18px;height:18px;width:18px">man</mat-icon>
        </div>
        <h3 class="font-semibold" style="color:var(--text-primary)">Père</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Nom complet</label>
          <input formControlName="pereName" type="text" placeholder="Ex : Diallo Ibrahim"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Téléphone</label>
          <input formControlName="pereTel" type="tel" placeholder="+225 07 XX XX XX XX"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Email</label>
          <input formControlName="pereEmail" type="email" placeholder="pere@email.com"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Profession</label>
          <input formControlName="pereProfession" type="text" placeholder="Ex : Ingénieur"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
      </div>
    </div>

    <!-- Mère -->
    <div class="sms-card p-6 mb-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(236,72,153,0.1)">
          <mat-icon style="color:#ec4899;font-size:18px;height:18px;width:18px">woman</mat-icon>
        </div>
        <h3 class="font-semibold" style="color:var(--text-primary)">Mère</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Nom complet</label>
          <input formControlName="mereName" type="text" placeholder="Ex : Koné Mariam"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Téléphone</label>
          <input formControlName="mereTel" type="tel" placeholder="+225 07 XX XX XX XX"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Email</label>
          <input formControlName="mereEmail" type="email" placeholder="mere@email.com"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Profession</label>
          <input formControlName="mereProfession" type="text" placeholder="Ex : Commerçante"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
      </div>
    </div>

    <!-- Tuteur légal -->
    <div class="sms-card p-6 mb-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(139,92,246,0.1)">
          <mat-icon style="color:#8b5cf6;font-size:18px;height:18px;width:18px">supervisor_account</mat-icon>
        </div>
        <div class="flex-1">
          <h3 class="font-semibold" style="color:var(--text-primary)">Tuteur légal / Contact principal</h3>
          <p class="text-xs" style="color:var(--text-secondary)">Personne légalement responsable si différente des parents</p>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Nom complet <span style="color:#ef4444">*</span>
          </label>
          <input formControlName="tuteurNom" type="text" placeholder="Ex : Diallo Ibrahim"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 [style.border-color]="isInvalid('tuteurNom') ? '#ef4444' : 'var(--border-color)'"
                 style="background:var(--surface-2);color:var(--text-primary)">
          @if (isInvalid('tuteurNom')) {
            <p class="text-xs mt-1" style="color:#ef4444">Obligatoire</p>
          }
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Lien de parenté</label>
          <select formControlName="tuteurRelation" class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="PERE">Père</option>
            <option value="MERE">Mère</option>
            <option value="TUTEUR">Tuteur</option>
            <option value="GRAND_PARENT">Grand-parent</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Téléphone <span style="color:#ef4444">*</span>
          </label>
          <input formControlName="tuteurPhone" type="tel" placeholder="+225 07 XX XX XX XX"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 [style.border-color]="isInvalid('tuteurPhone') ? '#ef4444' : 'var(--border-color)'"
                 style="background:var(--surface-2);color:var(--text-primary)">
          @if (isInvalid('tuteurPhone')) {
            <p class="text-xs mt-1" style="color:#ef4444">Obligatoire</p>
          }
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Email tuteur</label>
          <input formControlName="tuteurEmail" type="email" placeholder="parent@email.com"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
      </div>
    </div>

    <!-- Contact urgence -->
    <div class="sms-card p-6 mb-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(239,68,68,0.1)">
          <mat-icon style="color:#dc2626;font-size:18px;height:18px;width:18px">emergency</mat-icon>
        </div>
        <div>
          <h3 class="font-semibold" style="color:var(--text-primary)">Contact d'urgence</h3>
          <p class="text-xs" style="color:var(--text-secondary)">Personne à contacter en cas d'urgence médicale</p>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Nom et prénom</label>
          <input formControlName="urgenceNom" type="text" placeholder="Ex : Koné Jean"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">Téléphone</label>
          <input formControlName="urgenceTel" type="tel" placeholder="+225 07 XX XX XX"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
      </div>
    </div>
  }

  <!-- ══════════════════════════════════════════════════════════
       ÉTAPE 3 — FINANCE & DOCUMENTS
  ══════════════════════════════════════════════════════════ -->
  @if (currentStep() === 3) {

    <!-- Frais & bourse -->
    <div class="sms-card p-6 mb-4">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(22,163,74,0.1)">
          <mat-icon style="color:#16a34a;font-size:18px;height:18px;width:18px">payments</mat-icon>
        </div>
        <h3 class="font-semibold" style="color:var(--text-primary)">Frais de scolarité</h3>
      </div>

      <!-- Frais auto-calculés -->
      <div class="grid grid-cols-2 gap-4 mb-5">
        <div class="p-4 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
          <p class="text-xs mb-1" style="color:var(--text-secondary)">Frais d'inscription</p>
          <p class="text-lg font-bold" style="color:var(--text-primary)">{{ formatXOF(fraisInscription) }}</p>
          <p class="text-xs mt-0.5" style="color:var(--text-muted)">Montant fixe annuel</p>
        </div>
        <div class="p-4 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
          <p class="text-xs mb-1" style="color:var(--text-secondary)">Frais de scolarité</p>
          <p class="text-lg font-bold" style="color:var(--text-primary)">{{ formatXOF(fraisScolarite()) }}</p>
          <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ selectedClasseInfo()?.niveau ?? '—' }}</p>
        </div>
      </div>

      <!-- Bourse -->
      <div class="mb-4">
        <div class="flex items-center gap-3 mb-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" formControlName="bourseActif"
                   class="w-4 h-4 rounded accent-indigo-500">
            <span class="text-sm font-semibold" style="color:var(--text-primary)">Bourse / Aide financière</span>
          </label>
        </div>
        @if (form.value.bourseActif) {
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl"
               style="background:rgba(22,163,74,0.04);border:1px solid rgba(22,163,74,0.2)">
            <div>
              <label class="block text-xs font-semibold mb-1" style="color:var(--text-secondary)">Type de bourse</label>
              <select formControlName="typeBourse" class="w-full px-3 py-2 rounded-xl border text-sm"
                      style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                @for (t of typeBourses; track t.value) { <option [value]="t.value">{{ t.label }}</option> }
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" style="color:var(--text-secondary)">Montant (XOF)</label>
              <input formControlName="montantBourse" type="number" min="0" placeholder="Ex: 100000"
                     class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                     style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" style="color:var(--text-secondary)">Réduction (%)</label>
              <input formControlName="reduction" type="number" min="0" max="100" placeholder="Ex: 20"
                     class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                     style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            </div>
          </div>
        }
      </div>

      <!-- Total -->
      <div class="flex items-center justify-between p-4 rounded-xl"
           style="background:var(--accent-light);border:1px solid var(--accent)">
        <span class="font-semibold" style="color:var(--text-primary)">Total à payer</span>
        <span class="text-2xl font-black" style="color:var(--accent)">{{ formatXOF(totalFrais()) }}</span>
      </div>
    </div>

    <!-- Documents -->
    <div class="sms-card p-6 mb-4">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(99,102,241,0.1)">
          <mat-icon style="color:#6366f1;font-size:18px;height:18px;width:18px">folder_open</mat-icon>
        </div>
        <div>
          <h3 class="font-semibold" style="color:var(--text-primary)">Documents du dossier</h3>
          <p class="text-xs" style="color:var(--text-secondary)">
            {{ docsFournis() }}/{{ documents.length }} documents fournis
          </p>
        </div>
      </div>
      <div class="space-y-3">
        @for (doc of documents; track doc.label) {
          <div class="flex items-center justify-between p-3 rounded-xl"
               style="background:var(--surface-2);border:1px solid var(--border-color)">
            <div class="flex items-center gap-3">
              <mat-icon [style.color]="doc.provided ? '#10b981' : doc.required ? '#f59e0b' : 'var(--text-muted)'"
                        style="font-size:20px;height:20px;width:20px">
                {{ doc.provided ? 'check_circle' : doc.required ? 'pending' : 'radio_button_unchecked' }}
              </mat-icon>
              <div>
                <p class="text-sm font-medium" style="color:var(--text-primary)">{{ doc.label }}</p>
                <p class="text-xs" [style.color]="doc.required ? '#f59e0b' : 'var(--text-muted)'">
                  {{ doc.required ? 'Obligatoire' : 'Optionnel' }}
                </p>
              </div>
            </div>
            <button type="button" (click)="toggleDoc(doc)"
                    class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70"
                    [style.background]="doc.provided ? 'rgba(16,185,129,0.1)' : 'var(--surface-1)'"
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
    <!-- Profil élève -->
    <div class="sms-card p-6 mb-4">
      <div class="flex items-center gap-5 mb-5 pb-5" style="border-bottom:1px solid var(--border-color)">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
             style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">{{ photoInitials() }}</div>
        <div>
          <h2 class="text-xl font-bold" style="color:var(--text-primary)">
            {{ form.value.firstName }} {{ form.value.lastName }}
          </h2>
          <p class="text-sm" style="color:var(--text-secondary)">
            {{ selectedClasseLabel() }} · {{ form.value.anneeAcademique }}
          </p>
          <div class="flex items-center gap-2 mt-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style="background:rgba(22,163,74,0.12);color:#16a34a">{{ form.value.statut }}</span>
            <span class="px-2 py-0.5 rounded text-xs" style="background:var(--surface-2);color:var(--text-secondary)">
              {{ form.value.typeInscription }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Identité -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wide mb-3" style="color:var(--text-muted)">Identité</h4>
          <div class="space-y-2">
            @for (f of summaryIdentite(); track f.label) {
              <div>
                <p class="text-xs" style="color:var(--text-muted)">{{ f.label }}</p>
                <p class="text-sm font-medium" style="color:var(--text-primary)">{{ f.value || '—' }}</p>
              </div>
            }
          </div>
        </div>
        <!-- Scolarité -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wide mb-3" style="color:var(--text-muted)">Scolarité</h4>
          <div class="space-y-2">
            @for (f of summaryScolarite(); track f.label) {
              <div>
                <p class="text-xs" style="color:var(--text-muted)">{{ f.label }}</p>
                <p class="text-sm font-medium" style="color:var(--text-primary)">{{ f.value || '—' }}</p>
              </div>
            }
          </div>
        </div>
        <!-- Famille & Finance -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wide mb-3" style="color:var(--text-muted)">Famille</h4>
          <div class="space-y-2">
            @for (f of summaryFamille(); track f.label) {
              <div>
                <p class="text-xs" style="color:var(--text-muted)">{{ f.label }}</p>
                <p class="text-sm font-medium" style="color:var(--text-primary)">{{ f.value || '—' }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Finance summary -->
      <div class="mt-5 pt-4 border-t flex items-center justify-between flex-wrap gap-3"
           style="border-color:var(--border-color)">
        <div class="flex items-center gap-6 text-sm flex-wrap">
          <span style="color:var(--text-secondary)">Frais inscription : <strong>{{ formatXOF(fraisInscription) }}</strong></span>
          <span style="color:var(--text-secondary)">Scolarité : <strong>{{ formatXOF(fraisScolarite()) }}</strong></span>
          @if (form.value.bourseActif && (form.value.montantBourse || 0) > 0) {
            <span style="color:#16a34a">Bourse : <strong>- {{ formatXOF(+(form.value.montantBourse ?? 0)) }}</strong></span>
          }
        </div>
        <div class="text-right">
          <p class="text-xs" style="color:var(--text-muted)">Total à payer</p>
          <p class="text-xl font-black" style="color:var(--accent)">{{ formatXOF(totalFrais()) }}</p>
        </div>
      </div>
    </div>

    <!-- Documents status -->
    <div class="sms-card p-5 mb-4">
      <h4 class="text-xs font-bold uppercase tracking-wide mb-3" style="color:var(--text-muted)">Documents</h4>
      <div class="flex flex-wrap gap-2">
        @for (doc of documents; track doc.label) {
          <span class="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
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
          <mat-icon style="color:#d97706;font-size:16px;height:16px;width:16px;flex-shrink:0;margin-top:1px">warning</mat-icon>
          <p class="text-xs" style="color:var(--text-secondary)">
            Certains documents obligatoires n'ont pas été fournis. L'inscription peut tout de même être soumise, mais les documents devront être remis ultérieurement.
          </p>
        </div>
      }
    </div>

    <!-- Alertes métier -->
    @if (isDuplicate()) {
      <div class="flex items-start gap-3 mb-4 p-4 rounded-xl"
           style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.3)">
        <mat-icon style="color:#dc2626;flex-shrink:0">error</mat-icon>
        <p class="text-sm" style="color:#dc2626">
          <strong>Attention :</strong> Cet élève est déjà inscrit pour l'année {{ form.value.anneeAcademique }}.
          Vérifiez avant de valider.
        </p>
      </div>
    }
  }

  <!-- ── Navigation buttons ── -->
  <div class="flex items-center justify-between mt-6 flex-wrap gap-3">
    <button type="button" (click)="prevStep()" [disabled]="currentStep() === 0"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity"
            [class.opacity-40]="currentStep() === 0"
            [class.cursor-not-allowed]="currentStep() === 0"
            style="border:1px solid var(--border-color);color:var(--text-secondary);background:var(--surface-1)">
      <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
      Précédent
    </button>

    <div class="flex items-center gap-3 flex-wrap">
      <button type="button" (click)="saveDraft()"
              class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
              style="border:1px solid var(--border-color);color:var(--text-secondary);background:var(--surface-1)">
        <mat-icon style="font-size:16px;height:16px;width:16px">save_alt</mat-icon>
        Brouillon
      </button>

      @if (currentStep() === 4) {
        <button type="button" (click)="printPreview()"
                class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-70"
                style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-1)">
          <mat-icon style="font-size:16px;height:16px;width:16px">print</mat-icon>
          Prévisualiser
        </button>
        <button type="button" (click)="submitAndContinue()"
                [disabled]="store.saving()"
                class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-70 disabled:opacity-40"
                style="border-color:var(--accent);color:var(--accent);background:var(--accent-light)">
          <mat-icon style="font-size:16px;height:16px;width:16px">open_in_new</mat-icon>
          Inscrire et voir la fiche
        </button>
        <button type="submit" [disabled]="store.saving()"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style="background:#10b981">
          @if (store.saving()) {
            <mat-icon class="animate-spin" style="font-size:18px;height:18px;width:18px">refresh</mat-icon>
          } @else {
            <mat-icon style="font-size:18px;height:18px;width:18px">{{ isEditMode() ? 'save' : 'how_to_reg' }}</mat-icon>
          }
          {{ store.saving() ? 'Enregistrement…' : (isEditMode() ? 'Enregistrer les modifications' : "Confirmer l'inscription") }}
        </button>
      } @else {
        <button type="button" (click)="nextStep()"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style="background:var(--accent)">
          Suivant
          <mat-icon style="font-size:18px;height:18px;width:18px">arrow_forward</mat-icon>
        </button>
      }
    </div>
  </div>

  </form>

  <!-- ── Success Screen ── -->
  @if (submitted()) {
    <div class="fixed inset-0 flex items-center justify-center z-50"
         style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px)">
      <div class="sms-card p-8 max-w-md w-full mx-4 text-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
             style="background:rgba(16,185,129,0.15)">
          <mat-icon style="font-size:36px;height:36px;width:36px;color:#10b981">check_circle</mat-icon>
        </div>
        <h2 class="text-xl font-bold mb-2" style="color:var(--text-primary)">
          {{ isEditMode() ? 'Modifications enregistrées !' : 'Inscription réussie !' }}
        </h2>
        <p class="text-sm mb-1" style="color:var(--text-secondary)">
          <strong>{{ form.value.firstName }} {{ form.value.lastName }}</strong>
          {{ isEditMode() ? 'a été mis(e) à jour.' : 'a été inscrit(e) avec succès.' }}
        </p>
        @if (!isEditMode()) {
          <p class="text-xs mb-2" style="color:var(--text-muted)">Matricule · {{ generatedMatricule() }}</p>
          <p class="text-xs mb-6" style="color:var(--text-muted)">
            Classe : {{ selectedClasseLabel() }} · {{ form.value.anneeAcademique }}
          </p>
        }
        <div class="flex gap-3">
          <button (click)="goToList()"
                  class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                  style="border:1px solid var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
            Liste des élèves
          </button>
          @if (!isEditMode()) {
            <button (click)="goToDetail()"
                    class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style="background:var(--accent)">
              Voir la fiche
            </button>
          }
          <button (click)="resetForm()"
                  class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style="background:#10b981">
            Nouvel élève
          </button>
        </div>
      </div>
    </div>
  }

</div>
</div>
  `,
})
export class StudentFormComponent implements OnInit, OnDestroy {
  readonly store   = inject(StudentsStore);
  private  fb      = inject(FormBuilder);
  private  router  = inject(Router);
  private  route   = inject(ActivatedRoute);

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
  readonly classes      = CLASSES_DATA;
  readonly groupes      = GROUPES;
  readonly regimes      = REGIMES;
  readonly typeBourses  = TYPE_BOURSES;
  readonly fraisInscription = FRAIS_INSCRIPTION;

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
    { label: 'Photo d\'identité (x4)',     required: true,  provided: false },
    { label: 'Certificat de scolarité',    required: true,  provided: false },
    { label: 'Carnets scolaires (x2)',     required: false, provided: false },
    { label: 'Attestation de transfert',   required: false, provided: false },
    { label: 'Résultats du brevet / Bac',  required: false, provided: false },
    { label: 'Acte de naissance certifié', required: false, provided: false },
  ];

  // ── Form ──────────────────────────────────────────────────────────────────
  readonly form = this.fb.group({
    // Identité + Contact
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
    // Scolarité
    anneeAcademique:        ['2025-2026'],
    classePublicId:         ['', Validators.required],
    groupe:                 [''],
    regime:                 ['EXTERNE', Validators.required],
    typeInscription:        ['NOUVELLE'],
    statut:                 ['PRE_INSCRIT'],
    etablissementPrecedent: [''],
    observations:           [''],
    // Famille — Père
    pereName:               [''],
    pereTel:                [''],
    pereEmail:              [''],
    pereProfession:         [''],
    // Famille — Mère
    mereName:               [''],
    mereTel:                [''],
    mereEmail:              [''],
    mereProfession:         [''],
    // Tuteur légal (référent principal)
    tuteurNom:              ['', Validators.required],
    tuteurRelation:         ['PERE'],
    tuteurPhone:            ['', Validators.required],
    tuteurEmail:            [''],
    // Urgence
    urgenceNom:             [''],
    urgenceTel:             [''],
    // Finance
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
    return CLASSES_DATA.find(c => c.id === id)?.libelle ?? '—';
  });

  readonly selectedClasseInfo = computed(() => {
    const id = this.form.get('classePublicId')?.value;
    return CLASSES_DATA.find(c => c.id === id) ?? null;
  });

  readonly generatedMatricule = computed(() => {
    const year = new Date().getFullYear();
    const num  = String(MOCK_STUDENTS.length + 1).padStart(6, '0');
    return `LYCÉE-CI/${year}/${num}`;
  });

  readonly fraisScolarite = computed(() => {
    const niveau = this.selectedClasseInfo()?.niveau;
    return niveau ? (FRAIS_SCOLARITE[niveau] ?? 650_000) : 0;
  });

  readonly totalFrais = computed(() => {
    const base     = FRAIS_INSCRIPTION + this.fraisScolarite();
    const bourse   = this.form.value.bourseActif ? +(this.form.value.montantBourse ?? 0) : 0;
    const pct      = this.form.value.bourseActif ? +(this.form.value.reduction ?? 0) : 0;
    const remise   = Math.round(base * pct / 100);
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

  // ── Step-level required fields ────────────────────────────────────────────
  private readonly stepFields: Record<number, string[]> = {
    0: ['firstName', 'lastName', 'dateNaissance', 'genre'],
    1: ['classePublicId', 'regime'],
    2: ['tuteurNom', 'tuteurPhone'],
    3: [], // Finance & docs — no required validation
    4: [], // Summary — no extra validation
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  private draftInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const mode      = this.route.snapshot.data['mode'] as string;
    const publicId  = this.route.snapshot.paramMap.get('publicId');

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

    // Auto-save draft every 30s
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
      pereName:  (s.parents as any)?.find((p: any) => p.relation === 'PERE')?.nom ?? '',
      pereTel:   (s.parents as any)?.find((p: any) => p.relation === 'PERE')?.telephone ?? '',
      mereName:  (s.parents as any)?.find((p: any) => p.relation === 'MERE')?.nom ?? '',
      mereTel:   (s.parents as any)?.find((p: any) => p.relation === 'MERE')?.telephone ?? '',
      tuteurNom: (s.parents as any)?.[0]?.nom ?? '',
      tuteurPhone: (s.parents as any)?.[0]?.telephone ?? '',
      typeInscription: 'RENOUVELLEMENT',
    });
  }

  clearExisting(): void {
    this.selectedExisting.set(null);
    this.searchQuery = '';
  }

  // ── Classe change ─────────────────────────────────────────────────────────
  onClasseChange(): void {
    // Auto-fill regime hint if class changes
  }

  // ── Photo upload (simulate) ───────────────────────────────────────────────
  uploadPhoto(): void {
    // In production this would open a file picker
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
      { label: 'Lieu de naissance', value: v.lieuNaissance ?? '' },
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
      { label: 'Groupe',     value: this.form.value.groupe ?? '' },
      { label: 'Régime',     value: REGIMES.find(r => r.value === this.form.value.regime)?.label ?? '' },
      { label: 'Année',      value: this.form.value.anneeAcademique ?? '' },
      { label: 'Inscription',value: this.form.value.typeInscription ?? '' },
    ];
  }

  summaryFamille() {
    const v = this.form.value;
    return [
      { label: 'Père',             value: v.pereName ?? '' },
      { label: 'Tél. père',        value: v.pereTel ?? '' },
      { label: 'Mère',             value: v.mereName ?? '' },
      { label: 'Tél. mère',        value: v.mereTel ?? '' },
      { label: 'Tuteur légal',     value: v.tuteurNom ?? '' },
      { label: 'Tél. tuteur',      value: v.tuteurPhone ?? '' },
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

  // ── Step visual helpers ───────────────────────────────────────────────────
  stepBg(i: number): string {
    if (i < this.currentStep())  return 'rgba(16,185,129,0.15)';
    if (i === this.currentStep()) return 'var(--accent)';
    return 'var(--surface-2)';
  }
  stepColor(i: number): string {
    if (i < this.currentStep())  return '#10b981';
    if (i === this.currentStep()) return '#ffffff';
    return 'var(--text-muted)';
  }
  stepBorder(i: number): string {
    if (i < this.currentStep())  return '2px solid #10b981';
    if (i === this.currentStep()) return '2px solid var(--accent)';
    return '2px solid var(--border-color)';
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
      <div class="row"><span class="label">Frais d'inscription</span><span class="value">${this.formatXOF(FRAIS_INSCRIPTION)}</span></div>
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
      classeLibelle: this.selectedClasseLabel(),
      niveauLibelle: this.selectedClasseInfo()?.niveau ?? '',
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
      // Navigate to first step with error
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
