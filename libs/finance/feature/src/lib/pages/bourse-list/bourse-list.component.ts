import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FinanceStore }  from '@sms/finance/data-access';
import { STUDENT_NAMES_MAP } from '@sms/finance/data-access';
import { AuthStore }     from '@sms/shared/auth';
import { ToastService }  from '@sms/shared/ui';
import { TypeBourse, IBourse, IBourseRequest } from '@sms/shared/models';

const TYPE_BOURSE_CFG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  BOURSE:   { label:"Bourse d'État",  icon:'account_balance',    color:'#6366f1', bg:'rgba(99,102,241,0.10)'  },
  FRATRIE:  { label:'Fratrie',        icon:'family_restroom',    color:'#0891b2', bg:'rgba(8,145,178,0.10)'   },
  FIDELITE: { label:'Fidélité',       icon:'loyalty',            color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
  PROMO:    { label:'Promotionnelle', icon:'local_offer',        color:'#ec4899', bg:'rgba(236,72,153,0.10)'  },
  MERITE:   { label:'Mérite',         icon:'emoji_events',       color:'#f59e0b', bg:'rgba(245,158,11,0.10)'  },
  SOCIALE:  { label:'Aide sociale',   icon:'volunteer_activism', color:'#16a34a', bg:'rgba(22,163,74,0.10)'   },
};

@Component({
  selector:        'sms-bourse-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- En-tête -->
  <div class="flex items-start justify-between mb-5 gap-3 flex-wrap">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <a routerLink="/finance" class="hover:opacity-70" style="color:var(--text-muted)">
          <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        </a>
        <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Bourses & Aides</h1>
      </div>
      <p class="text-sm" style="color:var(--text-secondary)">Gestion des bourses et aides financières accordées</p>
    </div>
    <button (click)="showForm.set(!showForm())"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
            style="background:var(--accent)">
      <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
      Accorder une bourse
    </button>
  </div>

  <!-- KPIs -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(99,102,241,0.10)">
        <mat-icon style="color:#6366f1;font-size:20px;height:20px;width:20px">school</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.bourses().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Total bourses</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(245,158,11,0.10)">
        <mat-icon style="color:#f59e0b;font-size:20px;height:20px;width:20px">emoji_events</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ bourseMerite() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Bourses mérite</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(22,163,74,0.10)">
        <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">volunteer_activism</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ bourseSociale() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Aides sociales</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(16,185,129,0.10)">
        <mat-icon style="color:#10b981;font-size:20px;height:20px;width:20px">savings</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color:#10b981">{{ formatXOF(totalDeductions()) }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Total accordé</p>
      </div>
    </div>
  </div>

  <!-- Formulaire accordement bourse -->
  @if (showForm()) {
    <div class="sms-card p-5 mb-5 border-l-4" style="border-left-color:var(--accent)">
      <h3 class="font-bold mb-4" style="color:var(--text-primary)">Accorder une nouvelle bourse</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Étudiant</label>
          <select [(ngModel)]="newStudentId"
                  class="w-full px-3 py-2 rounded-xl border text-sm"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
            <option value="">Sélectionner…</option>
            @for (s of studentOptions; track s.id) {
              <option [value]="s.id">{{ s.nom }}</option>
            }
          </select>
        </div>
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Type de bourse</label>
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
          <input [(ngModel)]="newPourcentage" type="number" min="1" max="100" placeholder="Ex: 20"
                 class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
        <div class="md:col-span-3">
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Motif d'attribution</label>
          <input [(ngModel)]="newMotif" placeholder="Raison de l'attribution de la bourse…"
                 class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
      </div>
      <div class="flex gap-2">
        <button (click)="accordBourse()"
                [disabled]="store.saving()"
                class="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 disabled:opacity-50"
                style="background:var(--accent)">
          @if (store.saving()) { Traitement… } @else { Accorder la bourse }
        </button>
        <button (click)="showForm.set(false)"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
      </div>
    </div>
  }

  <!-- Types de bourses chips -->
  <div class="flex flex-wrap gap-2 mb-5">
    <button (click)="typeFilter.set('')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            [style.background]="typeFilter()==='' ? 'var(--accent)' : 'var(--surface-2)'"
            [style.color]="typeFilter()==='' ? '#fff' : 'var(--text-secondary)'"
            [style.border-color]="typeFilter()==='' ? 'var(--accent)' : 'var(--border-color)'">
      Tous ({{ store.bourses().length }})
    </button>
    @for (t of typeOptions; track t.value) {
      <button (click)="typeFilter.set(typeFilter()===t.value ? '' : t.value)"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              [style.background]="typeFilter()===t.value ? typeCfg(t.value).bg : 'var(--surface-2)'"
              [style.color]="typeFilter()===t.value ? typeCfg(t.value).color : 'var(--text-secondary)'"
              [style.border-color]="typeFilter()===t.value ? typeCfg(t.value).color + '50' : 'var(--border-color)'">
        <mat-icon style="font-size:13px;height:13px;width:13px">{{ typeCfg(t.value).icon }}</mat-icon>
        {{ t.label }}
      </button>
    }
  </div>

  <!-- Liste bourses -->
  @if (store.loading()) {
    <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
    </div>
  } @else if (boursesFiltrees().length === 0) {
    <div class="sms-card flex flex-col items-center justify-center py-16 gap-3">
      <mat-icon style="font-size:48px;height:48px;width:48px;color:var(--text-muted)">school</mat-icon>
      <p class="font-semibold" style="color:var(--text-secondary)">Aucune bourse enregistrée</p>
      <button (click)="showForm.set(true)"
              class="text-sm font-semibold px-4 py-2 rounded-xl text-white"
              style="background:var(--accent)">
        Accorder la première bourse
      </button>
    </div>
  } @else {
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      @for (b of boursesFiltrees(); track b.publicId) {
        <div class="sms-card p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   [style.background]="typeCfg(b.typeBourse).bg">
                <mat-icon [style.color]="typeCfg(b.typeBourse).color"
                          style="font-size:20px;height:20px;width:20px">{{ typeCfg(b.typeBourse).icon }}</mat-icon>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    [style.background]="typeCfg(b.typeBourse).bg"
                    [style.color]="typeCfg(b.typeBourse).color">
                {{ typeLabel(b.typeBourse) }}
              </span>
            </div>
            <div class="w-2 h-2 rounded-full" style="background:#16a34a;margin-top:4px"></div>
          </div>
          <h3 class="font-bold text-sm mb-0.5" style="color:var(--text-primary)">{{ studentName(b.studentId) }}</h3>
          <p class="text-xs mb-3" style="color:var(--text-muted)">{{ b.motif ?? 'Bourse accordée' }}</p>
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-xs" style="color:var(--text-muted)">Réduction</p>
              <p class="font-bold text-lg" style="color:var(--accent)">
                {{ b.pourcentage ? b.pourcentage + '%' : formatXOF(b.montantDeduction ?? 0) }}
              </p>
            </div>
            @if (b.valideJusquAu) {
              <div class="text-right">
                <p class="text-xs" style="color:var(--text-muted)">Valide jusqu'au</p>
                <p class="text-xs font-semibold" style="color:var(--text-secondary)">{{ b.valideJusquAu }}</p>
              </div>
            }
          </div>
          <div class="flex gap-2 pt-3 border-t" style="border-color:var(--border-color)">
            <button class="flex-1 text-xs font-semibold py-1.5 rounded-lg hover:opacity-80"
                    style="background:var(--accent-light);color:var(--accent)">
              <mat-icon style="font-size:13px;height:13px;width:13px;vertical-align:middle">edit</mat-icon>
              Modifier
            </button>
            <button (click)="suspendre(b)"
                    class="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80"
                    style="background:rgba(217,119,6,0.10);color:#d97706">
              Suspendre
            </button>
            <button (click)="supprimer(b)"
                    class="p-1.5 rounded-lg hover:opacity-70"
                    style="background:rgba(239,68,68,0.10);color:#dc2626">
              <mat-icon style="font-size:14px;height:14px;width:14px">delete</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  }

</div>
  `,
})
export class BourseListComponent implements OnInit {
  readonly store  = inject(FinanceStore);
  private  auth   = inject(AuthStore);
  private  toast  = inject(ToastService);

  showForm  = signal(false);
  typeFilter = signal('');

  newStudentId  = '';
  newType       = 'MERITE';
  newPourcentage = 20;
  newMotif      = '';

  readonly studentOptions = Object.entries(STUDENT_NAMES_MAP).map(([id, nom]) => ({ id, nom }));
  readonly typeOptions    = Object.entries(TYPE_BOURSE_CFG).map(([value, cfg]) => ({ value, label: cfg.label }));

  ngOnInit() {
    this.store.loadBourses(1);
  }

  boursesFiltrees = computed(() => {
    const f = this.typeFilter();
    return f ? this.store.bourses().filter(b => b.typeBourse === f) : this.store.bourses();
  });

  bourseMerite  = computed(() => this.store.bourses().filter(b => b.typeBourse === 'MERITE').length);
  bourseSociale = computed(() => this.store.bourses().filter(b => b.typeBourse === 'SOCIALE' || b.typeBourse === 'BOURSE').length);
  totalDeductions = computed(() =>
    this.store.bourses().reduce((s, b) => s + (b.montantDeduction ?? (b.pourcentage ? 750000 * b.pourcentage / 100 : 0)), 0)
  );

  typeCfg(type: string) { return TYPE_BOURSE_CFG[type] ?? TYPE_BOURSE_CFG['BOURSE']; }
  typeLabel(type: TypeBourse): string { return TYPE_BOURSE_CFG[type]?.label ?? type; }
  studentName(id: number): string { return STUDENT_NAMES_MAP[id] ?? `Étudiant #${id}`; }

  accordBourse(): void {
    if (!this.newStudentId || !this.newMotif) {
      this.toast.error('Veuillez sélectionner un étudiant et saisir un motif');
      return;
    }
    const req: IBourseRequest = {
      studentId:    +this.newStudentId,
      typeBourse:   this.newType as TypeBourse,
      pourcentage:  this.newPourcentage,
      anneeAcademiqueId: 1,
      motif: this.newMotif,
    };
    this.store.createBourse(req);
    this.showForm.set(false);
    this.toast.success(`Bourse ${this.typeLabel(req.typeBourse)} accordée à ${this.studentName(req.studentId)}`);
  }

  suspendre(b: IBourse): void { this.toast.success(`Bourse de ${this.studentName(b.studentId)} suspendue`); }
  supprimer(b: IBourse): void {
    this.store.deleteBourse(b.publicId);
    this.toast.success('Bourse supprimée');
  }

  formatXOF(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' XOF';
  }
}
