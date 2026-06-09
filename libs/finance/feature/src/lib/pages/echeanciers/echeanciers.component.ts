import {
  ChangeDetectionStrategy, Component, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MOCK_ECHEANCIERS, IEcheancier } from '@sms/finance/data-access';
import { ToastService } from '@sms/shared/ui';

const VERSEMENT_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PAYE:       { label:'Payé',      color:'#16a34a', bg:'rgba(22,163,74,0.10)',  icon:'check_circle'  },
  EN_ATTENTE: { label:'À venir',   color:'#6366f1', bg:'rgba(99,102,241,0.10)', icon:'schedule'      },
  EN_RETARD:  { label:'En retard', color:'#dc2626', bg:'rgba(239,68,68,0.10)',  icon:'warning'       },
};

@Component({
  selector:        'sms-echeanciers',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- En-tête -->
  <div class="flex items-start justify-between mb-5 gap-3 flex-wrap">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <a routerLink="/finance" class="hover:opacity-70" style="color:var(--text-muted)">
          <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        </a>
        <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Échéanciers</h1>
      </div>
      <p class="text-sm" style="color:var(--text-secondary)">Plans de paiement et suivi des versements</p>
    </div>
    <button (click)="showForm.set(true)"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
            style="background:var(--accent)">
      <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
      Créer un échéancier
    </button>
  </div>

  <!-- KPIs -->
  <div class="grid grid-cols-3 gap-3 mb-5">
    <div class="sms-card p-4 text-center">
      <p class="text-3xl font-bold" style="color:var(--text-primary)">{{ echeanciers.length }}</p>
      <p class="text-xs mt-1" style="color:var(--text-secondary)">Plans actifs</p>
    </div>
    <div class="sms-card p-4 text-center">
      <p class="text-3xl font-bold" style="color:#dc2626">{{ enRetard() }}</p>
      <p class="text-xs mt-1" style="color:var(--text-secondary)">En retard</p>
    </div>
    <div class="sms-card p-4 text-center">
      <p class="text-xl font-bold" style="color:#16a34a">{{ formatXOF(totalRestant()) }}</p>
      <p class="text-xs mt-1" style="color:var(--text-secondary)">Restant à percevoir</p>
    </div>
  </div>

  <!-- Formulaire création (inline) -->
  @if (showForm()) {
    <div class="sms-card p-5 mb-5 border-l-4" style="border-left-color:var(--accent)">
      <h3 class="font-bold mb-4" style="color:var(--text-primary)">Créer un plan de paiement</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">N° Facture</label>
          <input [(ngModel)]="newFacture" placeholder="FAC-2025-XXXX"
                 class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Nb versements</label>
          <select [(ngModel)]="nbVersements"
                  class="w-full px-3 py-2 rounded-xl border text-sm"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
            <option value="2">2 versements</option>
            <option value="3">3 versements</option>
            <option value="4">4 versements</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Premier versement</label>
          <input [(ngModel)]="premiereDate" type="date"
                 class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
      </div>
      <div class="flex gap-2">
        <button (click)="creerEcheancier()"
                class="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
                style="background:var(--accent)">Créer l'échéancier</button>
        <button (click)="showForm.set(false)"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
      </div>
    </div>
  }

  <!-- Liste échéanciers -->
  <div class="flex flex-col gap-4">
    @for (e of echeanciers; track e.publicId) {
      <div class="sms-card overflow-hidden">
        <!-- En-tête -->
        <div class="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3"
             style="border-color:var(--border-color)">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style="background:rgba(99,102,241,0.10)">
              <mat-icon style="color:#6366f1;font-size:20px;height:20px;width:20px">event_repeat</mat-icon>
            </div>
            <div>
              <p class="font-bold text-sm" style="color:var(--text-primary)">{{ e.studentNom }}</p>
              <p class="text-xs" style="color:var(--text-muted)">{{ e.factureNumero }} · Créé le {{ e.createdDate }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-xl font-bold" style="color:var(--text-primary)">{{ formatXOF(e.montantTotal) }}</p>
              <p class="text-xs" style="color:var(--text-muted)">{{ e.versements.length }} versements</p>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                  [style.background]="e.statut==='SOLDE' ? 'rgba(22,163,74,0.10)' : e.statut==='EN_RETARD' ? 'rgba(239,68,68,0.10)' : 'rgba(99,102,241,0.10)'"
                  [style.color]="e.statut==='SOLDE' ? '#16a34a' : e.statut==='EN_RETARD' ? '#dc2626' : '#6366f1'">
              {{ e.statut === 'SOLDE' ? 'Soldé' : e.statut === 'EN_RETARD' ? 'En retard' : 'En cours' }}
            </span>
          </div>
        </div>
        <!-- Versements -->
        <div class="px-5 py-4">
          <div class="flex gap-3 flex-wrap">
            @for (v of e.versements; track v.numero) {
              <div class="flex-1 min-w-32 p-3 rounded-xl border"
                   [style.background]="versementCfg(v.statut).bg + '50'"
                   [style.border-color]="versementCfg(v.statut).color + '30'">
                <div class="flex items-center gap-1.5 mb-2">
                  <mat-icon [style.color]="versementCfg(v.statut).color"
                            style="font-size:14px;height:14px;width:14px">{{ versementCfg(v.statut).icon }}</mat-icon>
                  <span class="text-xs font-semibold" [style.color]="versementCfg(v.statut).color">
                    {{ versementCfg(v.statut).label }}
                  </span>
                </div>
                <p class="font-bold text-sm" style="color:var(--text-primary)">
                  Versement {{ v.numero }}
                </p>
                <p class="font-bold text-base" style="color:var(--text-primary)">
                  {{ formatXOF(v.montantDu) }}
                </p>
                <p class="text-xs mt-0.5" style="color:var(--text-muted)">Éch. {{ v.dateEcheance }}</p>
                @if (v.datePaiement) {
                  <p class="text-xs mt-0.5" style="color:#16a34a">Payé le {{ v.datePaiement }}</p>
                }
                @if (v.statut === 'EN_ATTENTE' || v.statut === 'EN_RETARD') {
                  <a [routerLink]="['/finance/encaissement', e.facturePublicId]"
                     class="mt-2 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-semibold text-white hover:opacity-80"
                     style="background:var(--accent)">
                    Encaisser
                  </a>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  </div>

</div>
  `,
})
export class EcheanciesComponent {
  private toast = inject(ToastService);
  echeanciers   = [...MOCK_ECHEANCIERS];

  showForm     = signal(false);
  newFacture   = '';
  nbVersements = '3';
  premiereDate = '';

  enRetard()    { return this.echeanciers.filter(e => e.statut === 'EN_RETARD').length; }
  totalRestant(){ return this.echeanciers.reduce((s, e) =>
    s + e.versements.filter(v => v.statut !== 'PAYE').reduce((x, v) => x + v.montantDu, 0), 0
  ); }

  versementCfg(s: string) { return VERSEMENT_CFG[s] ?? VERSEMENT_CFG['EN_ATTENTE']; }

  creerEcheancier(): void {
    if (!this.newFacture || !this.premiereDate) {
      this.toast.error('Veuillez remplir tous les champs');
      return;
    }
    this.toast.success(`Échéancier créé pour ${this.newFacture} (${this.nbVersements} versements)`);
    this.showForm.set(false);
  }

  formatXOF(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' XOF';
  }
}
