import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FinanceStore }  from '@sms/finance/data-access';
import { MOCK_RECUS, STUDENT_NAMES_MAP } from '@sms/finance/data-access';
import { ToastService } from '@sms/shared/ui';

const OPERATEUR_CFG: Record<string, { icon: string; color: string; bg: string }> = {
  'WAVE':          { icon:'bolt',         color:'#2563eb', bg:'rgba(37,99,235,0.10)'  },
  'ORANGE_MONEY':  { icon:'signal_wifi_4_bar', color:'#f97316', bg:'rgba(249,115,22,0.10)' },
  'MTN_MOMO':      { icon:'cell_tower',   color:'#eab308', bg:'rgba(234,179,8,0.10)'  },
  'MOOV_MONEY':    { icon:'phone_android',color:'#0891b2', bg:'rgba(8,145,178,0.10)'  },
  'VIREMENT_BANCAIRE':{ icon:'account_balance', color:'#6366f1', bg:'rgba(99,102,241,0.10)' },
  'ESPECES':       { icon:'payments',     color:'#16a34a', bg:'rgba(22,163,74,0.10)'  },
};

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRME:   { label:'Confirmé',  color:'#16a34a', bg:'rgba(22,163,74,0.10)'   },
  EN_ATTENTE: { label:'En attente',color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
  ECHOUE:     { label:'Échoué',    color:'#dc2626', bg:'rgba(239,68,68,0.10)'   },
  REMBOURSE:  { label:'Remboursé', color:'#6b7280', bg:'rgba(107,114,128,0.10)' },
};

@Component({
  selector:        'sms-paiements-list',
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
        <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Paiements</h1>
      </div>
      <p class="text-sm" style="color:var(--text-secondary)">Historique et suivi de tous les paiements</p>
    </div>
    <div class="flex items-center gap-2">
      <button (click)="exportPDF()"
              class="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
              style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">picture_as_pdf</mat-icon>
        Export PDF
      </button>
      <button (click)="exportExcel()"
              class="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
              style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">table_chart</mat-icon>
        Excel
      </button>
    </div>
  </div>

  <!-- KPIs -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(22,163,74,0.10)">
        <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">payments</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.paiements().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Total paiements</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(22,163,74,0.10)">
        <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">check_circle</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:#16a34a">{{ confirmes() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Confirmés</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(217,119,6,0.10)">
        <mat-icon style="color:#d97706;font-size:20px;height:20px;width:20px">hourglass_top</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:#d97706">{{ enAttente() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">En attente</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:var(--accent-light)">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">account_balance_wallet</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color:var(--text-primary)">{{ formatXOF(totalMontant()) }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Total encaissé</p>
      </div>
    </div>
  </div>

  <!-- Filtres -->
  <div class="flex flex-wrap gap-3 mb-5 items-center">
    <div class="flex items-center gap-2 px-3 py-2 rounded-xl border"
         style="background:var(--surface-2);border-color:var(--border-color)">
      <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
      <input [(ngModel)]="searchQuery" placeholder="Rechercher…"
             class="text-sm bg-transparent outline-none w-44"
             style="color:var(--text-primary)"/>
    </div>
    <select [(ngModel)]="statutFilter"
            class="px-3 py-2 rounded-xl border text-sm"
            style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
      <option value="">Tous les statuts</option>
      <option value="CONFIRME">Confirmé</option>
      <option value="EN_ATTENTE">En attente</option>
      <option value="ECHOUE">Échoué</option>
    </select>
    <select [(ngModel)]="operateurFilter"
            class="px-3 py-2 rounded-xl border text-sm"
            style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
      <option value="">Tous les opérateurs</option>
      <option value="WAVE">Wave</option>
      <option value="ORANGE_MONEY">Orange Money</option>
      <option value="MTN_MOMO">MTN MoMo</option>
      <option value="ESPECES">Espèces</option>
      <option value="VIREMENT_BANCAIRE">Virement</option>
    </select>
  </div>

  <!-- Table paiements -->
  <div class="sms-card overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr style="background:var(--surface-2)">
          <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Référence</th>
          <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Facture</th>
          <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Étudiant</th>
          <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Date</th>
          <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Montant</th>
          <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Opérateur</th>
          <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Statut</th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        @for (p of paiementsFiltres(); track p.publicId) {
          <tr class="border-t hover:opacity-80 transition-opacity"
              style="border-color:var(--border-color)">
            <td class="px-4 py-3 font-mono text-xs font-semibold" style="color:var(--text-secondary)">
              {{ p.referenceExterne ?? '—' }}
            </td>
            <td class="px-4 py-3 text-xs" style="color:var(--accent)">{{ p.facturePublicId }}</td>
            <td class="px-4 py-3">
              <p class="text-sm font-medium" style="color:var(--text-primary)">{{ studentName(p.telephone) }}</p>
              <p class="text-xs" style="color:var(--text-muted)">{{ p.telephone }}</p>
            </td>
            <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ p.createdDate }}</td>
            <td class="px-4 py-3 font-bold text-sm" style="color:#16a34a">{{ formatXOF(p.montant) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                     [style.background]="operateurCfg(p.operateur).bg">
                  <mat-icon [style.color]="operateurCfg(p.operateur).color"
                            style="font-size:12px;height:12px;width:12px">{{ operateurCfg(p.operateur).icon }}</mat-icon>
                </div>
                <span class="text-xs" style="color:var(--text-secondary)">{{ p.operateur.replace('_',' ') }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    [style.background]="statutCfg(p.statut).bg"
                    [style.color]="statutCfg(p.statut).color">
                {{ statutCfg(p.statut).label }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-1">
                <button (click)="imprimerRecu(p.publicId)"
                        class="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                        style="background:var(--accent-light);color:var(--accent)" title="Imprimer reçu">
                  <mat-icon style="font-size:14px;height:14px;width:14px">print</mat-icon>
                </button>
                <button (click)="telechargerPDF(p.publicId)"
                        class="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                        style="background:rgba(16,185,129,0.10);color:#10b981" title="Télécharger PDF">
                  <mat-icon style="font-size:14px;height:14px;width:14px">download</mat-icon>
                </button>
                @if (p.statut === 'CONFIRME') {
                  <button (click)="annulerPaiement(p.publicId)"
                          class="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                          style="background:rgba(239,68,68,0.10);color:#dc2626" title="Annuler">
                    <mat-icon style="font-size:14px;height:14px;width:14px">cancel</mat-icon>
                  </button>
                }
              </div>
            </td>
          </tr>
        }
        @if (paiementsFiltres().length === 0) {
          <tr><td colspan="8" class="px-4 py-12 text-center" style="color:var(--text-muted)">
            Aucun paiement trouvé
          </td></tr>
        }
      </tbody>
    </table>
  </div>

  <!-- Reçus récents -->
  <div class="sms-card p-5 mt-5">
    <h3 class="font-bold mb-4" style="color:var(--text-primary)">Reçus récents</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      @for (r of recus; track r.publicId) {
        <div class="p-4 rounded-2xl border hover:shadow-md transition-shadow"
             style="background:var(--surface-2);border-color:var(--border-color)">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold" style="color:var(--accent)">{{ r.numero }}</span>
            <span class="text-xs" style="color:var(--text-muted)">{{ r.date.split(' ')[0] }}</span>
          </div>
          <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ r.studentNom }}</p>
          <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ r.studentClasse }}</p>
          <p class="text-lg font-bold mt-2" style="color:#16a34a">{{ formatXOF(r.montant) }}</p>
          <p class="text-xs" style="color:var(--text-muted)">via {{ r.operateur }} · {{ r.typeFrequence }}</p>
          <div class="flex gap-2 mt-3">
            <button (click)="imprimerRecu(r.publicId)"
                    class="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80 text-white"
                    style="background:var(--accent)">
              <mat-icon style="font-size:13px;height:13px;width:13px">print</mat-icon>
              Imprimer
            </button>
            <button (click)="telechargerPDF(r.publicId)"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80"
                    style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
              <mat-icon style="font-size:13px;height:13px;width:13px">download</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  </div>

</div>
  `,
})
export class PaiementsListComponent implements OnInit {
  readonly store  = inject(FinanceStore);
  private  toast  = inject(ToastService);

  readonly recus = MOCK_RECUS;

  searchQuery     = '';
  statutFilter    = '';
  operateurFilter = '';

  ngOnInit() { this.store.loadFactures(0); }

  confirmes  = computed(() => this.store.paiements().filter(p => p.statut === 'CONFIRME').length);
  enAttente  = computed(() => this.store.paiements().filter(p => p.statut === 'EN_ATTENTE').length);
  totalMontant = computed(() => this.store.paiements().filter(p => p.statut === 'CONFIRME').reduce((s, p) => s + p.montant, 0));

  paiementsFiltres = computed(() => {
    let list = this.store.paiements();
    if (this.statutFilter)    list = list.filter(p => p.statut   === this.statutFilter);
    if (this.operateurFilter) list = list.filter(p => p.operateur === this.operateurFilter);
    if (this.searchQuery)     list = list.filter(p =>
      p.publicId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (p.referenceExterne ?? '').toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return list;
  });

  studentName(_tel: string): string {
    const idx = Math.floor(Math.random() * 10) + 1;
    return STUDENT_NAMES_MAP[idx] ?? 'Étudiant';
  }

  operateurCfg(op: string) { return OPERATEUR_CFG[op] ?? OPERATEUR_CFG['ESPECES']; }
  statutCfg(s: string)     { return STATUT_CFG[s]      ?? STATUT_CFG['EN_ATTENTE']; }

  formatXOF(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' XOF';
  }

  imprimerRecu(id: string): void {
    this.toast.success(`Reçu ${id} envoyé à l'impression`);
    setTimeout(() => window.print(), 200);
  }

  telechargerPDF(id: string): void {
    this.toast.success(`Reçu PDF ${id} — téléchargement simulé`);
  }

  annulerPaiement(id: string): void {
    this.toast.error(`Paiement ${id} annulé`);
  }

  exportPDF():   void { this.toast.success('Export PDF des paiements généré'); }
  exportExcel(): void { this.toast.success('Export Excel des paiements généré'); }
}
