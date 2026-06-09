import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore, TypeSalle } from '@sms/config-system/data-access';

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  AMPHI:        { label: 'Amphithéâtre', icon: 'theater_comedy', color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
  TD:           { label: 'Salle TD',     icon: 'meeting_room',  color: '#0891b2', bg: 'rgba(8,145,178,0.1)'   },
  LABO:         { label: 'Laboratoire',  icon: 'science',       color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  INFORMATIQUE: { label: 'Salle Info',   icon: 'computer',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  TP:           { label: 'Salle TP',     icon: 'build',         color: '#d97706', bg: 'rgba(217,119,6,0.1)'   },
  BUREAU:       { label: 'Bureau',       icon: 'work',          color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

@Component({
  selector:        'sms-rooms-config',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/config"
       class="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
       style="background:var(--surface-2);color:var(--text-secondary)">
      <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
    </a>
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Salles & Infrastructure</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">Bâtiments, salles, amphithéâtres, laboratoires</p>
    </div>
  </div>

  <!-- KPIs par type -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    @for (type of typeStats(); track type.key) {
      <div class="sms-card p-5 flex items-start gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" [style.background]="typeCfg(type.key).bg">
          <mat-icon [style.color]="typeCfg(type.key).color" style="font-size:20px;height:20px;width:20px">{{ typeCfg(type.key).icon }}</mat-icon>
        </div>
        <div>
          <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ type.count }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">{{ typeCfg(type.key).label }}</p>
          <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ type.totalCapacite }} places</p>
        </div>
      </div>
    }
  </div>

  <!-- Filtres -->
  <div class="flex flex-wrap gap-3 mb-4">
    <div class="relative flex-1 min-w-40">
      <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
      <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher une salle…"
             class="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
             style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
    </div>
    <select [(ngModel)]="typeFilter"
            class="px-3 py-2 rounded-xl border text-sm"
            style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      <option value="">Tous les types</option>
      @for (t of typeOptions; track t) { <option [value]="t">{{ typeCfg(t).label }}</option> }
    </select>
    <select [(ngModel)]="batimentFilter"
            class="px-3 py-2 rounded-xl border text-sm"
            style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      <option value="">Tous les bâtiments</option>
      @for (b of refStore.batiments(); track b.publicId) {
        <option [value]="b.publicId">{{ b.libelle }}</option>
      }
    </select>
  </div>

  <!-- Table des salles -->
  <div class="sms-card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead style="background:var(--surface-2)">
          <tr>
            @for (h of ['Code','Libellé','Type','Bâtiment','Étage','Capacité','Équipements','Statut']; track h) {
              <th class="text-left px-4 py-3 font-medium text-xs" style="color:var(--text-secondary)">{{ h }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (s of filteredSalles(); track s.publicId) {
            <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
              <td class="px-4 py-3 font-mono text-xs font-bold" style="color:var(--accent)">{{ s.code }}</td>
              <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">{{ s.libelle }}</td>
              <td class="px-4 py-3">
                <span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit"
                      [style.background]="typeCfg(s.type).bg"
                      [style.color]="typeCfg(s.type).color">
                  <mat-icon style="font-size:12px;height:12px;width:12px">{{ typeCfg(s.type).icon }}</mat-icon>
                  {{ typeCfg(s.type).label }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ s.batimentLibelle || '—' }}</td>
              <td class="px-4 py-3 text-xs text-center" style="color:var(--text-secondary)">{{ s.etage != null ? 'Ét. ' + s.etage : '—' }}</td>
              <td class="px-4 py-3 font-semibold text-center" style="color:var(--text-primary)">{{ s.capacite }}</td>
              <td class="px-4 py-3 text-xs" style="color:var(--text-muted)">{{ s.equipements?.join(', ') || '—' }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      [style.background]="s.active ? 'rgba(22,163,74,0.1)' : 'rgba(107,114,128,0.1)'"
                      [style.color]="s.active ? '#16a34a' : '#6b7280'">
                  {{ s.active ? 'Disponible' : 'Indisponible' }}
                </span>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="px-4 py-12 text-center text-sm" style="color:var(--text-muted)">Aucune salle trouvée</td></tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
})
export class RoomsConfigComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);

  readonly searchQuery   = signal('');
  readonly typeFilter    = signal('');
  readonly batimentFilter = signal('');

  readonly typeOptions: TypeSalle[] = ['AMPHI', 'TD', 'LABO', 'INFORMATIQUE', 'TP', 'BUREAU'];

  readonly typeStats = computed(() =>
    this.typeOptions.map(key => ({
      key,
      count:         this.refStore.salles().filter(s => s.type === key).length,
      totalCapacite: this.refStore.salles().filter(s => s.type === key).reduce((a, s) => a + s.capacite, 0),
    })).filter(t => t.count > 0)
  );

  readonly filteredSalles = computed(() => {
    let list = this.refStore.salles();
    const s = this.searchQuery().toLowerCase();
    const t = this.typeFilter();
    const b = this.batimentFilter();
    if (s) list = list.filter(x => x.libelle.toLowerCase().includes(s) || x.code.toLowerCase().includes(s));
    if (t) list = list.filter(x => x.type === t);
    if (b) list = list.filter(x => x.batimentPublicId === b);
    return list;
  });

  ngOnInit(): void {
    if (!this.refStore.loaded()) this.refStore.loadAll();
  }

  typeCfg(type: string) {
    return TYPE_LABELS[type] ?? { label: type, icon: 'meeting_room', color: 'var(--accent)', bg: 'var(--accent-light)' };
  }
}
