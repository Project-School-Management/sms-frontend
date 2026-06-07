import {
  ChangeDetectionStrategy, Component, inject, signal, computed,
} from '@angular/core';
import { CommonModule }                          from '@angular/common';
import { RouterLink, Router }                    from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatIconModule }                         from '@angular/material/icon';
import { StudentsStore }                         from '@sms/students/data-access';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { index: 0, label: 'Identité',   icon: 'person',        desc: 'Informations personnelles' },
  { index: 1, label: 'Contact',    icon: 'contact_phone', desc: 'Coordonnées & tuteur légal' },
  { index: 2, label: 'Scolarité',  icon: 'school',        desc: 'Affectation académique' },
  { index: 3, label: 'Récapitulatif', icon: 'checklist',  desc: 'Vérification & confirmation' },
];

const CLASSES_DATA = [
  { id: 'cls-terminale-s1', libelle: 'Terminale S1 — Scientifique', niveau: 'Terminale' },
  { id: 'cls-terminale-a1', libelle: 'Terminale A1 — Littéraire',   niveau: 'Terminale' },
  { id: 'cls-premiere-d',   libelle: 'Première D — Scientifique',   niveau: 'Première'  },
  { id: 'cls-seconde',      libelle: 'Seconde A — Générale',        niveau: 'Seconde'   },
  { id: 'cls-troisieme',    libelle: '3ème B — Collège',            niveau: '3ème'      },
];

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector:        'sms-student-form',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
<div class="min-h-full" style="background: var(--content-bg)">
<div class="max-w-3xl mx-auto p-6">

  <!-- ── Page Header ──────────────────────────────────────────────────────── -->
  <div class="flex items-center gap-3 mb-8">
    <a routerLink="/students"
       class="w-9 h-9 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
       style="background: var(--surface-1); border: 1px solid var(--border-color)">
      <mat-icon style="font-size: 18px; height: 18px; width: 18px; color: var(--text-secondary)">arrow_back</mat-icon>
    </a>
    <div>
      <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Inscription d'un élève</h1>
      <p class="text-sm mt-0.5" style="color: var(--text-secondary)">
        Étape {{ currentStep() + 1 }} sur {{ steps.length }}
      </p>
    </div>
    <!-- Draft badge -->
    @if (draftSaved()) {
      <div class="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
           style="background: rgba(16,185,129,0.1); color: #10b981">
        <mat-icon style="font-size: 14px; height: 14px; width: 14px">cloud_done</mat-icon>
        Brouillon sauvegardé
      </div>
    }
  </div>

  <!-- ── Step Indicator ───────────────────────────────────────────────────── -->
  <div class="sms-card p-5 mb-6">
    <div class="flex items-center">
      @for (step of steps; track step.index) {
        <!-- Step circle + label -->
        <div class="flex flex-col items-center flex-1">
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all"
               [style.background]="stepBg(step.index)"
               [style.color]="stepColor(step.index)"
               [style.border]="stepBorder(step.index)">
            @if (step.index < currentStep()) {
              <mat-icon style="font-size: 18px; height: 18px; width: 18px">check</mat-icon>
            } @else {
              {{ step.index + 1 }}
            }
          </div>
          <p class="text-xs font-semibold mt-2 hidden sm:block"
             [style.color]="currentStep() === step.index ? 'var(--accent)' : step.index < currentStep() ? '#10b981' : 'var(--text-muted)'">
            {{ step.label }}
          </p>
        </div>
        <!-- Connector line -->
        @if (step.index < steps.length - 1) {
          <div class="flex-1 h-0.5 mx-2 mt-[-16px] rounded-full transition-all"
               [style.background]="step.index < currentStep() ? '#10b981' : 'var(--border-color)'"></div>
        }
      }
    </div>
  </div>

  <!-- ── Step Content ──────────────────────────────────────────────────────── -->
  <form [formGroup]="form" (ngSubmit)="submit()">

    <!-- ════════ STEP 0 — IDENTITÉ ════════ -->
    @if (currentStep() === 0) {
      <div class="sms-card p-6 mb-4">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent); font-size: 18px; height: 18px; width: 18px">person</mat-icon>
          </div>
          <div>
            <h3 class="font-semibold" style="color: var(--text-primary)">Informations personnelles</h3>
            <p class="text-xs" style="color: var(--text-secondary)">Identité civile de l'élève</p>
          </div>
        </div>

        <!-- Photo placeholder -->
        <div class="flex items-center gap-4 mb-6 p-4 rounded-xl" style="background: var(--surface-2); border: 1px dashed var(--border-color)">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
            {{ photoInitials() }}
          </div>
          <div>
            <p class="text-sm font-medium" style="color: var(--text-primary)">Photo de profil</p>
            <p class="text-xs mt-0.5" style="color: var(--text-secondary)">JPG, PNG — max 2 MB</p>
            <button type="button"
                    class="mt-2 flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                    style="border: 1px solid var(--border-color); color: var(--text-secondary); background: var(--surface-1)">
              <mat-icon style="font-size: 14px; height: 14px; width: 14px">upload</mat-icon>
              Choisir une photo
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Prénom -->
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">
              Prénom <span style="color: #ef4444">*</span>
            </label>
            <input formControlName="firstName" type="text" placeholder="Ex: Awa"
                   [class]="inputClass('firstName')"
                   [style.border-color]="isInvalid('firstName') ? '#ef4444' : 'var(--border-color)'"
                   style="background: var(--surface-2); color: var(--text-primary)" />
            @if (isInvalid('firstName')) {
              <p class="text-xs mt-1 flex items-center gap-1" style="color: #ef4444">
                <mat-icon style="font-size: 12px; height: 12px; width: 12px">error</mat-icon>
                Le prénom est obligatoire
              </p>
            }
          </div>
          <!-- Nom -->
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">
              Nom de famille <span style="color: #ef4444">*</span>
            </label>
            <input formControlName="lastName" type="text" placeholder="Ex: Diallo"
                   [class]="inputClass('lastName')"
                   [style.border-color]="isInvalid('lastName') ? '#ef4444' : 'var(--border-color)'"
                   style="background: var(--surface-2); color: var(--text-primary)" />
            @if (isInvalid('lastName')) {
              <p class="text-xs mt-1 flex items-center gap-1" style="color: #ef4444">
                <mat-icon style="font-size: 12px; height: 12px; width: 12px">error</mat-icon>
                Le nom est obligatoire
              </p>
            }
          </div>
          <!-- Date naissance -->
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">
              Date de naissance <span style="color: #ef4444">*</span>
            </label>
            <input formControlName="dateNaissance" type="date"
                   [class]="inputClass('dateNaissance')"
                   [style.border-color]="isInvalid('dateNaissance') ? '#ef4444' : 'var(--border-color)'"
                   style="background: var(--surface-2); color: var(--text-primary)" />
            @if (isInvalid('dateNaissance')) {
              <p class="text-xs mt-1" style="color: #ef4444">La date de naissance est obligatoire</p>
            }
          </div>
          <!-- Genre -->
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">
              Genre <span style="color: #ef4444">*</span>
            </label>
            <div class="flex gap-3">
              @for (g of genres; track g.value) {
                <label class="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                       [style.border]="form.get('genre')?.value === g.value ? '2px solid var(--accent)' : '1px solid var(--border-color)'"
                       [style.background]="form.get('genre')?.value === g.value ? 'var(--accent-light)' : 'var(--surface-2)'">
                  <input type="radio" formControlName="genre" [value]="g.value" class="sr-only" />
                  <mat-icon style="font-size: 18px; height: 18px; width: 18px"
                            [style.color]="form.get('genre')?.value === g.value ? 'var(--accent)' : 'var(--text-muted)'">
                    {{ g.icon }}
                  </mat-icon>
                  <span class="text-sm font-medium"
                        [style.color]="form.get('genre')?.value === g.value ? 'var(--accent)' : 'var(--text-primary)'">
                    {{ g.label }}
                  </span>
                </label>
              }
            </div>
          </div>
          <!-- Lieu de naissance -->
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Lieu de naissance</label>
            <input formControlName="lieuNaissance" type="text" placeholder="Ex: Abidjan"
                   [class]="inputClass('lieuNaissance')"
                   style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)" />
          </div>
          <!-- Nationalité -->
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Nationalité</label>
            <select formControlName="nationalite"
                    class="w-full px-3 py-2.5 rounded-lg border text-sm"
                    style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
              @for (n of nationalites; track n) {
                <option [value]="n">{{ n }}</option>
              }
            </select>
          </div>
        </div>
      </div>
    }

    <!-- ════════ STEP 1 — CONTACT ════════ -->
    @if (currentStep() === 1) {
      <!-- Contact élève -->
      <div class="sms-card p-6 mb-4">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: rgba(16,185,129,0.1)">
            <mat-icon style="color: #10b981; font-size: 18px; height: 18px; width: 18px">contact_phone</mat-icon>
          </div>
          <div>
            <h3 class="font-semibold" style="color: var(--text-primary)">Coordonnées de l'élève</h3>
            <p class="text-xs" style="color: var(--text-secondary)">Email, téléphone et adresse</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Email</label>
            <input formControlName="email" type="email" placeholder="eleve@email.com"
                   [class]="inputClass('email')"
                   [style.border-color]="isInvalid('email') ? '#ef4444' : 'var(--border-color)'"
                   style="background: var(--surface-2); color: var(--text-primary)" />
            @if (isInvalid('email')) {
              <p class="text-xs mt-1" style="color: #ef4444">Format email invalide</p>
            }
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Téléphone</label>
            <input formControlName="phone" type="tel" placeholder="+225 07 XX XX XX XX"
                   [class]="inputClass('phone')"
                   style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Adresse</label>
            <input formControlName="adresse" type="text" placeholder="Quartier, rue..."
                   [class]="inputClass('adresse')"
                   style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Ville</label>
            <input formControlName="ville" type="text" placeholder="Ex: Abidjan"
                   [class]="inputClass('ville')"
                   style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)" />
          </div>
        </div>
      </div>

      <!-- Tuteur légal -->
      <div class="sms-card p-6 mb-4">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: rgba(139,92,246,0.1)">
            <mat-icon style="color: #8b5cf6; font-size: 18px; height: 18px; width: 18px">family_restroom</mat-icon>
          </div>
          <div>
            <h3 class="font-semibold" style="color: var(--text-primary)">Tuteur légal / Parent</h3>
            <p class="text-xs" style="color: var(--text-secondary)">Personne à contacter en cas d'urgence</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">
              Nom complet <span style="color: #ef4444">*</span>
            </label>
            <input formControlName="tuteurNom" type="text" placeholder="Ex: Diallo Ibrahim"
                   [class]="inputClass('tuteurNom')"
                   [style.border-color]="isInvalid('tuteurNom') ? '#ef4444' : 'var(--border-color)'"
                   style="background: var(--surface-2); color: var(--text-primary)" />
            @if (isInvalid('tuteurNom')) {
              <p class="text-xs mt-1" style="color: #ef4444">Le nom du tuteur est obligatoire</p>
            }
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Lien de parenté</label>
            <select formControlName="tuteurRelation"
                    class="w-full px-3 py-2.5 rounded-lg border text-sm"
                    style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
              <option value="Pere">Père</option>
              <option value="Mere">Mère</option>
              <option value="Tuteur">Tuteur</option>
              <option value="GrandParent">Grand-parent</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">
              Téléphone tuteur <span style="color: #ef4444">*</span>
            </label>
            <input formControlName="tuteurPhone" type="tel" placeholder="+225 07 XX XX XX XX"
                   [class]="inputClass('tuteurPhone')"
                   [style.border-color]="isInvalid('tuteurPhone') ? '#ef4444' : 'var(--border-color)'"
                   style="background: var(--surface-2); color: var(--text-primary)" />
            @if (isInvalid('tuteurPhone')) {
              <p class="text-xs mt-1" style="color: #ef4444">Le téléphone du tuteur est obligatoire</p>
            }
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Email tuteur</label>
            <input formControlName="tuteurEmail" type="email" placeholder="parent@email.com"
                   [class]="inputClass('tuteurEmail')"
                   style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)" />
          </div>
        </div>
      </div>
    }

    <!-- ════════ STEP 2 — SCOLARITÉ ════════ -->
    @if (currentStep() === 2) {
      <div class="sms-card p-6 mb-4">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: rgba(245,158,11,0.1)">
            <mat-icon style="color: #f59e0b; font-size: 18px; height: 18px; width: 18px">school</mat-icon>
          </div>
          <div>
            <h3 class="font-semibold" style="color: var(--text-primary)">Informations scolaires</h3>
            <p class="text-xs" style="color: var(--text-secondary)">Affectation académique et scolarité</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Année académique</label>
            <select formControlName="anneeAcademique"
                    class="w-full px-3 py-2.5 rounded-lg border text-sm"
                    style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
              <option value="2025-2026">2025 – 2026</option>
              <option value="2024-2025">2024 – 2025</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">
              Classe <span style="color: #ef4444">*</span>
            </label>
            <select formControlName="classePublicId"
                    class="w-full px-3 py-2.5 rounded-lg border text-sm font-medium"
                    [style.border-color]="isInvalid('classePublicId') ? '#ef4444' : 'var(--border-color)'"
                    style="background: var(--surface-2); color: var(--text-primary)">
              <option value="">— Choisir une classe —</option>
              @for (c of classes; track c.id) {
                <option [value]="c.id">{{ c.libelle }}</option>
              }
            </select>
            @if (isInvalid('classePublicId')) {
              <p class="text-xs mt-1" style="color: #ef4444">La classe est obligatoire</p>
            }
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Type d'inscription</label>
            <select formControlName="typeInscription"
                    class="w-full px-3 py-2.5 rounded-lg border text-sm"
                    style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
              <option value="NOUVELLE">Nouvelle inscription</option>
              <option value="RENOUVELLEMENT">Renouvellement</option>
              <option value="TRANSFERT">Transfert</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Statut</label>
            <select formControlName="statut"
                    class="w-full px-3 py-2.5 rounded-lg border text-sm"
                    style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Établissement précédent</label>
            <input formControlName="etablissementPrecedent" type="text"
                   placeholder="Nom de l'établissement précédent (optionnel)"
                   [class]="inputClass('etablissementPrecedent')"
                   style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">Observations</label>
            <textarea formControlName="observations" rows="3"
                      placeholder="Informations complémentaires, besoins particuliers..."
                      class="w-full px-3 py-2.5 rounded-lg border text-sm resize-none"
                      style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
            </textarea>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="sms-card p-6 mb-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: rgba(99,102,241,0.1)">
            <mat-icon style="color: #6366f1; font-size: 18px; height: 18px; width: 18px">folder_open</mat-icon>
          </div>
          <h3 class="font-semibold" style="color: var(--text-primary)">Documents requis</h3>
        </div>
        <div class="space-y-3">
          @for (doc of documents; track doc.label) {
            <div class="flex items-center justify-between p-3 rounded-lg"
                 style="background: var(--surface-2); border: 1px solid var(--border-color)">
              <div class="flex items-center gap-3">
                <mat-icon [style.color]="doc.provided ? '#10b981' : '#f59e0b'"
                          style="font-size: 20px; height: 20px; width: 20px">
                  {{ doc.provided ? 'check_circle' : 'pending' }}
                </mat-icon>
                <div>
                  <p class="text-sm font-medium" style="color: var(--text-primary)">{{ doc.label }}</p>
                  <p class="text-xs" style="color: var(--text-muted)">{{ doc.required ? 'Obligatoire' : 'Optionnel' }}</p>
                </div>
              </div>
              <button type="button" (click)="toggleDoc(doc)"
                      class="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-opacity hover:opacity-70"
                      [style.background]="doc.provided ? 'rgba(16,185,129,0.1)' : 'var(--surface-1)'"
                      [style.color]="doc.provided ? '#10b981' : 'var(--text-secondary)'"
                      [style.border]="'1px solid ' + (doc.provided ? 'rgba(16,185,129,0.3)' : 'var(--border-color)')">
                <mat-icon style="font-size: 14px; height: 14px; width: 14px">
                  {{ doc.provided ? 'check' : 'upload' }}
                </mat-icon>
                {{ doc.provided ? 'Fourni' : 'Ajouter' }}
              </button>
            </div>
          }
        </div>
      </div>
    }

    <!-- ════════ STEP 3 — RÉCAPITULATIF ════════ -->
    @if (currentStep() === 3) {
      <!-- Summary card -->
      <div class="sms-card p-6 mb-4">
        <!-- Avatar header -->
        <div class="flex items-center gap-4 mb-6 pb-5" style="border-bottom: 1px solid var(--border-color)">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
            {{ photoInitials() }}
          </div>
          <div>
            <h2 class="text-xl font-bold" style="color: var(--text-primary)">
              {{ form.get('firstName')?.value }} {{ form.get('lastName')?.value }}
            </h2>
            <p class="text-sm" style="color: var(--text-secondary)">
              {{ selectedClasseLabel() }} · {{ form.get('anneeAcademique')?.value }}
            </p>
            <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style="background: rgba(22,163,74,0.12); color: #16a34a">
              ACTIF
            </span>
          </div>
        </div>

        <!-- Section grids -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Identité -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wide mb-3" style="color: var(--text-muted)">Identité</h4>
            <div class="space-y-2">
              @for (field of summaryIdentite(); track field.label) {
                <div>
                  <p class="text-xs" style="color: var(--text-muted)">{{ field.label }}</p>
                  <p class="text-sm font-medium" style="color: var(--text-primary)">{{ field.value || '—' }}</p>
                </div>
              }
            </div>
          </div>
          <!-- Contact -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wide mb-3" style="color: var(--text-muted)">Contact</h4>
            <div class="space-y-2">
              @for (field of summaryContact(); track field.label) {
                <div>
                  <p class="text-xs" style="color: var(--text-muted)">{{ field.label }}</p>
                  <p class="text-sm font-medium" style="color: var(--text-primary)">{{ field.value || '—' }}</p>
                </div>
              }
            </div>
          </div>
          <!-- Scolarité -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wide mb-3" style="color: var(--text-muted)">Scolarité</h4>
            <div class="space-y-2">
              @for (field of summaryScolarite(); track field.label) {
                <div>
                  <p class="text-xs" style="color: var(--text-muted)">{{ field.label }}</p>
                  <p class="text-sm font-medium" style="color: var(--text-primary)">{{ field.value || '—' }}</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Documents status -->
        <div class="mt-5 pt-4" style="border-top: 1px solid var(--border-color)">
          <p class="text-xs font-bold uppercase tracking-wide mb-3" style="color: var(--text-muted)">Documents</p>
          <div class="flex flex-wrap gap-2">
            @for (doc of documents; track doc.label) {
              <span class="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    [style.background]="doc.provided ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'"
                    [style.color]="doc.provided ? '#10b981' : '#ef4444'">
                <mat-icon style="font-size: 12px; height: 12px; width: 12px">
                  {{ doc.provided ? 'check_circle' : 'cancel' }}
                </mat-icon>
                {{ doc.label }}
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Warning if required docs missing -->
      @if (hasRequiredDocsMissing()) {
        <div class="flex items-start gap-3 p-4 rounded-xl mb-4"
             style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.3)">
          <mat-icon style="color: #f59e0b; flex-shrink: 0">warning</mat-icon>
          <div>
            <p class="text-sm font-semibold" style="color: #d97706">Documents manquants</p>
            <p class="text-xs mt-0.5" style="color: var(--text-secondary)">
              Certains documents obligatoires n'ont pas été fournis. L'inscription peut tout de même être soumise, mais les documents devront être remis ultérieurement.
            </p>
          </div>
        </div>
      }
    }

    <!-- ── Navigation buttons ─────────────────────────────────────────────── -->
    <div class="flex items-center justify-between mt-6">
      <button type="button" (click)="prevStep()"
              [disabled]="currentStep() === 0"
              class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity"
              [class.opacity-40]="currentStep() === 0"
              [class.cursor-not-allowed]="currentStep() === 0"
              style="border: 1px solid var(--border-color); color: var(--text-secondary); background: var(--surface-1)">
        <mat-icon style="font-size: 18px; height: 18px; width: 18px">arrow_back</mat-icon>
        Précédent
      </button>

      <div class="flex items-center gap-3">
        <!-- Save draft -->
        <button type="button" (click)="saveDraft()"
                class="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-70"
                style="border: 1px solid var(--border-color); color: var(--text-secondary); background: var(--surface-1)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">save_alt</mat-icon>
          Brouillon
        </button>

        @if (currentStep() < steps.length - 1) {
          <button type="button" (click)="nextStep()"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style="background: var(--accent)">
            Suivant
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">arrow_forward</mat-icon>
          </button>
        } @else {
          <button type="submit" [disabled]="store.saving()"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style="background: #10b981">
            @if (store.saving()) {
              <mat-icon class="animate-spin" style="font-size: 18px; height: 18px; width: 18px">refresh</mat-icon>
              Enregistrement...
            } @else {
              <mat-icon style="font-size: 18px; height: 18px; width: 18px">how_to_reg</mat-icon>
              Inscrire l'élève
            }
          </button>
        }
      </div>
    </div>

  </form>

  <!-- ── Success Screen ─────────────────────────────────────────────────────── -->
  @if (submitted()) {
    <div class="fixed inset-0 flex items-center justify-center z-50"
         style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px)">
      <div class="sms-card p-8 max-w-md w-full mx-4 text-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
             style="background: rgba(16,185,129,0.15)">
          <mat-icon style="font-size: 36px; height: 36px; width: 36px; color: #10b981">check_circle</mat-icon>
        </div>
        <h2 class="text-xl font-bold mb-2" style="color: var(--text-primary)">Inscription réussie !</h2>
        <p class="text-sm mb-1" style="color: var(--text-secondary)">
          <strong>{{ form.get('firstName')?.value }} {{ form.get('lastName')?.value }}</strong>
          a été inscrit(e) avec succès.
        </p>
        <p class="text-xs mb-6" style="color: var(--text-muted)">
          Matricule généré · {{ generatedMatricule() }}
        </p>
        <div class="flex gap-3">
          <button (click)="goToList()"
                  class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                  style="border: 1px solid var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            Liste des élèves
          </button>
          <button (click)="resetForm()"
                  class="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style="background: var(--accent)">
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
export class StudentFormComponent {
  readonly store  = inject(StudentsStore);
  private  fb     = inject(FormBuilder);
  private  router = inject(Router);

  // ── Step state ────────────────────────────────────────────────────────────
  readonly steps       = STEPS;
  readonly classes     = CLASSES_DATA;
  readonly currentStep = signal(0);
  readonly draftSaved  = signal(false);
  readonly submitted   = signal(false);

  // ── Static data ───────────────────────────────────────────────────────────
  readonly genres = [
    { value: 'M', label: 'Masculin', icon: 'male' },
    { value: 'F', label: 'Féminin',  icon: 'female' },
  ];

  readonly nationalites = [
    'Ivoirienne','Sénégalaise','Malienne','Burkinabè','Guinéenne',
    'Ghanéenne','Togolaise','Béninoise','Nigériane','Camerounaise','Autre',
  ];

  readonly documents = [
    { label: 'Extrait de naissance',      required: true,  provided: false },
    { label: 'Photo d\'identité (x4)',    required: true,  provided: false },
    { label: 'Certificat de scolarité',   required: true,  provided: false },
    { label: 'Carnets scolaires (x2)',    required: false, provided: false },
    { label: 'Attestation de transfert',  required: false, provided: false },
    { label: 'Résultats du brevet/Bac',   required: false, provided: false },
  ];

  // ── Form ──────────────────────────────────────────────────────────────────
  readonly form = this.fb.group({
    // Étape 1 — Identité
    firstName:              ['', Validators.required],
    lastName:               ['', Validators.required],
    dateNaissance:          ['', Validators.required],
    genre:                  ['M', Validators.required],
    lieuNaissance:          [''],
    nationalite:            ['Ivoirienne'],
    // Étape 2 — Contact
    email:                  ['', Validators.email],
    phone:                  [''],
    adresse:                [''],
    ville:                  [''],
    tuteurNom:              ['', Validators.required],
    tuteurRelation:         ['Pere'],
    tuteurPhone:            ['', Validators.required],
    tuteurEmail:            [''],
    // Étape 3 — Scolarité
    anneeAcademique:        ['2025-2026'],
    classePublicId:         ['', Validators.required],
    typeInscription:        ['NOUVELLE'],
    statut:                 ['ACTIF'],
    etablissementPrecedent: [''],
    observations:           [''],
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

  readonly generatedMatricule = computed(() => {
    const year = new Date().getFullYear();
    return `LYCÉE-CI/${year}/${String(Math.floor(Math.random() * 900) + 100).padStart(6, '0')}`;
  });

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
    ];
  }

  summaryContact() {
    const v = this.form.value;
    return [
      { label: 'Email',             value: v.email ?? '' },
      { label: 'Téléphone',         value: v.phone ?? '' },
      { label: 'Adresse',           value: v.adresse ?? '' },
      { label: 'Tuteur légal',      value: v.tuteurNom ?? '' },
      { label: 'Téléphone tuteur',  value: v.tuteurPhone ?? '' },
    ];
  }

  summaryScolarite() {
    return [
      { label: 'Classe',        value: this.selectedClasseLabel() },
      { label: 'Année',         value: this.form.get('anneeAcademique')?.value ?? '' },
      { label: 'Inscription',   value: this.form.get('typeInscription')?.value ?? '' },
      { label: 'Statut',        value: this.form.get('statut')?.value ?? '' },
    ];
  }

  hasRequiredDocsMissing(): boolean {
    return this.documents.some(d => d.required && !d.provided);
  }

  // ── Step validation ───────────────────────────────────────────────────────
  private step0Fields = ['firstName', 'lastName', 'dateNaissance', 'genre'];
  private step1Fields = ['tuteurNom', 'tuteurPhone'];
  private step2Fields = ['classePublicId'];

  private stepValid(step: number): boolean {
    const fieldsMap: Record<number, string[]> = {
      0: this.step0Fields,
      1: this.step1Fields,
      2: this.step2Fields,
    };
    const fields = fieldsMap[step] ?? [];
    return fields.every(f => this.form.get(f)?.valid);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  nextStep(): void {
    const step = this.currentStep();
    const fieldsMap: Record<number, string[]> = {
      0: this.step0Fields,
      1: this.step1Fields,
      2: this.step2Fields,
    };
    const fields = fieldsMap[step] ?? [];
    fields.forEach(f => this.form.get(f)?.markAsTouched());

    if (this.stepValid(step)) {
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

  // ── Form helpers ──────────────────────────────────────────────────────────
  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  inputClass(field: string): string {
    return 'w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-colors';
  }

  // ── Step indicator styles ─────────────────────────────────────────────────
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

  // ── Submit ────────────────────────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.createStudent(this.form.value as any);
    this.submitted.set(true);
  }

  goToList(): void  { this.router.navigate(['/students']); }
  resetForm(): void {
    this.form.reset({ genre: 'M', nationalite: 'Ivoirienne', anneeAcademique: '2025-2026', typeInscription: 'NOUVELLE', statut: 'ACTIF' });
    this.currentStep.set(0);
    this.submitted.set(false);
    this.documents.forEach(d => d.provided = false);
  }
}
