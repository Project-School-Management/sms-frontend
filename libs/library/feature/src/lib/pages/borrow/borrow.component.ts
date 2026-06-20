import {
  Component, ChangeDetectionStrategy, inject, OnInit, signal, computed,
} from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LibraryStore, LibraryApiService } from '@sms/library/data-access';
import { StudentPickerComponent } from '@sms/library/ui';
import { ILoan } from '@sms/shared/models';

@Component({
  selector: 'sms-borrow',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, StudentPickerComponent],
  template: `
<div class="borrow-page">
  <a routerLink="/library" class="back-link"><mat-icon>arrow_back</mat-icon> Catalogue</a>

  @if (store.loading()) {
    <div class="loading-state"><mat-icon class="spin">sync</mat-icon><p>Chargement…</p></div>
  } @else if (done()) {
    <!-- ── Écran de confirmation ── -->
    <div class="success-card">
      <div class="success-ic"><mat-icon>check_circle</mat-icon></div>
      <h1>Emprunt confirmé</h1>
      <p class="success-sub">L'emprunt a bien été enregistré.</p>
      @if (result(); as loan) {
        <div class="success-recap">
          <div class="recap-row"><span>Ressource</span><strong>{{ loan.ressourceTitre }}</strong></div>
          <div class="recap-row"><span>Emprunteur</span><strong>{{ loan.studentNom }}</strong></div>
          <div class="recap-row"><span>À retourner avant le</span><strong>{{ loan.dateRetourPrevue | date:'dd MMMM yyyy' }}</strong></div>
        </div>
      }
      <div class="success-actions">
        <a routerLink="/library/my-loans" class="btn btn-primary"><mat-icon>bookmark</mat-icon> Voir les emprunts</a>
        <a routerLink="/library" class="btn btn-outline">Retour au catalogue</a>
      </div>
    </div>
  } @else {
    @if (store.selectedResource(); as res) {
    <h1 class="page-title"><mat-icon>bookmark_add</mat-icon> Nouvel emprunt</h1>

    <div class="borrow-layout">
      <!-- Récap ressource -->
      <aside class="res-recap">
        <div class="recap-cover">
          @if (res.urlCouverture) {
            <img [src]="res.urlCouverture" [alt]="res.titre" />
          } @else {
            <div class="cover-ph"><mat-icon>book</mat-icon></div>
          }
        </div>
        <h2 class="recap-titre">{{ res.titre }}</h2>
        <p class="recap-auteur">{{ res.auteur }}</p>
        <div class="recap-meta">
          <span class="chip">{{ res.categorie }}</span>
          <span class="chip">{{ res.type }}</span>
        </div>
        <div class="recap-dispo" [class.ko]="res.nbDisponibles === 0">
          <mat-icon>{{ res.nbDisponibles > 0 ? 'check_circle' : 'cancel' }}</mat-icon>
          {{ res.nbDisponibles }}/{{ res.nbExemplaires }} exemplaire(s) disponible(s)
        </div>
        @if (res.emplacement) {
          <div class="recap-loc"><mat-icon>location_on</mat-icon> {{ res.emplacement }}@if (res.cote) { · {{ res.cote }}}</div>
        }
      </aside>

      <!-- Formulaire -->
      <section class="borrow-form">
        @if (res.nbDisponibles === 0) {
          <div class="alert alert-warn">
            <mat-icon>info</mat-icon>
            <div>
              <strong>Aucun exemplaire papier disponible.</strong>
              <p>Vous pouvez réserver cette ressource pour être notifié dès son retour.</p>
              <a [routerLink]="['/library/reserve', res.publicId]" class="btn btn-warn btn-sm"><mat-icon>event_available</mat-icon> Réserver</a>
            </div>
          </div>
        } @else {
          <div class="form-group">
            <label>Emprunteur <span class="req">*</span></label>
            <sms-student-picker
              [students]="store.students()"
              [value]="studentId()"
              (valueChange)="studentId.set($event)" />
          </div>

          <div class="form-group">
            <label>Durée de l'emprunt</label>
            <div class="duree-options">
              @for (d of durees; track d.value) {
                <button type="button" class="duree-chip" [class.active]="duree() === d.value" (click)="duree.set(d.value)">
                  {{ d.label }}
                </button>
              }
            </div>
          </div>

          <div class="form-summary">
            <div class="sum-row"><mat-icon>event</mat-icon><span>Date d'emprunt</span><strong>{{ today | date:'dd/MM/yyyy' }}</strong></div>
            <div class="sum-row"><mat-icon>event_available</mat-icon><span>Retour prévu</span><strong>{{ dateRetour() | date:'dd/MM/yyyy' }}</strong></div>
          </div>

          @if (store.error()) {
            <div class="alert alert-error"><mat-icon>error</mat-icon> {{ store.error() }}</div>
          }

          <div class="form-actions">
            <button class="btn btn-primary" [disabled]="!studentId() || submitting()" (click)="confirm(res.publicId)">
              <mat-icon>check</mat-icon> {{ submitting() ? 'Enregistrement…' : 'Confirmer l\\'emprunt' }}
            </button>
            <a routerLink="/library" class="btn btn-outline">Annuler</a>
          </div>
        }
      </section>
    </div>
    }
  }
</div>
  `,
  styles: [`
.borrow-page { padding: 24px; max-width: 980px; margin: 0 auto; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: #6366f1; text-decoration: none; font-size: 14px; margin-bottom: 20px; }
.back-link:hover { text-decoration: underline; }
.page-title { font-size: 22px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; margin: 0 0 24px; }

.loading-state { text-align: center; padding: 80px; color: #64748b; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; font-size: 32px !important; height: 32px !important; width: 32px !important; }

.borrow-layout { display: grid; grid-template-columns: 280px 1fr; gap: 28px; }

/* Récap */
.res-recap { background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.08); text-align: center; height: fit-content; }
.recap-cover img, .cover-ph { width: 120px; height: 170px; object-fit: cover; border-radius: 8px; margin: 0 auto 14px; display: block; }
.cover-ph { background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
.cover-ph mat-icon { font-size: 48px !important; height: 48px !important; width: 48px !important; color: #94a3b8; }
.recap-titre { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
.recap-auteur { font-size: 13px; color: #6366f1; margin: 0 0 12px; }
.recap-meta { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.chip { background: #f1f5f9; color: #475569; padding: 3px 10px; border-radius: 9999px; font-size: 11px; }
.recap-dispo { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: #065f46; background: #d1fae5; padding: 8px; border-radius: 8px; }
.recap-dispo.ko { color: #991b1b; background: #fee2e2; }
.recap-dispo mat-icon, .recap-loc mat-icon { font-size: 16px !important; height: 16px !important; width: 16px !important; }
.recap-loc { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 12px; color: #64748b; margin-top: 10px; }

/* Form */
.borrow-form { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
.req { color: #ef4444; }
.form-control { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; background: #fff; }
.form-control:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.duree-options { display: flex; gap: 8px; flex-wrap: wrap; }
.duree-chip { padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 13px; cursor: pointer; transition: all .2s; color: #374151; }
.duree-chip:hover { border-color: #6366f1; }
.duree-chip.active { background: #6366f1; color: #fff; border-color: #6366f1; }

.form-summary { background: #f8fafc; border-radius: 10px; padding: 14px; margin-bottom: 20px; }
.sum-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #64748b; padding: 4px 0; }
.sum-row mat-icon { font-size: 18px !important; height: 18px !important; width: 18px !important; color: #94a3b8; }
.sum-row span { flex: 1; }
.sum-row strong { color: #1e293b; }

.alert { display: flex; gap: 10px; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
.alert mat-icon { flex-shrink: 0; }
.alert-warn { background: #fef3c7; color: #92400e; }
.alert-warn p { margin: 4px 0 10px; }
.alert-error { background: #fee2e2; color: #991b1b; align-items: center; }

.form-actions { display: flex; gap: 12px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; transition: all .2s; }
.btn-sm { padding: 7px 12px; font-size: 13px; }
.btn-primary { background: #6366f1; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #4f46e5; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e2e8f0; }
.btn-outline:hover { background: #f8fafc; }
.btn-warn { background: #f59e0b; color: #fff; }
.btn-warn:hover { background: #d97706; }

/* Success */
.success-card { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
.success-ic mat-icon { font-size: 64px !important; height: 64px !important; width: 64px !important; color: #10b981; }
.success-card h1 { font-size: 22px; font-weight: 700; color: #1e293b; margin: 16px 0 4px; }
.success-sub { color: #64748b; font-size: 14px; margin: 0 0 24px; }
.success-recap { background: #f8fafc; border-radius: 10px; padding: 16px; text-align: left; margin-bottom: 24px; }
.recap-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9; }
.recap-row:last-child { border-bottom: none; }
.recap-row strong { color: #1e293b; }
.success-actions { display: flex; gap: 12px; justify-content: center; }

@media (max-width: 768px) { .borrow-layout { grid-template-columns: 1fr; } }
  `],
})
export class BorrowComponent implements OnInit {
  protected readonly store = inject(LibraryStore);
  private readonly api   = inject(LibraryApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly studentId = signal('');
  protected readonly duree = signal(21);
  protected readonly submitting = signal(false);
  protected readonly done = signal(false);
  protected readonly result = signal<ILoan | null>(null);
  protected readonly today = new Date();

  protected readonly durees = [
    { value: 7,  label: '1 semaine' },
    { value: 14, label: '2 semaines' },
    { value: 21, label: '3 semaines' },
    { value: 30, label: '1 mois' },
  ];

  protected readonly dateRetour = computed(() => {
    const d = new Date(this.today);
    d.setDate(d.getDate() + this.duree());
    return d;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('publicId');
    if (id) this.store.loadResource(id);
    this.store.loadStudents();
  }

  protected confirm(ressourcePublicId: string): void {
    const student = this.store.students().find(s => s.publicId === this.studentId());
    if (!student) return;
    this.submitting.set(true);
    this.store.clearError();
    this.api.borrowResource(ressourcePublicId, student.publicId, student.nom, this.duree()).subscribe({
      next: (loan) => {
        // garde le store synchronisé pour la liste des emprunts
        this.store.loadLoans(undefined);
        this.result.set(loan);
        this.submitting.set(false);
        this.done.set(true);
      },
      error: () => this.submitting.set(false),
    });
  }
}
