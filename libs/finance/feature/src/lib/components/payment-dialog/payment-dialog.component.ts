import { Component, inject, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe }    from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatSelectModule }      from '@angular/material/select';
import { MatButtonModule }      from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { IFacture, IInitierPaiementRequest, OperateurMobileMoney } from '@sms/shared/models';
import { FinanceStore } from '@sms/finance/data-access';

interface DialogData { facture: IFacture; }

@Component({
  selector: 'sms-payment-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Payer la facture {{ data.facture.numero }}</h2>

    <mat-dialog-content>
      <div class="solde-info">
        Solde restant :
        <strong>{{ data.facture.solde | currency:'XOF':'symbol':'1.0-0':'fr' }}</strong>
      </div>

      <form [formGroup]="form" class="payment-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Opérateur Mobile Money</mat-label>
          <mat-select formControlName="operateur">
            @for (op of operateurs; track op.value) {
              <mat-option [value]="op.value">{{ op.label }}</mat-option>
            }
          </mat-select>
          <mat-error>Sélectionnez un opérateur</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Numéro de téléphone</mat-label>
          <input matInput formControlName="telephone" placeholder="+225 07 XX XX XX XX" type="tel"/>
          <mat-error>Numéro requis</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Montant à payer (FCFA)</mat-label>
          <input matInput formControlName="montant" type="number" [max]="data.facture.solde"/>
          <mat-hint>Maximum : {{ data.facture.solde | currency:'XOF':'symbol':'1.0-0':'fr' }}</mat-hint>
          <mat-error>Montant invalide</mat-error>
        </mat-form-field>

        @if (store.error()) {
          <div class="error-msg">{{ store.error() }}</div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Annuler</button>
      <button mat-raised-button color="primary"
              [disabled]="form.invalid || store.saving()"
              (click)="submit()">
        @if (store.saving()) {
          <mat-spinner diameter="20"/>
        } @else {
          Confirmer le paiement
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .solde-info { background: #e3f2fd; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px; }
    .solde-info strong { color: #1565c0; }
    .payment-form { display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
    .error-msg { color: #d32f2f; font-size: 13px; padding: 8px 0; }
  `],
})
export class PaymentDialogComponent {
  protected readonly store = inject(FinanceStore);
  readonly dialogRef       = inject(MatDialogRef<PaymentDialogComponent>);
  private readonly fb      = inject(FormBuilder);

  @Inject(MAT_DIALOG_DATA)
  readonly data: DialogData = inject(MAT_DIALOG_DATA);

  operateurs: { value: OperateurMobileMoney; label: string }[] = [
    { value: 'WAVE',            label: 'Wave' },
    { value: 'ORANGE_MONEY',    label: 'Orange Money' },
    { value: 'MTN_MOMO',        label: 'MTN MoMo' },
    { value: 'MOOV_MONEY',      label: 'Moov Money' },
    { value: 'VIREMENT_BANCAIRE', label: 'Virement bancaire' },
    { value: 'ESPECES',         label: 'Espèces (guichet)' },
  ];

  form: FormGroup = this.fb.group({
    operateur: ['', Validators.required],
    telephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s]{8,20}$/)]],
    montant:   [this.data.facture.solde,
                [Validators.required, Validators.min(1), Validators.max(this.data.facture.solde)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    const req: IInitierPaiementRequest = {
      facturePublicId: this.data.facture.publicId,
      montant:         this.form.value.montant,
      operateur:       this.form.value.operateur,
      telephone:       this.form.value.telephone,
      idempotencyKey:  `${this.data.facture.publicId}-${Date.now()}`,
    };
    this.store.initierPaiement(req);
    this.store.clearError();
    if (!this.store.error()) {
      this.dialogRef.close(true);
    }
  }
}
