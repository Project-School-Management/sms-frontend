import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink }   from '@angular/router';
import { MatCardModule }                from '@angular/material/card';
import { MatTableModule }               from '@angular/material/table';
import { MatChipsModule }               from '@angular/material/chips';
import { MatButtonModule }              from '@angular/material/button';
import { MatIconModule }                from '@angular/material/icon';
import { MatDialog, MatDialogModule }   from '@angular/material/dialog';

import { FinanceStore }           from '@sms/finance/data-access';
import { PaymentDialogComponent } from '../../components/payment-dialog/payment-dialog.component';

@Component({
  selector: 'sms-invoice-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, RouterLink,
    MatCardModule, MatTableModule, MatChipsModule, MatButtonModule, MatIconModule, MatDialogModule,
  ],
  template: `
    <a routerLink="/finance/invoices" class="back-link">
      <mat-icon>arrow_back</mat-icon> Retour aux factures
    </a>

    @if (store.loading()) {
      <div class="loading-state">Chargement...</div>
    } @else if (facture()) {
      <div class="detail-layout">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Facture {{ facture()!.numero }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip [class]="'chip-' + facture()!.statut.toLowerCase()">
                {{ facture()!.statut }}
              </mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Montant total</span>
                <span class="value">{{ facture()!.montantTotal | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Montant payé</span>
                <span class="value paid">{{ facture()!.montantPaye | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Solde restant</span>
                <span class="value" [class.outstanding]="facture()!.solde > 0">
                  {{ facture()!.solde | currency:'XOF':'symbol':'1.0-0':'fr' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Date échéance</span>
                <span class="value">{{ facture()!.dateEcheance ? (facture()!.dateEcheance | date:'dd/MM/yyyy') : '—' }}</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            @if (facture()!.statut !== 'PAYEE' && facture()!.statut !== 'ANNULEE') {
              <button mat-raised-button color="primary" (click)="openPaymentDialog()">
                <mat-icon>payment</mat-icon> Payer maintenant
              </button>
            }
          </mat-card-actions>
        </mat-card>

        @if (facture()!.echeancier.length > 0) {
          <mat-card class="echeancier-card">
            <mat-card-header>
              <mat-card-title>Échéancier</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-table [dataSource]="facture()!.echeancier">
                <ng-container matColumnDef="numero">
                  <mat-header-cell *matHeaderCellDef>#</mat-header-cell>
                  <mat-cell *matCellDef="let e">{{ e.numero }}</mat-cell>
                </ng-container>
                <ng-container matColumnDef="montantDu">
                  <mat-header-cell *matHeaderCellDef>Montant</mat-header-cell>
                  <mat-cell *matCellDef="let e">{{ e.montantDu | currency:'XOF':'symbol':'1.0-0':'fr' }}</mat-cell>
                </ng-container>
                <ng-container matColumnDef="dateEcheance">
                  <mat-header-cell *matHeaderCellDef>Date limite</mat-header-cell>
                  <mat-cell *matCellDef="let e">{{ e.dateEcheance | date:'dd/MM/yyyy' }}</mat-cell>
                </ng-container>
                <ng-container matColumnDef="estPaye">
                  <mat-header-cell *matHeaderCellDef>Statut</mat-header-cell>
                  <mat-cell *matCellDef="let e">
                    <mat-icon [color]="e.estPaye ? 'primary' : 'warn'">
                      {{ e.estPaye ? 'check_circle' : 'pending' }}
                    </mat-icon>
                  </mat-cell>
                </ng-container>
                <mat-header-row *matHeaderRowDef="['numero','montantDu','dateEcheance','estPaye']"/>
                <mat-row *matRowDef="let row; columns: ['numero','montantDu','dateEcheance','estPaye']"/>
              </mat-table>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .back-link { display: flex; align-items: center; gap: 4px; color: #1976d2; text-decoration: none; margin-bottom: 20px; }
    .loading-state { text-align: center; padding: 48px; }
    .detail-layout { display: flex; flex-direction: column; gap: 20px; max-width: 800px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
    .detail-item { display: flex; flex-direction: column; gap: 4px; }
    .label { font-size: 12px; color: rgba(0,0,0,.5); text-transform: uppercase; letter-spacing: .5px; }
    .value { font-size: 18px; font-weight: 500; }
    .paid { color: #388e3c; }
    .outstanding { color: #d32f2f; }
    .chip-payee { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-en_retard { background: #ffebee !important; color: #c62828 !important; }
    .chip-emise { background: #e3f2fd !important; color: #1565c0 !important; }
  `],
})
export class InvoiceDetailComponent implements OnInit {
  protected readonly store = inject(FinanceStore);
  private readonly route   = inject(ActivatedRoute);
  private readonly dialog  = inject(MatDialog);

  readonly facture = this.store.selectedFacture;

  ngOnInit() {
    const publicId = this.route.snapshot.paramMap.get('publicId');
    if (publicId) this.store.selectFacture(publicId);
  }

  openPaymentDialog(): void {
    const f = this.facture();
    if (!f) return;
    this.dialog.open(PaymentDialogComponent, {
      width: '480px',
      maxWidth: '96vw',
      panelClass: 'sms-payment-dialog',
      data: { facture: f },
    });
  }
}
