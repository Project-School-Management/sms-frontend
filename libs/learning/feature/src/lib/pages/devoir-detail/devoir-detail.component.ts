import {
  Component, inject, OnInit, ChangeDetectionStrategy, signal, computed,
} from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule }     from '@angular/material/icon';
import { FormsModule }       from '@angular/forms';
import { LearningStore }     from '@sms/learning/data-access';
import { MOCK_PARTICIPANTS } from '@sms/learning/data-access';
import { IParticipant }      from '@sms/shared/models';

interface Soumission {
  etudiant:    IParticipant;
  dateRemise:  string;
  fichier:     string;
  note:        number | null;
  statut:      'SOUMIS' | 'CORRIGE' | 'EN_RETARD' | 'NON_RENDU';
  commentaire: string;
}

const STATUT_SOUM_CFG: Record<string, { label: string; bg: string; color: string }> = {
  SOUMIS:    { label:'Soumis',     bg:'rgba(37,99,235,0.10)',   color:'var(--accent)' },
  CORRIGE:   { label:'Corrigé',    bg:'rgba(22,163,74,0.10)',   color:'#16a34a'       },
  EN_RETARD: { label:'En retard',  bg:'rgba(245,158,11,0.10)',  color:'#d97706'       },
  NON_RENDU: { label:'Non rendu',  bg:'rgba(239,68,68,0.10)',   color:'#dc2626'       },
};

@Component({
  selector:        'sms-devoir-detail',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule, FormsModule],
  template: `
<div class="p-6">

  <!-- ── Navigation retour ────────────────────────────────────────────────── -->
  <div class="flex items-center gap-3 mb-5">
    <a routerLink="/learning/devoirs"
       class="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80"
       style="color:var(--text-secondary)">
      <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
      Devoirs
    </a>
    <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">chevron_right</mat-icon>
    <span class="text-sm font-semibold truncate" style="color:var(--text-primary)">
      {{ store.selectedDevoir()?.titre ?? '…' }}
    </span>
  </div>

  @if (store.loading()) {
    <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
    </div>
  } @else if (store.selectedDevoir(); as devoir) {

    <!-- ── Header devoir ─────────────────────────────────────────────────── -->
    <div class="sms-card p-5 mb-5"
         style="background:var(--accent-light);border:1px solid rgba(37,99,235,0.18)">
      <div class="flex items-start gap-4 flex-wrap">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
             style="background:var(--accent)">
          <mat-icon style="color:#fff;font-size:22px;height:22px;width:22px">assignment</mat-icon>
        </div>
        <div class="flex-1">
          <h1 class="text-xl font-bold" style="color:var(--text-primary)">{{ devoir.titre }}</h1>
          <p class="text-sm mt-1" style="color:var(--text-secondary)">{{ devoir.coursLibelle }}</p>
          <p class="text-sm mt-2" style="color:var(--text-primary)">{{ devoir.description }}</p>
        </div>
        <div class="flex flex-col items-end gap-2 shrink-0">
          <span class="text-xs px-3 py-1 rounded-full font-bold"
                style="background:var(--accent);color:#fff">
            {{ devoir.bareme }} points
          </span>
          <p class="text-xs" style="color:var(--text-muted)">
            Limite : <strong style="color:#ef4444">{{ devoir.dateLimite }}</strong>
          </p>
          @if (devoir.pieceJointe) {
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80"
                    style="background:var(--surface-1);color:var(--text-secondary);border:1px solid var(--border-color)">
              <mat-icon style="font-size:13px;height:13px;width:13px">download</mat-icon>
              {{ devoir.pieceJointe }}
            </button>
          }
        </div>
      </div>
    </div>

    <!-- ── KPIs soumissions ──────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      @for (kpi of kpis(); track kpi.label) {
        <div class="sms-card p-4 text-center">
          <p class="text-2xl font-bold" [style.color]="kpi.color">{{ kpi.value }}</p>
          <p class="text-xs mt-0.5 font-semibold" style="color:var(--text-muted)">{{ kpi.label }}</p>
        </div>
      }
    </div>

    <!-- ── Table soumissions ─────────────────────────────────────────────── -->
    <div class="sms-card overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b" style="border-color:var(--border-color)">
        <h2 class="font-bold" style="color:var(--text-primary)">Soumissions des étudiants</h2>
        <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
          <mat-icon style="font-size:14px;height:14px;width:14px">download</mat-icon>
          Exporter
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="background:var(--surface-2)">
              <th class="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Étudiant</th>
              <th class="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Date remise</th>
              <th class="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Fichier</th>
              <th class="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Statut</th>
              <th class="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Note /{{ devoir.bareme }}</th>
              <th class="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Commentaire</th>
            </tr>
          </thead>
          <tbody>
            @for (s of soumissions(); track s.etudiant.publicId) {
              <tr class="border-t hover:opacity-90 transition-opacity"
                  style="border-color:var(--border-color)">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                         style="background:linear-gradient(135deg,var(--accent),#3b82f6)">
                      {{ s.etudiant.initiales }}
                    </div>
                    <div>
                      <p class="font-semibold text-xs" style="color:var(--text-primary)">{{ s.etudiant.nom }}</p>
                      <p class="text-xs" style="color:var(--text-muted)">{{ s.etudiant.classe }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3 text-xs" style="color:var(--text-secondary)">
                  {{ s.statut !== 'NON_RENDU' ? s.dateRemise : '—' }}
                </td>
                <td class="px-5 py-3">
                  @if (s.statut !== 'NON_RENDU') {
                    <button class="flex items-center gap-1 text-xs font-semibold hover:opacity-80"
                            style="color:var(--accent)">
                      <mat-icon style="font-size:12px;height:12px;width:12px">attach_file</mat-icon>
                      {{ s.fichier }}
                    </button>
                  } @else {
                    <span class="text-xs" style="color:var(--text-muted)">—</span>
                  }
                </td>
                <td class="px-5 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                        [style.background]="statutSoumCfg(s.statut).bg"
                        [style.color]="statutSoumCfg(s.statut).color">
                    {{ statutSoumCfg(s.statut).label }}
                  </span>
                </td>
                <td class="px-5 py-3">
                  @if (s.statut !== 'NON_RENDU') {
                    <input type="number"
                           [(ngModel)]="s.note"
                           [min]="0" [max]="devoir.bareme"
                           class="w-16 px-2 py-1 rounded-xl border text-xs font-bold text-center"
                           style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"
                           placeholder="—"
                           (change)="onNoteChange(s)" />
                  } @else {
                    <span class="text-xs" style="color:var(--text-muted)">—</span>
                  }
                </td>
                <td class="px-5 py-3">
                  <input type="text"
                         [(ngModel)]="s.commentaire"
                         class="w-full min-w-[120px] px-2 py-1 rounded-xl border text-xs"
                         style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)"
                         placeholder="Commentaire…" />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <!-- Actions bas de page -->
      <div class="flex items-center justify-between p-4 border-t" style="border-color:var(--border-color)">
        <p class="text-xs" style="color:var(--text-muted)">
          {{ corrigesCount() }} / {{ soumissions().length }} notes saisies
        </p>
        <button (click)="sauvegarder()"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
                style="background:var(--accent)">
          <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
          Enregistrer les notes
        </button>
      </div>
    </div>

  } @else {
    <div class="flex flex-col items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
      <mat-icon style="font-size:48px;height:48px;width:48px;opacity:0.3">assignment_late</mat-icon>
      <p class="font-semibold">Devoir introuvable</p>
    </div>
  }

</div>
  `,
})
export class DevoirDetailComponent implements OnInit {
  readonly store = inject(LearningStore);
  private  route = inject(ActivatedRoute);

  readonly saved = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.selectDevoir(id);
  }

  soumissions = computed<Soumission[]>(() => {
    const devoir = this.store.selectedDevoir();
    if (!devoir) return [];
    const dates   = ['2026-06-10 09:42','2026-06-11 14:15','2026-06-09 16:00','2026-06-12 08:30','2026-06-11 11:45','2026-06-10 17:20'];
    const fichiers = ['rapport_final.pdf','projet_bdd.zip','tp_algo.py','analyse_réseau.docx','audit_secu.pdf','docker_compose.yml'];
    return MOCK_PARTICIPANTS.slice(0, devoir.nbEtudiants > 0 ? Math.min(MOCK_PARTICIPANTS.length, devoir.nbEtudiants) : MOCK_PARTICIPANTS.length)
      .map((p, i) => ({
        etudiant:    p,
        dateRemise:  dates[i % dates.length],
        fichier:     fichiers[i % fichiers.length],
        note:        i < devoir.nbSoumissions ? null : null,
        statut:      (i < devoir.nbSoumissions
          ? (i % 5 === 0 ? 'EN_RETARD' : 'SOUMIS')
          : 'NON_RENDU') as Soumission['statut'],
        commentaire: '',
      }));
  });

  kpis = computed(() => {
    const d = this.store.selectedDevoir();
    if (!d) return [];
    const soum = this.soumissions();
    const taux = d.nbEtudiants ? Math.round((d.nbSoumissions / d.nbEtudiants) * 100) : 0;
    return [
      { label:'Étudiants',    value: d.nbEtudiants,    color:'var(--text-primary)' },
      { label:'Soumissions',  value: d.nbSoumissions,  color:'var(--accent)'       },
      { label:'Taux remise',  value: taux + '%',        color: taux >= 75 ? '#16a34a' : '#f59e0b' },
      { label:'À corriger',   value: soum.filter(s => s.statut === 'SOUMIS').length, color:'#d97706' },
    ];
  });

  corrigesCount = computed(() => this.soumissions().filter(s => s.note !== null).length);

  onNoteChange(s: Soumission) {
    s.statut = 'CORRIGE';
  }

  sauvegarder() { this.saved.set(true); }

  statutSoumCfg(s: string) { return STATUT_SOUM_CFG[s] ?? STATUT_SOUM_CFG['SOUMIS']; }
}
