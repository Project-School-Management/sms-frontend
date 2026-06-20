import {
  Component, ChangeDetectionStrategy, inject, OnInit, signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule }    from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LibraryStore } from '@sms/library/data-access';
import { ILoan } from '@sms/shared/models';

@Component({
  selector: 'sms-loan-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatTooltipModule],
  template: `
<div class="loan-mgmt">

  <div class="page-header">
    <div>
      <h1 class="page-title"><mat-icon>manage_search</mat-icon> Gestion des emprunts</h1>
      <p class="page-sub">Suivi et administration de tous les emprunts</p>
    </div>
    <a routerLink="/library" class="btn btn-outline">
      <mat-icon>arrow_back</mat-icon> Catalogue
    </a>
  </div>

  <!-- KPIs -->
  <div class="kpi-row">
    <div class="kpi-card kpi-blue">
      <p class="kpi-val">{{ store.loans().length }}</p>
      <p class="kpi-lbl">Total emprunts</p>
    </div>
    <div class="kpi-card kpi-orange">
      <p class="kpi-val">{{ store.loansByStatus().enCours }}</p>
      <p class="kpi-lbl">En cours</p>
    </div>
    <div class="kpi-card kpi-red">
      <p class="kpi-val">{{ store.loansByStatus().enRetard }}</p>
      <p class="kpi-lbl">En retard</p>
    </div>
    <div class="kpi-card kpi-green">
      <p class="kpi-val">{{ store.loansByStatus().retournes }}</p>
      <p class="kpi-lbl">Retournés</p>
    </div>
  </div>

  <!-- Filtres -->
  <div class="filters-row">
    <div class="search-wrap">
      <mat-icon class="search-icon">search</mat-icon>
      <input type="text" class="search-input" placeholder="Rechercher élève ou ressource…"
        [(ngModel)]="searchTerm" />
    </div>
    <select class="filter-select" [(ngModel)]="filterStatut">
      <option value="">Tous les statuts</option>
      <option value="EN_COURS">En cours</option>
      <option value="EN_RETARD">En retard</option>
      <option value="RETOURNE">Retourné</option>
    </select>
  </div>

  <!-- Table -->
  <div class="loans-table-wrap">
    <table class="loans-table">
      <thead>
        <tr>
          <th>Ressource</th>
          <th>Élève</th>
          <th>Date emprunt</th>
          <th>Retour prévu</th>
          <th>Retour effectif</th>
          <th>Renouvellements</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (loan of filteredLoans(); track loan.publicId) {
          <tr [class.row-overdue]="loan.statut === 'EN_RETARD'">
            <td>
              <div class="res-cell">
                @if (loan.urlCouverture) {
                  <img [src]="loan.urlCouverture" [alt]="loan.ressourceTitre" class="mini-cover" />
                }
                <div>
                  <p class="res-titre">{{ loan.ressourceTitre }}</p>
                  <p class="res-auteur">{{ loan.ressourceAuteur }}</p>
                </div>
              </div>
            </td>
            <td>{{ loan.studentNom }}</td>
            <td>{{ loan.dateEmprunt | date:'dd/MM/yyyy' }}</td>
            <td [class.date-red]="loan.statut === 'EN_RETARD'">{{ loan.dateRetourPrevue | date:'dd/MM/yyyy' }}</td>
            <td>{{ loan.dateRetourEffective ? (loan.dateRetourEffective | date:'dd/MM/yyyy') : '—' }}</td>
            <td class="text-center">{{ loan.nbRenouvellements }}/2</td>
            <td>
              <span class="statut-badge statut-{{ loan.statut.toLowerCase() }}">{{ statutLabel(loan.statut) }}</span>
            </td>
            <td>
              <div class="row-actions">
                <a class="action-btn" [routerLink]="['/library/loan', loan.publicId]" matTooltip="Voir le détail">
                  <mat-icon>visibility</mat-icon>
                </a>
                @if (loan.statut === 'EN_COURS' || loan.statut === 'EN_RETARD') {
                  <button class="action-btn" (click)="onReturn(loan.publicId)" [disabled]="store.saving()" matTooltip="Marquer retourné">
                    <mat-icon>keyboard_return</mat-icon>
                  </button>
                  @if (loan.nbRenouvellements < 2 && loan.statut === 'EN_COURS') {
                    <button class="action-btn" (click)="onRenew(loan.publicId)" [disabled]="store.saving()" matTooltip="Renouveler">
                      <mat-icon>refresh</mat-icon>
                    </button>
                  }
                }
              </div>
            </td>
          </tr>
        } @empty {
          <tr>
            <td colspan="8" class="empty-row">Aucun emprunt trouvé</td>
          </tr>
        }
      </tbody>
    </table>
  </div>

</div>
  `,
  styles: [`
.loan-mgmt { padding: 24px; max-width: 1300px; margin: 0 auto; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; }
.page-title { font-size: 22px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; margin: 0; }
.page-sub { font-size: 13px; color: #64748b; margin: 4px 0 0 32px; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e2e8f0; }
.btn-outline:hover { background: #f8fafc; }

/* KPIs */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.kpi-card { border-radius: 12px; padding: 16px 20px; }
.kpi-blue { background: #dbeafe; } .kpi-orange { background: #fef3c7; } .kpi-red { background: #fee2e2; } .kpi-green { background: #d1fae5; }
.kpi-val { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
.kpi-lbl { font-size: 12px; color: #64748b; margin: 0; }

/* Filters */
.filters-row { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }
.search-wrap { position: relative; display: flex; align-items: center; flex: 1; }
.search-icon { position: absolute; left: 12px; color: #94a3b8; font-size: 18px; }
.search-input { width: 100%; padding: 9px 12px 9px 38px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; outline: none; background: #fff; }
.search-input:focus { border-color: #6366f1; }
.filter-select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; background: #fff; outline: none; }

/* Table */
.loans-table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); overflow: auto; }
.loans-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.loans-table thead tr { background: #f8fafc; }
.loans-table th { padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
.loans-table td { padding: 12px 14px; border-top: 1px solid #f1f5f9; color: #374151; vertical-align: middle; }
.loans-table tbody tr:hover { background: #f8fafc; }
.row-overdue td { background: #fff5f5; }
.row-overdue:hover td { background: #fee2e2; }

.res-cell { display: flex; align-items: center; gap: 10px; }
.mini-cover { width: 36px; height: 48px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
.res-titre { font-weight: 600; color: #1e293b; margin: 0 0 2px; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.res-auteur { font-size: 11px; color: #94a3b8; margin: 0; }
.date-red { color: #dc2626; font-weight: 600; }
.text-center { text-align: center; }

.statut-badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.statut-en_cours { background: #dbeafe; color: #1e40af; }
.statut-en_retard { background: #fee2e2; color: #991b1b; }
.statut-retourne { background: #d1fae5; color: #065f46; }
.statut-perdu { background: #f1f5f9; color: #475569; }

.row-actions { display: flex; gap: 6px; }
.action-btn { width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; transition: all .15s; }
.action-btn:hover:not(:disabled) { background: #6366f1; color: #fff; border-color: #6366f1; }
.action-btn:disabled { opacity: .5; cursor: not-allowed; }
.action-btn .mat-icon { font-size: 18px !important; height: 18px !important; width: 18px !important; }
.empty-row { text-align: center; padding: 32px; color: #94a3b8; }

/* Tailles d'icônes — override du .mat-icon { !important } global */
.search-icon { font-size: 18px !important; height: 18px !important; width: 18px !important; }
  `],
})
export class LoanManagementComponent implements OnInit {
  protected readonly store = inject(LibraryStore);
  protected searchTerm  = '';
  protected filterStatut = '';

  ngOnInit(): void {
    this.store.loadLoans(undefined);
  }

  protected filteredLoans(): ILoan[] {
    let list = this.store.loans();
    if (this.filterStatut) list = list.filter(l => l.statut === this.filterStatut);
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(l =>
        l.ressourceTitre.toLowerCase().includes(q) ||
        l.studentNom.toLowerCase().includes(q)
      );
    }
    return list;
  }

  protected onReturn(loanId: string): void { this.store.returnResource(loanId); }
  protected onRenew(loanId: string): void  { this.store.renewLoan(loanId); }

  protected statutLabel(statut: string): string {
    const l: Record<string, string> = {
      EN_COURS: 'En cours', EN_RETARD: 'En retard',
      RETOURNE: 'Retourné', PERDU: 'Perdu',
    };
    return l[statut] ?? statut;
  }
}
