import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MOCK_REDUCTIONS, IReduction, STUDENT_NAMES_MAP } from '@sms/finance/data-access';
import { ToastService } from '@sms/shared/ui';

const TYPE_CFG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  FRATRIE:    { label:'Fratrie',       icon:'family_restroom', color:'#6366f1', bg:'rgba(99,102,241,0.10)'  },
  FIDELITE:   { label:'Fidélité',      icon:'loyalty',         color:'#0891b2', bg:'rgba(8,145,178,0.10)'   },
  PROMO:      { label:'Promotion',     icon:'local_offer',     color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
  AIDE_SOCIALE:{ label:'Aide sociale', icon:'volunteer_activism', color:'#16a34a', bg:'rgba(22,163,74,0.10)' },
  EXCELLENCE: { label:'Excellence',    icon:'emoji_events',    color:'#f59e0b', bg:'rgba(245,158,11,0.10)'  },
  AUTRE:      { label:'Autre',         icon:'more_horiz',      color:'#6b7280', bg:'rgba(107,114,128,0.10)' },
};

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label:'Active',    color:'#16a34a', bg:'rgba(22,163,74,0.10)'   },
  SUSPENDUE: { label:'Suspendue', color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
  EXPIREE:   { label:'Expirée',   color:'#6b7280', bg:'rgba(107,114,128,0.10)' },
};

@Component({
  selector:        'sms-reductions-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- En-tête -->
  <div class="flex items-start justify-between mb-5 gap-3 flex-wrap">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <a routerLink="/finance" class="hover:opacity-70 transition-opacity" style="color:var(--text-muted)">
          <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        </a>
        <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Réductions & Remises</h1>
      </div>
      <p class="text-sm" style="color:var(--text-secondary)">Gestion des réductions accordées aux étudiants</p>
    </div>
    <button (click)="showForm.set(true)"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
            style="background:var(--accent)">
      <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
      Nouvelle réduction
    </button>
  </div>

  <!-- KPIs -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:var(--accent-light)">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">discount</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ reductions.length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Total</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(22,163,74,0.10)">
        <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">check_circle</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:#16a34a">{{ actives() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Actives</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(16,185,129,0.10)">
        <mat-icon style="color:#10b981;font-size:20px;height:20px;width:20px">savings</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color:#10b981">{{ formatXOF(totalEconomise()) }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Total économisé</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(107,114,128,0.10)">
        <mat-icon style="color:#6b7280;font-size:20px;height:20px;width:20px">history</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:#6b7280">{{ expirees() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Expirées</p>
      </div>
    </div>
  </div>

  <!-- Formulaire ajout (inline) -->
  @if (showForm()) {
    <div class="sms-card p-5 mb-5 border-l-4" style="border-left-color:var(--accent)">
      <h3 class="font-bold mb-4" style="color:var(--text-primary)">Nouvelle réduction</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Étudiant</label>
          <select [(ngModel)]="newStudentId"
                  class="w-full px-3 py-2 rounded-xl border text-sm"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
            <option value="">Sélectionner…</option>
            @for (entry of studentOptions; track entry.id) {
              <option [value]="entry.id">{{ entry.nom }}</option>
            }
          </select>
        </div>
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Type</label>
          <select [(ngModel)]="newType"
                  class="w-full px-3 py-2 rounded-xl border text-sm"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
            @for (t of typeOptions; track t.value) {
              <option [value]="t.value">{{ t.label }}</option>
            }
          </select>
        </div>
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Pourcentage (%)</label>
          <input [(ngModel)]="newPct" type="number" min="1" max="100" placeholder="Ex: 10"
                 class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Motif</label>
          <input [(ngModel)]="newMotif" placeholder="Raison de la réduction…"
                 class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Date fin (optionnel)</label>
          <input [(ngModel)]="newDateFin" type="date"
                 class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
      </div>
      <div class="flex gap-2">
        <button (click)="validerReduction()"
                class="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
                style="background:var(--accent)">
          Valider la réduction
        </button>
        <button (click)="showForm.set(false)"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">
          Annuler
        </button>
      </div>
    </div>
  }

  <!-- Grille réductions -->
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    @for (r of reductions; track r.publicId) {
      <div class="sms-card p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [style.background]="typeCfg(r.type).bg">
              <mat-icon [style.color]="typeCfg(r.type).color"
                        style="font-size:20px;height:20px;width:20px">{{ typeCfg(r.type).icon }}</mat-icon>
            </div>
            <div>
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    [style.background]="typeCfg(r.type).bg"
                    [style.color]="typeCfg(r.type).color">
                {{ typeCfg(r.type).label }}
              </span>
            </div>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                [style.background]="statutCfg(r.statut).bg"
                [style.color]="statutCfg(r.statut).color">
            {{ statutCfg(r.statut).label }}
          </span>
        </div>
        <h3 class="font-bold text-sm mb-0.5" style="color:var(--text-primary)">{{ r.libelle }}</h3>
        <p class="text-xs mb-3" style="color:var(--text-secondary)">{{ r.studentNom }}</p>
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-xs" style="color:var(--text-muted)">Réduction</p>
            <p class="font-bold text-base" style="color:var(--accent)">
              {{ r.pourcentage ? r.pourcentage + '%' : formatXOF(r.montantFixe ?? 0) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs" style="color:var(--text-muted)">Économie</p>
            <p class="font-bold text-base" style="color:#16a34a">{{ formatXOF(r.montantEconomise) }}</p>
          </div>
        </div>
        <p class="text-xs mb-3 italic" style="color:var(--text-muted)">{{ r.motif }}</p>
        <div class="flex items-center gap-1 text-xs mb-3" style="color:var(--text-muted)">
          <mat-icon style="font-size:12px;height:12px;width:12px">event</mat-icon>
          {{ r.dateDebut }}
          @if (r.dateFin) { → {{ r.dateFin }} }
        </div>
        <div class="flex gap-2 pt-3 border-t" style="border-color:var(--border-color)">
          <button class="flex-1 text-xs font-semibold py-1.5 rounded-lg hover:opacity-80"
                  style="background:var(--accent-light);color:var(--accent)">
            Modifier
          </button>
          @if (r.statut === 'ACTIVE') {
            <button (click)="suspendre(r)"
                    class="flex-1 text-xs font-semibold py-1.5 rounded-lg hover:opacity-80"
                    style="background:rgba(217,119,6,0.10);color:#d97706">
              Suspendre
            </button>
          }
          @if (r.statut === 'SUSPENDUE') {
            <button (click)="reactiver(r)"
                    class="flex-1 text-xs font-semibold py-1.5 rounded-lg hover:opacity-80"
                    style="background:rgba(22,163,74,0.10);color:#16a34a">
              Réactiver
            </button>
          }
        </div>
      </div>
    }
  </div>

</div>
  `,
})
export class ReductionsListComponent {
  private toast  = inject(ToastService);
  reductions     = [...MOCK_REDUCTIONS];

  showForm   = signal(false);
  newStudentId = '';
  newType    = 'FRATRIE';
  newPct     = 10;
  newMotif   = '';
  newDateFin = '';

  readonly typeOptions = Object.entries(TYPE_CFG).map(([value, cfg]) => ({ value, label: cfg.label }));
  readonly studentOptions = Object.entries(STUDENT_NAMES_MAP).map(([id, nom]) => ({ id, nom }));

  actives()       { return this.reductions.filter(r => r.statut === 'ACTIVE').length; }
  expirees()      { return this.reductions.filter(r => r.statut === 'EXPIREE').length; }
  totalEconomise(){ return this.reductions.filter(r => r.statut === 'ACTIVE').reduce((s, r) => s + r.montantEconomise, 0); }

  typeCfg(type: string) { return TYPE_CFG[type] ?? TYPE_CFG['AUTRE']; }
  statutCfg(s: string)  { return STATUT_CFG[s]   ?? STATUT_CFG['ACTIVE']; }

  validerReduction(): void {
    if (!this.newStudentId || !this.newMotif) {
      this.toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const newR: IReduction = {
      publicId: `red-${Date.now()}`,
      studentId: +this.newStudentId,
      studentNom: STUDENT_NAMES_MAP[+this.newStudentId] ?? '',
      type: this.newType as IReduction['type'],
      libelle: `${TYPE_CFG[this.newType].label} — ${this.newPct}%`,
      pourcentage: this.newPct,
      motif: this.newMotif,
      validePar: 'Admin courant',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: this.newDateFin || undefined,
      statut: 'ACTIVE',
      montantEconomise: Math.round(750000 * this.newPct / 100),
    };
    this.reductions = [newR, ...this.reductions];
    this.showForm.set(false);
    this.toast.success('Réduction créée et validée avec succès');
  }

  suspendre(r: IReduction): void {
    r.statut = 'SUSPENDUE';
    this.reductions = [...this.reductions];
    this.toast.success(`Réduction de ${r.studentNom} suspendue`);
  }

  reactiver(r: IReduction): void {
    r.statut = 'ACTIVE';
    this.reductions = [...this.reductions];
    this.toast.success(`Réduction de ${r.studentNom} réactivée`);
  }

  formatXOF(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' XOF';
  }
}
