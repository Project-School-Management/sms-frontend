import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule }        from '@angular/material/table';
import { MatButtonModule }       from '@angular/material/button';
import { MatIconModule }         from '@angular/material/icon';
import { MatFormFieldModule }    from '@angular/material/form-field';
import { MatInputModule }        from '@angular/material/input';
import { MatSelectModule }       from '@angular/material/select';
import { MatDialogModule }       from '@angular/material/dialog';
import { MatChipsModule }        from '@angular/material/chips';

import { IBourse, TypeBourse }   from '@sms/shared/models';
import { FinanceStore }          from '../../store/finance.store';
import { AuthStore }             from '@sms/shared/auth';

@Component({
  selector: 'sms-bourse-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDialogModule, MatChipsModule,
  ],
  template: `
    <div class="page-header">
      <h1>Bourses & Réductions</h1>
    </div>

    @if (store.loading()) {
      <div class="loading-state">Chargement...</div>
    } @else if (store.bourses().length === 0) {
      <div class="empty-state">
        <mat-icon>school</mat-icon>
        <p>Aucune bourse enregistrée</p>
      </div>
    } @else {
      <mat-table [dataSource]="store.bourses()" class="bourse-table">
        <ng-container matColumnDef="typeBourse">
          <mat-header-cell *matHeaderCellDef>Type</mat-header-cell>
          <mat-cell *matCellDef="let b">
            <mat-chip>{{ typeLabel(b.typeBourse) }}</mat-chip>
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="studentId">
          <mat-header-cell *matHeaderCellDef>Étudiant</mat-header-cell>
          <mat-cell *matCellDef="let b">ID {{ b.studentId }}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="deduction">
          <mat-header-cell *matHeaderCellDef>Réduction</mat-header-cell>
          <mat-cell *matCellDef="let b">
            @if (b.montantDeduction) {
              {{ b.montantDeduction | currency:'XOF':'symbol':'1.0-0':'fr' }}
            } @else if (b.pourcentage) {
              {{ b.pourcentage }}%
            } @else {
              —
            }
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="validite">
          <mat-header-cell *matHeaderCellDef>Valide jusqu'au</mat-header-cell>
          <mat-cell *matCellDef="let b">
            {{ b.valideJusquAu ? (b.valideJusquAu | date:'dd/MM/yyyy') : '—' }}
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="motif">
          <mat-header-cell *matHeaderCellDef>Motif</mat-header-cell>
          <mat-cell *matCellDef="let b">{{ b.motif ?? '—' }}</mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="columns"/>
        <mat-row *matRowDef="let row; columns: columns"/>
      </mat-table>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .empty-state { text-align: center; padding: 48px; color: rgba(0,0,0,.5); }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; }
    .loading-state { text-align: center; padding: 24px; }
    .bourse-table { width: 100%; }
  `],
})
export class BourseListComponent implements OnInit {
  protected readonly store = inject(FinanceStore);
  private readonly auth    = inject(AuthStore);

  columns = ['typeBourse', 'studentId', 'deduction', 'validite', 'motif'];

  ngOnInit() {
    const anneeId = this.auth.anneeAcademiqueId();
    if (anneeId) this.store.loadBourses(anneeId);
  }

  typeLabel(type: TypeBourse): string {
    const labels: Record<TypeBourse, string> = {
      BOURSE:   'Bourse d\'État',
      FRATRIE:  'Fratrie',
      FIDELITE: 'Fidélité',
      PROMO:    'Promotionnelle',
      MERITE:   'Mérite',
      SOCIALE:  'Sociale',
    };
    return labels[type] ?? type;
  }
}
