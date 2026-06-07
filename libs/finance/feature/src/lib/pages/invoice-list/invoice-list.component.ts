import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule }        from '@angular/material/table';
import { MatPaginatorModule }    from '@angular/material/paginator';
import { MatChipsModule }        from '@angular/material/chips';
import { MatButtonModule }       from '@angular/material/button';
import { MatIconModule }         from '@angular/material/icon';
import { MatInputModule }        from '@angular/material/input';
import { MatFormFieldModule }    from '@angular/material/form-field';
import { MatSelectModule }       from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink }            from '@angular/router';
import { FormsModule }           from '@angular/forms';

import { IFacture, StatutFacture }  from '@sms/shared/models';
import { FinanceStore }             from '@sms/finance/data-access';
import { PaymentDialogComponent }   from '../../components/payment-dialog/payment-dialog.component';

@Component({
  selector: 'sms-invoice-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, FormsModule,
    MatTableModule, MatPaginatorModule, MatChipsModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule,
    MatDialogModule, RouterLink,
  ],
  template: `
    <div class="page-header">
      <h1>Factures</h1>
      <div class="filters">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Statut</mat-label>
          <mat-select [(ngModel)]="filtreStatut" (ngModelChange)="applyFilter()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="EMISE">Émises</mat-option>
            <mat-option value="PARTIELLEMENT_PAYEE">Partiellement payées</mat-option>
            <mat-option value="PAYEE">Payées</mat-option>
            <mat-option value="EN_RETARD">En retard</mat-option>
            <mat-option value="ANNULEE">Annulées</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>

    @if (store.loading()) {
      <div class="loading-state">Chargement...</div>
    } @else if (facturesFiltrees.length === 0) {
      <div class="empty-state">
        <mat-icon>receipt_long</mat-icon>
        <p>Aucune facture trouvée</p>
      </div>
    } @else {
      <mat-table [dataSource]="facturesFiltrees" class="invoice-table">
        <ng-container matColumnDef="numero">
          <mat-header-cell *matHeaderCellDef>Numéro</mat-header-cell>
          <mat-cell *matCellDef="let f">
            <a [routerLink]="['/finance/invoices', f.publicId]" class="link">{{ f.numero }}</a>
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="montantTotal">
          <mat-header-cell *matHeaderCellDef>Montant</mat-header-cell>
          <mat-cell *matCellDef="let f">
            {{ f.montantTotal | currency:'XOF':'symbol':'1.0-0':'fr' }}
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="solde">
          <mat-header-cell *matHeaderCellDef>Solde</mat-header-cell>
          <mat-cell *matCellDef="let f" [class.solde-zero]="f.solde === 0">
            {{ f.solde | currency:'XOF':'symbol':'1.0-0':'fr' }}
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="statut">
          <mat-header-cell *matHeaderCellDef>Statut</mat-header-cell>
          <mat-cell *matCellDef="let f">
            <mat-chip [class]="'chip-' + f.statut.toLowerCase()">
              {{ statutLabel(f.statut) }}
            </mat-chip>
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="dateEcheance">
          <mat-header-cell *matHeaderCellDef>Échéance</mat-header-cell>
          <mat-cell *matCellDef="let f">
            {{ f.dateEcheance ? (f.dateEcheance | date:'dd/MM/yyyy') : '—' }}
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="actions">
          <mat-header-cell *matHeaderCellDef></mat-header-cell>
          <mat-cell *matCellDef="let f">
            @if (f.statut !== 'PAYEE' && f.statut !== 'ANNULEE') {
              <button mat-icon-button color="primary" (click)="openPaymentDialog(f)"
                      matTooltip="Payer">
                <mat-icon>payment</mat-icon>
              </button>
            }
          </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="columns"/>
        <mat-row *matRowDef="let row; columns: columns"/>
      </mat-table>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .empty-state { text-align: center; padding: 48px; color: rgba(0,0,0,.5); }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; }
    .loading-state { padding: 24px; text-align: center; }
    .link { color: #1976d2; text-decoration: none; font-weight: 500; }
    .link:hover { text-decoration: underline; }
    .solde-zero { color: #388e3c; font-weight: 600; }
    .chip-payee { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-emise { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-en_retard { background: #ffebee !important; color: #c62828 !important; }
    .chip-partiellement_payee { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-annulee { background: #f5f5f5 !important; color: rgba(0,0,0,.4) !important; }
    .invoice-table { width: 100%; }
  `],
})
export class InvoiceListComponent implements OnInit {
  protected readonly store = inject(FinanceStore);
  private readonly dialog = inject(MatDialog);

  columns = ['numero', 'montantTotal', 'solde', 'statut', 'dateEcheance', 'actions'];
  filtreStatut = '';

  get facturesFiltrees(): IFacture[] {
    const all = this.store.factures();
    if (!this.filtreStatut) return all;
    return all.filter(f => f.statut === this.filtreStatut);
  }

  ngOnInit() {
    this.store.loadFactures(0);
  }

  applyFilter(): void { /* filtre appliqué via getter facturesFiltrees */ }

  statutLabel(statut: StatutFacture): string {
    const labels: Record<StatutFacture, string> = {
      BROUILLON:          'Brouillon',
      EMISE:              'Émise',
      PARTIELLEMENT_PAYEE:'Partiel',
      PAYEE:              'Payée',
      EN_RETARD:          'En retard',
      ANNULEE:            'Annulée',
    };
    return labels[statut] ?? statut;
  }

  openPaymentDialog(facture: IFacture): void {
    this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { facture },
    });
  }
}
