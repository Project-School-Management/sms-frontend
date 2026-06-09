import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore, IClasseRef } from '@sms/config-system/data-access';
import { ToastService } from '@sms/shared/ui';

type AcademicTab = 'classes' | 'matieres' | 'niveaux' | 'filieres';

@Component({
  selector:        'sms-academic-config',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- Header -->
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/config"
       class="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
       style="background:var(--surface-2);color:var(--text-secondary)">
      <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
    </a>
    <div class="flex-1">
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Référentiels académiques</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Cycles · Niveaux · Filières · Classes · Matières
      </p>
    </div>
    <button (click)="showAddDialog.set(true)"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-80 transition-opacity"
            style="background:var(--accent)">
      <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
      Ajouter
    </button>
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 mb-5 p-1 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
    @for (tab of tabs(); track tab.key) {
      <button (click)="activeTab.set(tab.key)"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              [style.background]="activeTab() === tab.key ? 'var(--surface-1)' : 'transparent'"
              [style.color]="activeTab() === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)'"
              [style.box-shadow]="activeTab() === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'">
        <mat-icon style="font-size:15px;height:15px;width:15px">{{ tab.icon }}</mat-icon>
        {{ tab.label }}
        <span class="ml-1 px-1.5 py-0.5 rounded-full text-xs"
              style="background:var(--surface-2);color:var(--text-muted)">{{ tab.count() }}</span>
      </button>
    }
  </div>

  <!-- ── CLASSES ── -->
  @if (activeTab() === 'classes') {
    <!-- Filtres -->
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

    <!-- Table des classes -->
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b flex items-center justify-between"
           style="border-color:var(--border-color)">
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
              @for (h of ['Code','Libellé','Cycle','Niveau','Filière','Effectif/Cap','Statut','Actions']; track h) {
                <th class="text-left px-4 py-3 font-medium text-xs" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (cls of filteredClasses(); track cls.publicId) {
              <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
                <td class="px-4 py-3 font-mono text-xs" style="color:var(--text-muted)">{{ cls.code }}</td>
                <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">{{ cls.libelle }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        style="background:rgba(99,102,241,0.1);color:#6366f1">{{ cls.cycleLibelle }}</span>
                </td>
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ cls.niveauLibelle }}</td>
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ cls.filiereLibelle || '—' }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 rounded-full h-1.5" style="background:var(--border-color)">
                      <div class="h-1.5 rounded-full transition-all"
                           style="background:var(--accent)"
                           [style.width]="(cls.effectif / cls.capacite * 100) + '%'"></div>
                    </div>
                    <span class="text-xs tabular-nums" style="color:var(--text-secondary)">
                      {{ cls.effectif }}/{{ cls.capacite }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="cls.active ? 'rgba(22,163,74,0.1)' : 'rgba(107,114,128,0.1)'"
                        [style.color]="cls.active ? '#16a34a' : '#6b7280'">
                    {{ cls.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <button (click)="editClasse(cls)"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                            style="background:var(--accent-light);color:var(--accent)">
                      <mat-icon style="font-size:14px;height:14px;width:14px">edit</mat-icon>
                    </button>
                    <button (click)="toggleClasse(cls)"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                            [style.background]="cls.active ? 'rgba(239,68,68,0.1)' : 'rgba(22,163,74,0.1)'"
                            [style.color]="cls.active ? '#dc2626' : '#16a34a'">
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

  <!-- ── MATIÈRES ── -->
  @if (activeTab() === 'matieres') {
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b" style="border-color:var(--border-color)">
        <h3 class="font-semibold" style="color:var(--text-primary)">Matières configurées</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of ['Code','Libellé','Type','Coeff.','H/sem','Crédits','Niveaux','Statut']; track h) {
                <th class="text-left px-4 py-3 font-medium text-xs" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (mat of refStore.matieres(); track mat.publicId) {
              <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
                <td class="px-4 py-3 font-mono text-xs" style="color:var(--text-muted)">{{ mat.code }}</td>
                <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">{{ mat.libelle }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-xs font-medium"
                        style="background:var(--surface-2);color:var(--text-secondary)">{{ mat.type }}</span>
                </td>
                <td class="px-4 py-3 text-center font-bold" style="color:var(--accent)">{{ mat.coefficient }}</td>
                <td class="px-4 py-3 text-center" style="color:var(--text-secondary)">{{ mat.heuresHebdo }}h</td>
                <td class="px-4 py-3 text-center" style="color:var(--text-secondary)">{{ mat.credits || '—' }}</td>
                <td class="px-4 py-3 text-xs" style="color:var(--text-muted)">{{ mat.niveauxPublicIds.length }} niveau(x)</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="mat.active ? 'rgba(22,163,74,0.1)' : 'rgba(107,114,128,0.1)'"
                        [style.color]="mat.active ? '#16a34a' : '#6b7280'">
                    {{ mat.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  }

  <!-- ── NIVEAUX ── -->
  @if (activeTab() === 'niveaux') {
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (cycle of refStore.cycles(); track cycle.publicId) {
        <div class="sms-card overflow-hidden">
          <div class="px-5 py-3.5 border-b flex items-center gap-3"
               style="border-color:var(--border-color);background:rgba(99,102,241,0.04)">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                 style="background:rgba(99,102,241,0.12)">
              <mat-icon style="color:#6366f1;font-size:16px;height:16px;width:16px">layers</mat-icon>
            </div>
            <h3 class="font-semibold text-sm" style="color:var(--text-primary)">{{ cycle.libelle }}</h3>
          </div>
          <div class="divide-y" style="border-color:var(--border-color)">
            @for (n of niveauxByCycle(cycle.publicId); track n.publicId) {
              <div class="px-5 py-2.5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" style="background:var(--accent)"></span>
                  <span class="text-sm" style="color:var(--text-primary)">{{ n.libelle }}</span>
                  <span class="font-mono text-xs" style="color:var(--text-muted)">({{ n.code }})</span>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full"
                      [style.background]="n.active ? 'rgba(22,163,74,0.1)' : 'rgba(107,114,128,0.1)'"
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

  <!-- ── FILIÈRES ── -->
  @if (activeTab() === 'filieres') {
    <div class="sms-card overflow-hidden">
      <table class="w-full text-sm">
        <thead style="background:var(--surface-2)">
          <tr>
            @for (h of ['Code','Libellé','Cycle','Statut']; track h) {
              <th class="text-left px-4 py-3 font-medium text-xs" style="color:var(--text-secondary)">{{ h }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (f of refStore.filieres(); track f.publicId) {
            <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
              <td class="px-4 py-3 font-mono text-xs" style="color:var(--text-muted)">{{ f.code }}</td>
              <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">{{ f.libelle }}</td>
              <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">
                {{ cycleLibelleById(f.cyclePublicId) }}
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      [style.background]="f.active ? 'rgba(22,163,74,0.1)' : 'rgba(107,114,128,0.1)'"
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
  `,
})
export class AcademicConfigComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);
  readonly toast    = inject(ToastService);

  readonly activeTab      = signal<AcademicTab>('classes');
  readonly classesSearch  = signal('');
  readonly cycleFilter    = signal('');
  readonly showAddDialog  = signal(false);

  readonly tabs = computed(() => [
    { key: 'classes'  as AcademicTab, label: 'Classes',  icon: 'class',       count: () => this.refStore.classes().length  },
    { key: 'matieres' as AcademicTab, label: 'Matières', icon: 'menu_book',   count: () => this.refStore.matieres().length },
    { key: 'niveaux'  as AcademicTab, label: 'Niveaux',  icon: 'layers',      count: () => this.refStore.niveaux().length  },
    { key: 'filieres' as AcademicTab, label: 'Filières', icon: 'fork_right',  count: () => this.refStore.filieres().length },
  ]);

  readonly filteredClasses = computed(() => {
    let list = this.refStore.classes();
    const s = this.classesSearch().toLowerCase();
    const c = this.cycleFilter();
    if (s) list = list.filter(cl => cl.libelle.toLowerCase().includes(s) || cl.code.toLowerCase().includes(s));
    if (c) list = list.filter(cl => cl.cyclePublicId === c);
    return list;
  });

  ngOnInit(): void {
    if (!this.refStore.loaded()) this.refStore.loadAll();
  }

  niveauxByCycle(cycleId: string) {
    return this.refStore.niveaux().filter(n => n.cyclePublicId === cycleId);
  }

  cycleLibelleById(id?: string): string {
    if (!id) return '—';
    return this.refStore.cycles().find(c => c.publicId === id)?.libelle ?? id;
  }

  editClasse(cls: IClasseRef): void {
    this.toast.info(`Édition de ${cls.libelle} — formulaire à implémenter`);
  }

  toggleClasse(cls: IClasseRef): void {
    cls.active = !cls.active;
    this.toast.success(cls.active ? `${cls.libelle} activée` : `${cls.libelle} désactivée`);
  }
}
