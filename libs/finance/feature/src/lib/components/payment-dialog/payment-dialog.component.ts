import {
  Component, inject, Inject, ChangeDetectionStrategy,
  signal, computed, OnInit,
} from '@angular/core';
import { CommonModule }       from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule }      from '@angular/material/icon';

import { IFacture, IInitierPaiementRequest, OperateurMobileMoney } from '@sms/shared/models';
import { FinanceStore, STUDENT_NAMES } from '@sms/finance/data-access';

// ── Operator config ���───────────────────────────────────────────────────────────
interface OperateurConfig {
  value:   OperateurMobileMoney;
  label:   string;
  logo:    string;
  color:   string;
  bg:      string;
  hint?:   string;
  noPhone: boolean;
}

const OPERATEURS: OperateurConfig[] = [
  { value: 'WAVE',              label: 'Wave',         logo: 'W',   color: '#009fdb', bg: 'rgba(0,159,219,0.10)',  hint: '07 XX XX XX XX', noPhone: false },
  { value: 'ORANGE_MONEY',      label: 'Orange Money', logo: 'OM',  color: '#ff6600', bg: 'rgba(255,102,0,0.10)',  hint: '07 XX XX XX XX', noPhone: false },
  { value: 'MTN_MOMO',          label: 'MTN MoMo',     logo: 'M',   color: '#ffc300', bg: 'rgba(255,195,0,0.12)',  hint: '05 XX XX XX XX', noPhone: false },
  { value: 'MOOV_MONEY',        label: 'Moov Money',   logo: 'MV',  color: '#0052cc', bg: 'rgba(0,82,204,0.10)',   hint: '01 XX XX XX XX', noPhone: false },
  { value: 'VIREMENT_BANCAIRE', label: 'Virement',     logo: 'VB',  color: '#16a34a', bg: 'rgba(22,163,74,0.10)',  noPhone: true  },
  { value: 'ESPECES',           label: 'Espèces',      logo: 'ES',  color: '#6b7280', bg: 'rgba(107,114,128,0.10)',noPhone: true  },
];

// ── Validator ────────────────────────────────────────────────────────────────
function maxSolde(solde: number) {
  return (c: AbstractControl): ValidationErrors | null =>
    c.value > solde ? { maxSolde: true } : null;
}

// ── Data ─────────────────────────────────────────────────────────────────────
interface DialogData { facture: IFacture; }
type Phase = 'form' | 'loading' | 'success';

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector: 'sms-payment-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  styles: [`
    :host { display: block; }

    /* ── Wrapper ──────────────────────────────────────────────────────────── */
    .modal-wrap {
      width: 460px;
      background: var(--surface-1);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* ── Header ────────────────────────────────────────────────────────────── */
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .modal-header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .secure-dot { width: 8px; height: 8px; border-radius: 50%; background: #16a34a; }
    .close-btn {
      width: 32px; height: 32px;
      border: none; cursor: pointer; border-radius: 8px;
      background: var(--surface-2);
      display: flex; align-items: center; justify-content: center;
      transition: opacity .15s;
      color: var(--text-secondary);
    }
    .close-btn:hover { opacity: .7; }

    /* ── Body ──────────────────────────────────────────────────────────────── */
    .modal-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }

    /* ── Facture card ───────────────────────────────────────────────────────── */
    .facture-card {
      border-radius: 12px; padding: 16px;
      background: var(--accent-light);
      border: 1px solid var(--accent);
      opacity: .9;
    }
    .facture-row { display: flex; align-items: center; justify-content: space-between; }
    .facture-num { font-weight: 700; font-size: 14px; color: var(--accent); }
    .facture-student { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
    .facture-badge {
      font-size: 11px; font-weight: 600; padding: 2px 8px;
      border-radius: 20px; white-space: nowrap;
    }
    .progress-section { margin-top: 12px; }
    .progress-labels {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;
    }
    .progress-bar {
      width: 100%; height: 6px; border-radius: 3px;
      background: var(--border-color);
    }
    .progress-fill { height: 6px; border-radius: 3px; background: var(--accent); transition: width .4s; }
    .solde-highlight {
      margin-top: 10px; display: flex; align-items: baseline; gap: 6px;
    }
    .solde-label { font-size: 12px; color: var(--text-secondary); }
    .solde-amount { font-size: 20px; font-weight: 800; color: var(--text-primary); }
    .solde-currency { font-size: 13px; font-weight: 600; color: var(--text-secondary); }

    /* ── Section label ��─────────────────────────────────────────────────────── */
    .section-label {
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .5px; color: var(--text-secondary);
      margin-bottom: 10px;
    }

    /* ── Operator grid ──────────────────────────────────────────────────────── */
    .op-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .op-card {
      border: 2px solid var(--border-color);
      border-radius: 12px; padding: 10px 8px;
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      cursor: pointer; transition: all .15s; background: var(--surface-2);
    }
    .op-card:hover { opacity: .85; }
    .op-card.selected { border-width: 2px; }
    .op-logo {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 800; letter-spacing: -.5px;
    }
    .op-label { font-size: 11px; font-weight: 600; color: var(--text-primary); text-align: center; }

    /* ── Input field ��───────────────────────────────────────────────────────── */
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .input-wrap {
      display: flex; align-items: center;
      border: 1.5px solid var(--border-color);
      border-radius: 10px; overflow: hidden;
      background: var(--surface-2);
      transition: border-color .15s;
    }
    .input-wrap:focus-within { border-color: var(--accent); background: var(--surface-1); }
    .input-wrap.error-border { border-color: #ef4444; }
    .input-prefix {
      padding: 0 12px; font-size: 13px; font-weight: 600; white-space: nowrap;
      color: var(--text-secondary);
      border-right: 1px solid var(--border-color);
      background: var(--surface-2);
      height: 44px; display: flex; align-items: center;
    }
    .input-suffix {
      padding: 0 12px; font-size: 13px; font-weight: 700; white-space: nowrap;
      color: var(--text-secondary);
      border-left: 1px solid var(--border-color);
      background: var(--surface-2);
      height: 44px; display: flex; align-items: center;
    }
    .sms-input {
      flex: 1; border: none; outline: none;
      background: transparent;
      padding: 0 12px; height: 44px;
      font-size: 14px; font-weight: 500;
      color: var(--text-primary);
    }
    .field-error { font-size: 12px; color: #ef4444; display: flex; align-items: center; gap: 4px; }
    .field-hint  { font-size: 12px; color: var(--text-muted); }

    /* ── Amount shortcuts ───────────────────────────────────────────────────── */
    .shortcut-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
    .shortcut-btn {
      padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
      border: 1.5px solid var(--border-color);
      cursor: pointer; transition: all .15s;
      background: var(--surface-2); color: var(--text-secondary);
    }
    .shortcut-btn:hover, .shortcut-btn.active {
      background: var(--accent-light); border-color: var(--accent); color: var(--accent);
    }

    /* ── Summary ────────────────────────────────────────────────────────────── */
    .summary-card {
      border-radius: 12px; padding: 14px 16px;
      background: var(--surface-2);
      border: 1px solid var(--border-color);
    }
    .summary-row {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 13px; padding: 4px 0;
    }
    .summary-label { color: var(--text-secondary); }
    .summary-value { font-weight: 600; color: var(--text-primary); }
    .summary-divider { border: none; border-top: 1px solid var(--border-color); margin: 8px 0; }
    .summary-total-row {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 15px; font-weight: 800; padding-top: 4px;
    }
    .summary-total-label { color: var(--text-primary); }

    /* ── Secure badge ───────────────────────────────────────────────────────── */
    .secure-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-radius: 10px;
      background: rgba(22,163,74,0.07); border: 1px solid rgba(22,163,74,0.2);
    }
    .secure-text { font-size: 12px; color: #16a34a; font-weight: 500; }

    /* ── Submit button ──────────────────────────────────────────────────────── */
    .submit-btn {
      width: 100%; height: 48px; border: none; border-radius: 12px;
      font-size: 15px; font-weight: 700; color: #fff;
      cursor: pointer; transition: opacity .15s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .submit-btn:hover:not(:disabled) { opacity: .88; }
    .submit-btn:disabled { opacity: .5; cursor: not-allowed; }

    /* ── Spinner ────────────────────────────────────────────────────────────── */
    .spinner {
      width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Success ────────────────────────────────────────────────────────────── */
    .success-body {
      padding: 40px 24px;
      display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center;
    }
    .success-ring {
      width: 72px; height: 72px; border-radius: 50%;
      background: rgba(22,163,74,0.12);
      display: flex; align-items: center; justify-content: center;
    }
    .success-title { font-size: 18px; font-weight: 800; color: var(--text-primary); }
    .success-sub   { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
    .success-ref {
      font-family: monospace; font-size: 13px; font-weight: 700;
      padding: 6px 14px; border-radius: 8px;
      background: var(--surface-2); color: var(--text-secondary);
    }
    .success-close-btn {
      width: 100%; height: 44px; border: none; border-radius: 10px;
      background: var(--accent-light); color: var(--accent);
      font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity .15s;
    }
    .success-close-btn:hover { opacity: .8; }
  `],
  template: `
<div class="modal-wrap">

  <!-- ── Loading phase ���─ -->
  @if (phase() === 'loading') {
    <div class="modal-header">
      <div class="modal-header-title">
        <div class="spinner" [style.border-top-color]="selectedOpConfig()?.color ?? 'var(--accent)'"></div>
        Traitement en cours…
      </div>
    </div>
    <div style="padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 16px">
      <div class="spinner" style="width:48px;height:48px;border-width:3px"
           [style.border-top-color]="selectedOpConfig()?.color ?? 'var(--accent)'"></div>
      <p style="font-size:14px;color:var(--text-secondary)">
        Connexion à {{ selectedOpConfig()?.label }} en cours…
      </p>
    </div>
  }

  <!-- ── Success phase ── -->
  @if (phase() === 'success') {
    <div class="modal-header">
      <div class="modal-header-title">
        <div class="secure-dot"></div>
        Paiement confirmé
      </div>
    </div>
    <div class="success-body">
      <div class="success-ring">
        <mat-icon style="color: #16a34a; font-size: 36px; height: 36px; width: 36px">check_circle</mat-icon>
      </div>
      <div class="success-title">Paiement réussi !</div>
      <p class="success-sub">
        <strong>{{ formatXOF(form.value.montant) }}</strong> débité via
        <strong>{{ selectedOpConfig()?.label }}</strong><br>
        Facture {{ data.facture.numero }}
      </p>
      <div class="success-ref">REF : {{ confirmRef() }}</div>
      <button class="success-close-btn" (click)="dialogRef.close(true)">
        Fermer
      </button>
    </div>
  }

  <!-- ── Form phase ── -->
  @if (phase() === 'form') {
    <div class="modal-header">
      <div class="modal-header-title">
        <div class="secure-dot"></div>
        Paiement sécurisé
      </div>
      <button class="close-btn" (click)="dialogRef.close()">
        <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
      </button>
    </div>

    <div class="modal-body">

      <!-- Facture info card -->
      <div class="facture-card">
        <div class="facture-row">
          <div>
            <p class="facture-num">{{ data.facture.numero }}</p>
            <p class="facture-student">{{ studentName() }}</p>
          </div>
          <span class="facture-badge" [ngStyle]="statutStyle()">{{ data.facture.statut }}</span>
        </div>

        <div class="progress-section">
          <div class="progress-labels">
            <span>{{ formatXOF(data.facture.montantPaye) }} payé</span>
            <span>{{ pctPaye() }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="pctPaye()"></div>
          </div>
        </div>

        <div class="solde-highlight">
          <span class="solde-label">Solde restant :</span>
          <span class="solde-amount">{{ formatNum(data.facture.solde) }}</span>
          <span class="solde-currency">XOF</span>
        </div>
      </div>

      <!-- Operator grid -->
      <div>
        <p class="section-label">Opérateur de paiement</p>
        <div class="op-grid">
          @for (op of operateurs; track op.value) {
            <div class="op-card"
                 [class.selected]="form.value.operateur === op.value"
                 [style.border-color]="form.value.operateur === op.value ? op.color : 'var(--border-color)'"
                 [style.background]="form.value.operateur === op.value ? op.bg : 'var(--surface-2)'"
                 (click)="selectOp(op.value)">
              <div class="op-logo"
                   [style.background]="op.bg"
                   [style.color]="op.color">
                {{ op.logo }}
              </div>
              <span class="op-label"
                    [style.color]="form.value.operateur === op.value ? op.color : 'var(--text-secondary)'">
                {{ op.label }}
              </span>
              @if (form.value.operateur === op.value) {
                <mat-icon style="font-size:14px;height:14px;width:14px;margin-top:-2px"
                          [style.color]="op.color">
                  check_circle
                </mat-icon>
              }
            </div>
          }
        </div>
        @if (opCtrl.touched && opCtrl.invalid) {
          <p class="field-error" style="margin-top:6px">
            <mat-icon style="font-size:13px;height:13px;width:13px">error_outline</mat-icon>
            Veuillez sélectionner un opérateur
          </p>
        }
      </div>

      <!-- Phone number (hidden for VIREMENT / ESPECES) -->
      @if (!selectedOpConfig()?.noPhone) {
        <div class="field" [formGroup]="form">
          <label class="field-label">Numéro de téléphone Mobile Money</label>
          <div class="input-wrap" [class.error-border]="phoneCtrl.touched && phoneCtrl.invalid">
            <div class="input-prefix">🇨🇮 +225</div>
            <input class="sms-input"
                   formControlName="telephone"
                   type="tel"
                   [placeholder]="selectedOpConfig()?.hint ?? '07 XX XX XX XX'">
          </div>
          @if (phoneCtrl.touched && phoneCtrl.hasError('required')) {
            <p class="field-error">
              <mat-icon style="font-size:13px;height:13px;width:13px">error_outline</mat-icon>
              Numéro requis
            </p>
          }
          @if (phoneCtrl.touched && phoneCtrl.hasError('pattern')) {
            <p class="field-error">
              <mat-icon style="font-size:13px;height:13px;width:13px">error_outline</mat-icon>
              Format invalide (ex : 07 12 34 56 78)
            </p>
          }
        </div>
      }

      <!-- Amount -->
      <div class="field" [formGroup]="form">
        <label class="field-label">Montant à payer</label>
        <div class="input-wrap" [class.error-border]="montantCtrl.touched && montantCtrl.invalid">
          <input class="sms-input"
                 formControlName="montant"
                 type="number"
                 min="1"
                 [max]="data.facture.solde"
                 placeholder="0">
          <div class="input-suffix">XOF</div>
        </div>
        @if (montantCtrl.value > 0) {
          <p class="field-hint">
            ≈ {{ formatXOF(montantCtrl.value) }}
          </p>
        }
        @if (montantCtrl.touched && montantCtrl.hasError('required')) {
          <p class="field-error">
            <mat-icon style="font-size:13px;height:13px;width:13px">error_outline</mat-icon>
            Montant requis
          </p>
        }
        @if (montantCtrl.touched && montantCtrl.hasError('min')) {
          <p class="field-error">
            <mat-icon style="font-size:13px;height:13px;width:13px">error_outline</mat-icon>
            Le montant doit être supérieur à 0
          </p>
        }
        @if (montantCtrl.touched && montantCtrl.hasError('maxSolde')) {
          <p class="field-error">
            <mat-icon style="font-size:13px;height:13px;width:13px">error_outline</mat-icon>
            Supérieur au solde restant ({{ formatXOF(data.facture.solde) }})
          </p>
        }

        <!-- Shortcuts -->
        <div class="shortcut-row">
          <button type="button" class="shortcut-btn"
                  [class.active]="isShortcut(1)"
                  (click)="setAmount(data.facture.solde)">
            Tout payer
          </button>
          <button type="button" class="shortcut-btn"
                  [class.active]="isShortcut(0.75)"
                  (click)="setAmount(Math.floor(data.facture.solde * 0.75))">
            75 %
          </button>
          <button type="button" class="shortcut-btn"
                  [class.active]="isShortcut(0.5)"
                  (click)="setAmount(Math.floor(data.facture.solde * 0.5))">
            50 %
          </button>
          <button type="button" class="shortcut-btn"
                  [class.active]="isShortcut(0.25)"
                  (click)="setAmount(Math.floor(data.facture.solde * 0.25))">
            25 %
          </button>
        </div>
      </div>

      <!-- Summary (visible once form is filled) -->
      @if (showSummary()) {
        <div class="summary-card">
          <p class="section-label" style="margin-bottom:8px">Récapitulatif</p>
          <div class="summary-row">
            <span class="summary-label">Facture</span>
            <span class="summary-value">{{ data.facture.numero }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Opérateur</span>
            <span class="summary-value" [style.color]="selectedOpConfig()?.color">
              {{ selectedOpConfig()?.label }}
            </span>
          </div>
          @if (!selectedOpConfig()?.noPhone) {
            <div class="summary-row">
              <span class="summary-label">Téléphone</span>
              <span class="summary-value">+225 {{ form.value.telephone }}</span>
            </div>
          }
          <hr class="summary-divider">
          <div class="summary-total-row">
            <span class="summary-total-label">Montant d��bité</span>
            <span [style.color]="selectedOpConfig()?.color ?? 'var(--accent)'">
              {{ formatXOF(form.value.montant) }}
            </span>
          </div>
        </div>
      }

      <!-- Secure badge -->
      <div class="secure-badge">
        <mat-icon style="color:#16a34a;font-size:18px;height:18px;width:18px">lock</mat-icon>
        <span class="secure-text">Paiement chiffré HMAC-SHA256 · Données non conservées</span>
      </div>

      <!-- Error global -->
      @if (store.error()) {
        <div style="display:flex;align-items:center;gap:6px;padding:10px 14px;border-radius:10px;
                    background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2)">
          <mat-icon style="color:#ef4444;font-size:16px;height:16px;width:16px">error</mat-icon>
          <span style="font-size:13px;color:#dc2626">{{ store.error() }}</span>
        </div>
      }

      <!-- Submit button -->
      <button class="submit-btn"
              [disabled]="form.invalid"
              [style.background]="selectedOpConfig()?.color ?? 'var(--accent)'"
              (click)="submit()">
        <mat-icon style="font-size:20px;height:20px;width:20px">payment</mat-icon>
        Confirmer le paiement
      </button>

    </div>
  }

</div>
  `,
})
export class PaymentDialogComponent {
  protected readonly store = inject(FinanceStore);
  readonly dialogRef       = inject(MatDialogRef<PaymentDialogComponent>);
  private readonly fb      = inject(FormBuilder);

  @Inject(MAT_DIALOG_DATA)
  readonly data: DialogData = inject(MAT_DIALOG_DATA);

  readonly Math = Math;
  readonly operateurs = OPERATEURS;

  readonly phase      = signal<Phase>('form');
  readonly confirmRef = signal('');

  form = this.fb.group({
    operateur: ['' as OperateurMobileMoney | '', Validators.required],
    telephone: ['', [Validators.pattern(/^[0-9\s]{8,15}$/)]],
    montant:   [
      this.data.facture.solde,
      [Validators.required, Validators.min(1), maxSolde(this.data.facture.solde)],
    ],
  });

  // ── Computed ──────────────────────────────────────────────────────────────

  readonly selectedOpConfig = computed(() =>
    OPERATEURS.find(o => o.value === this.form.value.operateur) ?? null
  );

  readonly showSummary = computed(() =>
    !!this.form.value.operateur && (this.form.value.montant ?? 0) > 0
  );

  readonly pctPaye = computed(() => {
    const t = this.data.facture.montantTotal;
    return t > 0 ? Math.round((this.data.facture.montantPaye / t) * 100) : 0;
  });

  readonly studentName = computed(() =>
    STUDENT_NAMES[this.data.facture.studentId] ?? `Étudiant #${this.data.facture.studentId}`
  );

  // ── Accessors ─────────────────────────────────────────────────────────────

  get opCtrl()     { return this.form.controls.operateur; }
  get phoneCtrl()  { return this.form.controls.telephone; }
  get montantCtrl(){ return this.form.controls.montant; }

  // ── Helpers ───────────────────────────────────────────────────────────────

  selectOp(val: OperateurMobileMoney): void {
    this.form.patchValue({ operateur: val });
    this.opCtrl.markAsTouched();
    const cfg = OPERATEURS.find(o => o.value === val);
    // phone required only for mobile money operators
    if (cfg?.noPhone) {
      this.phoneCtrl.clearValidators();
      this.phoneCtrl.setValue('');
    } else {
      this.phoneCtrl.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9\s]{8,15}$/),
      ]);
    }
    this.phoneCtrl.updateValueAndValidity();
  }

  setAmount(amount: number): void {
    this.form.patchValue({ montant: amount });
    this.montantCtrl.markAsTouched();
  }

  isShortcut(ratio: number): boolean {
    const v = this.form.value.montant ?? 0;
    return v === Math.floor(this.data.facture.solde * ratio) || (ratio === 1 && v === this.data.facture.solde);
  }

  formatXOF(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount ?? 0) + ' XOF';
  }

  formatNum(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount ?? 0);
  }

  statutStyle(): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      PAYEE:               { background: '#dcfce7', color: '#16a34a' },
      PARTIELLEMENT_PAYEE: { background: '#fef3c7', color: '#d97706' },
      EN_RETARD:           { background: '#fee2e2', color: '#dc2626' },
      EMISE:               { background: '#dbeafe', color: '#2563eb' },
      ANNULEE:             { background: '#f3f4f6', color: '#6b7280' },
    };
    return map[this.data.facture.statut] ?? map['EMISE'];
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const req: IInitierPaiementRequest = {
      facturePublicId: this.data.facture.publicId,
      montant:         this.form.value.montant!,
      operateur:       this.form.value.operateur as OperateurMobileMoney,
      telephone:       this.form.value.telephone ?? '',
      idempotencyKey:  `${this.data.facture.publicId}-${Date.now()}`,
    };

    this.phase.set('loading');
    this.store.initierPaiement(req);

    // Mock 500ms API delay → show success
    setTimeout(() => {
      if (!this.store.error()) {
        this.confirmRef.set(
          `${this.form.value.operateur}-${Date.now().toString(36).toUpperCase().slice(-8)}`
        );
        this.phase.set('success');
      } else {
        this.phase.set('form');
      }
    }, 600);
  }
}
