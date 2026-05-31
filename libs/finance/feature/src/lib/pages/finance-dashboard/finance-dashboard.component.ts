import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe }    from '@angular/common';
import { MatCardModule }                 from '@angular/material/card';
import { MatIconModule }                 from '@angular/material/icon';
import { MatButtonModule }               from '@angular/material/button';
import { RouterLink }                    from '@angular/router';

import { FinanceStore }   from '../../store/finance.store';
import { AuthStore }      from '@sms/shared/auth';

@Component({
  selector: 'sms-finance-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Tableau de bord Finance</h1>
    </div>

    <div class="kpi-grid">
      <mat-card class="kpi-card kpi-total">
        <mat-card-content>
          <div class="kpi-icon"><mat-icon>receipt_long</mat-icon></div>
          <div class="kpi-value">{{ store.totalPercu() | currency:'XOF':'symbol':'1.0-0':'fr' }}</div>
          <div class="kpi-label">Total perçu</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="kpi-card kpi-impaye">
        <mat-card-content>
          <div class="kpi-icon"><mat-icon>warning</mat-icon></div>
          <div class="kpi-value">{{ store.totalImpaye() | currency:'XOF':'symbol':'1.0-0':'fr' }}</div>
          <div class="kpi-label">Impayés</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="kpi-card kpi-retard">
        <mat-card-content>
          <div class="kpi-icon"><mat-icon>schedule</mat-icon></div>
          <div class="kpi-value">{{ store.facturesEnRetard().length }}</div>
          <div class="kpi-label">En retard</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="kpi-card kpi-taux">
        <mat-card-content>
          <div class="kpi-icon"><mat-icon>trending_up</mat-icon></div>
          <div class="kpi-value">{{ store.tauxRecouvrement() }}%</div>
          <div class="kpi-label">Taux recouvrement</div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="quick-actions">
      <button mat-raised-button color="primary" routerLink="/finance/invoices">
        <mat-icon>list</mat-icon> Voir les factures
      </button>
      <button mat-raised-button routerLink="/finance/bourses">
        <mat-icon>school</mat-icon> Gérer les bourses
      </button>
      <button mat-raised-button routerLink="/finance/frais">
        <mat-icon>payments</mat-icon> Frais scolarité
      </button>
    </div>

    @if (store.facturesEnRetard().length > 0) {
      <mat-card class="alert-card">
        <mat-card-header>
          <mat-icon color="warn">warning</mat-icon>
          <mat-card-title>Factures en retard ({{ store.facturesEnRetard().length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @for (f of store.facturesEnRetard().slice(0, 5); track f.publicId) {
            <div class="alert-row">
              <span class="numero">{{ f.numero }}</span>
              <span class="montant">{{ f.solde | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
              <span class="echeance">{{ f.dateEcheance | date:'dd/MM/yyyy' }}</span>
            </div>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card { text-align: center; }
    .kpi-card mat-card-content { padding: 24px 16px; }
    .kpi-icon mat-icon { font-size: 36px; height: 36px; width: 36px; }
    .kpi-total .kpi-icon { color: #1976d2; }
    .kpi-impaye .kpi-icon { color: #d32f2f; }
    .kpi-retard .kpi-icon { color: #f57c00; }
    .kpi-taux .kpi-icon { color: #388e3c; }
    .kpi-value { font-size: 24px; font-weight: 600; margin: 8px 0 4px; }
    .kpi-label { color: rgba(0,0,0,.6); font-size: 13px; }
    .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
    .alert-card { border-left: 4px solid #d32f2f; }
    .alert-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .numero { font-weight: 500; }
    .montant { color: #d32f2f; font-weight: 600; }
    .echeance { color: rgba(0,0,0,.6); font-size: 13px; }
  `],
})
export class FinanceDashboardComponent implements OnInit {
  protected readonly store = inject(FinanceStore);
  private readonly auth   = inject(AuthStore);

  ngOnInit() {
    this.store.loadFactures(0);
  }
}
