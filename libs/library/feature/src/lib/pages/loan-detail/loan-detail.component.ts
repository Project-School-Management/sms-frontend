import {
  Component, ChangeDetectionStrategy, inject, OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LibraryStore, LibraryApiService } from '@sms/library/data-access';
import { ILoan } from '@sms/shared/models';

const TARIF_RETARD_JOUR = 100; // FCFA / jour de retard

@Component({
  selector: 'sms-loan-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="loan-detail">
  <a routerLink="/library/my-loans" class="back-link"><mat-icon>arrow_back</mat-icon> Mes emprunts</a>

  @if (store.loading()) {
    <div class="loading-state"><mat-icon class="spin">sync</mat-icon><p>Chargement…</p></div>
  } @else {
    @if (store.selectedLoan(); as loan) {
    <div class="ld-header" [class.overdue]="loan.statut === 'EN_RETARD'">
      <div class="ld-cover">
        @if (loan.urlCouverture) {
          <img [src]="loan.urlCouverture" [alt]="loan.ressourceTitre" />
        } @else {
          <div class="cover-ph"><mat-icon>{{ typeIcon(loan.type) }}</mat-icon></div>
        }
      </div>
      <div class="ld-head-info">
        <span class="statut-badge" [class]="'statut-' + loan.statut.toLowerCase()">{{ statutLabel(loan.statut) }}</span>
        <h1 class="ld-titre">{{ loan.ressourceTitre }}</h1>
        <p class="ld-auteur">{{ loan.ressourceAuteur }}</p>
        <a [routerLink]="['/library/resource', loan.ressourcePublicId]" class="ld-link">
          <mat-icon>open_in_new</mat-icon> Voir la fiche de la ressource
        </a>
      </div>
    </div>

    <!-- Échéance -->
    <div class="ld-banner" [class]="bannerClass(loan)">
      <mat-icon>{{ bannerIcon(loan) }}</mat-icon>
      <span>{{ bannerText(loan) }}</span>
    </div>

    <!-- Détails -->
    <div class="ld-grid">
      <div class="ld-card">
        <h2 class="ld-card-title">Informations de l'emprunt</h2>
        <div class="info-row"><span>Emprunteur</span><strong>{{ loan.studentNom }}</strong></div>
        <div class="info-row"><span>Date d'emprunt</span><strong>{{ loan.dateEmprunt | date:'dd MMMM yyyy' }}</strong></div>
        <div class="info-row"><span>Retour prévu</span><strong [class.txt-red]="loan.statut === 'EN_RETARD'">{{ loan.dateRetourPrevue | date:'dd MMMM yyyy' }}</strong></div>
        @if (loan.dateRetourEffective) {
          <div class="info-row"><span>Retour effectif</span><strong>{{ loan.dateRetourEffective | date:'dd MMMM yyyy' }}</strong></div>
        }
        <div class="info-row"><span>Renouvellements</span><strong>{{ loan.nbRenouvellements }}/2</strong></div>
      </div>

      <div class="ld-card">
        <h2 class="ld-card-title">Échéance & frais</h2>
        @if (loan.statut === 'EN_RETARD') {
          <div class="amende-box">
            <mat-icon>warning</mat-icon>
            <div>
              <p class="amende-val">{{ amende(loan) | number }} FCFA</p>
              <p class="amende-lbl">Amende de retard ({{ joursRetard(loan) }} jour(s) × {{ tarif }} FCFA)</p>
            </div>
          </div>
        } @else if (loan.statut === 'EN_COURS') {
          <div class="info-row"><span>Jours restants</span><strong>{{ joursRestants(loan) }} jour(s)</strong></div>
          <div class="info-row"><span>Aucune amende</span><strong class="txt-green">À jour</strong></div>
        } @else {
          <div class="info-row"><span>Statut</span><strong class="txt-green">Clôturé</strong></div>
        }
      </div>
    </div>

    <!-- Actions -->
    @if (loan.statut === 'EN_COURS' || loan.statut === 'EN_RETARD') {
      <div class="ld-actions">
        @if (loan.nbRenouvellements < 2 && loan.statut === 'EN_COURS') {
          <button class="btn btn-outline" (click)="onRenew(loan)" [disabled]="store.saving()">
            <mat-icon>refresh</mat-icon> Renouveler (+14 jours)
          </button>
        }
        <button class="btn btn-primary" (click)="onReturn(loan)" [disabled]="store.saving()">
          <mat-icon>keyboard_return</mat-icon> Marquer comme retourné
        </button>
      </div>
    }
    } @else {
    <div class="empty"><mat-icon>search_off</mat-icon><p>Emprunt introuvable.</p></div>
    }
  }
</div>
  `,
  styles: [`
.loan-detail { padding: 24px; max-width: 900px; margin: 0 auto; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: #6366f1; text-decoration: none; font-size: 14px; margin-bottom: 20px; }
.back-link:hover { text-decoration: underline; }
.loading-state, .empty { text-align: center; padding: 80px; color: #64748b; }
.empty mat-icon { font-size: 56px !important; height: 56px !important; width: 56px !important; color: #cbd5e1; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; font-size: 32px !important; height: 32px !important; width: 32px !important; }

.ld-header { display: flex; gap: 20px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.08); border-left: 4px solid #6366f1; margin-bottom: 16px; }
.ld-header.overdue { border-left-color: #ef4444; }
.ld-cover img, .cover-ph { width: 90px; height: 124px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.cover-ph { background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
.cover-ph mat-icon { font-size: 40px !important; height: 40px !important; width: 40px !important; color: #94a3b8; }
.ld-head-info { flex: 1; }
.statut-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
.statut-en_cours { background: #dbeafe; color: #1e40af; }
.statut-en_retard { background: #fee2e2; color: #991b1b; }
.statut-retourne { background: #d1fae5; color: #065f46; }
.statut-perdu { background: #f1f5f9; color: #475569; }
.ld-titre { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
.ld-auteur { font-size: 14px; color: #6366f1; margin: 0 0 12px; }
.ld-link { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #64748b; text-decoration: none; }
.ld-link:hover { color: #6366f1; }
.ld-link mat-icon { font-size: 16px !important; height: 16px !important; width: 16px !important; }

.ld-banner { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 10px; font-size: 14px; font-weight: 500; margin-bottom: 16px; }
.banner-ok { background: #d1fae5; color: #065f46; }
.banner-soon { background: #fef3c7; color: #92400e; }
.banner-late { background: #fee2e2; color: #991b1b; }
.banner-done { background: #f1f5f9; color: #475569; }

.ld-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.ld-card { background: #fff; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.ld-card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6366f1; margin: 0 0 14px; }
.info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; }
.info-row:last-child { border-bottom: none; }
.info-row strong { color: #1e293b; }
.txt-red { color: #dc2626 !important; }
.txt-green { color: #059669 !important; }

.amende-box { display: flex; gap: 12px; align-items: center; background: #fee2e2; border-radius: 10px; padding: 14px; }
.amende-box mat-icon { color: #dc2626; font-size: 28px !important; height: 28px !important; width: 28px !important; }
.amende-val { font-size: 20px; font-weight: 700; color: #991b1b; margin: 0; }
.amende-lbl { font-size: 12px; color: #b91c1c; margin: 2px 0 0; }

.ld-actions { display: flex; gap: 12px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; transition: all .2s; }
.btn-primary { background: #6366f1; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #4f46e5; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e2e8f0; }
.btn-outline:hover { background: #f8fafc; }
.btn:disabled { opacity: .5; cursor: not-allowed; }

@media (max-width: 768px) { .ld-grid { grid-template-columns: 1fr; } }
  `],
})
export class LoanDetailComponent implements OnInit {
  protected readonly store = inject(LibraryStore);
  private readonly api   = inject(LibraryApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly tarif = TARIF_RETARD_JOUR;
  private loanId = '';

  ngOnInit(): void {
    this.loanId = this.route.snapshot.paramMap.get('publicId') ?? '';
    if (this.loanId) this.store.loadLoan(this.loanId);
  }

  // ── Calculs d'échéance ──
  private jours(dateIso: string): number {
    const cible = new Date(dateIso); cible.setHours(0, 0, 0, 0);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((cible.getTime() - now.getTime()) / 86400000);
  }
  protected joursRestants(loan: ILoan): number { return Math.max(0, this.jours(loan.dateRetourPrevue)); }
  protected joursRetard(loan: ILoan): number   { return Math.max(0, -this.jours(loan.dateRetourPrevue)); }
  protected amende(loan: ILoan): number         { return this.joursRetard(loan) * TARIF_RETARD_JOUR; }

  protected bannerClass(loan: ILoan): string {
    if (loan.statut === 'EN_RETARD') return 'banner-late';
    if (loan.statut === 'RETOURNE' || loan.statut === 'PERDU') return 'banner-done';
    return this.joursRestants(loan) <= 3 ? 'banner-soon' : 'banner-ok';
  }
  protected bannerIcon(loan: ILoan): string {
    if (loan.statut === 'EN_RETARD') return 'error';
    if (loan.statut === 'RETOURNE' || loan.statut === 'PERDU') return 'check_circle';
    return this.joursRestants(loan) <= 3 ? 'schedule' : 'check_circle';
  }
  protected bannerText(loan: ILoan): string {
    if (loan.statut === 'EN_RETARD') return `En retard de ${this.joursRetard(loan)} jour(s)`;
    if (loan.statut === 'RETOURNE') return 'Emprunt retourné et clôturé';
    if (loan.statut === 'PERDU')    return 'Ressource déclarée perdue';
    const j = this.joursRestants(loan);
    return j <= 3 ? `À retourner bientôt — ${j} jour(s) restant(s)` : `Emprunt en cours — ${j} jour(s) restant(s)`;
  }

  protected onReturn(loan: ILoan): void {
    this.api.returnResource(loan.publicId).subscribe(() => {
      this.store.loadLoan(this.loanId);
      this.store.loadLoans(undefined);
    });
  }
  protected onRenew(loan: ILoan): void {
    this.api.renewLoan(loan.publicId).subscribe(() => {
      this.store.loadLoan(this.loanId);
      this.store.loadLoans(undefined);
    });
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
      EN_COURS: 'En cours', EN_RETARD: 'En retard', RETOURNE: 'Retourné', PERDU: 'Perdu',
    };
    return labels[statut] ?? statut;
  }
}
