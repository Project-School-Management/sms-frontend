import {
  ChangeDetectionStrategy, Component, inject, OnInit, computed, signal,
} from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterLink }     from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { MatIconModule }  from '@angular/material/icon';
import { StudentsStore, CLASSES_MAP } from '@sms/students/data-access';
import { StudentStatut }  from '@sms/shared/models';
import { SkeletonTableComponent, EmptyStateComponent, ErrorStateComponent } from '@sms/shared/ui';

// ── Statut config ─────────────────────────────────────────────────────────────
const STATUT_CFG: Record<string, { label: string; bg: string; color: string; group: string }> = {
  PRE_INSCRIT:         { label: 'Pré-inscrit',      bg: 'rgba(245,158,11,0.12)', color: '#d97706', group: 'En attente' },
  INSCRIT:             { label: 'Inscrit',           bg: 'rgba(59,130,246,0.12)', color: '#2563eb', group: 'En attente' },
  INSCRIPTION_VALIDEE: { label: 'Validé',            bg: 'rgba(16,185,129,0.12)', color: '#059669', group: 'En attente' },
  ACTIF:               { label: 'Actif',             bg: 'rgba(22,163,74,0.12)',  color: '#16a34a', group: 'Scolarisé'  },
  INACTIF:             { label: 'Inactif',           bg: 'rgba(107,114,128,0.12)',color: '#6b7280', group: 'Scolarisé'  },
  INSCRIPTION_ANNULEE: { label: 'Inscr. annulée',    bg: 'rgba(239,68,68,0.12)',  color: '#dc2626', group: 'Clôturé'   },
  SUSPENDU:            { label: 'Suspendu',          bg: 'rgba(217,119,6,0.12)',  color: '#d97706', group: 'Clôturé'   },
  ABANDONNE:           { label: 'Abandonné',         bg: 'rgba(239,68,68,0.10)',  color: '#ef4444', group: 'Clôturé'   },
  TRANSFERE:           { label: 'Transféré',         bg: 'rgba(99,102,241,0.12)', color: '#6366f1', group: 'Clôturé'   },
  DIPLOME:             { label: 'Diplômé',           bg: 'rgba(99,102,241,0.15)', color: '#4f46e5', group: 'Clôturé'   },
  EXCLUS:              { label: 'Exclu',             bg: 'rgba(239,68,68,0.15)',  color: '#dc2626', group: 'Clôturé'   },
};

const ALL_STATUTS = Object.entries(STATUT_CFG).map(([key, val]) => ({ value: key, ...val }));

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector:        'sms-student-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule, SkeletonTableComponent, EmptyStateComponent, ErrorStateComponent],
  template: `
<div class="p-6">

  <!-- ── Header ── -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Élèves & Inscriptions</h1>
      <p class="text-sm mt-0.5" style="color: var(--text-secondary)">
        Gestion du cycle de vie scolaire — {{ store.students().length }} étudiants
      </p>
    </div>
    <a routerLink="/students/new"
       class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
       style="background: var(--accent)">
      <mat-icon style="font-size: 18px; height: 18px; width: 18px">person_add</mat-icon>
      Nouvelle inscription
    </a>
  </div>

  <!-- ── KPI Cards ── -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <!-- Total -->
    <div class="sms-card p-5 flex items-start gap-4 cursor-pointer hover:opacity-90 transition-opacity"
         (click)="store.setStatutFilter('')">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
        <mat-icon style="color: var(--accent)">people</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.students().length }}</p>
        <p class="text-sm" style="color: var(--text-secondary)">Total</p>
      </div>
    </div>
    <!-- Actifs -->
    <div class="sms-card p-5 flex items-start gap-4 cursor-pointer hover:opacity-90 transition-opacity"
         (click)="store.setStatutFilter('ACTIF')">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.10)">
        <mat-icon style="color: #16a34a">check_circle</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.actifsCount() }}</p>
        <p class="text-sm" style="color: var(--text-secondary)">Actifs</p>
      </div>
    </div>
    <!-- En attente / Pré-inscrits -->
    <div class="sms-card p-5 flex items-start gap-4 cursor-pointer hover:opacity-90 transition-opacity"
         (click)="store.setStatutFilter('PRE_INSCRIT')">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(245,158,11,0.10)">
        <mat-icon style="color: #d97706">pending</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.preInscritsCount() }}</p>
        <p class="text-sm" style="color: var(--text-secondary)">En attente</p>
      </div>
    </div>
    <!-- Annulés / Clôturés -->
    <div class="sms-card p-5 flex items-start gap-4 cursor-pointer hover:opacity-90 transition-opacity"
         (click)="store.setStatutFilter('INSCRIPTION_ANNULEE')">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(239,68,68,0.10)">
        <mat-icon style="color: #dc2626">cancel</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.annulationsCount() }}</p>
        <p class="text-sm" style="color: var(--text-secondary)">Annulés</p>
      </div>
    </div>
  </div>

  <!-- ── Table card ── -->
  <div class="sms-card overflow-hidden">

    <!-- Toolbar -->
    <div class="px-5 py-4 border-b flex flex-wrap items-center gap-3" style="border-color: var(--border-color)">
      <h3 class="font-semibold" style="color: var(--text-primary)">Liste des étudiants</h3>

      <div class="flex-1"></div>

      <!-- Search -->
      <div class="relative">
        <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2"
                  style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
        <input type="search"
               placeholder="Nom, matricule, email…"
               class="pl-8 pr-3 py-1.5 rounded-lg border text-sm focus:outline-none"
               style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary);width:220px"
               [ngModel]="store.searchQuery()"
               (ngModelChange)="onSearch($event)" />
      </div>

      <!-- Status filter -->
      <select class="px-3 py-1.5 rounded-lg border text-sm focus:outline-none"
              style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"
              [ngModel]="store.statutFilter()"
              (ngModelChange)="store.setStatutFilter($event)">
        <option value="">Tous les statuts</option>
        <optgroup label="En attente">
          <option value="PRE_INSCRIT">Pré-inscrit</option>
          <option value="INSCRIT">Inscrit</option>
          <option value="INSCRIPTION_VALIDEE">Inscription validée</option>
        </optgroup>
        <optgroup label="Scolarisé">
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
          <option value="SUSPENDU">Suspendu</option>
        </optgroup>
        <optgroup label="Clôturé">
          <option value="INSCRIPTION_ANNULEE">Inscription annulée</option>
          <option value="ABANDONNE">Abandonné</option>
          <option value="TRANSFERE">Transféré</option>
          <option value="DIPLOME">Diplômé</option>
          <option value="EXCLUS">Exclu</option>
        </optgroup>
      </select>

      <!-- Classe filter -->
      <select class="px-3 py-1.5 rounded-lg border text-sm focus:outline-none"
              style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"
              [ngModel]="classeFilter()"
              (ngModelChange)="classeFilter.set($event); currentPage.set(0)">
        <option value="">Toutes les classes</option>
        @for (entry of classeOptions; track entry.id) {
          <option [value]="entry.id">{{ entry.libelle }}</option>
        }
      </select>
    </div>

    <!-- Loading -->
    @if (store.loading()) {
      <sms-skeleton-table />
    } @else {
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="background:var(--surface-2)">
              <th class="text-left px-4 py-3 font-medium" style="color:var(--text-secondary)">Étudiant</th>
              <th class="text-left px-4 py-3 font-medium hidden md:table-cell" style="color:var(--text-secondary)">Matricule</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell" style="color:var(--text-secondary)">Classe</th>
              <th class="text-left px-4 py-3 font-medium hidden sm:table-cell" style="color:var(--text-secondary)">Nationalité</th>
              <th class="text-left px-4 py-3 font-medium" style="color:var(--text-secondary)">Statut</th>
              <th class="px-4 py-3 text-right" style="color:var(--text-secondary)">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (s of displayedStudents(); track s.publicId) {
              <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
                <!-- Étudiant -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                         [style.background]="avatarBg(s.genre)">
                      {{ s.firstName[0] }}{{ s.lastName[0] }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold truncate" style="color:var(--text-primary)">
                        {{ s.firstName }} {{ s.lastName }}
                      </p>
                      <p class="text-xs truncate" style="color:var(--text-secondary)">
                        {{ s.email ?? s.phone ?? '—' }}
                      </p>
                    </div>
                  </div>
                </td>
                <!-- Matricule -->
                <td class="px-4 py-3 font-mono text-xs hidden md:table-cell" style="color:var(--text-secondary)">
                  {{ s.matricule }}
                </td>
                <!-- Classe -->
                <td class="px-4 py-3 text-xs hidden lg:table-cell">
                  <div style="color:var(--text-primary)">{{ s.classeLibelle ?? classeLabel(s.classePublicId) }}</div>
                  @if (s.niveauLibelle) {
                    <div style="color:var(--text-muted)">{{ s.niveauLibelle }} · {{ s.filiereLibelle }}</div>
                  }
                </td>
                <!-- Nationalité -->
                <td class="px-4 py-3 text-xs hidden sm:table-cell" style="color:var(--text-secondary)">
                  {{ s.nationalite ?? '—' }}
                </td>
                <!-- Statut -->
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                        [style.background]="statutBg(s.statut)"
                        [style.color]="statutColor(s.statut)">
                    {{ statutLabel(s.statut) }}
                  </span>
                  @if (s.motifStatut) {
                    <p class="text-xs mt-0.5 truncate max-w-32" style="color:var(--text-muted)"
                       [title]="s.motifStatut">
                      {{ s.motifStatut }}
                    </p>
                  }
                </td>
                <!-- Actions -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1.5 justify-end">

                    <!-- Voir -->
                    <a [routerLink]="['/students', s.publicId]"
                       class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                       style="background:var(--accent-light);color:var(--accent)">
                      <mat-icon style="font-size:14px;height:14px;width:14px">visibility</mat-icon>
                      Voir
                    </a>

                    <!-- Kebab ⋮ -->
                    <div class="relative">
                      <button (click)="toggleRowMenu(s.publicId)"
                              class="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:opacity-80"
                              [style.background]="activeMenuId() === s.publicId ? 'var(--accent-light)' : 'var(--surface-2)'"
                              [style.color]="activeMenuId() === s.publicId ? 'var(--accent)' : 'var(--text-muted)'">
                        <mat-icon style="font-size:18px;height:18px;width:18px">more_vert</mat-icon>
                      </button>

                      @if (activeMenuId() === s.publicId) {
                        <!-- Backdrop -->
                        <div class="fixed inset-0 z-40" (click)="activeMenuId.set(null)"></div>

                        <!-- Dropdown -->
                        <div class="absolute right-0 z-50 w-44 rounded-xl overflow-hidden"
                             style="top:calc(100% + 4px);background:var(--surface-1);
                                    border:1px solid var(--border-color);
                                    box-shadow:0 8px 24px rgba(0,0,0,0.10)">

                          <a [routerLink]="['/students', s.publicId, 'edit']"
                             (click)="activeMenuId.set(null)"
                             class="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:opacity-80 transition-opacity"
                             style="color:var(--text-primary)">
                            <mat-icon style="font-size:15px;height:15px;width:15px;color:var(--accent)">edit</mat-icon>
                            Modifier
                          </a>

                          @if (canReactivate(s.statut)) {
                            <button (click)="reactivate(s.publicId); activeMenuId.set(null)"
                                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                                    style="background:transparent">
                              <mat-icon style="font-size:15px;height:15px;width:15px;color:#16a34a">restart_alt</mat-icon>
                              <span style="color:#16a34a">Réactiver</span>
                            </button>
                          }

                          @if (canCancel(s.statut)) {
                            <div style="height:1px;background:var(--border-color)" class="mx-2"></div>
                            <button (click)="openCancelFor(s.publicId, s.firstName + ' ' + s.lastName); activeMenuId.set(null)"
                                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                                    style="background:transparent">
                              <mat-icon style="font-size:15px;height:15px;width:15px;color:#dc2626">cancel</mat-icon>
                              <span style="color:#dc2626">Annuler l'inscription</span>
                            </button>
                          }

                        </div>
                      }
                    </div>

                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">
                  <sms-empty-state
                    [type]="store.searchQuery() || store.statutFilter() || classeFilter() ? 'search' : 'students'"
                    [actionLabel]="store.searchQuery() || store.statutFilter() || classeFilter() ? 'Effacer les filtres' : 'Nouvelle inscription'"
                    [actionLink]="store.searchQuery() || store.statutFilter() || classeFilter() ? null : '/students/new'"
                    (action)="clearFilters()">
                  </sms-empty-state>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-5 py-3 border-t flex items-center justify-between flex-wrap gap-2"
           style="border-color:var(--border-color)">
        <p class="text-sm" style="color:var(--text-secondary)">
          {{ displayedStudents().length }} sur {{ filteredByClasse().length }} étudiant(s)
          @if (store.statutFilter()) {
            — filtre : <strong>{{ statutLabel(store.statutFilter()) }}</strong>
          }
        </p>
        <div class="flex items-center gap-1">
          <button (click)="prevPage()" [disabled]="currentPage() === 0"
                  class="px-3 py-1 rounded text-xs border disabled:opacity-40 hover:opacity-80"
                  style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
            ← Préc.
          </button>
          <span class="px-3 py-1 text-xs" style="color:var(--text-secondary)">
            {{ currentPage() + 1 }} / {{ totalPages() }}
          </span>
          <button (click)="nextPage()" [disabled]="currentPage() >= totalPages() - 1"
                  class="px-3 py-1 rounded text-xs border disabled:opacity-40 hover:opacity-80"
                  style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
            Suiv. →
          </button>
        </div>
      </div>
    }
  </div>
</div>

<!-- ═══ DIALOG : Annulation rapide depuis la liste ═══ -->
@if (cancelTarget()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
       style="background:rgba(0,0,0,0.45);backdrop-filter:blur(4px)">
    <div class="sms-card w-full max-w-md overflow-hidden">
      <div class="px-6 py-5 border-b flex items-center gap-3" style="border-color:var(--border-color)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(239,68,68,0.10)">
          <mat-icon style="color:#dc2626;font-size:20px;height:20px;width:20px">cancel</mat-icon>
        </div>
        <div>
          <p class="font-bold" style="color:var(--text-primary)">Annuler l'inscription</p>
          <p class="text-sm" style="color:var(--text-secondary)">{{ cancelTargetName() }}</p>
        </div>
      </div>

      <div class="px-6 py-5">
        <div class="flex items-start gap-3 mb-4 p-3 rounded-xl"
             style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25)">
          <mat-icon style="color:#d97706;font-size:16px;height:16px;width:16px;flex-shrink:0;margin-top:2px">warning</mat-icon>
          <p class="text-sm" style="color:var(--text-secondary)">
            L'inscription sera annulée. L'élève pourra être réactivé ultérieurement.
          </p>
        </div>
        <label class="block text-sm font-semibold mb-2" style="color:var(--text-primary)">
          Motif <span style="color:#ef4444">*</span>
        </label>
        <textarea [(ngModel)]="cancelMotifStr" rows="3"
                  placeholder="Raison de l'annulation (déménagement, erreur, abandon avant rentrée…)"
                  class="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </textarea>
        @if (cancelTouched() && !cancelMotifStr.trim()) {
          <p class="text-xs mt-1.5" style="color:#ef4444">Le motif est obligatoire</p>
        }
      </div>

      <div class="px-6 py-4 border-t flex gap-3 justify-end" style="border-color:var(--border-color)">
        <button (click)="closeCancelDialog()"
                class="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
          Annuler
        </button>
        <button (click)="confirmCancel()"
                [disabled]="store.saving()"
                class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style="background:#dc2626">
          @if (store.saving()) {
            <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
          } @else {
            <mat-icon style="font-size:16px;height:16px;width:16px">cancel</mat-icon>
          }
          Confirmer
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class StudentListComponent implements OnInit {
  protected readonly store = inject(StudentsStore);

  readonly classeFilter = signal('');
  readonly currentPage  = signal(0);
  readonly pageSize     = 10;

  // Row kebab menu state — stores the publicId of the open row's menu
  readonly activeMenuId = signal<string | null>(null);

  // Cancel dialog state
  readonly cancelTarget     = signal('');
  readonly cancelTargetName = signal('');
  cancelMotifStr            = '';
  readonly cancelTouched    = signal(false);

  // ── Static data ───────────────────────────────────────────────────────────
  readonly classeOptions = Object.entries(CLASSES_MAP).map(([id, v]) => ({ id, libelle: v.libelle }));

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly filteredByClasse = computed(() => {
    const cls = this.classeFilter();
    return cls
      ? this.store.filteredStudents().filter(s => s.classePublicId === cls)
      : this.store.filteredStudents();
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredByClasse().length / this.pageSize))
  );

  readonly displayedStudents = computed(() => {
    const p = this.currentPage();
    return this.filteredByClasse().slice(p * this.pageSize, (p + 1) * this.pageSize);
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadStudents({ page: 0 });
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  prevPage(): void { this.currentPage.update(p => Math.max(0, p - 1)); }
  nextPage(): void { this.currentPage.update(p => Math.min(this.totalPages() - 1, p + 1)); }

  onSearch(q: string): void {
    this.store.setSearchQuery(q);
    this.currentPage.set(0);
  }

  clearFilters(): void {
    this.store.setSearchQuery('');
    this.store.setStatutFilter('');
    this.classeFilter.set('');
    this.currentPage.set(0);
  }

  // ── Statut helpers ────────────────────────────────────────────────────────
  statutLabel(s: string): string { return STATUT_CFG[s]?.label ?? s; }
  statutBg(s: string):    string { return STATUT_CFG[s]?.bg    ?? 'rgba(107,114,128,0.1)'; }
  statutColor(s: string): string { return STATUT_CFG[s]?.color ?? '#6b7280'; }

  classeLabel(id?: string): string {
    return id ? (CLASSES_MAP[id]?.libelle ?? id) : '—';
  }

  avatarBg(genre: string): string {
    return genre === 'F' ? '#ec4899' : '#6366f1';
  }

  // ── Workflow conditions ───────────────────────────────────────────────────
  toggleRowMenu(id: string): void {
    this.activeMenuId.set(this.activeMenuId() === id ? null : id);
  }

  canCancel(statut: StudentStatut): boolean {
    return ['PRE_INSCRIT', 'INSCRIT', 'INSCRIPTION_VALIDEE', 'ACTIF', 'SUSPENDU'].includes(statut);
  }

  canReactivate(statut: StudentStatut): boolean {
    return ['INSCRIPTION_ANNULEE', 'SUSPENDU', 'INACTIF', 'ABANDONNE'].includes(statut);
  }

  // ── Cancel dialog ─────────────────────────────────────────────────────────
  openCancelFor(publicId: string, name: string): void {
    this.cancelTarget.set(publicId);
    this.cancelTargetName.set(name);
    this.cancelMotifStr = '';
    this.cancelTouched.set(false);
  }

  closeCancelDialog(): void {
    this.cancelTarget.set('');
    this.cancelMotifStr = '';
    this.cancelTouched.set(false);
  }

  confirmCancel(): void {
    this.cancelTouched.set(true);
    if (!this.cancelMotifStr.trim()) return;
    const publicId = this.cancelTarget();
    if (!publicId) return;
    this.store.cancelInscription({ publicId, motif: this.cancelMotifStr.trim() });
    setTimeout(() => this.closeCancelDialog(), 350);
  }

  reactivate(publicId: string): void {
    this.store.reactiverInscription(publicId);
  }
}
