import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FinanceStore }  from '@sms/finance/data-access';
import { STUDENT_NAMES_MAP } from '@sms/finance/data-access';
import { ToastService } from '@sms/shared/ui';
import { OperateurMobileMoney } from '@sms/shared/models';

type ModePaiement = 'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY' | 'VIREMENT_BANCAIRE' | 'ESPECES' | 'CARTE' | 'CHEQUE';

const MODES: { value: ModePaiement; label: string; icon: string; color: string }[] = [
  { value:'WAVE',           label:'Wave',          icon:'bolt',               color:'#2563eb' },
  { value:'ORANGE_MONEY',   label:'Orange Money',  icon:'signal_wifi_4_bar',  color:'#f97316' },
  { value:'MTN_MOMO',       label:'MTN MoMo',      icon:'cell_tower',         color:'#eab308' },
  { value:'MOOV_MONEY',     label:'Moov Money',    icon:'phone_android',      color:'#0891b2' },
  { value:'VIREMENT_BANCAIRE',label:'Virement',    icon:'account_balance',    color:'#6366f1' },
  { value:'ESPECES',        label:'Espèces',        icon:'payments',           color:'#16a34a' },
  { value:'CARTE',          label:'Carte bancaire', icon:'credit_card',        color:'#8b5cf6' },
  { value:'CHEQUE',         label:'Chèque',         icon:'description',        color:'#d97706' },
];

@Component({
  selector:        'sms-encaissement',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6 max-w-3xl mx-auto">

  <!-- En-tête -->
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/finance/invoices"
       class="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
       style="background:var(--surface-2);color:var(--text-secondary)">
      <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
    </a>
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Encaissement</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">Enregistrer un paiement</p>
    </div>
  </div>

  @if (store.loading()) {
    <div class="flex items-center justify-center py-20" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon>&nbsp;Chargement…
    </div>
  } @else if (facture()) {
    <!-- Résumé facture -->
    <div class="sms-card p-5 mb-5 border-l-4"
         [style.border-left-color]="statutColor()">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p class="text-xs font-bold uppercase tracking-wide mb-1" style="color:var(--text-muted)">Facture</p>
          <p class="text-xl font-bold" style="color:var(--text-primary)">{{ facture()!.numero }}</p>
          <p class="text-sm mt-1" style="color:var(--text-secondary)">
            {{ studentName() }} · Éch. {{ facture()!.dateEcheance }}
          </p>
        </div>
        <div class="text-right">
          <div class="grid grid-cols-3 gap-4 text-right">
            <div>
              <p class="text-xs" style="color:var(--text-muted)">Total</p>
              <p class="font-bold text-sm" style="color:var(--text-primary)">{{ formatXOF(facture()!.montantTotal) }}</p>
            </div>
            <div>
              <p class="text-xs" style="color:var(--text-muted)">Payé</p>
              <p class="font-bold text-sm" style="color:#16a34a">{{ formatXOF(facture()!.montantPaye) }}</p>
            </div>
            <div>
              <p class="text-xs" style="color:var(--text-muted)">Solde</p>
              <p class="font-bold text-sm" style="color:#dc2626">{{ formatXOF(facture()!.solde) }}</p>
            </div>
          </div>
          <!-- Barre progression -->
          <div class="mt-2 w-48 rounded-full h-2 ml-auto" style="background:var(--surface-2)">
            <div class="h-2 rounded-full" style="background:#16a34a"
                 [style.width]="progressionPct() + '%'"></div>
          </div>
          <p class="text-xs mt-0.5 text-right" style="color:var(--text-muted)">{{ progressionPct() }}% payé</p>
        </div>
      </div>
    </div>

    <!-- Formulaire d'encaissement -->
    <div class="sms-card p-6">
      <h2 class="font-bold text-lg mb-5" style="color:var(--text-primary)">Détails du paiement</h2>

      <!-- Montant -->
      <div class="mb-5">
        <label class="text-xs font-bold uppercase tracking-wide mb-2 block" style="color:var(--text-secondary)">
          Montant à encaisser
        </label>
        <div class="flex gap-3 mb-3">
          <button (click)="setMontant(facture()!.solde)"
                  class="px-4 py-2 rounded-xl text-sm font-semibold border hover:opacity-80 transition-opacity"
                  [style.background]="montant() === facture()!.solde ? 'var(--accent)' : 'var(--surface-2)'"
                  [style.color]="montant() === facture()!.solde ? '#fff' : 'var(--text-secondary)'"
                  [style.border-color]="montant() === facture()!.solde ? 'var(--accent)' : 'var(--border-color)'">
            Paiement intégral ({{ formatXOF(facture()!.solde) }})
          </button>
          <button (click)="setMontant(Math.round(facture()!.solde / 2))"
                  class="px-4 py-2 rounded-xl text-sm font-semibold border hover:opacity-80 transition-opacity"
                  [style.background]="'var(--surface-2)'"
                  style="color:var(--text-secondary);border-color:var(--border-color)">
            Paiement partiel
          </button>
        </div>
        <div class="flex items-center gap-2 p-3 rounded-xl border"
             style="background:var(--surface-2);border-color:var(--border-color)">
          <span class="font-bold text-sm" style="color:var(--text-muted)">XOF</span>
          <input type="number" [value]="montant()" (input)="montant.set(+($any($event.target).value))"
                 [max]="facture()!.solde" [min]="1"
                 class="flex-1 bg-transparent outline-none text-xl font-bold"
                 style="color:var(--text-primary)"/>
        </div>
        @if (montant() > facture()!.solde) {
          <p class="text-xs mt-1" style="color:#dc2626">
            Le montant dépasse le solde restant ({{ formatXOF(facture()!.solde) }})
          </p>
        }
      </div>

      <!-- Mode de paiement -->
      <div class="mb-5">
        <label class="text-xs font-bold uppercase tracking-wide mb-3 block" style="color:var(--text-secondary)">
          Mode de paiement
        </label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          @for (mode of modes; track mode.value) {
            <button (click)="selectedMode.set(mode.value)"
                    class="flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-all"
                    [style.background]="selectedMode()===mode.value ? mode.color + '15' : 'var(--surface-2)'"
                    [style.color]="selectedMode()===mode.value ? mode.color : 'var(--text-secondary)'"
                    [style.border-color]="selectedMode()===mode.value ? mode.color + '50' : 'var(--border-color)'">
              <mat-icon style="font-size:18px;height:18px;width:18px" [style.color]="mode.color">{{ mode.icon }}</mat-icon>
              {{ mode.label }}
            </button>
          }
        </div>
      </div>

      <!-- Téléphone / Référence -->
      @if (isMobileMoney()) {
        <div class="mb-5">
          <label class="text-xs font-bold uppercase tracking-wide mb-2 block" style="color:var(--text-secondary)">
            Numéro de téléphone
          </label>
          <input [(ngModel)]="telephone" type="tel" placeholder="+225 07 00 00 00 00"
                 class="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
      }
      @if (selectedMode() === 'VIREMENT_BANCAIRE') {
        <div class="mb-5">
          <label class="text-xs font-bold uppercase tracking-wide mb-2 block" style="color:var(--text-secondary)">
            Référence virement
          </label>
          <input [(ngModel)]="reference" placeholder="Ex: VIR-2026-001234"
                 class="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
      }

      <!-- Commentaire -->
      <div class="mb-6">
        <label class="text-xs font-bold uppercase tracking-wide mb-2 block" style="color:var(--text-secondary)">
          Commentaire (optionnel)
        </label>
        <textarea [(ngModel)]="commentaire" rows="2" placeholder="Notes supplémentaires…"
                  class="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"></textarea>
      </div>

      <!-- Récapitulatif -->
      @if (montant() > 0 && selectedMode()) {
        <div class="p-4 rounded-xl mb-5 border-l-4"
             style="background:rgba(22,163,74,0.04);border-left-color:#16a34a">
          <p class="text-sm font-bold mb-2" style="color:#16a34a">Récapitulatif</p>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div style="color:var(--text-secondary)">Facture</div>
            <div class="font-semibold" style="color:var(--text-primary)">{{ facture()!.numero }}</div>
            <div style="color:var(--text-secondary)">Étudiant</div>
            <div class="font-semibold" style="color:var(--text-primary)">{{ studentName() }}</div>
            <div style="color:var(--text-secondary)">Montant</div>
            <div class="font-bold text-base" style="color:#16a34a">{{ formatXOF(montant()) }}</div>
            <div style="color:var(--text-secondary)">Mode</div>
            <div class="font-semibold" style="color:var(--text-primary)">{{ selectedModeLabel() }}</div>
            @if (montant() < facture()!.solde) {
              <div style="color:var(--text-secondary)">Solde après</div>
              <div class="font-semibold" style="color:#d97706">{{ formatXOF(facture()!.solde - montant()) }}</div>
            } @else {
              <div style="color:var(--text-secondary)">Statut après</div>
              <div class="font-semibold" style="color:#16a34a">PAYÉE ✓</div>
            }
          </div>
        </div>
      }

      <!-- Actions -->
      <div class="flex items-center gap-3 flex-wrap">
        <button (click)="validerPaiement()"
                [disabled]="!canSubmit() || store.saving()"
                class="flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold text-white hover:opacity-80 disabled:opacity-40 transition-opacity"
                style="background:var(--accent)">
          @if (store.saving()) {
            <mat-icon class="animate-spin" style="font-size:18px;height:18px;width:18px">refresh</mat-icon>
            Traitement…
          } @else {
            <mat-icon style="font-size:18px;height:18px;width:18px">check_circle</mat-icon>
            Valider le paiement
          }
        </button>
        <a routerLink="/finance/invoices"
           class="px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
           style="background:var(--surface-2);color:var(--text-secondary)">
          Annuler
        </a>
      </div>
    </div>
  } @else {
    <div class="sms-card flex flex-col items-center justify-center py-16 gap-3">
      <mat-icon style="font-size:48px;height:48px;width:48px;color:var(--text-muted)">receipt_long</mat-icon>
      <p style="color:var(--text-secondary)">Facture introuvable</p>
      <a routerLink="/finance/invoices" class="text-sm font-semibold" style="color:var(--accent)">
        ← Retour aux factures
      </a>
    </div>
  }

</div>
  `,
})
export class EncaissementComponent implements OnInit {
  readonly store   = inject(FinanceStore);
  private  route   = inject(ActivatedRoute);
  private  router  = inject(Router);
  private  toast   = inject(ToastService);
  readonly Math    = Math;
  readonly modes   = MODES;

  montant      = signal(0);
  selectedMode = signal<ModePaiement | ''>('');
  telephone    = '';
  reference    = '';
  commentaire  = '';

  facture = computed(() => this.store.selectedFacture());
  progressionPct = computed(() => {
    const f = this.facture();
    if (!f || !f.montantTotal) return 0;
    return Math.round((f.montantPaye / f.montantTotal) * 100);
  });

  statutColor = computed(() => {
    const s = this.facture()?.statut ?? '';
    return { PAYEE:'#16a34a', PARTIELLEMENT_PAYEE:'#d97706', EN_RETARD:'#dc2626', EMISE:'#2563eb' }[s] ?? '#6b7280';
  });

  isMobileMoney = computed(() =>
    ['WAVE','ORANGE_MONEY','MTN_MOMO','MOOV_MONEY'].includes(this.selectedMode())
  );

  canSubmit = computed(() =>
    this.montant() > 0 &&
    this.montant() <= (this.facture()?.solde ?? 0) &&
    this.selectedMode() !== '' &&
    (!this.isMobileMoney() || this.telephone.length >= 10)
  );

  selectedModeLabel = computed(() =>
    MODES.find(m => m.value === this.selectedMode())?.label ?? ''
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.selectFacture(id);
    setTimeout(() => {
      const f = this.store.selectedFacture();
      if (f) this.montant.set(f.solde);
    }, 400);
  }

  setMontant(n: number): void { this.montant.set(n); }

  studentName(): string {
    const id = this.facture()?.studentId ?? 0;
    return STUDENT_NAMES_MAP[id] ?? `Étudiant #${id}`;
  }

  validerPaiement(): void {
    const f = this.facture();
    if (!f || !this.canSubmit()) return;
    this.store.initierPaiement({
      facturePublicId: f.publicId,
      montant:         this.montant(),
      operateur:       this.selectedMode() as OperateurMobileMoney,
      telephone:       this.telephone || '+225 00 00 00 00',
      idempotencyKey:  `${f.publicId}-${Date.now()}`,
    });
    setTimeout(() => {
      if (!this.store.error()) this.router.navigate(['/finance/invoices']);
    }, 800);
  }

  formatXOF(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' XOF';
  }
}
