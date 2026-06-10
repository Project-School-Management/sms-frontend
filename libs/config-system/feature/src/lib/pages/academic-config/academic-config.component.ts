import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore, IClasseRef, IMatiereRef } from '@sms/config-system/data-access';
import { ToastService } from '@sms/shared/ui';

type AcademicTab = 'classes' | 'matieres' | 'niveaux' | 'filieres';
type TypeMatiere = 'OBLIGATOIRE' | 'OPTIONNELLE' | 'UE' | 'EC' | 'MODULE';

// ── Formulaire classe ─────────────────────────────────────────────────────────
interface ClasseForm {
  publicId?: string;
  code:        string;
  libelle:     string;
  cyclePublicId:   string;
  niveauPublicId:  string;
  filierePublicId: string;
  anneeAcademiquePublicId: string;
  capacite:    number;
  effectif:    number;
  professeurPrincipal: string;
  sallePrincipale:     string;
}

// ── Formulaire matière ────────────────────────────────────────────────────────
interface MatiereForm {
  publicId?:  string;
  code:       string;
  libelle:    string;
  type:       TypeMatiere;
  coefficient: number;
  heuresHebdo: number;
  heuresTotal: number;
  credits:     number;
  niveauxIds:  string; // comma-separated publicIds
  couleur:     string;
}

const EMPTY_CLASSE: ClasseForm = {
  code:'', libelle:'', cyclePublicId:'', niveauPublicId:'',
  filierePublicId:'', anneeAcademiquePublicId:'', capacite:30, effectif:0,
  professeurPrincipal:'', sallePrincipale:'',
};
const EMPTY_MATIERE: MatiereForm = {
  code:'', libelle:'', type:'OBLIGATOIRE', coefficient:1, heuresHebdo:2,
  heuresTotal:30, credits:0, niveauxIds:'', couleur:'#2563eb',
};

@Component({
  selector:        'sms-academic-config',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/config"
       class="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70"
       style="background:var(--surface-2);color:var(--text-secondary)">
      <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
    </a>
    <div class="flex-1">
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Référentiels académiques</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">Cycles · Niveaux · Filières · Classes · Matières</p>
    </div>
    <button (click)="openAddDialog()"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
            style="background:var(--accent)">
      <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
      {{ activeTab() === 'matieres' ? 'Nouvelle matière' : 'Nouvelle classe' }}
    </button>
  </div>

  <!-- ── Onglets ────────────────────────────────────────────────────────────── -->
  <div class="flex gap-1 mb-5 p-1 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
    @for (tab of tabs(); track tab.key) {
      <button (click)="activeTab.set(tab.key)"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex-1 justify-center"
              [style.background]="activeTab()===tab.key ? 'var(--surface-1)' : 'transparent'"
              [style.color]="activeTab()===tab.key ? 'var(--text-primary)' : 'var(--text-secondary)'"
              [style.box-shadow]="activeTab()===tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'">
        <mat-icon style="font-size:15px;height:15px;width:15px">{{ tab.icon }}</mat-icon>
        {{ tab.label }}
        <span class="ml-1 px-1.5 py-0.5 rounded-full text-xs"
              style="background:var(--surface-2);color:var(--text-muted)">{{ tab.count() }}</span>
      </button>
    }
  </div>

  <!-- ████████ ONGLET CLASSES ████████ -->
  @if (activeTab() === 'classes') {
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="relative flex-1 min-w-40">
        <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
        <input type="text" [(ngModel)]="classesSearch"
               placeholder="Rechercher une classe…"
               class="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
               style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      </div>
      <select [(ngModel)]="cycleFilter"
              class="px-3 py-2 rounded-xl border text-sm"
              style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        <option value="">Tous les cycles</option>
        @for (c of refStore.cycles(); track c.publicId) {
          <option [value]="c.publicId">{{ c.libelle }}</option>
        }
      </select>
    </div>

    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color:var(--border-color)">
        <h3 class="font-semibold" style="color:var(--text-primary)">
          Classes configurées
          <span class="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                style="background:var(--surface-2);color:var(--text-muted)">
            {{ filteredClasses().length }} résultat(s)
          </span>
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of ['Code','Libellé','Cycle','Niveau','Filière','Effectif / Cap.','Statut','Actions']; track h) {
                <th class="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (cls of filteredClasses(); track cls.publicId) {
              <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
                <td class="px-4 py-3 font-mono text-xs font-bold" style="color:var(--accent)">{{ cls.code }}</td>
                <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">{{ cls.libelle }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        style="background:rgba(37,99,235,0.10);color:var(--accent)">{{ cls.cycleLibelle }}</span>
                </td>
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ cls.niveauLibelle }}</td>
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ cls.filiereLibelle || '—' }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 rounded-full h-1.5 min-w-[60px]" style="background:var(--border-color)">
                      <div class="h-1.5 rounded-full" style="background:var(--accent)"
                           [style.width]="cls.capacite ? (cls.effectif / cls.capacite * 100)+'%' : '0%'"></div>
                    </div>
                    <span class="text-xs tabular-nums" style="color:var(--text-secondary)">
                      {{ cls.effectif }}/{{ cls.capacite }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="cls.active ? 'rgba(22,163,74,0.10)' : 'rgba(107,114,128,0.10)'"
                        [style.color]="cls.active ? '#16a34a' : '#6b7280'">
                    {{ cls.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <button (click)="editClasse(cls)"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            style="background:var(--accent-light);color:var(--accent)"
                            title="Modifier">
                      <mat-icon style="font-size:14px;height:14px;width:14px">edit</mat-icon>
                    </button>
                    <button (click)="toggleClasse(cls)"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            [style.background]="cls.active ? 'rgba(239,68,68,0.10)' : 'rgba(22,163,74,0.10)'"
                            [style.color]="cls.active ? '#dc2626' : '#16a34a'"
                            [title]="cls.active ? 'Désactiver' : 'Activer'">
                      <mat-icon style="font-size:14px;height:14px;width:14px">
                        {{ cls.active ? 'visibility_off' : 'visibility' }}
                      </mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="px-4 py-12 text-center text-sm" style="color:var(--text-muted)">
                Aucune classe trouvée
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  }

  <!-- ████████ ONGLET MATIÈRES ████████ -->
  @if (activeTab() === 'matieres') {
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="relative flex-1 min-w-40">
        <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
        <input type="text" [(ngModel)]="matieresSearch"
               placeholder="Rechercher une matière…"
               class="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
               style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      </div>
      <select [(ngModel)]="typeMatiereFilter"
              class="px-3 py-2 rounded-xl border text-sm"
              style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        <option value="">Tous les types</option>
        @for (t of typesMatiereOptions; track t) { <option [value]="t">{{ t }}</option> }
      </select>
    </div>

    <div class="sms-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of ['Code','Libellé','Type','Coeff.','H/sem','Crédits','Niveaux','Statut','Actions']; track h) {
                <th class="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (mat of filteredMatieres(); track mat.publicId) {
              <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
                <td class="px-4 py-3 font-mono text-xs font-bold" style="color:var(--accent)">{{ mat.code }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    @if (mat.couleur) {
                      <div class="w-3 h-3 rounded-full shrink-0" [style.background]="mat.couleur"></div>
                    }
                    <span class="font-semibold" style="color:var(--text-primary)">{{ mat.libelle }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-xs font-medium"
                        style="background:var(--surface-2);color:var(--text-secondary)">{{ mat.type }}</span>
                </td>
                <td class="px-4 py-3 text-center font-bold" style="color:var(--accent)">{{ mat.coefficient }}</td>
                <td class="px-4 py-3 text-center text-xs" style="color:var(--text-secondary)">{{ mat.heuresHebdo }}h</td>
                <td class="px-4 py-3 text-center text-xs" style="color:var(--text-secondary)">{{ mat.credits || '—' }}</td>
                <td class="px-4 py-3 text-xs" style="color:var(--text-muted)">{{ mat.niveauxPublicIds.length }} niveau(x)</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="mat.active ? 'rgba(22,163,74,0.10)' : 'rgba(107,114,128,0.10)'"
                        [style.color]="mat.active ? '#16a34a' : '#6b7280'">
                    {{ mat.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <button (click)="editMatiere(mat)"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            style="background:var(--accent-light);color:var(--accent)">
                      <mat-icon style="font-size:14px;height:14px;width:14px">edit</mat-icon>
                    </button>
                    <button (click)="toggleMatiere(mat)"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            [style.background]="mat.active ? 'rgba(239,68,68,0.10)' : 'rgba(22,163,74,0.10)'"
                            [style.color]="mat.active ? '#dc2626' : '#16a34a'">
                      <mat-icon style="font-size:14px;height:14px;width:14px">
                        {{ mat.active ? 'visibility_off' : 'visibility' }}
                      </mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="9" class="px-4 py-12 text-center text-sm" style="color:var(--text-muted)">
                Aucune matière trouvée
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  }

  <!-- ████████ ONGLET NIVEAUX ████████ -->
  @if (activeTab() === 'niveaux') {
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (cycle of refStore.cycles(); track cycle.publicId) {
        <div class="sms-card overflow-hidden">
          <div class="px-5 py-3.5 border-b flex items-center gap-3"
               style="border-color:var(--border-color);background:rgba(37,99,235,0.04)">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                 style="background:rgba(37,99,235,0.12)">
              <mat-icon style="color:var(--accent);font-size:16px;height:16px;width:16px">layers</mat-icon>
            </div>
            <h3 class="font-semibold text-sm" style="color:var(--text-primary)">{{ cycle.libelle }}</h3>
            <span class="ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style="background:var(--accent-light);color:var(--accent)">
              {{ niveauxByCycle(cycle.publicId).length }}
            </span>
          </div>
          <div class="divide-y" style="border-color:var(--border-color)">
            @for (n of niveauxByCycle(cycle.publicId); track n.publicId) {
              <div class="px-5 py-2.5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full shrink-0" style="background:var(--accent)"></span>
                  <span class="text-sm" style="color:var(--text-primary)">{{ n.libelle }}</span>
                  <span class="font-mono text-xs" style="color:var(--text-muted)">({{ n.code }})</span>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full"
                      [style.background]="n.active ? 'rgba(22,163,74,0.10)' : 'rgba(107,114,128,0.10)'"
                      [style.color]="n.active ? '#16a34a' : '#6b7280'">
                  {{ n.active ? 'Actif' : 'Inactif' }}
                </span>
              </div>
            } @empty {
              <div class="px-5 py-4 text-xs text-center" style="color:var(--text-muted)">Aucun niveau</div>
            }
          </div>
        </div>
      }
    </div>
  }

  <!-- ████████ ONGLET FILIÈRES ████████ -->
  @if (activeTab() === 'filieres') {
    <div class="sms-card overflow-hidden">
      <table class="w-full text-sm">
        <thead style="background:var(--surface-2)">
          <tr>
            @for (h of ['Code','Libellé','Cycle','Statut']; track h) {
              <th class="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide" style="color:var(--text-secondary)">{{ h }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (f of refStore.filieres(); track f.publicId) {
            <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
              <td class="px-4 py-3 font-mono text-xs font-bold" style="color:var(--accent)">{{ f.code }}</td>
              <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">{{ f.libelle }}</td>
              <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ cycleLibelleById(f.cyclePublicId) }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      [style.background]="f.active ? 'rgba(22,163,74,0.10)' : 'rgba(107,114,128,0.10)'"
                      [style.color]="f.active ? '#16a34a' : '#6b7280'">
                  {{ f.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }

</div>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- SLIDE-OVER : DIALOG CLASSE                                                 -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
@if (showClasseDialog()) {
  <div class="fixed inset-0 z-50 flex" style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="closeDialogs()">
    <div class="ml-auto w-full max-w-lg h-full flex flex-col shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:var(--border-color)">
        <div>
          <h2 class="font-bold text-lg" style="color:var(--text-primary)">
            {{ classeForm.publicId ? 'Modifier la classe' : 'Nouvelle classe' }}
          </h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
            Renseigner les informations de la classe
          </p>
        </div>
        <button (click)="closeDialogs()"
                class="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>
      <!-- Corps du formulaire -->
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Code *</label>
            <input [(ngModel)]="classeForm.code" placeholder="ex : L3-GL-A"
                   class="px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Libellé *</label>
            <input [(ngModel)]="classeForm.libelle" placeholder="ex : Licence 3 Génie Logiciel A"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Cycle *</label>
          <select [(ngModel)]="classeForm.cyclePublicId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Sélectionner un cycle —</option>
            @for (c of refStore.cycles(); track c.publicId) {
              <option [value]="c.publicId">{{ c.libelle }}</option>
            }
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Niveau *</label>
          <select [(ngModel)]="classeForm.niveauPublicId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Sélectionner un niveau —</option>
            @for (n of niveauxForCycle(); track n.publicId) {
              <option [value]="n.publicId">{{ n.libelle }}</option>
            }
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Filière (optionnel)</label>
          <select [(ngModel)]="classeForm.filierePublicId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Aucune filière —</option>
            @for (f of filieresForCycle(); track f.publicId) {
              <option [value]="f.publicId">{{ f.libelle }}</option>
            }
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Année académique *</label>
          <select [(ngModel)]="classeForm.anneeAcademiquePublicId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Sélectionner une année —</option>
            @for (a of refStore.annees(); track a.publicId) {
              <option [value]="a.publicId">{{ a.libelle }}{{ a.active ? ' (en cours)' : '' }}</option>
            }
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Capacité *</label>
            <input type="number" [(ngModel)]="classeForm.capacite" min="1"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Effectif actuel</label>
            <input type="number" [(ngModel)]="classeForm.effectif" min="0"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Professeur principal</label>
          <input [(ngModel)]="classeForm.professeurPrincipal" placeholder="ex : Prof. Kaboré Aristide"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Salle principale</label>
          <select [(ngModel)]="classeForm.sallePrincipale"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Aucune salle —</option>
            @for (s of refStore.salles(); track s.publicId) {
              <option [value]="s.publicId">{{ s.libelle }} ({{ s.capacite }} places)</option>
            }
          </select>
        </div>
      </div>
      <!-- Actions -->
      <div class="px-6 py-4 border-t flex items-center justify-end gap-3" style="border-color:var(--border-color)">
        <button (click)="closeDialogs()"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">
          Annuler
        </button>
        <button (click)="saveClasse()"
                [disabled]="refStore.saving()"
                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                style="background:var(--accent)">
          @if (refStore.saving()) {
            <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
          } @else {
            <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
          }
          {{ classeForm.publicId ? 'Enregistrer' : 'Créer la classe' }}
        </button>
      </div>
    </div>
  </div>
}

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- SLIDE-OVER : DIALOG MATIÈRE                                                -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
@if (showMatiereDialog()) {
  <div class="fixed inset-0 z-50 flex" style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="closeDialogs()">
    <div class="ml-auto w-full max-w-lg h-full flex flex-col shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:var(--border-color)">
        <div>
          <h2 class="font-bold text-lg" style="color:var(--text-primary)">
            {{ matiereForm.publicId ? 'Modifier la matière' : 'Nouvelle matière' }}
          </h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary)">Configuration pédagogique</p>
        </div>
        <button (click)="closeDialogs()"
                class="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Code *</label>
            <input [(ngModel)]="matiereForm.code" placeholder="ex : INFO-301"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Libellé *</label>
            <input [(ngModel)]="matiereForm.libelle" placeholder="ex : Algorithmique avancée"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Type de matière</label>
          <select [(ngModel)]="matiereForm.type"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            @for (t of typesMatiereOptions; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Coefficient</label>
            <input type="number" [(ngModel)]="matiereForm.coefficient" min="0.5" step="0.5"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">H/semaine</label>
            <input type="number" [(ngModel)]="matiereForm.heuresHebdo" min="1"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Crédits ECTS</label>
            <input type="number" [(ngModel)]="matiereForm.credits" min="0"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Couleur d'identification</label>
          <div class="flex items-center gap-3">
            <input type="color" [(ngModel)]="matiereForm.couleur"
                   class="w-10 h-10 rounded-xl border cursor-pointer"
                   style="border-color:var(--border-color);padding:2px">
            <span class="text-sm font-mono" style="color:var(--text-secondary)">{{ matiereForm.couleur }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Niveaux concernés</label>
          <div class="flex flex-col gap-1 p-3 rounded-xl border max-h-40 overflow-y-auto"
               style="border-color:var(--border-color);background:var(--surface-2)">
            @for (n of refStore.niveaux(); track n.publicId) {
              <label class="flex items-center gap-2 cursor-pointer py-1">
                <input type="checkbox"
                       [checked]="isNiveauSelected(n.publicId)"
                       (change)="toggleNiveauSelection(n.publicId)"
                       class="rounded">
                <span class="text-sm" style="color:var(--text-primary)">{{ n.libelle }}</span>
              </label>
            }
          </div>
        </div>

      </div>
      <div class="px-6 py-4 border-t flex items-center justify-end gap-3" style="border-color:var(--border-color)">
        <button (click)="closeDialogs()"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
        <button (click)="saveMatiere()"
                [disabled]="refStore.saving()"
                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                style="background:var(--accent)">
          <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
          {{ matiereForm.publicId ? 'Enregistrer' : 'Créer la matière' }}
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class AcademicConfigComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);
  readonly toast    = inject(ToastService);

  // ── Onglet actif ──────────────────────────────────────────────────────────
  readonly activeTab = signal<AcademicTab>('classes');

  // ── Filtres ───────────────────────────────────────────────────────────────
  classesSearch      = '';
  cycleFilter        = '';
  matieresSearch     = '';
  typeMatiereFilter  = '';
  readonly typesMatiereOptions: TypeMatiere[] = ['OBLIGATOIRE','OPTIONNELLE','UE','EC','MODULE'];

  // ── Dialogs ───────────────────────────────────────────────────────────────
  readonly showClasseDialog  = signal(false);
  readonly showMatiereDialog = signal(false);

  // ── Formulaires ───────────────────────────────────────────────────────────
  classeForm:  ClasseForm  = { ...EMPTY_CLASSE };
  matiereForm: MatiereForm = { ...EMPTY_MATIERE };
  private selectedNiveauxIds: Set<string> = new Set();

  // ── Onglets ───────────────────────────────────────────────────────────────
  readonly tabs = computed(() => [
    { key:'classes'  as AcademicTab, label:'Classes',  icon:'class',      count: () => this.refStore.classes().length  },
    { key:'matieres' as AcademicTab, label:'Matières', icon:'menu_book',  count: () => this.refStore.matieres().length },
    { key:'niveaux'  as AcademicTab, label:'Niveaux',  icon:'layers',     count: () => this.refStore.niveaux().length  },
    { key:'filieres' as AcademicTab, label:'Filières', icon:'fork_right', count: () => this.refStore.filieres().length },
  ]);

  // ── Classes filtrées ──────────────────────────────────────────────────────
  readonly filteredClasses = computed(() => {
    let list = this.refStore.classes();
    const s = this.classesSearch.toLowerCase();
    const c = this.cycleFilter;
    if (s) list = list.filter(cl => cl.libelle.toLowerCase().includes(s) || cl.code.toLowerCase().includes(s));
    if (c) list = list.filter(cl => cl.cyclePublicId === c);
    return list;
  });

  // ── Matières filtrées ─────────────────────────────────────────────────────
  readonly filteredMatieres = computed(() => {
    let list = this.refStore.matieres();
    const s = this.matieresSearch.toLowerCase();
    const t = this.typeMatiereFilter;
    if (s) list = list.filter(m => m.libelle.toLowerCase().includes(s) || m.code.toLowerCase().includes(s));
    if (t) list = list.filter(m => m.type === t);
    return list;
  });

  // ── Niveaux filtrés par cycle sélectionné dans le formulaire ──────────────
  niveauxForCycle = computed(() =>
    this.classeForm.cyclePublicId
      ? this.refStore.niveaux().filter(n => n.cyclePublicId === this.classeForm.cyclePublicId)
      : this.refStore.niveaux()
  );

  filieresForCycle = computed(() =>
    this.classeForm.cyclePublicId
      ? this.refStore.filieres().filter(f => f.cyclePublicId === this.classeForm.cyclePublicId)
      : this.refStore.filieres()
  );

  ngOnInit(): void {
    if (!this.refStore.loaded()) this.refStore.loadAll();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  niveauxByCycle(cycleId: string) {
    return this.refStore.niveaux().filter(n => n.cyclePublicId === cycleId);
  }
  cycleLibelleById(id?: string): string {
    return id ? (this.refStore.cycles().find(c => c.publicId === id)?.libelle ?? id) : '—';
  }

  // ── Dialog : ouvrir ───────────────────────────────────────────────────────
  openAddDialog(): void {
    if (this.activeTab() === 'matieres') {
      this.matiereForm = { ...EMPTY_MATIERE };
      this.selectedNiveauxIds = new Set();
      this.showMatiereDialog.set(true);
    } else {
      this.classeForm = { ...EMPTY_CLASSE };
      const anneeActive = this.refStore.annees().find(a => a.active);
      if (anneeActive) this.classeForm.anneeAcademiquePublicId = anneeActive.publicId;
      this.showClasseDialog.set(true);
    }
  }

  // ── Classes : édition ─────────────────────────────────────────────────────
  editClasse(cls: IClasseRef): void {
    this.classeForm = {
      publicId:               cls.publicId,
      code:                   cls.code,
      libelle:                cls.libelle,
      cyclePublicId:          cls.cyclePublicId,
      niveauPublicId:         cls.niveauPublicId,
      filierePublicId:        cls.filierePublicId ?? '',
      anneeAcademiquePublicId:cls.anneeAcademiquePublicId,
      capacite:               cls.capacite,
      effectif:               cls.effectif ?? 0,
      professeurPrincipal:    cls.professeurPrincipal ?? '',
      sallePrincipale:        cls.sallePrincipale ?? '',
    };
    this.showClasseDialog.set(true);
  }

  saveClasse(): void {
    if (!this.classeForm.code || !this.classeForm.libelle || !this.classeForm.niveauPublicId) {
      this.toast.error('Veuillez renseigner les champs obligatoires (*)');
      return;
    }
    const cycle  = this.refStore.cycles().find(c => c.publicId === this.classeForm.cyclePublicId);
    const niveau = this.refStore.niveaux().find(n => n.publicId === this.classeForm.niveauPublicId);
    const filiere = this.refStore.filieres().find(f => f.publicId === this.classeForm.filierePublicId);

    this.refStore.saveClasse({
      ...this.classeForm,
      cycleLibelle:   cycle?.libelle  ?? '',
      niveauLibelle:  niveau?.libelle ?? '',
      filiereLibelle: filiere?.libelle,
      active: true,
    } as Partial<IClasseRef>);

    this.toast.success(this.classeForm.publicId ? 'Classe mise à jour' : 'Classe créée avec succès');
    this.closeDialogs();
  }

  toggleClasse(cls: IClasseRef): void {
    const newActive = !cls.active;
    this.refStore.toggleClasse({ publicId: cls.publicId, active: newActive });
    this.toast.success(newActive ? `${cls.libelle} activée` : `${cls.libelle} désactivée`);
  }

  // ── Matières : édition ────────────────────────────────────────────────────
  editMatiere(mat: IMatiereRef): void {
    this.matiereForm = {
      publicId:    mat.publicId,
      code:        mat.code,
      libelle:     mat.libelle,
      type:        mat.type as TypeMatiere,
      coefficient: mat.coefficient,
      heuresHebdo: mat.heuresHebdo,
      heuresTotal: mat.heuresTotal ?? 0,
      credits:     mat.credits ?? 0,
      niveauxIds:  mat.niveauxPublicIds.join(','),
      couleur:     mat.couleur ?? '#2563eb',
    };
    this.selectedNiveauxIds = new Set(mat.niveauxPublicIds);
    this.showMatiereDialog.set(true);
  }

  saveMatiere(): void {
    if (!this.matiereForm.code || !this.matiereForm.libelle) {
      this.toast.error('Code et libellé sont obligatoires');
      return;
    }
    this.refStore.saveMatiere({
      ...this.matiereForm,
      niveauxPublicIds: [...this.selectedNiveauxIds],
      active: true,
    } as Partial<IMatiereRef>);
    this.toast.success(this.matiereForm.publicId ? 'Matière mise à jour' : 'Matière créée');
    this.closeDialogs();
  }

  toggleMatiere(mat: IMatiereRef): void {
    const newActive = !mat.active;
    this.refStore.toggleMatiere({ publicId: mat.publicId, active: newActive });
    this.toast.success(newActive ? `${mat.libelle} activée` : `${mat.libelle} désactivée`);
  }

  // ── Checkbox niveaux ──────────────────────────────────────────────────────
  isNiveauSelected(id: string): boolean { return this.selectedNiveauxIds.has(id); }
  toggleNiveauSelection(id: string): void {
    this.selectedNiveauxIds.has(id)
      ? this.selectedNiveauxIds.delete(id)
      : this.selectedNiveauxIds.add(id);
  }

  // ── Fermer dialogs ────────────────────────────────────────────────────────
  closeDialogs(): void {
    this.showClasseDialog.set(false);
    this.showMatiereDialog.set(false);
  }
}
