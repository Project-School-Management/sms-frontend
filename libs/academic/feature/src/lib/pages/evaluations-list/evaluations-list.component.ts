import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AcademicStore } from '@sms/academic/data-access';
import { ReferenceStore } from '@sms/config-system/data-access';
import { ToastService }   from '@sms/shared/ui';
import { IEvaluation, TypeEvaluation, Periode } from '@sms/shared/models';

// ── Config visuels ────────────────────────────────────────────────────────────
const STATUT_CFG: Record<string, { label: string; bg: string; color: string; icon: string; next?: string }> = {
  BROUILLON: { label:'Brouillon',  bg:'rgba(107,114,128,0.10)', color:'#6b7280', icon:'draft',              next:'SAISIE'  },
  SAISIE:    { label:'En saisie',  bg:'rgba(37,99,235,0.10)',   color:'var(--accent)', icon:'edit_note',     next:'VALIDEE' },
  VALIDEE:   { label:'Validée',    bg:'rgba(245,158,11,0.10)', color:'#d97706', icon:'verified',             next:'PUBLIE'  },
  PUBLIE:    { label:'Publiée',    bg:'rgba(22,163,74,0.10)',   color:'#16a34a', icon:'public',              next:undefined },
};

const TYPE_CFG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  DEVOIR:      { label:'Devoir',          icon:'assignment',         color:'#6366f1', bg:'rgba(99,102,241,0.10)'  },
  EXAMEN:      { label:'Examen',          icon:'quiz',               color:'#dc2626', bg:'rgba(220,38,38,0.10)'   },
  TP:          { label:'TP',              icon:'science',            color:'#10b981', bg:'rgba(16,185,129,0.10)'  },
  ORAL:        { label:'Oral',            icon:'record_voice_over',  color:'#8b5cf6', bg:'rgba(139,92,246,0.10)'  },
  PROJET:      { label:'Projet',          icon:'folder_special',     color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
  RATTRAPAGE:  { label:'Rattrapage',      icon:'replay',             color:'#6b7280', bg:'rgba(107,114,128,0.10)' },
};

const PERIODE_OPTIONS: { value: Periode; label: string }[] = [
  { value:'T1', label:'Trimestre 1' }, { value:'T2', label:'Trimestre 2' },
  { value:'T3', label:'Trimestre 3' }, { value:'S1', label:'Semestre 1'  },
  { value:'S2', label:'Semestre 2'  }, { value:'ANNUEL', label:'Annuel'  },
];

type EvalTab = 'all' | 'BROUILLON' | 'SAISIE' | 'VALIDEE' | 'PUBLIE';

interface EvalForm {
  publicId?:          string;
  titre:              string;
  type:               TypeEvaluation;
  periode:            Periode;
  matierePublicId:    string;
  coefficient:        number;
  promotionPublicId:  string;
  enseignantNom:      string;
  dateEvaluation:     string;
  nbEleves:           number;
}

const EMPTY_FORM: EvalForm = {
  titre:'', type:'DEVOIR', periode:'T1', matierePublicId:'',
  coefficient:1, promotionPublicId:'', enseignantNom:'',
  dateEvaluation: new Date().toISOString().split('T')[0],
  nbEleves:0,
};

@Component({
  selector:        'sms-evaluations-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Gestion des évaluations</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Devoirs · Examens · TP · Oraux · Projets · Rattrapages
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/academic"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        Notes
      </a>
      <button (click)="openCreateDialog()"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
        Créer une évaluation
      </button>
    </div>
  </div>

  <!-- ── KPIs ──────────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:var(--accent-light)">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">assessment</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.evaluations().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Total</p>
      </div>
    </div>
    @for (s of ['BROUILLON','SAISIE','VALIDEE','PUBLIE']; track s) {
      <div class="sms-card p-4 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
           (click)="activeTab.set(activeTab() === s ? 'all' : s)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             [style.background]="statutCfg(s).bg">
          <mat-icon [style.color]="statutCfg(s).color"
                    style="font-size:18px;height:18px;width:18px">{{ statutCfg(s).icon }}</mat-icon>
        </div>
        <div>
          <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ countByStatut(s) }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">{{ statutCfg(s).label }}</p>
        </div>
      </div>
    }
  </div>

  <!-- ── Filtres ────────────────────────────────────────────────────────────── -->
  <div class="flex flex-wrap gap-3 mb-5">
    <div class="relative flex-1 min-w-40">
      <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
      <input type="text" [(ngModel)]="searchEval"
             placeholder="Rechercher une évaluation…"
             class="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
             style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
    </div>
    <select [(ngModel)]="typeFilter"
            class="px-3 py-2 rounded-xl border text-sm"
            style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      <option value="">Tous les types</option>
      @for (t of typeOptions; track t.key) { <option [value]="t.key">{{ t.label }}</option> }
    </select>
    <select [(ngModel)]="classeFilter"
            class="px-3 py-2 rounded-xl border text-sm"
            style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      <option value="">Toutes les classes</option>
      @for (c of refStore.classesActives(); track c.id) {
        <option [value]="c.id">{{ c.libelle }}</option>
      }
    </select>
    <!-- Onglets statut -->
    <div class="flex gap-1 p-1 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
      <button (click)="activeTab.set('all')"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              [style.background]="activeTab()==='all' ? 'var(--surface-1)' : 'transparent'"
              [style.color]="activeTab()==='all' ? 'var(--text-primary)' : 'var(--text-secondary)'">
        Toutes
      </button>
      @for (s of statuts; track s) {
        <button (click)="activeTab.set(s)"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                [style.background]="activeTab()===s ? 'var(--surface-1)' : 'transparent'"
                [style.color]="activeTab()===s ? statutCfg(s).color : 'var(--text-secondary)'">
          {{ statutCfg(s).label }}
        </button>
      }
    </div>
  </div>

  <!-- ── Table ──────────────────────────────────────────────────────────────── -->
  @if (store.loading()) {
    <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
    </div>
  } @else {
    <div class="sms-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of ['Type','Titre','Classe','Matière','Période','Coeff.','Date','Progression','Statut','Actions']; track h) {
                <th class="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (ev of filteredEvals(); track ev.publicId) {
              <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
                <!-- Type -->
                <td class="px-4 py-3">
                  <span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold w-fit"
                        [style.background]="typeCfg(ev.type).bg"
                        [style.color]="typeCfg(ev.type).color">
                    <mat-icon style="font-size:11px;height:11px;width:11px">{{ typeCfg(ev.type).icon }}</mat-icon>
                    {{ typeCfg(ev.type).label }}
                  </span>
                </td>
                <!-- Titre -->
                <td class="px-4 py-3">
                  <p class="font-semibold" style="color:var(--text-primary)">{{ ev.titre }}</p>
                  <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ ev.enseignantNom }}</p>
                </td>
                <!-- Classe -->
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ ev.promotionLibelle }}</td>
                <!-- Matière -->
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ ev.matiereLibelle }}</td>
                <!-- Période -->
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-xs font-medium"
                        style="background:var(--surface-2);color:var(--text-secondary)">{{ ev.periode }}</span>
                </td>
                <!-- Coeff -->
                <td class="px-4 py-3 text-center font-bold" style="color:var(--accent)">{{ ev.coefficient }}</td>
                <!-- Date -->
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ ev.dateEvaluation }}</td>
                <!-- Progression saisie -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2 min-w-[80px]">
                    <div class="flex-1 rounded-full h-1.5" style="background:var(--border-color)">
                      <div class="h-1.5 rounded-full transition-all"
                           [style.background]="progressColor(ev)"
                           [style.width]="progressPct(ev) + '%'"></div>
                    </div>
                    <span class="text-xs tabular-nums" style="color:var(--text-secondary)">
                      {{ ev.nbSaisis }}/{{ ev.nbEleves }}
                    </span>
                  </div>
                </td>
                <!-- Statut -->
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="statutCfg(ev.statut).bg"
                        [style.color]="statutCfg(ev.statut).color">
                    {{ statutCfg(ev.statut).label }}
                  </span>
                </td>
                <!-- Actions -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <!-- Saisir notes -->
                    <a [routerLink]="['/academic/saisie']"
                       [queryParams]="{ evalId: ev.publicId }"
                       class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold hover:opacity-80"
                       style="background:var(--accent-light);color:var(--accent)">
                      <mat-icon style="font-size:13px;height:13px;width:13px">edit_note</mat-icon>
                      Saisir
                    </a>
                    <!-- Avancer workflow -->
                    @if (statutCfg(ev.statut).next) {
                      <button (click)="advanceStatut(ev)"
                              class="px-2 py-1 rounded-lg text-xs font-semibold hover:opacity-80"
                              [style.background]="statutCfg(statutCfg(ev.statut).next!).bg"
                              [style.color]="statutCfg(statutCfg(ev.statut).next!).color">
                        {{ statutCfg(ev.statut).next === 'VALIDEE' ? 'Valider' : statutCfg(ev.statut).next === 'PUBLIE' ? 'Publier' : 'Démarrer' }}
                      </button>
                    }
                    <!-- Edit -->
                    <button (click)="editEval(ev)"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            style="background:var(--surface-2);color:var(--text-secondary)">
                      <mat-icon style="font-size:13px;height:13px;width:13px">edit</mat-icon>
                    </button>
                    <!-- Delete -->
                    @if (ev.statut === 'BROUILLON') {
                      <button (click)="confirmDelete(ev)"
                              class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                              style="background:rgba(239,68,68,0.10);color:#dc2626">
                        <mat-icon style="font-size:13px;height:13px;width:13px">delete</mat-icon>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="10" class="px-4 py-16 text-center" style="color:var(--text-muted)">
                <div class="flex flex-col items-center gap-3">
                  <mat-icon style="font-size:48px;height:48px;width:48px;opacity:0.3">assessment</mat-icon>
                  <p class="font-semibold">Aucune évaluation trouvée</p>
                  <button (click)="openCreateDialog()"
                          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
                          style="background:var(--accent)">
                    <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
                    Créer la première évaluation
                  </button>
                </div>
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  }

</div>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- SLIDE-OVER : CRÉER / MODIFIER ÉVALUATION                                   -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
@if (showDialog()) {
  <div class="fixed inset-0 z-50 flex" style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="closeDialog()">
    <div class="ml-auto w-full max-w-lg h-full flex flex-col shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:var(--border-color)">
        <div>
          <h2 class="font-bold text-lg" style="color:var(--text-primary)">
            {{ form.publicId ? 'Modifier l\'évaluation' : 'Nouvelle évaluation' }}
          </h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
            Renseigner les paramètres de l'évaluation
          </p>
        </div>
        <button (click)="closeDialog()"
                class="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>

      <!-- Corps -->
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        <!-- Type d'évaluation — sélecteur visuel -->
        <div class="flex flex-col gap-2">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Type d'évaluation *</label>
          <div class="grid grid-cols-3 gap-2">
            @for (t of typeOptions; track t.key) {
              <button (click)="form.type = t.key"
                      class="flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all"
                      [style.background]="form.type === t.key ? typeCfg(t.key).bg : 'var(--surface-2)'"
                      [style.border-color]="form.type === t.key ? typeCfg(t.key).color : 'var(--border-color)'"
                      [style.color]="form.type === t.key ? typeCfg(t.key).color : 'var(--text-secondary)'">
                <mat-icon style="font-size:18px;height:18px;width:18px">{{ typeCfg(t.key).icon }}</mat-icon>
                {{ t.label }}
              </button>
            }
          </div>
        </div>

        <!-- Titre -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Titre *</label>
          <input [(ngModel)]="form.titre"
                 placeholder="ex : Devoir sur les fonctions — Chapitre 4"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <!-- Classe -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Classe *</label>
          <select [(ngModel)]="form.promotionPublicId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Sélectionner une classe —</option>
            @for (c of refStore.classesActives(); track c.id) {
              <option [value]="c.id">{{ c.libelle }}</option>
            }
          </select>
        </div>

        <!-- Matière -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Matière *</label>
          <select [(ngModel)]="form.matierePublicId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Sélectionner une matière —</option>
            @for (m of refStore.matieres(); track m.publicId) {
              <option [value]="m.publicId">{{ m.libelle }} (coeff. {{ m.coefficient }})</option>
            }
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Période -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Période *</label>
            <select [(ngModel)]="form.periode"
                    class="px-3 py-2 rounded-xl border text-sm outline-none"
                    style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
              @for (p of periodeOptions; track p.value) {
                <option [value]="p.value">{{ p.label }}</option>
              }
            </select>
          </div>
          <!-- Coefficient -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Coefficient</label>
            <input type="number" [(ngModel)]="form.coefficient" min="0.5" step="0.5"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Date -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date d'évaluation *</label>
            <input type="date" [(ngModel)]="form.dateEvaluation"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <!-- Nb élèves -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Nb élèves concernés</label>
            <input type="number" [(ngModel)]="form.nbEleves" min="0"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <!-- Enseignant -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Enseignant responsable</label>
          <input [(ngModel)]="form.enseignantNom" placeholder="ex : M. Kaboré Aristide"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

      </div>

      <!-- Footer actions -->
      <div class="px-6 py-4 border-t flex items-center justify-between gap-3" style="border-color:var(--border-color)">
        <p class="text-xs" style="color:var(--text-muted)">* Champs obligatoires</p>
        <div class="flex gap-3">
          <button (click)="closeDialog()"
                  class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                  style="background:var(--surface-2);color:var(--text-secondary)">
            Annuler
          </button>
          <button (click)="saveEval()"
                  [disabled]="store.saving()"
                  class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                  style="background:var(--accent)">
            @if (store.saving()) {
              <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
            } @else {
              <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
            }
            {{ form.publicId ? 'Enregistrer' : 'Créer l\'évaluation' }}
          </button>
        </div>
      </div>
    </div>
  </div>
}

<!-- ── Dialog de confirmation suppression ──────────────────────────────────── -->
@if (deleteTarget()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
       style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="deleteTarget.set(null)">
    <div class="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
           style="background:rgba(239,68,68,0.10)">
        <mat-icon style="color:#dc2626;font-size:24px;height:24px;width:24px">delete_forever</mat-icon>
      </div>
      <div class="text-center">
        <h3 class="font-bold text-lg" style="color:var(--text-primary)">Supprimer l'évaluation ?</h3>
        <p class="text-sm mt-1" style="color:var(--text-secondary)">
          <strong>{{ deleteTarget()?.titre }}</strong> sera définitivement supprimée.
          Cette action est irréversible.
        </p>
      </div>
      <div class="flex gap-3">
        <button (click)="deleteTarget.set(null)"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">
          Annuler
        </button>
        <button (click)="doDelete()"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-80"
                style="background:#dc2626">
          Supprimer
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class EvaluationsListComponent implements OnInit {
  readonly store     = inject(AcademicStore);
  readonly refStore  = inject(ReferenceStore);
  readonly toast     = inject(ToastService);

  // ── UI state ──────────────────────────────────────────────────────────────
  activeTab    = signal<EvalTab>('all');
  showDialog   = signal(false);
  deleteTarget = signal<IEvaluation | null>(null);
  searchEval   = '';
  typeFilter   = '';
  classeFilter = '';

  // ── Form ──────────────────────────────────────────────────────────────────
  form: EvalForm = { ...EMPTY_FORM };

  // ── Options ───────────────────────────────────────────────────────────────
  readonly typeOptions = Object.entries(TYPE_CFG).map(([key, v]) => ({ key: key as TypeEvaluation, label: v.label }));
  readonly periodeOptions = PERIODE_OPTIONS;
  readonly statuts: string[] = ['BROUILLON','SAISIE','VALIDEE','PUBLIE'];

  // ── Filtered evals ────────────────────────────────────────────────────────
  readonly filteredEvals = computed(() => {
    let list = this.store.evaluations();
    const tab = this.activeTab();
    const s   = this.searchEval.toLowerCase();
    const t   = this.typeFilter;
    const c   = this.classeFilter;
    if (tab !== 'all') list = list.filter(e => e.statut === tab);
    if (s) list = list.filter(e => e.titre.toLowerCase().includes(s) || e.matiereLibelle.toLowerCase().includes(s));
    if (t) list = list.filter(e => e.type === t);
    if (c) list = list.filter(e => e.promotionPublicId === c);
    return list;
  });

  ngOnInit(): void {
    this.store.loadEvaluations(this.store.selectedClasseId() || '');
    if (!this.refStore.loaded()) this.refStore.loadAll();
  }

  countByStatut(s: string): number {
    return this.store.evaluations().filter(e => e.statut === s).length;
  }

  progressPct(ev: IEvaluation): number {
    return ev.nbEleves ? Math.round((ev.nbSaisis / ev.nbEleves) * 100) : 0;
  }
  progressColor(ev: IEvaluation): string {
    const p = this.progressPct(ev);
    return p >= 100 ? '#16a34a' : p >= 50 ? 'var(--accent)' : '#f59e0b';
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────
  openCreateDialog(): void {
    this.form = { ...EMPTY_FORM };
    const annee = this.refStore.anneeActive();
    if (annee) {
      // pre-fill periode from active periode
    }
    this.showDialog.set(true);
  }

  editEval(ev: IEvaluation): void {
    this.form = {
      publicId:          ev.publicId,
      titre:             ev.titre,
      type:              ev.type,
      periode:           ev.periode,
      matierePublicId:   ev.matierePublicId,
      coefficient:       ev.coefficient,
      promotionPublicId: ev.promotionPublicId,
      enseignantNom:     ev.enseignantNom,
      dateEvaluation:    ev.dateEvaluation,
      nbEleves:          ev.nbEleves,
    };
    this.showDialog.set(true);
  }

  saveEval(): void {
    if (!this.form.titre || !this.form.promotionPublicId) {
      this.toast.error('Titre et classe sont obligatoires');
      return;
    }
    const matiere  = this.refStore.matieres().find(m => m.publicId === this.form.matierePublicId);
    const classe   = this.refStore.classesActives().find(c => c.id === this.form.promotionPublicId);

    const payload: Partial<IEvaluation> = {
      ...this.form,
      matiereLibelle:   matiere?.libelle  ?? this.form.matierePublicId,
      promotionLibelle: classe?.libelle   ?? this.form.promotionPublicId,
      enseignantPublicId: 'user-current',
      anneeAcademique:  this.refStore.anneeActiveLib(),
      statut: this.form.publicId
        ? (this.store.evaluations().find(e => e.publicId === this.form.publicId)?.statut ?? 'BROUILLON')
        : 'BROUILLON',
    };

    if (this.form.publicId) {
      this.store.updateEvaluation(payload);
      this.toast.success('Évaluation mise à jour');
    } else {
      this.store.createEvaluation(payload);
      this.toast.success('Évaluation créée avec succès');
    }
    this.closeDialog();
  }

  advanceStatut(ev: IEvaluation): void {
    const next = STATUT_CFG[ev.statut]?.next;
    if (!next) return;
    if (next === 'VALIDEE') {
      this.store.validateEvaluation(ev.publicId);
      this.toast.success(`${ev.titre} validée`);
    } else if (next === 'PUBLIE') {
      this.store.publishEvaluation(ev.publicId);
      this.toast.success(`${ev.titre} publiée`);
    } else {
      this.store.updateEvaluation({ ...ev, statut: next as IEvaluation['statut'] });
      this.toast.info(`Statut avancé → ${next}`);
    }
  }

  confirmDelete(ev: IEvaluation): void { this.deleteTarget.set(ev); }
  doDelete(): void {
    const ev = this.deleteTarget();
    if (ev) {
      this.store.deleteEvaluation(ev.publicId);
      this.toast.success(`${ev.titre} supprimée`);
    }
    this.deleteTarget.set(null);
  }

  closeDialog(): void { this.showDialog.set(false); }
  statutCfg(s: string) { return STATUT_CFG[s] ?? STATUT_CFG['BROUILLON']; }
  typeCfg(t: string)   { return TYPE_CFG[t]   ?? TYPE_CFG['DEVOIR'];      }
}
