import {
  Component, ChangeDetectionStrategy, inject, OnInit, signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LibraryStore, LibraryApiService } from '@sms/library/data-access';
import { StudentPickerComponent } from '@sms/library/ui';
import { IReservation } from '@sms/shared/models';

@Component({
  selector: 'sms-reserve',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, StudentPickerComponent],
  template: `
<div class="reserve-page">
  <a routerLink="/library" class="back-link"><mat-icon>arrow_back</mat-icon> Catalogue</a>

  @if (store.loading()) {
    <div class="loading-state"><mat-icon class="spin">sync</mat-icon><p>Chargement…</p></div>
  } @else if (done()) {
    <div class="success-card">
      <div class="success-ic"><mat-icon>event_available</mat-icon></div>
      <h1>Réservation enregistrée</h1>
      <p class="success-sub">Vous serez notifié dès que la ressource sera disponible.</p>
      @if (result(); as resa) {
        <div class="success-recap">
          <div class="recap-row"><span>Ressource</span><strong>{{ resa.ressourceTitre }}</strong></div>
          <div class="recap-row"><span>Position dans la file</span><strong>{{ resa.rangFile }}<sup>e</sup></strong></div>
          @if (resa.dateDisponibilitePrevue) {
            <div class="recap-row"><span>Disponibilité estimée</span><strong>{{ resa.dateDisponibilitePrevue | date:'dd MMMM yyyy' }}</strong></div>
          }
        </div>
      }
      <div class="success-actions">
        <a routerLink="/library" class="btn btn-primary">Retour au catalogue</a>
      </div>
    </div>
  } @else {
    @if (store.selectedResource(); as res) {
    <h1 class="page-title"><mat-icon>event_available</mat-icon> Réserver une ressource</h1>

    <div class="reserve-layout">
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
        <div class="recap-statut"><mat-icon>schedule</mat-icon> {{ statutLabel(res.statut) }}</div>
      </aside>

      <section class="reserve-form">
        <div class="info-box">
          <mat-icon>info</mat-icon>
          <p>Cette ressource est actuellement indisponible. En réservant, vous rejoignez une file d'attente et serez prévenu dès qu'un exemplaire se libère.</p>
        </div>

        <div class="form-group">
          <label>Réserver pour <span class="req">*</span></label>
          <sms-student-picker
            [students]="store.students()"
            [value]="studentId()"
            (valueChange)="studentId.set($event)" />
        </div>

        @if (store.error()) {
          <div class="alert alert-error"><mat-icon>error</mat-icon> {{ store.error() }}</div>
        }

        <div class="form-actions">
          <button class="btn btn-primary" [disabled]="!studentId() || submitting()" (click)="confirm(res.publicId)">
            <mat-icon>event_available</mat-icon> {{ submitting() ? 'Enregistrement…' : 'Confirmer la réservation' }}
          </button>
          <a routerLink="/library" class="btn btn-outline">Annuler</a>
        </div>
      </section>
    </div>
    }
  }
</div>
  `,
  styles: [`
.reserve-page { padding: 24px; max-width: 900px; margin: 0 auto; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: #6366f1; text-decoration: none; font-size: 14px; margin-bottom: 20px; }
.back-link:hover { text-decoration: underline; }
.page-title { font-size: 22px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; margin: 0 0 24px; }

.loading-state { text-align: center; padding: 80px; color: #64748b; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; font-size: 32px !important; height: 32px !important; width: 32px !important; }

.reserve-layout { display: grid; grid-template-columns: 260px 1fr; gap: 28px; }
.res-recap { background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.08); text-align: center; height: fit-content; }
.recap-cover img, .cover-ph { width: 110px; height: 156px; object-fit: cover; border-radius: 8px; margin: 0 auto 14px; display: block; }
.cover-ph { background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
.cover-ph mat-icon { font-size: 44px !important; height: 44px !important; width: 44px !important; color: #94a3b8; }
.recap-titre { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
.recap-auteur { font-size: 13px; color: #6366f1; margin: 0 0 12px; }
.recap-statut { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: #92400e; background: #fef3c7; padding: 8px; border-radius: 8px; }
.recap-statut mat-icon { font-size: 16px !important; height: 16px !important; width: 16px !important; }

.reserve-form { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.info-box { display: flex; gap: 10px; background: #eff6ff; color: #1e40af; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
.info-box mat-icon { flex-shrink: 0; }
.info-box p { margin: 0; line-height: 1.5; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
.req { color: #ef4444; }
.form-control { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; background: #fff; }
.form-control:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }

.alert { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
.alert-error { background: #fee2e2; color: #991b1b; }

.form-actions { display: flex; gap: 12px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; transition: all .2s; }
.btn-primary { background: #6366f1; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #4f46e5; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e2e8f0; }
.btn-outline:hover { background: #f8fafc; }

.success-card { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
.success-ic mat-icon { font-size: 64px !important; height: 64px !important; width: 64px !important; color: #6366f1; }
.success-card h1 { font-size: 22px; font-weight: 700; color: #1e293b; margin: 16px 0 4px; }
.success-sub { color: #64748b; font-size: 14px; margin: 0 0 24px; }
.success-recap { background: #f8fafc; border-radius: 10px; padding: 16px; text-align: left; margin-bottom: 24px; }
.recap-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9; }
.recap-row:last-child { border-bottom: none; }
.recap-row strong { color: #1e293b; }
.success-actions { display: flex; gap: 12px; justify-content: center; }

@media (max-width: 768px) { .reserve-layout { grid-template-columns: 1fr; } }
  `],
})
export class ReserveComponent implements OnInit {
  protected readonly store = inject(LibraryStore);
  private readonly api   = inject(LibraryApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly studentId = signal('');
  protected readonly submitting = signal(false);
  protected readonly done = signal(false);
  protected readonly result = signal<IReservation | null>(null);

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
    this.api.reserveResource(ressourcePublicId, student.publicId, student.nom).subscribe({
      next: (resa) => {
        this.result.set(resa);
        this.submitting.set(false);
        this.done.set(true);
      },
      error: () => this.submitting.set(false),
    });
  }

  protected statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      DISPONIBLE: 'Disponible', EMPRUNTE: 'Emprunté',
      RESERVE: 'Réservé', INDISPONIBLE: 'Indisponible',
    };
    return labels[statut] ?? statut;
  }
}
