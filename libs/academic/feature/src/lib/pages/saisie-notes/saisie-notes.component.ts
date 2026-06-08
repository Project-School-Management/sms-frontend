import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
  ElementRef, ViewChildren, QueryList, AfterViewInit,
} from '@angular/core';
import { CommonModule }        from '@angular/common';
import { RouterLink, Router }  from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule }       from '@angular/material/icon';
import { AcademicStore, MOCK_PROMOTIONS, MATIERES_BY_CLASSE } from '@sms/academic/data-access';
import { IEleveContext, TypeEvaluation, Periode, CasParticulier } from '@sms/shared/models';

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPE_EVAL_CFG: Record<TypeEvaluation, { label: string; icon: string; color: string }> = {
  DEVOIR:      { label: 'Devoir Surveillé', icon: 'assignment',         color: '#6366f1' },
  EXAMEN:      { label: 'Examen',           icon: 'fact_check',         color: '#dc2626' },
  TP:          { label: 'Travaux Pratiques',icon: 'science',            color: '#0891b2' },
  ORAL:        { label: 'Oral',             icon: 'record_voice_over',  color: '#d97706' },
  PROJET:      { label: 'Projet',           icon: 'folder_special',     color: '#16a34a' },
  RATTRAPAGE:  { label: 'Rattrapage',       icon: 'refresh',            color: '#7c3aed' },
};

const PERIODES: { value: Periode; label: string }[] = [
  { value: 'T1',    label: 'Trimestre 1'  },
  { value: 'T2',    label: 'Trimestre 2'  },
  { value: 'T3',    label: 'Trimestre 3'  },
  { value: 'S1',    label: 'Semestre 1'   },
  { value: 'S2',    label: 'Semestre 2'   },
  { value: 'ANNUEL',label: 'Annuel'       },
];

type Phase = 'contexte' | 'saisie' | 'recapitulatif';
type CasEntry = '' | 'ABS' | 'EXC' | 'DISP';

interface EntryRow {
  eleve:          IEleveContext;
  valeur:         string;    // raw input (number string or '')
  cas:            CasEntry;  // ABS / EXC / DISP or ''
  appreciation:   string;
  error:          string;
  touched:        boolean;
}

@Component({
  selector:        'sms-saisie-notes',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, MatIconModule],
  template: `
<div class="min-h-full" style="background: var(--content-bg)">
<div class="max-w-5xl mx-auto p-6">

  <!-- ── Breadcrumb ── -->
  <div class="flex items-center gap-2 mb-6 text-sm">
    <a routerLink="/academic" class="hover:opacity-70" style="color:var(--accent)">Notes & Évaluations</a>
    <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">chevron_right</mat-icon>
    <span style="color:var(--text-secondary)">Saisie des notes</span>
  </div>

  <!-- ── Phase stepper ── -->
  <div class="sms-card p-5 mb-6">
    <div class="flex items-center">
      @for (step of steps; track step.phase; let i = $index) {
        <div class="flex-1 flex flex-col items-center">
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all"
               [style.background]="stepBg(step.phase)"
               [style.color]="stepColor(step.phase)">
            @if (isStepDone(step.phase)) {
              <mat-icon style="font-size:18px;height:18px;width:18px">check</mat-icon>
            } @else {
              {{ i + 1 }}
            }
          </div>
          <p class="text-xs font-semibold mt-2 hidden sm:block"
             [style.color]="phase() === step.phase ? 'var(--accent)' : isStepDone(step.phase) ? '#10b981' : 'var(--text-muted)'">
            {{ step.label }}
          </p>
        </div>
        @if (i < steps.length - 1) {
          <div class="flex-1 h-0.5 mx-2 mt-[-16px] rounded-full transition-all"
               [style.background]="isStepDone(step.phase) ? '#10b981' : 'var(--border-color)'"></div>
        }
      }
    </div>
  </div>

  <!-- ════════════════════════════════════════════════
       PHASE 1 — CONTEXTE
  ════════════════════════════════════════════════ -->
  @if (phase() === 'contexte') {
    <div class="sms-card p-6 mb-4">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:var(--accent-light)">
          <mat-icon style="color:var(--accent);font-size:18px;height:18px;width:18px">tune</mat-icon>
        </div>
        <div>
          <h3 class="font-bold" style="color:var(--text-primary)">Définir le contexte d'évaluation</h3>
          <p class="text-xs" style="color:var(--text-secondary)">Ces informations permettront de charger automatiquement les élèves concernés</p>
        </div>
      </div>

      <form [formGroup]="contextForm" class="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <!-- Année académique -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Année académique <span style="color:#ef4444">*</span>
          </label>
          <select formControlName="anneeAcademique"
                  class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
            <option value="2025-2026">2025 – 2026 (en cours)</option>
            <option value="2024-2025">2024 – 2025</option>
          </select>
        </div>

        <!-- Classe -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Classe <span style="color:#ef4444">*</span>
          </label>
          <select formControlName="classeId" (change)="onClasseChange()"
                  class="w-full px-3 py-2.5 rounded-xl border text-sm font-medium"
                  [style.border-color]="ctxInvalid('classeId') ? '#ef4444' : 'var(--border-color)'"
                  style="background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Choisir une classe —</option>
            @for (p of promotions; track p.publicId) {
              <option [value]="p.publicId">{{ p.libelle }}</option>
            }
          </select>
        </div>

        <!-- Matière -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Matière <span style="color:#ef4444">*</span>
          </label>
          <select formControlName="matiereId" (change)="onMatiereChange()"
                  class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  [style.border-color]="ctxInvalid('matiereId') ? '#ef4444' : 'var(--border-color)'"
                  style="background:var(--surface-2);color:var(--text-primary)"
                  [disabled]="!contextForm.value.classeId">
            <option value="">— Sélectionner une matière —</option>
            @for (m of matieresDispo(); track m.publicId) {
              <option [value]="m.publicId">{{ m.libelle }} (coeff. {{ m.coeff }})</option>
            }
          </select>
          @if (selectedMatiereInfo()) {
            <p class="text-xs mt-1 flex items-center gap-1" style="color:var(--text-muted)">
              <mat-icon style="font-size:12px;height:12px;width:12px">person</mat-icon>
              {{ selectedMatiereInfo()!.enseignant }}
            </p>
          }
        </div>

        <!-- Type évaluation -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Type d'évaluation <span style="color:#ef4444">*</span>
          </label>
          <select formControlName="typeEval"
                  class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  [style.border-color]="ctxInvalid('typeEval') ? '#ef4444' : 'var(--border-color)'"
                  style="background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Choisir un type —</option>
            @for (t of typesEval; track t.value) {
              <option [value]="t.value">{{ t.label }}</option>
            }
          </select>
        </div>

        <!-- Période -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Période <span style="color:#ef4444">*</span>
          </label>
          <select formControlName="periode"
                  class="w-full px-3 py-2.5 rounded-xl border text-sm"
                  [style.border-color]="ctxInvalid('periode') ? '#ef4444' : 'var(--border-color)'"
                  style="background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Choisir une période —</option>
            @for (p of periodes; track p.value) {
              <option [value]="p.value">{{ p.label }}</option>
            }
          </select>
        </div>

        <!-- Date d'évaluation -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Date d'évaluation <span style="color:#ef4444">*</span>
          </label>
          <input formControlName="dateEval" type="date"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm"
                 [style.border-color]="ctxInvalid('dateEval') ? '#ef4444' : 'var(--border-color)'"
                 style="background:var(--surface-2);color:var(--text-primary)">
        </div>

        <!-- Coefficient -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Coefficient
          </label>
          <input formControlName="coefficient" type="number" min="1" max="10"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <!-- Titre / Intitulé -->
        <div>
          <label class="block text-sm font-semibold mb-1.5" style="color:var(--text-secondary)">
            Intitulé de l'évaluation
          </label>
          <input formControlName="titre" type="text"
                 placeholder="Ex: DS N°1 sur les équations"
                 class="w-full px-3 py-2.5 rounded-xl border text-sm"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

      </form>

      <!-- Aperçu contexte sélectionné -->
      @if (contextForm.valid) {
        <div class="mt-5 p-4 rounded-xl flex items-center gap-4"
             style="background:var(--accent-light);border:1px solid var(--accent)">
          <mat-icon style="color:var(--accent);flex-shrink:0">check_circle</mat-icon>
          <div class="text-sm" style="color:var(--text-primary)">
            <strong>{{ selectedClasseLibelle() }}</strong> ·
            <strong>{{ selectedMatiereInfo()?.libelle }}</strong> ·
            <strong>{{ typeCfg(contextForm.value.typeEval)?.label }}</strong> ·
            {{ periodeLabel(contextForm.value.periode) }} ·
            {{ contextForm.value.dateEval | date:'dd/MM/yyyy' }}
          </div>
        </div>
      }
    </div>

    <!-- Navigation -->
    <div class="flex justify-end">
      <button (click)="loadEleves()"
              [disabled]="contextForm.invalid || store.loading()"
              class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              style="background:var(--accent)">
        @if (store.loading()) {
          <mat-icon class="animate-spin" style="font-size:18px;height:18px;width:18px">refresh</mat-icon>
          Chargement...
        } @else {
          Charger les élèves
          <mat-icon style="font-size:18px;height:18px;width:18px">arrow_forward</mat-icon>
        }
      </button>
    </div>
  }

  <!-- ════════════════════════════════════════════════
       PHASE 2 — SAISIE EN MASSE
  ══════��═════════════════════════════════════════ -->
  @if (phase() === 'saisie') {
    <div class="flex flex-col gap-4">

      <!-- Context reminder -->
      <div class="sms-card px-5 py-3 flex flex-wrap items-center gap-3">
        <mat-icon [style.color]="typeCfg(contextForm.value.typeEval)?.color ?? 'var(--accent)'"
                  style="font-size:20px;height:20px;width:20px">
          {{ typeCfg(contextForm.value.typeEval)?.icon ?? 'grade' }}
        </mat-icon>
        <div class="flex-1 text-sm" style="color:var(--text-primary)">
          <strong>{{ contextForm.value.titre || typeCfg(contextForm.value.typeEval)?.label }}</strong> ·
          {{ selectedMatiereInfo()?.libelle }} · {{ selectedClasseLibelle() }}
        </div>
        <div class="flex items-center gap-3 text-xs" style="color:var(--text-secondary)">
          <span>{{ periodeLabel(contextForm.value.periode) }}</span>
          <span>·</span>
          <span>{{ contextForm.value.dateEval | date:'dd/MM/yyyy' }}</span>
          <span>·</span>
          <span>coeff. {{ contextForm.value.coefficient }}</span>
        </div>
        <button (click)="phase.set('contexte')"
                class="flex items-center gap-1 text-xs hover:opacity-70" style="color:var(--accent)">
          <mat-icon style="font-size:13px;height:13px;width:13px">edit</mat-icon>
          Modifier
        </button>
      </div>

      <!-- Live stats bar -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div class="sms-card p-3 text-center">
          <p class="text-lg font-bold" style="color:var(--text-primary)">{{ rows().length }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">Élèves</p>
        </div>
        <div class="sms-card p-3 text-center">
          <p class="text-lg font-bold" [style.color]="liveStats().nbSaisis === rows().length ? '#16a34a' : 'var(--accent)'">
            {{ liveStats().nbSaisis }}
          </p>
          <p class="text-xs" style="color:var(--text-secondary)">Saisis</p>
        </div>
        <div class="sms-card p-3 text-center">
          <p class="text-lg font-bold" [style.color]="noteColor(liveStats().moyenne)">
            {{ liveStats().moyenne > 0 ? liveStats().moyenne.toFixed(2) : '—' }}/20
          </p>
          <p class="text-xs" style="color:var(--text-secondary)">Moy. actuelle</p>
        </div>
        <div class="sms-card p-3 text-center">
          <p class="text-lg font-bold" style="color:#dc2626">{{ liveStats().nbAbs }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">Absents</p>
        </div>
        <div class="sms-card p-3 text-center">
          <p class="text-lg font-bold" style="color:#d97706">{{ liveStats().nbErrors }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">Erreurs</p>
        </div>
      </div>

      <!-- Table de saisie -->
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 border-b flex items-center gap-2" style="border-color:var(--border-color)">
          <mat-icon style="color:var(--accent);font-size:18px;height:18px;width:18px">edit_note</mat-icon>
          <h3 class="font-semibold" style="color:var(--text-primary)">Saisie des notes</h3>
          <span class="text-xs ml-1 px-2 py-0.5 rounded-full" style="background:var(--surface-2);color:var(--text-muted)">
            Tab / Entrée pour naviguer entre les lignes
          </span>
          <div class="ml-auto flex items-center gap-2">
            <button (click)="fillAllAbs()"
                    class="text-xs px-2.5 py-1 rounded-lg border transition-opacity hover:opacity-70"
                    style="border-color:rgba(239,68,68,0.3);color:#dc2626;background:rgba(239,68,68,0.06)">
              Tout ABS
            </button>
            <button (click)="clearAll()"
                    class="text-xs px-2.5 py-1 rounded-lg border transition-opacity hover:opacity-70"
                    style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
              Effacer tout
            </button>
          </div>
        </div>

        <!-- Skeleton loading -->
        @if (store.loading()) {
          <div class="p-4 space-y-2">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="flex items-center gap-4 p-3 rounded-xl" style="background:var(--surface-2)">
                <div class="w-8 h-8 rounded-full" style="background:var(--border-color)"></div>
                <div class="flex-1 h-4 rounded" style="background:var(--border-color)"></div>
                <div class="w-28 h-8 rounded-xl" style="background:var(--border-color)"></div>
                <div class="w-20 h-8 rounded-xl" style="background:var(--border-color)"></div>
              </div>
            }
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead style="background:var(--surface-2)">
                <tr>
                  <th class="text-left px-4 py-3 font-medium" style="color:var(--text-secondary)">#</th>
                  <th class="text-left px-4 py-3 font-medium" style="color:var(--text-secondary)">Élève</th>
                  <th class="text-left px-4 py-3 font-medium hidden sm:table-cell" style="color:var(--text-secondary)">Matricule</th>
                  <th class="text-center px-4 py-3 font-medium" style="color:var(--text-secondary)">Note /20</th>
                  <th class="text-center px-4 py-3 font-medium" style="color:var(--text-secondary)">Cas particulier</th>
                  <th class="text-left px-4 py-3 font-medium hidden lg:table-cell" style="color:var(--text-secondary)">Appréciation</th>
                </tr>
              </thead>
              <tbody>
                @for (row of rows(); track row.eleve.publicId; let i = $index) {
                  <tr class="border-t" style="border-color:var(--border-color)"
                      [style.background]="row.cas ? 'rgba(245,158,11,0.04)' : row.error ? 'rgba(239,68,68,0.04)' : 'transparent'">
                    <!-- Rang -->
                    <td class="px-4 py-2 text-xs font-medium" style="color:var(--text-muted)">{{ i + 1 }}</td>

                    <!-- Élève -->
                    <td class="px-4 py-2">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                             [style.background]="row.eleve.genre === 'F' ? '#ec4899' : '#6366f1'">
                          {{ initiales(row.eleve.nom) }}
                        </div>
                        <span class="font-medium" style="color:var(--text-primary)">{{ row.eleve.nom }}</span>
                      </div>
                    </td>

                    <!-- Matricule -->
                    <td class="px-4 py-2 font-mono text-xs hidden sm:table-cell" style="color:var(--text-secondary)">
                      {{ row.eleve.matricule }}
                    </td>

                    <!-- Note input -->
                    <td class="px-4 py-2">
                      <div class="flex flex-col items-center gap-0.5">
                        <input
                          [id]="'note-' + i"
                          type="number" min="0" max="20" step="0.5"
                          placeholder="—"
                          [(ngModel)]="row.valeur"
                          (ngModelChange)="onNoteChange(row)"
                          (keydown.enter)="focusNext(i)"
                          (keydown.tab)="focusNext(i)"
                          [disabled]="!!row.cas"
                          class="w-24 px-3 py-1.5 rounded-xl border text-center text-sm font-semibold outline-none transition-all"
                          [style.border-color]="row.error ? '#ef4444' : row.valeur ? 'var(--accent)' : 'var(--border-color)'"
                          [style.color]="noteColor(+row.valeur)"
                          [style.background]="row.cas ? 'var(--surface-2)' : 'var(--surface-1)'"
                          [style.opacity]="row.cas ? '0.4' : '1'">
                        @if (row.error) {
                          <span class="text-xs" style="color:#ef4444">{{ row.error }}</span>
                        }
                      </div>
                    </td>

                    <!-- Cas particulier -->
                    <td class="px-4 py-2">
                      <div class="flex items-center gap-1 justify-center">
                        @for (cas of casOptions; track cas.value) {
                          <button (click)="toggleCas(row, cas.value)"
                                  class="px-2 py-1 rounded-lg text-xs font-bold border transition-all"
                                  [style.background]="row.cas === cas.value ? cas.activeBg : 'var(--surface-2)'"
                                  [style.color]="row.cas === cas.value ? cas.activeColor : 'var(--text-muted)'"
                                  [style.border-color]="row.cas === cas.value ? cas.activeBg : 'var(--border-color)'"
                                  [title]="cas.label">
                            {{ cas.value }}
                          </button>
                        }
                      </div>
                    </td>

                    <!-- Appréciation -->
                    <td class="px-4 py-2 hidden lg:table-cell">
                      <input type="text" [(ngModel)]="row.appreciation"
                             placeholder="Appréciation optionnelle…"
                             class="w-full px-2 py-1 rounded-lg border text-xs outline-none"
                             style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-secondary)">
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6">
                      <div class="flex items-center justify-center py-12 gap-2" style="color:var(--text-secondary)">
                        <mat-icon>people_outline</mat-icon>
                        Aucun élève chargé
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between gap-3">
        <button (click)="phase.set('contexte')"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-70"
                style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-1)">
          <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
          Retour
        </button>

        <div class="flex items-center gap-3">
          <button (click)="saveDraft()"
                  [disabled]="store.saving()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-70 disabled:opacity-40"
                  style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-1)">
            <mat-icon style="font-size:16px;height:16px;width:16px">save_alt</mat-icon>
            Brouillon
          </button>
          <button (click)="submitSaisie()"
                  [disabled]="store.saving() || liveStats().nbErrors > 0"
                  class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  style="background:var(--accent)">
            @if (store.saving()) {
              <mat-icon class="animate-spin" style="font-size:18px;height:18px;width:18px">refresh</mat-icon>
              Enregistrement…
            } @else {
              <mat-icon style="font-size:18px;height:18px;width:18px">send</mat-icon>
              Soumettre
            }
          </button>
        </div>
      </div>

      @if (store.error()) {
        <div class="flex items-center gap-2 p-3 rounded-xl" style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2)">
          <mat-icon style="color:#dc2626;font-size:16px;height:16px;width:16px">error</mat-icon>
          <span class="text-sm" style="color:#dc2626">{{ store.error() }}</span>
        </div>
      }
    </div>
  }

  <!-- ════════════════════════════════════════════════
       PHASE 3 — RÉCAPITULATIF & PUBLICATION
  ════════════════════════════════════════════════ -->
  @if (phase() === 'recapitulatif') {
    <div class="flex flex-col gap-5">

      <!-- Header succès -->
      <div class="sms-card p-6 flex items-start gap-4">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
             style="background:rgba(22,163,74,0.12)">
          <mat-icon style="color:#16a34a;font-size:28px;height:28px;width:28px">task_alt</mat-icon>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold mb-1" style="color:var(--text-primary)">Notes soumises avec succès</h2>
          <p class="text-sm" style="color:var(--text-secondary)">
            {{ liveStats().nbSaisis }} notes saisies ·
            {{ selectedMatiereInfo()?.libelle }} · {{ selectedClasseLibelle() }} ·
            {{ periodeLabel(contextForm.value.periode) }}
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-sm font-bold" style="background:rgba(245,158,11,0.12);color:#d97706">
          En attente de validation
        </span>
      </div>

      <!-- Stats finales -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="sms-card p-5 text-center">
          <p class="text-3xl font-black" [style.color]="noteColor(liveStats().moyenne)">
            {{ liveStats().moyenne.toFixed(2) }}
          </p>
          <p class="text-xs mt-1" style="color:var(--text-secondary)">Moyenne de classe</p>
        </div>
        <div class="sms-card p-5 text-center">
          <p class="text-3xl font-black" style="color:#16a34a">{{ liveStats().tauxReussite }}%</p>
          <p class="text-xs mt-1" style="color:var(--text-secondary)">Taux de réussite</p>
        </div>
        <div class="sms-card p-5 text-center">
          <p class="text-3xl font-black" style="color:#dc2626">{{ liveStats().nbAbs }}</p>
          <p class="text-xs mt-1" style="color:var(--text-secondary)">Absents / Excusés</p>
        </div>
        <div class="sms-card p-5 text-center">
          <p class="text-3xl font-black" style="color:var(--accent)">{{ liveStats().nbSaisis }}</p>
          <p class="text-xs mt-1" style="color:var(--text-secondary)">Notes saisies</p>
        </div>
      </div>

      <!-- Distribution des notes (CSS bar chart) -->
      <div class="sms-card p-5">
        <h3 class="font-semibold mb-4" style="color:var(--text-primary)">Distribution des notes</h3>
        <div class="flex items-end gap-2" style="height:80px">
          @for (bar of distribution(); track bar.label) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs font-semibold" [style.color]="bar.color">
                {{ bar.count > 0 ? bar.count : '' }}
              </span>
              <div class="w-full rounded-t transition-all"
                   [style.background]="bar.color"
                   [style.height.px]="bar.count > 0 ? Math.max(6, (bar.count / maxBarCount()) * 60) : 0"
                   style="opacity:0.75">
              </div>
              <span class="text-xs" style="color:var(--text-muted)">{{ bar.label }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Tableau récap des notes -->
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 border-b" style="border-color:var(--border-color)">
          <h3 class="font-semibold" style="color:var(--text-primary)">Récapitulatif des notes</h3>
        </div>
        <div class="overflow-x-auto max-h-64 overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="sticky top-0" style="background:var(--surface-2)">
              <tr>
                <th class="text-left px-4 py-2 font-medium text-xs" style="color:var(--text-secondary)">Élève</th>
                <th class="text-center px-4 py-2 font-medium text-xs" style="color:var(--text-secondary)">Note</th>
                <th class="text-center px-4 py-2 font-medium text-xs" style="color:var(--text-secondary)">Statut</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.eleve.publicId) {
                <tr class="border-t" style="border-color:var(--border-color)">
                  <td class="px-4 py-2 font-medium" style="color:var(--text-primary)">{{ row.eleve.nom }}</td>
                  <td class="px-4 py-2 text-center">
                    @if (row.cas) {
                      <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                            style="background:rgba(245,158,11,0.12);color:#d97706">{{ row.cas }}</span>
                    } @else if (row.valeur) {
                      <span class="font-bold" [style.color]="noteColor(+row.valeur)">{{ row.valeur }}/20</span>
                    } @else {
                      <span style="color:var(--text-muted)">—</span>
                    }
                  </td>
                  <td class="px-4 py-2 text-center">
                    <span class="px-1.5 py-0.5 rounded text-xs font-semibold"
                          style="background:rgba(245,158,11,0.12);color:#d97706">SAISIE</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Workflow steps -->
      <div class="sms-card p-5">
        <h3 class="font-semibold mb-4" style="color:var(--text-primary)">Workflow de validation</h3>
        <div class="flex items-center gap-0">
          @for (step of workflowSteps; track step.label; let i = $index) {
            <div class="flex items-center gap-2 flex-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                   [style.background]="step.done ? 'rgba(22,163,74,0.15)' : step.current ? 'var(--accent-light)' : 'var(--surface-2)'"
                   [style.color]="step.done ? '#16a34a' : step.current ? 'var(--accent)' : 'var(--text-muted)'">
                <mat-icon *ngIf="step.done" style="font-size:14px;height:14px;width:14px">check</mat-icon>
                @if (!step.done) { {{ i + 1 }} }
              </div>
              <span class="text-xs font-medium"
                    [style.color]="step.done ? '#16a34a' : step.current ? 'var(--accent)' : 'var(--text-muted)'">
                {{ step.label }}
              </span>
            </div>
            @if (i < workflowSteps.length - 1) {
              <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted);flex-shrink:0">chevron_right</mat-icon>
            }
          }
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center gap-3 justify-between">
        <button (click)="phase.set('saisie')"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-70"
                style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-1)">
          <mat-icon style="font-size:16px;height:16px;width:16px">edit</mat-icon>
          Modifier les notes
        </button>

        <div class="flex items-center gap-3">
          <a routerLink="/academic"
             class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
             style="border:1px solid var(--border-color);color:var(--text-secondary)">
            Retour aux notes
          </a>
          <button (click)="showPublishConfirm.set(true)"
                  [disabled]="store.saving()"
                  class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  style="background:#16a34a">
            <mat-icon style="font-size:18px;height:18px;width:18px">publish</mat-icon>
            Soumettre pour validation
          </button>
        </div>
      </div>
    </div>
  }

</div>
</div>

<!-- ══ DIALOG : Confirmation publication ══ -->
@if (showPublishConfirm()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
       style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px)">
    <div class="sms-card w-full max-w-md overflow-hidden">
      <div class="px-6 py-5 border-b" style="border-color:var(--border-color)">
        <h3 class="font-bold" style="color:var(--text-primary)">Soumettre pour validation</h3>
        <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
          Les notes seront soumises au responsable pédagogique pour validation.
        </p>
      </div>
      <div class="px-6 py-4">
        <div class="flex items-start gap-3 p-4 rounded-xl"
             style="background:rgba(22,163,74,0.06);border:1px solid rgba(22,163,74,0.2)">
          <mat-icon style="color:#16a34a;flex-shrink:0;font-size:18px;height:18px;width:18px;margin-top:1px">info</mat-icon>
          <p class="text-sm" style="color:var(--text-secondary)">
            <strong>{{ liveStats().nbSaisis }} notes</strong> · {{ selectedMatiereInfo()?.libelle }} ·
            {{ selectedClasseLibelle() }} — Une fois soumises, les modifications nécessiteront une autorisation.
          </p>
        </div>
      </div>
      <div class="px-6 py-4 border-t flex gap-3 justify-end" style="border-color:var(--border-color)">
        <button (click)="showPublishConfirm.set(false)"
                class="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                style="border-color:var(--border-color);color:var(--text-secondary)">
          Annuler
        </button>
        <button (click)="publishNotes()"
                [disabled]="store.saving()"
                class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                style="background:#16a34a">
          @if (store.saving()) {
            <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
          } @else {
            <mat-icon style="font-size:16px;height:16px;width:16px">send</mat-icon>
          }
          Confirmer
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class SaisieNotesComponent implements OnInit {
  protected readonly store  = inject(AcademicStore);
  private  readonly router  = inject(Router);
  private  readonly fb      = inject(FormBuilder);

  readonly Math = Math;

  // ── Static data ───────────────────────────────────────────────────────────
  readonly promotions   = MOCK_PROMOTIONS;
  readonly typesEval    = Object.entries(TYPE_EVAL_CFG).map(([value, cfg]) => ({ value: value as TypeEvaluation, ...cfg }));
  readonly periodes     = PERIODES;
  readonly casOptions   = [
    { value: 'ABS'  as CasEntry, label: 'Absent',   activeBg: 'rgba(239,68,68,0.15)',    activeColor: '#dc2626' },
    { value: 'EXC'  as CasEntry, label: 'Excusé',   activeBg: 'rgba(245,158,11,0.15)',   activeColor: '#d97706' },
    { value: 'DISP' as CasEntry, label: 'Dispensé', activeBg: 'rgba(107,114,128,0.15)',  activeColor: '#6b7280' },
  ];

  // ── UI state ──────────────────────────────────────────────────────────────
  readonly phase             = signal<Phase>('contexte');
  readonly rows              = signal<EntryRow[]>([]);
  readonly showPublishConfirm = signal(false);
  readonly currentEvalId     = signal('');

  // ── Steps config ─────────────────────────────────────────────────────────
  readonly steps = [
    { phase: 'contexte'       as Phase, label: 'Contexte'    },
    { phase: 'saisie'         as Phase, label: 'Saisie'      },
    { phase: 'recapitulatif'  as Phase, label: 'Récapitulatif' },
  ];

  // ── Form ─────────────────────────────────────────────���────────────────────
  readonly contextForm = this.fb.group({
    anneeAcademique: ['2025-2026'],
    classeId:        ['', Validators.required],
    matiereId:       ['', Validators.required],
    typeEval:        ['', Validators.required],
    periode:         ['', Validators.required],
    dateEval:        ['', Validators.required],
    coefficient:     [1, [Validators.required, Validators.min(1)]],
    titre:           [''],
  });

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly matieresDispo = computed(() => {
    const id = this.contextForm.value.classeId;
    return id ? (MATIERES_BY_CLASSE[id] ?? []) : [];
  });

  readonly selectedMatiereInfo = computed(() => {
    const id = this.contextForm.value.matiereId;
    return this.matieresDispo().find(m => m.publicId === id) ?? null;
  });

  readonly selectedClasseLibelle = computed(() => {
    const id = this.contextForm.value.classeId;
    return this.promotions.find(p => p.publicId === id)?.libelle ?? '';
  });

  readonly liveStats = computed(() => {
    const r = this.rows();
    const valid = r.filter(x => !x.cas && x.valeur !== '' && !x.error);
    const values = valid.map(x => parseFloat(x.valeur)).filter(v => !isNaN(v));
    const nbAbs  = r.filter(x => !!x.cas).length;
    const moy    = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    return {
      nbSaisis:    r.filter(x => x.cas || x.valeur !== '').length,
      nbAbs,
      nbErrors:    r.filter(x => !!x.error).length,
      moyenne:     moy,
      tauxReussite: values.length ? Math.round((values.filter(v => v >= 10).length / values.length) * 100) : 0,
    };
  });

  readonly distribution = computed(() => {
    const values = this.rows()
      .filter(r => !r.cas && r.valeur !== '')
      .map(r => parseFloat(r.valeur))
      .filter(v => !isNaN(v));
    const bars = [
      { label: '0-5',   range: [0,5],   color: '#dc2626' },
      { label: '5-8',   range: [5,8],   color: '#ef4444' },
      { label: '8-10',  range: [8,10],  color: '#f97316' },
      { label: '10-12', range: [10,12], color: '#d97706' },
      { label: '12-14', range: [12,14], color: '#2563eb' },
      { label: '14-16', range: [14,16], color: '#16a34a' },
      { label: '16-20', range: [16,20.1],color: '#059669' },
    ];
    return bars.map(b => ({
      ...b,
      count: values.filter(v => v >= b.range[0] && v < b.range[1]).length,
    }));
  });

  readonly maxBarCount = computed(() =>
    Math.max(...this.distribution().map(b => b.count), 1)
  );

  readonly workflowSteps = [
    { label: 'Saisie',     done: true,  current: false },
    { label: 'Soumis',     done: false, current: true  },
    { label: 'Validé',     done: false, current: false },
    { label: 'Publié',     done: false, current: false },
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadPromotions();
  }

  // ── Phase navigation ──────────────────────────────────────────────────────
  isStepDone(p: Phase): boolean {
    const order: Phase[] = ['contexte', 'saisie', 'recapitulatif'];
    return order.indexOf(this.phase()) > order.indexOf(p);
  }

  stepBg(p: Phase): string {
    if (this.isStepDone(p))    return 'rgba(16,185,129,0.15)';
    if (this.phase() === p)    return 'var(--accent)';
    return 'var(--surface-2)';
  }
  stepColor(p: Phase): string {
    if (this.isStepDone(p)) return '#10b981';
    if (this.phase() === p) return '#fff';
    return 'var(--text-muted)';
  }

  // ── Context form ──────────────────────────────────────────────────────────
  ctxInvalid(field: string): boolean {
    const c = this.contextForm.get(field);
    return !!(c?.invalid && c?.touched);
  }

  onClasseChange(): void {
    this.contextForm.patchValue({ matiereId: '' });
    this.rows.set([]);
  }

  onMatiereChange(): void {
    const mat = this.selectedMatiereInfo();
    if (mat) this.contextForm.patchValue({ coefficient: mat.coeff });
  }

  loadEleves(): void {
    this.contextForm.markAllAsTouched();
    if (this.contextForm.invalid) return;
    const classeId = this.contextForm.value.classeId!;
    this.store.loadElevesSaisie(classeId);
    // Subscribe once to populate rows
    const interval = setInterval(() => {
      const eleves = this.store.elevesSaisie();
      if (!this.store.loading() && eleves.length > 0) {
        this.rows.set(eleves.map(e => ({
          eleve: e, valeur: '', cas: '', appreciation: '', error: '', touched: false,
        })));
        this.phase.set('saisie');
        clearInterval(interval);
      }
    }, 100);
  }

  // ── Note validation ─────────────────��─────────────────────────────────────
  onNoteChange(row: EntryRow): void {
    row.touched = true;
    row.error   = '';
    if (row.valeur === '' || row.valeur === null) return;
    const v = parseFloat(row.valeur);
    if (isNaN(v))      { row.error = 'Invalide';     return; }
    if (v < 0)         { row.error = 'Min : 0';      return; }
    if (v > 20)        { row.error = 'Max : 20';     return; }
    if (v % 0.5 !== 0) { row.error = 'Multiple 0.5'; return; }
  }

  toggleCas(row: EntryRow, cas: CasEntry): void {
    row.cas   = row.cas === cas ? '' : cas;
    row.valeur = '';
    row.error  = '';
  }

  // ── Keyboard navigation ────────────────────────────────────────────���──────
  focusNext(currentIndex: number): void {
    const next = document.getElementById(`note-${currentIndex + 1}`);
    if (next) (next as HTMLInputElement).focus();
  }

  // ── Bulk helpers ──────────────────────────────────────────────────────────
  fillAllAbs(): void {
    this.rows.update(rs => rs.map(r => ({ ...r, cas: 'ABS' as CasEntry, valeur: '', error: '' })));
  }

  clearAll(): void {
    this.rows.update(rs => rs.map(r => ({ ...r, cas: '' as CasEntry, valeur: '', error: '', touched: false })));
  }

  // ── Save / Submit ─────────────────────────────────────────���───────────────
  private buildEntries(statut: 'BROUILLON' | 'SAISIE') {
    return {
      entries: this.rows().map(r => ({
        studentPublicId: r.eleve.publicId,
        valeur:          r.cas ? null : (r.valeur !== '' ? parseFloat(r.valeur) : null),
        casParticulier:  r.cas || undefined,
        appreciation:    r.appreciation || undefined,
      })),
      statut,
    };
  }

  saveDraft(): void {
    const evalId = this.currentEvalId() || `eval-draft-${Date.now()}`;
    if (!this.currentEvalId()) this.currentEvalId.set(evalId);
    this.store.saveNotesBatch({ evaluationPublicId: evalId, ...this.buildEntries('BROUILLON') });
  }

  submitSaisie(): void {
    this.rows.update(rs => { rs.forEach(r => this.onNoteChange(r)); return [...rs]; });
    if (this.liveStats().nbErrors > 0) return;
    const evalId = this.currentEvalId() || `eval-${Date.now()}`;
    if (!this.currentEvalId()) this.currentEvalId.set(evalId);
    this.store.saveNotesBatch({ evaluationPublicId: evalId, ...this.buildEntries('SAISIE') });
    setTimeout(() => {
      if (!this.store.error()) this.phase.set('recapitulatif');
    }, 450);
  }

  publishNotes(): void {
    const evalId = this.currentEvalId();
    if (evalId) this.store.validateEvaluation(evalId);
    setTimeout(() => {
      this.showPublishConfirm.set(false);
      if (!this.store.error()) this.router.navigate(['/academic']);
    }, 500);
  }

  // ── UI helpers ────────────────────────────────────────────────────────────
  noteColor(v: number | null | string): string {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (n === null || isNaN(n as number)) return 'var(--text-muted)';
    if ((n as number) >= 16) return '#16a34a';
    if ((n as number) >= 14) return '#2563eb';
    if ((n as number) >= 10) return 'var(--text-primary)';
    return '#dc2626';
  }

  typeCfg(type: string | null | undefined) {
    return type ? TYPE_EVAL_CFG[type as TypeEvaluation] : null;
  }

  periodeLabel(p: string | null | undefined): string {
    return PERIODES.find(x => x.value === p)?.label ?? (p ?? '');
  }

  initiales(nom: string): string {
    return nom.split(' ').map(p => p[0] ?? '').slice(0, 2).join('');
  }
}
