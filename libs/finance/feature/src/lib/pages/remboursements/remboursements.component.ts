import {
  ChangeDetectionStrategy, Component, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MOCK_REMBOURSEMENTS, IRemboursement, STUDENT_NAMES_MAP } from '@sms/finance/data-access';
import { ToastService } from '@sms/shared/ui';

const STATUT_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  EN_ATTENTE: { label:'En attente', color:'#d97706', bg:'rgba(217,119,6,0.10)',  icon:'hourglass_top'  },
  VALIDE:     { label:'Validé',     color:'#6366f1', bg:'rgba(99,102,241,0.10)', icon:'check_circle'   },
  EFFECTUE:   { label:'Effectué',   color:'#16a34a', bg:'rgba(22,163,74,0.10)',  icon:'done_all'       },
  REJETE:     { label:'Rejeté',     color:'#dc2626', bg:'rgba(239,68,68,0.10)',  icon:'cancel'         },
};

@Component({
  selector:        'sms-remboursements',
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
        <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Remboursements</h1>
      </div>
      <p class="text-sm" style="color:var(--text-secondary)">Demandes de remboursement et historique</p>
    </div>
    <button (click)="showForm.set(true)"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
            style="background:var(--accent)">
      <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
      Nouvelle demande
    </button>
  </div>

  <!-- KPIs -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    @for (item of kpis; track item.label) {
      <div class="sms-card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             [style.background]="item.bg">
          <mat-icon [style.color]="item.color" style="font-size:20px;height:20px;width:20px">{{ item.icon }}</mat-icon>
        </div>
        <div>
          <p class="text-2xl font-bold" [style.color]="item.color">{{ item.value }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">{{ item.label }}</p>
        </div>
      </div>
    }
  </div>

  <!-- Formulaire demande -->
  @if (showForm()) {
    <div class="sms-card p-5 mb-5 border-l-4" style="border-left-color:var(--accent)">
      <h3 class="font-bold mb-4" style="color:var(--text-primary)">Nouvelle demande de remboursement</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">N° Paiement</label>
          <input [(ngModel)]="newPaiement" placeholder="PAY-2026-XXXX"
                 class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Étudiant</label>
          <select [(ngModel)]="newStudentId"
                  class="w-full px-3 py-2 rounded-xl border text-sm"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
            <option value="">Sélectionner…</option>
            @for (s of studentOptions; track s.id) {
              <option [value]="s.id">{{ s.nom }}</option>
            }
          </select>
        </div>
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Montant (XOF)</label>
          <input [(ngModel)]="newMontant" type="number" min="1"
                 class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                 style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"/>
        </div>
        <div>
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Mode de remboursement</label>
          <select [(ngModel)]="newMode"
                  class="w-full px-3 py-2 rounded-xl border text-sm"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
            <option>Virement bancaire</option>
            <option>Espèces</option>
            <option>Mobile Money</option>
            <option>Chèque</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-bold mb-1 block" style="color:var(--text-secondary)">Motif de remboursement</label>
          <textarea [(ngModel)]="newMotif" rows="2" placeholder="Raison de la demande de remboursement…"
                    class="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                    style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"></textarea>
        </div>
      </div>
      <div class="flex gap-2">
        <button (click)="soumettreDemande()"
                class="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
                style="background:var(--accent)">Soumettre la demande</button>
        <button (click)="showForm.set(false)"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
      </div>
    </div>
  }

  <!-- Liste remboursements -->
  <div class="flex flex-col gap-4">
    @for (r of remboursements; track r.publicId) {
      <div class="sms-card p-5 border-l-4"
           [style.border-left-color]="statutCfg(r.statut).color">
        <div class="flex items-start gap-4 flex-wrap">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
               [style.background]="statutCfg(r.statut).bg">
            <mat-icon [style.color]="statutCfg(r.statut).color"
                      style="font-size:22px;height:22px;width:22px">{{ statutCfg(r.statut).icon }}</mat-icon>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <h3 class="font-bold text-sm" style="color:var(--text-primary)">{{ r.studentNom }}</h3>
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    [style.background]="statutCfg(r.statut).bg"
                    [style.color]="statutCfg(r.statut).color">
                {{ statutCfg(r.statut).label }}
              </span>
            </div>
            <p class="text-xs mb-2 text-sm" style="color:var(--text-secondary)">{{ r.motif }}</p>
            <div class="flex flex-wrap gap-3 text-xs" style="color:var(--text-muted)">
              <span>Réf : {{ r.paiementPublicId }}</span>
              <span>Demandé par : {{ r.demandePar }}</span>
              <span>Le {{ r.dateDemande }}</span>
              @if (r.dateValidation) { <span>Validé le {{ r.dateValidation }}</span> }
              @if (r.modePaiement)   { <span>Via {{ r.modePaiement }}</span> }
            </div>
            @if (r.commentaire) {
              <p class="text-xs mt-2 italic" style="color:var(--text-muted)">{{ r.commentaire }}</p>
            }
          </div>
          <div class="text-right shrink-0">
            <p class="text-xl font-bold" style="color:var(--accent)">{{ formatXOF(r.montant) }}</p>
            <div class="flex gap-1 mt-2 justify-end flex-wrap">
              @if (r.statut === 'EN_ATTENTE') {
                <button (click)="valider(r)"
                        class="text-xs px-2.5 py-1.5 rounded-lg font-semibold hover:opacity-80 text-white"
                        style="background:#16a34a">Valider</button>
                <button (click)="rejeter(r)"
                        class="text-xs px-2.5 py-1.5 rounded-lg font-semibold hover:opacity-80 text-white"
                        style="background:#dc2626">Rejeter</button>
              }
              @if (r.statut === 'VALIDE') {
                <button (click)="effectuer(r)"
                        class="text-xs px-2.5 py-1.5 rounded-lg font-semibold hover:opacity-80 text-white"
                        style="background:var(--accent)">Effectuer</button>
              }
              <button (click)="imprimer(r)"
                      class="text-xs px-2.5 py-1.5 rounded-lg font-semibold hover:opacity-80"
                      style="background:var(--surface-2);color:var(--text-secondary)">
                <mat-icon style="font-size:12px;height:12px;width:12px">print</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  </div>

</div>
  `,
})
export class RemboursementsComponent {
  private toast = inject(ToastService);
  remboursements = [...MOCK_REMBOURSEMENTS];

  showForm    = signal(false);
  newPaiement = '';
  newStudentId = '';
  newMontant  = 0;
  newMode     = 'Virement bancaire';
  newMotif    = '';

  readonly studentOptions = Object.entries(STUDENT_NAMES_MAP).slice(0, 15).map(([id, nom]) => ({ id, nom }));

  get kpis() {
    return [
      { label:'Total', value:this.remboursements.length, color:'var(--text-primary)', bg:'var(--surface-2)', icon:'undo' },
      { label:'En attente', value:this.remboursements.filter(r=>r.statut==='EN_ATTENTE').length, color:'#d97706', bg:'rgba(217,119,6,0.10)', icon:'hourglass_top' },
      { label:'Effectués', value:this.remboursements.filter(r=>r.statut==='EFFECTUE').length, color:'#16a34a', bg:'rgba(22,163,74,0.10)', icon:'done_all' },
      { label:'Rejetés', value:this.remboursements.filter(r=>r.statut==='REJETE').length, color:'#dc2626', bg:'rgba(239,68,68,0.10)', icon:'cancel' },
    ];
  }

  statutCfg(s: string) { return STATUT_CFG[s] ?? STATUT_CFG['EN_ATTENTE']; }

  valider(r: IRemboursement): void {
    r.statut = 'VALIDE';
    r.dateValidation = new Date().toISOString().split('T')[0];
    this.remboursements = [...this.remboursements];
    this.toast.success(`Remboursement de ${r.studentNom} validé`);
  }

  rejeter(r: IRemboursement): void {
    r.statut = 'REJETE';
    this.remboursements = [...this.remboursements];
    this.toast.error(`Remboursement de ${r.studentNom} rejeté`);
  }

  effectuer(r: IRemboursement): void {
    r.statut = 'EFFECTUE';
    this.remboursements = [...this.remboursements];
    this.toast.success(`Remboursement de ${formatXOF(r.montant)} effectué`);
  }

  imprimer(r: IRemboursement): void {
    this.toast.success(`Document remboursement ${r.publicId} — impression simulée`);
  }

  soumettreDemande(): void {
    if (!this.newMotif || !this.newMontant) {
      this.toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const newR: IRemboursement = {
      publicId: `rem-${Date.now()}`,
      paiementPublicId: this.newPaiement,
      factureNumero: 'FAC-2026-XXX',
      studentId: +this.newStudentId || 1,
      studentNom: STUDENT_NAMES_MAP[+this.newStudentId || 1] ?? 'Étudiant',
      montant: this.newMontant,
      motif: this.newMotif,
      demandePar: 'Admin courant',
      dateDemande: new Date().toISOString().split('T')[0],
      statut: 'EN_ATTENTE',
      modePaiement: this.newMode,
    };
    this.remboursements = [newR, ...this.remboursements];
    this.showForm.set(false);
    this.toast.success('Demande de remboursement soumise avec succès');
  }

  formatXOF(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' XOF';
  }
}

function formatXOF(n: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' XOF';
}
