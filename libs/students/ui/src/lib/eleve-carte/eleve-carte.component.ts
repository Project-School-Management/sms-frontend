import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { QRCodeModule } from 'angularx-qrcode';
import { IStudentCard, getVocabulary } from '@sms/shared/models';

/**
 * Carte d'établissement virtuelle (élève/étudiant), imprimable au format
 * physique d'une carte bancaire — ISO/IEC 7810 ID-1 (85,60 × 53,98 mm).
 *
 * Le vocabulaire (Élève/Étudiant, Classe/Faculté) est dérivé du
 * {@link IStudentCard#workspaceType} — aucune condition codée en dur.
 */
@Component({
  selector:        'sms-eleve-carte',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation:   ViewEncapsulation.None,
  imports:         [CommonModule, MatIconModule, QRCodeModule],
  template: `
<div class="sms-card-print">
  <div class="sms-card">
    <div class="sms-card-band">
      <span class="sms-card-etab">{{ card().etablissementNom }}</span>
      <span class="sms-card-type">Carte {{ vocab().learner }}</span>
    </div>

    <div class="sms-card-body">
      <div class="sms-card-photo">
        @if (card().photoUrl) {
          <img [src]="card().photoUrl" alt="Photo" />
        } @else {
          <mat-icon>person</mat-icon>
        }
      </div>

      <div class="sms-card-info">
        <div class="sms-card-name">{{ card().prenom }} {{ card().nom }}</div>
        <div class="sms-card-line"><span>Matricule</span>{{ card().matricule }}</div>
        @if (card().groupeLibelle) {
          <div class="sms-card-line"><span>{{ vocab().group }}</span>{{ card().groupeLibelle }}</div>
        }
        @if (card().anneeAcademique) {
          <div class="sms-card-line"><span>{{ vocab().period }}s</span>{{ card().anneeAcademique }}</div>
        }
      </div>

      <div class="sms-card-qr">
        <qrcode [qrdata]="card().matricule" [width]="80" [margin]="0" errorCorrectionLevel="M"></qrcode>
      </div>
    </div>

    @if (card().dateEmission) {
      <div class="sms-card-footer">Émise le {{ card().dateEmission }}</div>
    }
  </div>
</div>

<button type="button" class="sms-no-print sms-print-btn" (click)="imprimer()">
  <mat-icon>print</mat-icon> Imprimer la carte
</button>
  `,
  styles: [`
    .sms-card {
      width: 340px;
      aspect-ratio: 85.6 / 53.98;
      border-radius: 12px;
      background: var(--surface-1, #fff);
      color: var(--text-primary, #111827);
      border: 1px solid var(--border, rgba(0,0,0,.08));
      box-shadow: 0 4px 16px rgba(0,0,0,.12);
      display: flex; flex-direction: column;
      overflow: hidden;
      font-family: inherit;
    }
    .sms-card-band {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 12px; color: #fff;
      background: var(--accent, #2563eb);
    }
    .sms-card-etab { font-weight: 700; font-size: 12px; }
    .sms-card-type { font-size: 10px; opacity: .9; text-transform: uppercase; letter-spacing: .04em; }
    .sms-card-body { display: flex; gap: 10px; padding: 10px 12px; flex: 1; align-items: center; }
    .sms-card-photo {
      width: 56px; height: 70px; border-radius: 6px;
      background: var(--surface-2, #f3f4f6);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
      flex: 0 0 auto;
    }
    .sms-card-photo img { width: 100%; height: 100%; object-fit: cover; }
    .sms-card-photo mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted, #9ca3af); }
    .sms-card-info { flex: 1; min-width: 0; }
    .sms-card-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
    .sms-card-line { font-size: 11px; color: var(--text-secondary, #4b5563); }
    .sms-card-line span { display: inline-block; min-width: 64px; color: var(--text-muted, #9ca3af); }
    .sms-card-qr { flex: 0 0 auto; }
    .sms-card-footer { padding: 4px 12px; font-size: 9px; color: var(--text-muted, #9ca3af); text-align: right; }
    .sms-print-btn {
      margin-top: 12px; display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 8px; border: none; cursor: pointer;
      background: var(--accent, #2563eb); color: #fff; font-size: 14px;
    }

    @media print {
      @page { size: 85.6mm 53.98mm; margin: 0; }
      body * { visibility: hidden !important; }
      .sms-card-print, .sms-card-print * { visibility: visible !important; }
      .sms-card-print { position: fixed; left: 0; top: 0; margin: 0; padding: 0; }
      .sms-card-print .sms-card {
        width: 85.6mm; height: 53.98mm; border-radius: 3.18mm;
        box-shadow: none; border: none;
      }
      .sms-no-print { display: none !important; }
    }
  `],
})
export class EleveCarteComponent {
  /** Données de la carte (requis). */
  readonly card = input.required<IStudentCard>();

  /** Vocabulaire contextuel dérivé du type d'espace. */
  readonly vocab = computed(() => getVocabulary(this.card().workspaceType));

  imprimer(): void {
    window.print();
  }
}
