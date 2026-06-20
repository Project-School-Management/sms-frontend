import {
  Component, ChangeDetectionStrategy, inject, OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule }    from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LibraryStore } from '@sms/library/data-access';
import { ILoan } from '@sms/shared/models';

@Component({
  selector: 'sms-my-loans',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, MatTooltipModule],
  template: `
<div class="my-loans">

  <div class="page-header">
    <div>
      <h1 class="page-title"><mat-icon>bookmark</mat-icon> Mes emprunts</h1>
      <p class="page-sub">Suivez vos emprunts en cours et votre historique</p>
    </div>
    <a routerLink="/library" class="btn btn-outline">
      <mat-icon>arrow_back</mat-icon> Retour catalogue
    </a>
  </div>

  <!-- Stats rapides -->
  <div class="loan-stats">
    <div class="lstat-card">
      <mat-icon class="lstat-icon text-blue">hourglass_empty</mat-icon>
      <div><p class="lstat-val">{{ store.loansByStatus().enCours }}</p><p class="lstat-lbl">En cours</p></div>
    </div>
    <div class="lstat-card">
      <mat-icon class="lstat-icon text-red">warning</mat-icon>
      <div><p class="lstat-val">{{ store.loansByStatus().enRetard }}</p><p class="lstat-lbl">En retard</p></div>
    </div>
    <div class="lstat-card">
      <mat-icon class="lstat-icon text-green">check_circle</mat-icon>
      <div><p class="lstat-val">{{ store.loansByStatus().retournes }}</p><p class="lstat-lbl">Retournés</p></div>
    </div>
  </div>

  <!-- Emprunts en cours -->
  @if (store.activeLoans().length) {
    <section class="loans-section">
      <h2 class="section-title">Emprunts actifs</h2>
      <div class="loans-list">
        @for (loan of store.activeLoans(); track loan.publicId) {
          <div class="loan-card" [class.overdue]="loan.statut === 'EN_RETARD'">
            <div class="loan-cover">
              @if (loan.urlCouverture) {
                <img [src]="loan.urlCouverture" [alt]="loan.ressourceTitre" class="loan-img" />
              } @else {
                <div class="loan-placeholder">
                  <mat-icon>{{ typeIcon(loan.type) }}</mat-icon>
                </div>
              }
            </div>
            <div class="loan-info">
              <h3 class="loan-titre">{{ loan.ressourceTitre }}</h3>
              <p class="loan-auteur">{{ loan.ressourceAuteur }}</p>
              <div class="loan-dates">
                <span><mat-icon class="date-icon">calendar_today</mat-icon> Emprunté le {{ loan.dateEmprunt | date:'dd/MM/yyyy' }}</span>
                <span [class.date-red]="loan.statut === 'EN_RETARD'">
                  <mat-icon class="date-icon">event</mat-icon> Retour prévu le {{ loan.dateRetourPrevue | date:'dd/MM/yyyy' }}
                </span>
              </div>
              @if (loan.nbRenouvellements > 0) {
                <p class="loan-renew-info">Renouvelé {{ loan.nbRenouvellements }}/2 fois</p>
              }
            </div>
            <div class="loan-actions">
              <span class="statut-badge" [class]="'statut-' + loan.statut.toLowerCase()">
                {{ statutLabel(loan.statut) }}
              </span>
              <div class="action-btns">
                @if (loan.nbRenouvellements < 2 && loan.statut !== 'EN_RETARD') {
                  <button class="btn btn-sm btn-outline" (click)="onRenew(loan.publicId)" [disabled]="store.saving()">
                    <mat-icon>refresh</mat-icon> Renouveler
                  </button>
                }
                <button class="btn btn-sm btn-danger-outline" (click)="onReturn(loan.publicId)" [disabled]="store.saving()">
                  <mat-icon>keyboard_return</mat-icon> Retourner
                </button>
              </div>
              <a [routerLink]="['/library/loan', loan.publicId]" class="detail-link">
                <mat-icon>info</mat-icon> Détails
              </a>
            </div>
          </div>
        }
      </div>
    </section>
  } @else {
    <div class="empty-active">
      <mat-icon>bookmark_border</mat-icon>
      <p>Aucun emprunt en cours</p>
      <a routerLink="/library" class="btn btn-primary">Parcourir le catalogue</a>
    </div>
  }

  <!-- Historique -->
  @if (store.loans().length > store.activeLoans().length) {
    <section class="loans-section">
      <h2 class="section-title">Historique</h2>
      <div class="history-table">
        <div class="history-header">
          <span>Ressource</span><span>Emprunté</span><span>Retour prévu</span><span>Retour effectif</span><span>Statut</span>
        </div>
        @for (loan of store.loans(); track loan.publicId) {
          @if (loan.statut === 'RETOURNE' || loan.statut === 'PERDU') {
            <div class="history-row" [routerLink]="['/library/loan', loan.publicId]">
              <span class="hist-titre">{{ loan.ressourceTitre }}</span>
              <span>{{ loan.dateEmprunt | date:'dd/MM/yy' }}</span>
              <span>{{ loan.dateRetourPrevue | date:'dd/MM/yy' }}</span>
              <span>{{ loan.dateRetourEffective ? (loan.dateRetourEffective | date:'dd/MM/yy') : '—' }}</span>
              <span class="statut-badge" [class]="'statut-' + loan.statut.toLowerCase()">{{ statutLabel(loan.statut) }}</span>
            </div>
          }
        }
      </div>
    </section>
  }
</div>
  `,
  styles: [`
.my-loans { padding: 24px; max-width: 1100px; margin: 0 auto; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; }
.page-title { font-size: 22px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; margin: 0; }
.page-sub { font-size: 13px; color: #64748b; margin: 4px 0 0 32px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; transition: all .2s; }
.btn-primary { background: #6366f1; color: #fff; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e2e8f0; }
.btn-outline:hover { background: #f8fafc; }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn-danger-outline { background: #fff; color: #dc2626; border: 1px solid #fca5a5; }
.btn-danger-outline:hover { background: #fee2e2; }
button:disabled { opacity: .6; cursor: not-allowed; }

/* Stats */
.loan-stats { display: flex; gap: 16px; margin-bottom: 28px; }
.lstat-card { background: #fff; border-radius: 10px; padding: 14px 20px; box-shadow: 0 1px 3px rgba(0,0,0,.08); display: flex; align-items: center; gap: 10px; }
.lstat-icon { font-size: 26px; }
.lstat-val { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0; }
.lstat-lbl { font-size: 12px; color: #64748b; margin: 0; }
.text-blue { color: #3B82F6; } .text-red { color: #EF4444; } .text-green { color: #10B981; }

/* Section */
.loans-section { margin-bottom: 32px; }
.section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #374151; margin-bottom: 14px; }

/* Loan card */
.loans-list { display: flex; flex-direction: column; gap: 12px; }
.loan-card { display: flex; align-items: center; gap: 16px; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.08); border-left: 4px solid #6366f1; }
.loan-card.overdue { border-left-color: #EF4444; background: #fff5f5; }
.loan-img, .loan-placeholder { width: 56px; height: 72px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.loan-placeholder { background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
.loan-info { flex: 1; }
.loan-titre { font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.loan-auteur { font-size: 12px; color: #6366f1; margin: 0 0 8px; }
.loan-dates { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #64748b; }
.date-icon { font-size: 13px; vertical-align: middle; }
.date-red { color: #dc2626; font-weight: 500; }
.loan-renew-info { font-size: 11px; color: #94a3b8; margin: 6px 0 0; }
.loan-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.action-btns { display: flex; gap: 8px; }
.detail-link { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #6366f1; text-decoration: none; }
.detail-link:hover { text-decoration: underline; }
.detail-link mat-icon { font-size: 15px !important; height: 15px !important; width: 15px !important; }

/* Badges */
.statut-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.statut-en_cours { background: #dbeafe; color: #1e40af; }
.statut-en_retard { background: #fee2e2; color: #991b1b; }
.statut-retourne { background: #d1fae5; color: #065f46; }
.statut-perdu { background: #f1f5f9; color: #475569; }

/* Empty */
.empty-active { text-align: center; padding: 48px; color: #64748b; background: #fff; border-radius: 12px; }
.empty-active .mat-icon { font-size: 48px; color: #cbd5e1; margin-bottom: 12px; }
.empty-active p { margin: 0 0 16px; }

/* History table */
.history-table { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.history-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; padding: 10px 16px; background: #f8fafc; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
.history-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; padding: 12px 16px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #374151; align-items: center; cursor: pointer; }
.history-row:hover { background: #f8fafc; }
.hist-titre { font-weight: 500; }

/* Tailles d'icônes — override du .mat-icon { !important } global */
.lstat-icon { font-size: 26px !important; height: 26px !important; width: 26px !important; }
.date-icon  { font-size: 14px !important; height: 14px !important; width: 14px !important; vertical-align: middle; }
.empty-active .mat-icon { font-size: 48px !important; height: 48px !important; width: 48px !important; color: #cbd5e1; }
  `],
})
export class MyLoansComponent implements OnInit {
  protected readonly store = inject(LibraryStore);

  ngOnInit(): void {
    this.store.loadLoans('std-001');
  }

  protected onRenew(loanId: string): void {
    this.store.renewLoan(loanId);
  }

  protected onReturn(loanId: string): void {
    this.store.returnResource(loanId);
  }

  protected typeIcon(type: string): string {
    const icons: Record<string, string> = {
      LIVRE: 'book', PDF: 'picture_as_pdf', VIDEO: 'play_circle',
      AUDIO: 'headphones', LIEN: 'link', PERIODIQUE: 'newspaper',
    };
    return icons[type] ?? 'description';
  }

  protected statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      EN_COURS: 'En cours', EN_RETARD: 'En retard',
      RETOURNE: 'Retourné', PERDU: 'Perdu',
    };
    return labels[statut] ?? statut;
  }
}
