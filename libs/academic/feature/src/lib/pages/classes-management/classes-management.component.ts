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

@Component({
  selector:        'sms-classes-management',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Gestion des classes</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Vue académique · {{ refStore.classesActives().length }} classes actives
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/academic"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        Notes
      </a>
      <a routerLink="/config/academic"
         class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
         style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
        <mat-icon style="font-size:16px;height:16px;width:16px">settings</mat-icon>
        Configurer les classes
      </a>
    </div>
  </div>

  <!-- ── KPI cards ─────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Classes</p>
      <p class="text-3xl font-bold" style="color:var(--text-primary)">{{ refStore.totalClasses() }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">configurées</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Effectif total</p>
      <p class="text-3xl font-bold" style="color:var(--accent)">{{ refStore.totalEffectif() }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">élèves inscrits</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Capacité totale</p>
      <p class="text-3xl font-bold" style="color:#10b981">{{ refStore.totalCapacite() }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">places disponibles</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Taux remplissage</p>
      <p class="text-3xl font-bold"
         [style.color]="refStore.tauxRemplissage() >= 90 ? '#dc2626' : refStore.tauxRemplissage() >= 70 ? '#d97706' : '#16a34a'">
        {{ refStore.tauxRemplissage() }}%
      </p>
      <div class="mt-2 rounded-full h-1.5" style="background:var(--border-color)">
        <div class="h-1.5 rounded-full transition-all"
             [style.background]="refStore.tauxRemplissage() >= 90 ? '#dc2626' : refStore.tauxRemplissage() >= 70 ? '#d97706' : '#16a34a'"
             [style.width]="refStore.tauxRemplissage() + '%'"></div>
      </div>
    </div>
  </div>

  <!-- ── Filtres ────────────────────────────────────────────────────────────── -->
  <div class="flex flex-wrap gap-3 mb-5">
    <div class="relative flex-1 min-w-40">
      <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
      <input type="text" [(ngModel)]="searchQuery"
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

  <!-- ── Vue par cycle ──────────────────────────────────────────────────────── -->
  @if (viewMode() === 'cycle') {
    <div class="flex flex-col gap-6">
      @for (cycle of cyclesAvecClasses(); track cycle.publicId) {
        <div>
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center"
                 style="background:var(--accent-light)">
              <mat-icon style="color:var(--accent);font-size:16px;height:16px;width:16px">layers</mat-icon>
            </div>
            <h2 class="font-bold" style="color:var(--text-primary)">{{ cycle.libelle }}</h2>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                  style="background:var(--accent-light);color:var(--accent)">
              {{ classesByCycle(cycle.publicId).length }} classe(s)
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (cls of classesByCycle(cycle.publicId); track cls.publicId) {
              <div class="sms-card p-5 flex flex-col gap-4">
                <!-- Header -->
                <div class="flex items-start gap-3">
                  <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-sm font-black text-white"
                       style="background:linear-gradient(135deg,var(--accent),#3b82f6)">
                    {{ cls.code.substring(0,2) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold" style="color:var(--text-primary)">{{ cls.libelle }}</h3>
                    <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
                      {{ cls.niveauLibelle }}{{ cls.filiereLibelle ? ' · ' + cls.filiereLibelle : '' }}
                    </p>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full shrink-0"
                        [style.background]="cls.active ? 'rgba(22,163,74,0.10)' : 'rgba(107,114,128,0.10)'"
                        [style.color]="cls.active ? '#16a34a' : '#6b7280'">
                    {{ cls.active ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <!-- Effectif gauge -->
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span style="color:var(--text-secondary)">Effectif</span>
                    <span class="font-bold" style="color:var(--text-primary)">
                      {{ cls.effectif }} / {{ cls.capacite }} places
                    </span>
                  </div>
                  <div class="rounded-full h-2" style="background:var(--border-color)">
                    <div class="h-2 rounded-full"
                         [style.background]="tauxCls(cls) >= 90 ? '#dc2626' : tauxCls(cls) >= 70 ? '#d97706' : '#16a34a'"
                         [style.width]="tauxCls(cls) + '%'"></div>
                  </div>
                  <p class="text-xs mt-0.5 text-right" style="color:var(--text-muted)">
                    {{ tauxCls(cls) }}% remplie
                  </p>
                </div>

                <!-- Stats académiques -->
                <div class="flex flex-wrap gap-3">
                  @if (cls.professeurPrincipal) {
                    <div class="flex items-center gap-1 text-xs" style="color:var(--text-muted)">
                      <mat-icon style="font-size:12px;height:12px;width:12px">person</mat-icon>
                      {{ cls.professeurPrincipal }}
                    </div>
                  }
                  <div class="flex items-center gap-1 text-xs" style="color:var(--text-muted)">
                    <mat-icon style="font-size:12px;height:12px;width:12px">assessment</mat-icon>
                    {{ nbEvalsForClasse(cls.publicId) }} éval(s)
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 pt-2 border-t" style="border-color:var(--border-color)">
                  <button (click)="voirNotes(cls.publicId)"
                          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80 flex-1 justify-center"
                          style="background:var(--accent-light);color:var(--accent)">
                    <mat-icon style="font-size:13px;height:13px;width:13px">menu_book</mat-icon>
                    Notes
                  </button>
                  <a [routerLink]="['/academic/evaluations']"
                     [queryParams]="{ classeId: cls.publicId }"
                     class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80 flex-1 justify-center"
                     style="background:var(--surface-2);color:var(--text-secondary)">
                    <mat-icon style="font-size:13px;height:13px;width:13px">assessment</mat-icon>
                    Évals
                  </a>
                  <a routerLink="/academic/saisie"
                     class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80 flex-1 justify-center"
                     style="background:var(--surface-2);color:var(--text-secondary)">
                    <mat-icon style="font-size:13px;height:13px;width:13px">edit_note</mat-icon>
                    Saisir
                  </a>
                </div>
              </div>
            } @empty {
              <div class="col-span-3 text-center py-8 text-sm" style="color:var(--text-muted)">
                Aucune classe pour ce cycle
              </div>
            }
          </div>
        </div>
      }
    </div>
  }

  <!-- ── Vue liste ──────────────────────────────────────────────────────────── -->
  @if (viewMode() === 'list') {
    <div class="sms-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of ['Code','Classe','Cycle','Niveau','Effectif / Cap.','Remplissage','Prof. principal','Évals','Actions']; track h) {
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
                        style="background:var(--accent-light);color:var(--accent)">{{ cls.cycleLibelle }}</span>
                </td>
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ cls.niveauLibelle }}</td>
                <td class="px-4 py-3 text-xs text-center" style="color:var(--text-secondary)">
                  {{ cls.effectif }} / {{ cls.capacite }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-16 rounded-full h-1.5" style="background:var(--border-color)">
                      <div class="h-1.5 rounded-full"
                           [style.background]="tauxCls(cls) >= 90 ? '#dc2626' : '#16a34a'"
                           [style.width]="tauxCls(cls) + '%'"></div>
                    </div>
                    <span class="text-xs" style="color:var(--text-secondary)">{{ tauxCls(cls) }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">
                  {{ cls.professeurPrincipal || '—' }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                        style="background:var(--accent-light);color:var(--accent)">
                    {{ nbEvalsForClasse(cls.publicId) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-1">
                    <button (click)="voirNotes(cls.publicId)"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            style="background:var(--accent-light);color:var(--accent)" title="Voir les notes">
                      <mat-icon style="font-size:13px;height:13px;width:13px">menu_book</mat-icon>
                    </button>
                    <a routerLink="/academic/saisie"
                       class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                       style="background:var(--surface-2);color:var(--text-secondary)" title="Saisir notes">
                      <mat-icon style="font-size:13px;height:13px;width:13px">edit_note</mat-icon>
                    </a>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  }

</div>
  `,
})
export class ClassesManagementComponent implements OnInit {
  readonly store    = inject(AcademicStore);
  readonly refStore = inject(ReferenceStore);
  readonly toast    = inject(ToastService);

  searchQuery  = '';
  cycleFilter  = '';
  viewMode     = signal<'cycle' | 'list'>('cycle');

  ngOnInit(): void {
    if (!this.refStore.loaded()) this.refStore.loadAll();
    this.store.loadEvaluations('');
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly filteredClasses = computed(() => {
    let list = this.refStore.classesActives();
    const s = this.searchQuery.toLowerCase();
    const c = this.cycleFilter;
    if (s) list = list.filter(x => x.libelle.toLowerCase().includes(s) || x.code.toLowerCase().includes(s));
    if (c) list = list.filter(x => x.cyclePublicId === c);
    return list;
  });

  readonly cyclesAvecClasses = computed(() =>
    this.refStore.cycles().filter(c =>
      this.refStore.classesActives().some(cl => cl.cyclePublicId === c.publicId)
    )
  );

  classesByCycle(cycleId: string) {
    return this.filteredClasses().filter(c => c.cyclePublicId === cycleId);
  }

  nbEvalsForClasse(classeId: string): number {
    return this.store.evaluations().filter(e => e.promotionPublicId === classeId).length;
  }

  tauxCls(cls: { effectif: number; capacite: number }): number {
    return cls.capacite ? Math.round((cls.effectif / cls.capacite) * 100) : 0;
  }

  voirNotes(classeId: string): void {
    this.store.setSelectedClasseId(classeId);
    this.toast.info('Classe sélectionnée — voir l\'onglet Notes');
  }
}
