import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore, ISalleRef, TypeSalle } from '@sms/config-system/data-access';
import { ToastService } from '@sms/shared/ui';

const TYPE_CFG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  AMPHI:          { label:'Amphithéâtre',  icon:'theater_comedy',  color:'#6366f1', bg:'rgba(99,102,241,0.10)'  },
  TD:             { label:'Salle TD',      icon:'meeting_room',    color:'#0891b2', bg:'rgba(8,145,178,0.10)'   },
  LABO:           { label:'Laboratoire',   icon:'science',         color:'#10b981', bg:'rgba(16,185,129,0.10)'  },
  INFORMATIQUE:   { label:'Salle Info',    icon:'computer',        color:'#8b5cf6', bg:'rgba(139,92,246,0.10)'  },
  TP:             { label:'Salle TP',      icon:'build',           color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
  BUREAU:         { label:'Bureau',        icon:'work',            color:'#6b7280', bg:'rgba(107,114,128,0.10)' },
  BIBLIOTHEQUE:   { label:'Bibliothèque',  icon:'local_library',   color:'#16a34a', bg:'rgba(22,163,74,0.10)'   },
  SALLE_REUNION:  { label:'Salle réunion', icon:'groups',          color:'#dc2626', bg:'rgba(220,38,38,0.10)'   },
};

interface SalleForm {
  publicId?:       string;
  code:            string;
  libelle:         string;
  type:            TypeSalle;
  batimentPublicId:string;
  etage:           number;
  capacite:        number;
  equipements:     string; // comma-separated
}

const EMPTY_SALLE: SalleForm = {
  code:'', libelle:'', type:'TD', batimentPublicId:'', etage:0, capacite:30, equipements:'',
};

@Component({
  selector:        'sms-rooms-config',
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
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Salles & Infrastructure</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">Bâtiments, salles, amphithéâtres, laboratoires</p>
    </div>
    <button (click)="openAddDialog()"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
            style="background:var(--accent)">
      <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
      Nouvelle salle
    </button>
  </div>

  <!-- ── KPI par type ──────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    @for (stat of typeStats(); track stat.key) {
      <div class="sms-card p-4 flex items-start gap-4 cursor-pointer hover:opacity-90 transition-opacity"
           (click)="typeFilter = stat.key === typeFilter ? '' : stat.key"
           [style.border]="typeFilter === stat.key ? '2px solid ' + typeCfg(stat.key).color : '1px solid var(--border-color)'">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             [style.background]="typeCfg(stat.key).bg">
          <mat-icon [style.color]="typeCfg(stat.key).color"
                    style="font-size:20px;height:20px;width:20px">{{ typeCfg(stat.key).icon }}</mat-icon>
        </div>
        <div>
          <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ stat.count }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">{{ typeCfg(stat.key).label }}</p>
          <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ stat.totalCapacite }} places</p>
        </div>
      </div>
    }
  </div>

  <!-- ── Filtres ────────────────────────────────────────────────────────────── -->
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

  <!-- ── Table des salles ───────────────────────────────────────────────────── -->
  <div class="sms-card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead style="background:var(--surface-2)">
          <tr>
            @for (h of ['Code','Libellé','Type','Bâtiment','Étage','Capacité','Équipements','Statut','Actions']; track h) {
              <th class="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide" style="color:var(--text-secondary)">{{ h }}</th>
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
              <td class="px-4 py-3 text-xs text-center" style="color:var(--text-secondary)">
                {{ s.etage != null ? 'Ét. ' + s.etage : '—' }}
              </td>
              <td class="px-4 py-3 font-semibold text-center" style="color:var(--text-primary)">{{ s.capacite }}</td>
              <td class="px-4 py-3 text-xs" style="color:var(--text-muted)">
                {{ s.equipements?.slice(0,3).join(', ') || '—' }}{{ s.equipements && s.equipements.length > 3 ? '…' : '' }}
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      [style.background]="s.active ? 'rgba(22,163,74,0.10)' : 'rgba(107,114,128,0.10)'"
                      [style.color]="s.active ? '#16a34a' : '#6b7280'">
                  {{ s.active ? 'Disponible' : 'Indisponible' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <button (click)="editSalle(s)"
                          class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                          style="background:var(--accent-light);color:var(--accent)" title="Modifier">
                    <mat-icon style="font-size:14px;height:14px;width:14px">edit</mat-icon>
                  </button>
                  <button (click)="toggleSalle(s)"
                          class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                          [style.background]="s.active ? 'rgba(239,68,68,0.10)' : 'rgba(22,163,74,0.10)'"
                          [style.color]="s.active ? '#dc2626' : '#16a34a'"
                          [title]="s.active ? 'Désactiver' : 'Activer'">
                    <mat-icon style="font-size:14px;height:14px;width:14px">
                      {{ s.active ? 'visibility_off' : 'visibility' }}
                    </mat-icon>
                  </button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="9" class="px-4 py-12 text-center text-sm" style="color:var(--text-muted)">
              Aucune salle trouvée
            </td></tr>
          }
        </tbody>
      </table>
    </div>
    <!-- Footer total -->
    <div class="px-5 py-3 border-t flex items-center justify-between"
         style="border-color:var(--border-color);background:var(--surface-2)">
      <span class="text-xs" style="color:var(--text-secondary)">
        {{ filteredSalles().length }} salle(s) · Capacité totale :
        <strong style="color:var(--text-primary)">
          {{ totalCapacite() }} places
        </strong>
      </span>
      <span class="text-xs" style="color:var(--text-muted)">
        {{ refStore.batiments().length }} bâtiment(s)
      </span>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- SLIDE-OVER : DIALOG SALLE                                                  -->
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
            {{ salleForm.publicId ? 'Modifier la salle' : 'Nouvelle salle' }}
          </h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary)">Infrastructure & logistique</p>
        </div>
        <button (click)="closeDialog()"
                class="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>
      <!-- Corps -->
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Code *</label>
            <input [(ngModel)]="salleForm.code" placeholder="ex : AMPHI-A"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Libellé *</label>
            <input [(ngModel)]="salleForm.libelle" placeholder="ex : Amphithéâtre A"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Type de salle *</label>
          <div class="grid grid-cols-4 gap-2">
            @for (t of typeOptions; track t) {
              <button (click)="salleForm.type = t"
                      class="flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-semibold transition-all"
                      [style.background]="salleForm.type === t ? typeCfg(t).bg : 'var(--surface-2)'"
                      [style.border-color]="salleForm.type === t ? typeCfg(t).color : 'var(--border-color)'"
                      [style.color]="salleForm.type === t ? typeCfg(t).color : 'var(--text-secondary)'">
                <mat-icon style="font-size:16px;height:16px;width:16px">{{ typeCfg(t).icon }}</mat-icon>
                <span style="font-size:10px">{{ typeCfg(t).label }}</span>
              </button>
            }
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Bâtiment</label>
          <select [(ngModel)]="salleForm.batimentPublicId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Sélectionner un bâtiment —</option>
            @for (b of refStore.batiments(); track b.publicId) {
              <option [value]="b.publicId">{{ b.libelle }}</option>
            }
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Étage</label>
            <input type="number" [(ngModel)]="salleForm.etage" min="0"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Capacité *</label>
            <input type="number" [(ngModel)]="salleForm.capacite" min="1"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">
            Équipements (séparés par des virgules)
          </label>
          <input [(ngModel)]="salleForm.equipements"
                 placeholder="ex : Vidéoprojecteur, Tableau blanc, Climatisation"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          <p class="text-xs" style="color:var(--text-muted)">Séparer chaque équipement par une virgule</p>
        </div>

      </div>
      <!-- Actions -->
      <div class="px-6 py-4 border-t flex items-center justify-end gap-3" style="border-color:var(--border-color)">
        <button (click)="closeDialog()"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
        <button (click)="saveSalle()"
                [disabled]="refStore.saving()"
                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                style="background:var(--accent)">
          <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
          {{ salleForm.publicId ? 'Enregistrer' : 'Créer la salle' }}
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class RoomsConfigComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);
  readonly toast    = inject(ToastService);

  searchQuery    = '';
  typeFilter     = '';
  batimentFilter = '';

  readonly typeOptions: TypeSalle[] = ['AMPHI','TD','LABO','INFORMATIQUE','TP','BUREAU','BIBLIOTHEQUE','SALLE_REUNION'];

  readonly typeStats = computed(() =>
    this.typeOptions.map(key => ({
      key,
      count:          this.refStore.salles().filter(s => s.type === key).length,
      totalCapacite:  this.refStore.salles().filter(s => s.type === key).reduce((a, s) => a + s.capacite, 0),
    })).filter(t => t.count > 0)
  );

  readonly filteredSalles = computed(() => {
    let list = this.refStore.salles();
    const s = this.searchQuery.toLowerCase();
    const t = this.typeFilter;
    const b = this.batimentFilter;
    if (s) list = list.filter(x => x.libelle.toLowerCase().includes(s) || x.code.toLowerCase().includes(s));
    if (t) list = list.filter(x => x.type === t);
    if (b) list = list.filter(x => x.batimentPublicId === b);
    return list;
  });

  // ── Dialog ───────────────────────────────────────────────────────────────
  readonly showDialog = signal(false);
  salleForm: SalleForm = { ...EMPTY_SALLE };

  ngOnInit(): void { if (!this.refStore.loaded()) this.refStore.loadAll(); }

  openAddDialog(): void {
    this.salleForm = { ...EMPTY_SALLE };
    this.showDialog.set(true);
  }

  editSalle(s: ISalleRef): void {
    this.salleForm = {
      publicId:        s.publicId,
      code:            s.code,
      libelle:         s.libelle,
      type:            s.type as TypeSalle,
      batimentPublicId:s.batimentPublicId ?? '',
      etage:           s.etage ?? 0,
      capacite:        s.capacite,
      equipements:     s.equipements?.join(', ') ?? '',
    };
    this.showDialog.set(true);
  }

  saveSalle(): void {
    if (!this.salleForm.code || !this.salleForm.libelle) {
      this.toast.error('Code et libellé sont obligatoires');
      return;
    }
    const batiment = this.refStore.batiments().find(b => b.publicId === this.salleForm.batimentPublicId);
    this.refStore.saveSalle({
      ...this.salleForm,
      batimentLibelle: batiment?.libelle,
      equipements: this.salleForm.equipements
        ? this.salleForm.equipements.split(',').map(e => e.trim()).filter(Boolean)
        : [],
      active: true,
    } as Partial<ISalleRef>);
    this.toast.success(this.salleForm.publicId ? 'Salle mise à jour' : 'Salle créée avec succès');
    this.closeDialog();
  }

  toggleSalle(s: ISalleRef): void {
    const newActive = !s.active;
    this.refStore.toggleSalle({ publicId: s.publicId, active: newActive });
    this.toast.success(newActive ? `${s.libelle} disponible` : `${s.libelle} indisponible`);
  }

  closeDialog(): void { this.showDialog.set(false); }

  totalCapacite = computed(() =>
    this.filteredSalles().reduce((acc, s) => acc + s.capacite, 0)
  );

  typeCfg(type: string) {
    return TYPE_CFG[type] ?? { label:type, icon:'meeting_room', color:'var(--accent)', bg:'var(--accent-light)' };
  }
}
