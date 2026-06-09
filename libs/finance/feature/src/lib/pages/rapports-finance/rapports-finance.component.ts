import {
  ChangeDetectionStrategy, Component, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FinanceStore }  from '@sms/finance/data-access';
import {
  MOCK_RAPPORT_MENSUEL, MOCK_RAPPORT_CLASSE,
  MOCK_RAPPORT_MODE_PAIEMENT, MOCK_JOURNAL,
} from '@sms/finance/data-access';
import { ToastService } from '@sms/shared/ui';

type RapportTab = 'mensuel' | 'classes' | 'modes' | 'journal';

@Component({
  selector:        'sms-rapports-finance',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6">

  <!-- En-tête -->
  <div class="flex items-start justify-between mb-5 gap-3 flex-wrap">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <a routerLink="/finance" class="hover:opacity-70" style="color:var(--text-muted)">
          <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        </a>
        <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Rapports financiers</h1>
      </div>
      <p class="text-sm" style="color:var(--text-secondary)">Analyse financière — Année académique 2025-2026</p>
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
      <button (click)="imprimer()"
              class="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
              style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">print</mat-icon>
        Imprimer
      </button>
    </div>
  </div>

  <!-- Résumé global -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    <div class="sms-card p-5 text-center">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Total facturé</p>
      <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ fmtM(totalFacture()) }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">XOF</p>
    </div>
    <div class="sms-card p-5 text-center">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Total encaissé</p>
      <p class="text-2xl font-bold" style="color:#16a34a">{{ fmtM(totalEncaisse()) }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ tauxMoyen() }}% taux</p>
    </div>
    <div class="sms-card p-5 text-center">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Total impayé</p>
      <p class="text-2xl font-bold" style="color:#dc2626">{{ fmtM(totalFacture() - totalEncaisse()) }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">XOF</p>
    </div>
    <div class="sms-card p-5 text-center">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Taux moyen</p>
      <p class="text-2xl font-bold" style="color:var(--accent)">{{ tauxMoyen() }}%</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">recouvrement</p>
    </div>
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 mb-5 p-1 rounded-2xl"
       style="background:var(--surface-2);border:1px solid var(--border-color)">
    @for (tab of tabs; track tab.id) {
      <button (click)="activeTab.set(tab.id)"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center"
              [style.background]="activeTab()===tab.id ? 'var(--surface-1)' : 'transparent'"
              [style.color]="activeTab()===tab.id ? 'var(--text-primary)' : 'var(--text-secondary)'"
              [style.box-shadow]="activeTab()===tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'">
        <mat-icon style="font-size:16px;height:16px;width:16px">{{ tab.icon }}</mat-icon>
        {{ tab.label }}
      </button>
    }
  </div>

  <!-- Rapport mensuel -->
  @if (activeTab() === 'mensuel') {
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b" style="border-color:var(--border-color)">
        <h3 class="font-bold" style="color:var(--text-primary)">Évolution mensuelle des recettes</h3>
      </div>
      <!-- Histogramme visuel -->
      <div class="px-5 py-4">
        <div class="flex items-end gap-3 h-40 mb-4">
          @for (m of mensuel; track m.mois) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ fmtM(m.encaisse) }}</span>
              <div class="w-full rounded-t-lg"
                   [style.height.px]="(m.encaisse / maxMensuel()) * 120"
                   style="background:var(--accent);min-height:4px"></div>
              <span class="text-xs" style="color:var(--text-muted)">{{ m.mois }}</span>
            </div>
          }
        </div>
      </div>
      <!-- Table -->
      <table class="w-full text-sm">
        <thead>
          <tr style="background:var(--surface-2)">
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Mois</th>
            <th class="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Facturé</th>
            <th class="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Encaissé</th>
            <th class="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Impayé</th>
            <th class="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Taux</th>
          </tr>
        </thead>
        <tbody>
          @for (m of mensuel; track m.mois) {
            <tr class="border-t hover:opacity-80" style="border-color:var(--border-color)">
              <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">{{ m.mois }}</td>
              <td class="px-4 py-3 text-right" style="color:var(--text-secondary)">{{ formatXOF(m.facture) }}</td>
              <td class="px-4 py-3 text-right font-semibold" style="color:#16a34a">{{ formatXOF(m.encaisse) }}</td>
              <td class="px-4 py-3 text-right" style="color:#dc2626">{{ formatXOF(m.impaye) }}</td>
              <td class="px-4 py-3 text-right">
                <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                      [style.background]="m.taux >= 90 ? 'rgba(22,163,74,0.10)' : m.taux >= 80 ? 'rgba(245,158,11,0.10)' : 'rgba(239,68,68,0.10)'"
                      [style.color]="m.taux >= 90 ? '#16a34a' : m.taux >= 80 ? '#d97706' : '#dc2626'">
                  {{ m.taux }}%
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }

  <!-- Par classe -->
  @if (activeTab() === 'classes') {
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b" style="border-color:var(--border-color)">
        <h3 class="font-bold" style="color:var(--text-primary)">Recouvrement par classe</h3>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr style="background:var(--surface-2)">
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Classe</th>
            <th class="text-center px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Effectif</th>
            <th class="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Facturé</th>
            <th class="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Encaissé</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Taux</th>
          </tr>
        </thead>
        <tbody>
          @for (c of classes; track c.classe) {
            <tr class="border-t hover:opacity-80" style="border-color:var(--border-color)">
              <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">{{ c.classe }}</td>
              <td class="px-4 py-3 text-center" style="color:var(--text-secondary)">{{ c.effectif }}</td>
              <td class="px-4 py-3 text-right" style="color:var(--text-secondary)">{{ fmtM(c.facture) }}</td>
              <td class="px-4 py-3 text-right font-semibold" style="color:#16a34a">{{ fmtM(c.encaisse) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="flex-1 rounded-full h-2" style="background:var(--surface-2)">
                    <div class="h-2 rounded-full"
                         [style.background]="c.taux >= 90 ? '#16a34a' : c.taux >= 80 ? '#f59e0b' : '#ef4444'"
                         [style.width]="c.taux + '%'"></div>
                  </div>
                  <span class="text-xs font-bold shrink-0" style="color:var(--text-secondary)">{{ c.taux }}%</span>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }

  <!-- Modes de paiement -->
  @if (activeTab() === 'modes') {
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Répartition par mode de paiement</h3>
        <div class="flex flex-col gap-4">
          @for (m of modes; track m.mode) {
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-medium" style="color:var(--text-primary)">{{ m.mode }}</span>
                <div class="text-right">
                  <span class="text-sm font-bold" style="color:var(--text-primary)">{{ m.pct }}%</span>
                  <span class="text-xs ml-2" style="color:var(--text-muted)">{{ m.nb }} op.</span>
                </div>
              </div>
              <div class="rounded-full h-2.5" style="background:var(--surface-2)">
                <div class="h-2.5 rounded-full" style="background:var(--accent)"
                     [style.width]="m.pct + '%'"></div>
              </div>
              <p class="text-xs mt-0.5 text-right" style="color:var(--text-muted)">{{ formatXOF(m.montant) }}</p>
            </div>
          }
        </div>
      </div>
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Indicateurs clés</h3>
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between p-3 rounded-xl" style="background:var(--surface-2)">
            <span class="text-sm" style="color:var(--text-secondary)">Mode préféré</span>
            <span class="font-bold text-sm" style="color:var(--text-primary)">{{ modes[0].mode }}</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl" style="background:var(--surface-2)">
            <span class="text-sm" style="color:var(--text-secondary)">% Mobile Money</span>
            <span class="font-bold text-sm" style="color:var(--accent)">{{ mobileMoneyPct() }}%</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl" style="background:var(--surface-2)">
            <span class="text-sm" style="color:var(--text-secondary)">Montant total</span>
            <span class="font-bold text-sm" style="color:#16a34a">{{ formatXOF(totalModes()) }}</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl" style="background:var(--surface-2)">
            <span class="text-sm" style="color:var(--text-secondary)">Nb opérations</span>
            <span class="font-bold text-sm" style="color:var(--text-primary)">{{ totalOperations() }}</span>
          </div>
        </div>
      </div>
    </div>
  }

  <!-- Journal des opérations -->
  @if (activeTab() === 'journal') {
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b flex items-center justify-between"
           style="border-color:var(--border-color)">
        <h3 class="font-bold" style="color:var(--text-primary)">Journal complet des opérations</h3>
        <span class="text-sm" style="color:var(--text-muted)">{{ journal.length }} entrées</span>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr style="background:var(--surface-2)">
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Date</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Type</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Détail</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Auteur</th>
            <th class="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Montant</th>
          </tr>
        </thead>
        <tbody>
          @for (op of journal; track op.publicId) {
            <tr class="border-t hover:opacity-80" style="border-color:var(--border-color)">
              <td class="px-4 py-3 text-xs" style="color:var(--text-muted)">{{ op.date }}</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                      [style.background]="opBg(op.type)"
                      [style.color]="opColor(op.type)">
                  {{ op.type }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm" style="color:var(--text-secondary)">{{ op.detail }}</td>
              <td class="px-4 py-3 text-xs" style="color:var(--text-muted)">{{ op.auteur }}</td>
              <td class="px-4 py-3 text-right font-bold text-sm"
                  [style.color]="op.type === 'ANNULATION' ? '#dc2626' : '#16a34a'">
                {{ op.type === 'ANNULATION' ? '—' : '+' }}{{ formatXOF(op.montant) }}
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
export class RapportsFinanceComponent {
  private store = inject(FinanceStore);
  private toast = inject(ToastService);

  activeTab = signal<RapportTab>('mensuel');

  readonly mensuel = MOCK_RAPPORT_MENSUEL;
  readonly classes = MOCK_RAPPORT_CLASSE;
  readonly modes   = MOCK_RAPPORT_MODE_PAIEMENT;
  readonly journal = MOCK_JOURNAL;

  readonly tabs = [
    { id:'mensuel' as RapportTab, label:'Mensuel',  icon:'calendar_month' },
    { id:'classes' as RapportTab, label:'Classses',  icon:'class'          },
    { id:'modes'   as RapportTab, label:'Modes paiement', icon:'payments'  },
    { id:'journal' as RapportTab, label:'Journal',   icon:'list_alt'       },
  ];

  totalFacture()  { return this.mensuel.reduce((s, m) => s + m.facture, 0); }
  totalEncaisse() { return this.mensuel.reduce((s, m) => s + m.encaisse, 0); }
  tauxMoyen()     { return Math.round((this.totalEncaisse() / this.totalFacture()) * 100); }
  maxMensuel()    { return Math.max(...this.mensuel.map(m => m.encaisse), 1); }
  mobileMoneyPct() { return this.modes.filter(m => m.mode.includes('Money')).reduce((s, m) => s + m.pct, 0); }
  totalModes()     { return this.modes.reduce((s, m) => s + m.montant, 0); }
  totalOperations(){ return this.modes.reduce((s, m) => s + m.nb, 0); }

  opColor(type: string): string {
    return { PAIEMENT:'#16a34a', REMBOURSEMENT:'#d97706', REDUCTION:'#0891b2',
             BOURSE:'#8b5cf6', CREATION:'#6366f1', MODIFICATION:'#6b7280', ANNULATION:'#dc2626' }[type] ?? '#6b7280';
  }

  opBg(type: string): string {
    return { PAIEMENT:'rgba(22,163,74,0.10)', REMBOURSEMENT:'rgba(217,119,6,0.10)',
             REDUCTION:'rgba(8,145,178,0.10)', BOURSE:'rgba(139,92,246,0.10)',
             CREATION:'rgba(99,102,241,0.10)', MODIFICATION:'rgba(107,114,128,0.10)',
             ANNULATION:'rgba(239,68,68,0.10)' }[type] ?? 'rgba(107,114,128,0.10)';
  }

  fmtM(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`;
    return `${Math.round(n / 1_000)}k`;
  }

  formatXOF(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' XOF';
  }

  exportPDF():   void { this.toast.success('Rapport PDF généré — téléchargement simulé'); }
  exportExcel(): void { this.toast.success('Rapport Excel généré — téléchargement simulé'); }
  imprimer():    void { window.print(); }
}
