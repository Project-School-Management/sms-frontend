import { Component, inject, OnInit, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { IFacture, StatutFacture } from '@sms/shared/models';
import { FinanceStore } from '@sms/finance/data-access';
import { PaymentDialogComponent } from '../../components/payment-dialog/payment-dialog.component';
import { SkeletonTableComponent, EmptyStateComponent, ErrorStateComponent } from '@sms/shared/ui';

const STUDENT_NAMES: Record<number, string> = {
  1: 'Awa Diallo', 2: 'Kofi Mensah', 3: 'Fatou Traoré', 4: 'Moussa Coulibaly',
  5: 'Aminata Koné', 6: 'Ibrahima Bah', 7: 'Mariam Sanogo', 8: 'Seydou Ouedraogo',
  9: 'Kadiatou Camara', 10: 'Ousmane Diakité', 11: 'Rokhaya Ndiaye', 12: 'Bakary Kouyaté',
  13: 'Bintou Keita', 14: 'Aliou Barry', 15: 'Ndeye Faye', 16: 'Lamine Sow',
  17: 'Aïssatou Baldé', 18: 'Mamadou Sall', 19: 'Oumou Dramé', 20: 'Cheikh Mbaye',
};

@Component({
  selector: 'sms-invoice-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatDialogModule, SkeletonTableComponent, EmptyStateComponent, ErrorStateComponent],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Factures</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Gestion des factures et paiements étudiants</p>
        </div>
        <a routerLink="/finance"
           class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--text-secondary)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
          Tableau de bord Finance
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent)">receipt_long</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.factures().length }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Total factures</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
            <mat-icon style="color: #16a34a">check_circle</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ payeesCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Payées</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(239,68,68,0.1)">
            <mat-icon style="color: #dc2626">warning</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.facturesEnRetard().length }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">En retard</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(217,119,6,0.1)">
            <mat-icon style="color: #d97706">hourglass_top</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ partiellesCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Partielles</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 border-b flex flex-wrap items-center gap-3" style="border-color: var(--border-color)">
          <h3 class="font-semibold flex-1" style="color: var(--text-primary)">Liste des factures</h3>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="relative">
              <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2" style="font-size: 16px; height: 16px; width: 16px; color: var(--text-muted)">search</mat-icon>
              <input
                type="search" [(ngModel)]="searchQuery"
                placeholder="Numéro de facture..."
                class="pl-8 pr-3 py-1.5 rounded-lg border text-sm focus:outline-none"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary); width: 200px" />
            </div>
            <select [(ngModel)]="filtreStatut"
              class="px-3 py-1.5 rounded-lg border text-sm"
              style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
              <option value="">Tous les statuts</option>
              <option value="EMISE">Émise</option>
              <option value="PARTIELLEMENT_PAYEE">Partielle</option>
              <option value="PAYEE">Payée</option>
              <option value="EN_RETARD">En retard</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
        </div>

        @if (store.loading()) {
          <sms-skeleton-table />
        } @else if (facturesFiltrees().length === 0) {
          <sms-empty-state type="invoices" actionLabel="Retour au tableau de bord" actionLink="/finance" />
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr style="background: var(--surface-2)">
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Numéro</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Étudiant</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Montant</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Payé</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Solde</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Statut</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Échéance</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                @for (f of facturesFiltrees(); track f.publicId) {
                  <tr class="border-t hover:opacity-80 transition-opacity" style="border-color: var(--border-color)">
                    <td class="px-4 py-3">
                      <a [routerLink]="['/finance/invoices', f.publicId]" class="font-mono text-xs font-medium hover:underline" style="color: var(--accent)">
                        {{ f.numero }}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-sm" style="color: var(--text-primary)">{{ studentName(f.studentId) }}</td>
                    <td class="px-4 py-3 text-sm font-medium" style="color: var(--text-primary)">{{ formatXOF(f.montantTotal) }}</td>
                    <td class="px-4 py-3 text-sm" style="color: #16a34a">{{ formatXOF(f.montantPaye) }}</td>
                    <td class="px-4 py-3 text-sm font-semibold" [style.color]="f.solde > 0 ? '#dc2626' : '#16a34a'">
                      {{ formatXOF(f.solde) }}
                    </td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngStyle]="statutStyle(f.statut)">
                        {{ statutLabel(f.statut) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">
                      {{ f.dateEcheance ? (f.dateEcheance | date:'dd/MM/yyyy') : '—' }}
                    </td>
                    <td class="px-4 py-3 text-right">
                      @if (f.statut !== 'PAYEE' && f.statut !== 'ANNULEE') {
                        <button (click)="openPaymentDialog(f)"
                          class="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:opacity-80 transition-opacity"
                          style="background: rgba(22,163,74,0.1); color: #16a34a">
                          <mat-icon style="font-size: 14px; height: 14px; width: 14px">payment</mat-icon>
                          Payer
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class InvoiceListComponent implements OnInit {
  protected readonly store = inject(FinanceStore);
  private readonly dialog = inject(MatDialog);

  filtreStatut = '';
  searchQuery = '';

  readonly payeesCount    = computed(() => this.store.factures().filter(f => f.statut === 'PAYEE').length);
  readonly partiellesCount = computed(() => this.store.factures().filter(f => f.statut === 'PARTIELLEMENT_PAYEE').length);

  readonly facturesFiltrees = computed(() => {
    let all = this.store.factures();
    if (this.filtreStatut) all = all.filter(f => f.statut === this.filtreStatut);
    if (this.searchQuery)  all = all.filter(f => f.numero.toLowerCase().includes(this.searchQuery.toLowerCase()));
    return all;
  });

  ngOnInit() {
    this.store.loadFactures(0);
  }

  studentName(id: number): string {
    return STUDENT_NAMES[id] ?? `Étudiant #${id}`;
  }

  formatXOF(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' XOF';
  }

  statutLabel(statut: StatutFacture): string {
    const labels: Record<StatutFacture, string> = {
      BROUILLON: 'Brouillon', EMISE: 'Émise', PARTIELLEMENT_PAYEE: 'Partielle',
      PAYEE: 'Payée', EN_RETARD: 'En retard', ANNULEE: 'Annulée',
    };
    return labels[statut] ?? statut;
  }

  statutStyle(statut: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      PAYEE:              { background: '#dcfce7', color: '#16a34a' },
      EMISE:              { background: '#dbeafe', color: '#2563eb' },
      EN_RETARD:          { background: '#fee2e2', color: '#dc2626' },
      PARTIELLEMENT_PAYEE:{ background: '#fef3c7', color: '#d97706' },
      ANNULEE:            { background: '#f3f4f6', color: '#6b7280' },
    };
    return map[statut] ?? { background: '#f3f4f6', color: '#6b7280' };
  }

  openPaymentDialog(facture: IFacture): void {
    this.dialog.open(PaymentDialogComponent, {
      width: '480px',
      maxWidth: '96vw',
      panelClass: 'sms-payment-dialog',
      data: { facture },
    });
  }
}
