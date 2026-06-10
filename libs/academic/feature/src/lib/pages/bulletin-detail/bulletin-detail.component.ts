import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule }             from '@angular/material/icon';
import { AcademicStore }             from '@sms/academic/data-access';
import { IBulletin, INote }          from '@sms/shared/models';

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUT_CFG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  EN_ATTENTE: { label: 'En attente', bg: 'rgba(107,114,128,0.12)', color: '#6b7280', icon: 'pending' },
  GENERE:     { label: 'Généré',     bg: 'rgba(59,130,246,0.12)',  color: '#2563eb', icon: 'description' },
  PUBLIE:     { label: 'Publié',     bg: 'rgba(22,163,74,0.12)',   color: '#16a34a', icon: 'check_circle' },
};

const MENTION_CFG: Record<string, { color: string; bg: string }> = {
  'Très Bien':  { color: '#16a34a', bg: 'rgba(22,163,74,0.12)'   },
  'Bien':       { color: '#2563eb', bg: 'rgba(59,130,246,0.12)'  },
  'Assez Bien': { color: '#0891b2', bg: 'rgba(8,145,178,0.12)'   },
  'Passable':   { color: '#d97706', bg: 'rgba(245,158,11,0.12)'  },
  'Insuffisant':{ color: '#dc2626', bg: 'rgba(239,68,68,0.12)'   },
};

@Component({
  selector:        'sms-bulletin-detail',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6 max-w-4xl mx-auto">

  <!-- Breadcrumb -->
  <div class="flex items-center gap-2 mb-6 text-sm">
    <a routerLink="/academic/bulletins" class="hover:opacity-70" style="color: var(--accent)">
      Bulletins
    </a>
    <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">chevron_right</mat-icon>
    <span style="color:var(--text-secondary)">Détail du bulletin</span>
  </div>

  @if (store.loading()) {
    <div class="flex items-center justify-center py-16 gap-2" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement...
    </div>
  }

  @if (store.selectedBulletin(); as b) {

    <!-- ── Header card ── -->
    <div class="sms-card p-6 mb-6">
      <div class="flex flex-wrap items-start gap-6">

        <!-- Avatar initiales -->
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
             style="background: linear-gradient(135deg,#6366f1,#8b5cf6)">
          {{ initiales(b.studentNom) }}
        </div>

        <!-- Infos principales -->
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <h1 class="text-2xl font-bold" style="color:var(--text-primary)">{{ b.studentNom }}</h1>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  [style.background]="statutCfg(b.statut).bg"
                  [style.color]="statutCfg(b.statut).color">
              <mat-icon style="font-size:12px;height:12px;width:12px">{{ statutCfg(b.statut).icon }}</mat-icon>
              {{ statutCfg(b.statut).label }}
            </span>
          </div>
          <p class="text-sm" style="color:var(--text-secondary)">
            {{ b.promotionLibelle }} · Semestre {{ b.semestre }} · Année 2025-2026
          </p>

          <div class="flex flex-wrap gap-4 mt-3 text-sm" style="color:var(--text-secondary)">
            <span class="flex items-center gap-1">
              <mat-icon style="font-size:15px;height:15px;width:15px">emoji_events</mat-icon>
              Rang : <strong style="color:var(--text-primary)">{{ b.rang }}e</strong>
            </span>
            <span class="flex items-center gap-1">
              <mat-icon style="font-size:15px;height:15px;width:15px">calendar_today</mat-icon>
              Généré le {{ b.createdDate | date:'dd/MM/yyyy' }}
            </span>
          </div>
        </div>

        <!-- Moyenne + Mention -->
        <div class="flex flex-col items-center gap-1 flex-shrink-0">
          <div class="text-5xl font-black tabular-nums" [style.color]="moyenneColor(b.moyenne)">
            {{ b.moyenne }}
          </div>
          <div class="text-base font-semibold" style="color:var(--text-secondary)">/20</div>
          @if (b.mention) {
            <span class="mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                  [style.background]="mentionBg(b.mention)"
                  [style.color]="mentionColor(b.mention)">
              {{ b.mention }}
            </span>
          }
        </div>
      </div>

      <!-- Stats bar -->
      <div class="mt-5 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4"
           style="border-color:var(--border-color)">
        <div class="text-center">
          <p class="text-xl font-bold" style="color:var(--text-primary)">{{ b.notes.length }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">Matières</p>
        </div>
        <div class="text-center">
          <p class="text-xl font-bold" style="color:#16a34a">{{ validatedCount(b) }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">Validées (≥10)</p>
        </div>
        <div class="text-center">
          <p class="text-xl font-bold" style="color:#dc2626">{{ failedCount(b) }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">Insuffisantes</p>
        </div>
        <div class="text-center">
          <p class="text-xl font-bold" style="color:#d97706">{{ absentCount(b) }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">Absences</p>
        </div>
      </div>
    </div>

    <!-- ── Notes table ── -->
    <div class="sms-card overflow-hidden mb-6">
      <div class="px-5 py-4 border-b flex items-center gap-2" style="border-color:var(--border-color)">
        <mat-icon style="font-size:18px;height:18px;width:18px;color:var(--accent)">grade</mat-icon>
        <h3 class="font-semibold" style="color:var(--text-primary)">Détail des notes</h3>
        <span class="ml-auto text-xs" style="color:var(--text-muted)">{{ b.notes.length }} matière(s)</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              <th class="text-left px-4 py-3 font-medium" style="color:var(--text-secondary)">Matière</th>
              <th class="text-center px-4 py-3 font-medium" style="color:var(--text-secondary)">Note /20</th>
              <th class="text-center px-4 py-3 font-medium hidden sm:table-cell" style="color:var(--text-secondary)">Coeff.</th>
              <th class="text-center px-4 py-3 font-medium hidden md:table-cell" style="color:var(--text-secondary)">Statut</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell" style="color:var(--text-secondary)">Appréciation</th>
              <th class="text-left px-4 py-3 font-medium hidden xl:table-cell" style="color:var(--text-secondary)">Enseignant</th>
            </tr>
          </thead>
          <tbody>
            @for (note of b.notes; track note.publicId) {
              <tr class="border-t transition-opacity hover:opacity-90" style="border-color:var(--border-color)">
                <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">{{ note.matiereLibelle }}</td>

                <td class="px-4 py-3 text-center">
                  @if (note.absent) {
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                          style="background:rgba(239,68,68,0.12);color:#dc2626">
                      ABS
                    </span>
                  } @else if (note.valeur !== null) {
                    <span class="text-base font-bold tabular-nums"
                          [style.color]="noteColor(note.valeur)">
                      {{ note.valeur }}
                    </span>
                  } @else {
                    <span style="color:var(--text-muted)">—</span>
                  }
                </td>

                <td class="px-4 py-3 text-center hidden sm:table-cell" style="color:var(--text-secondary)">
                  {{ note.coefficient ?? '—' }}
                </td>

                <td class="px-4 py-3 text-center hidden md:table-cell">
                  @if (!note.absent && note.valeur !== null) {
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                          [style.background]="note.valeur >= 10 ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)'"
                          [style.color]="note.valeur >= 10 ? '#16a34a' : '#dc2626'">
                      {{ note.valeur >= 10 ? 'Validée' : 'Insuffisante' }}
                    </span>
                  }
                </td>

                <td class="px-4 py-3 hidden lg:table-cell text-sm" style="color:var(--text-secondary)">
                  {{ note.appreciation ?? '—' }}
                </td>

                <td class="px-4 py-3 hidden xl:table-cell text-xs" style="color:var(--text-muted)">
                  {{ note.enseignantNom ?? '—' }}
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">
                  <div class="flex flex-col items-center justify-center py-10 gap-2">
                    <mat-icon style="font-size:36px;height:36px;width:36px;color:var(--text-muted)">grade</mat-icon>
                    <p style="color:var(--text-secondary)">Aucune note disponible</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Footer: moyenne + weighted -->
      <div class="px-5 py-3 border-t flex items-center justify-between flex-wrap gap-2"
           style="border-color:var(--border-color);background:var(--surface-2)">
        <div class="flex items-center gap-6 text-sm">
          <span style="color:var(--text-secondary)">
            Moyenne générale :
            <strong class="text-base ml-1" [style.color]="moyenneColor(b.moyenne)">
              {{ b.moyenne }}/20
            </strong>
          </span>
          @if (b.mention) {
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                  [style.background]="mentionBg(b.mention)"
                  [style.color]="mentionColor(b.mention)">
              {{ b.mention }}
            </span>
          }
        </div>
        <span class="text-sm" style="color:var(--text-secondary)">
          Rang : <strong style="color:var(--text-primary)">{{ b.rang }}e / classe</strong>
        </span>
      </div>
    </div>

    <!-- ── Download button ── -->
    @if (b.pdfUrl || b.statut === 'PUBLIE') {
      <div class="flex items-center gap-3">
        <a [href]="b.pdfUrl ?? '#'"
           target="_blank"
           class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
           style="background: var(--accent)">
          <mat-icon style="font-size:18px;height:18px;width:18px">download</mat-icon>
          Télécharger le bulletin PDF
        </a>
        <button (click)="printBulletin()"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-70"
                style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
          <mat-icon style="font-size:18px;height:18px;width:18px">print</mat-icon>
          Imprimer
        </button>
      </div>
    }

  } @else if (!store.loading()) {
    <div class="flex flex-col items-center justify-center py-16 gap-3">
      <mat-icon style="font-size:48px;height:48px;width:48px;color:var(--text-muted)">description</mat-icon>
      <p style="color:var(--text-secondary)">Bulletin non trouvé</p>
      <a routerLink="/academic/bulletins" class="text-sm font-medium" style="color:var(--accent)">
        ← Retour aux bulletins
      </a>
    </div>
  }

</div>
  `,
})
export class BulletinDetailComponent implements OnInit {
  protected readonly store = inject(AcademicStore);
  private  readonly route  = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.loadBulletin(id);
  }

  printBulletin(): void {
    window.print();
  }

  // ── Stats helpers ─────────────────────────────────────────────────────────
  validatedCount(b: IBulletin): number {
    return b.notes.filter(n => !n.absent && (n.valeur ?? 0) >= 10).length;
  }
  failedCount(b: IBulletin): number {
    return b.notes.filter(n => !n.absent && (n.valeur ?? 0) < 10).length;
  }
  absentCount(b: IBulletin): number {
    return b.notes.filter(n => n.absent).length;
  }

  // ── Visual helpers ────────────────────────────────────────────────────────
  initiales(nom: string): string {
    const parts = nom.trim().split(' ');
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  }

  moyenneColor(m: number): string {
    if (m >= 16) return '#16a34a';
    if (m >= 14) return '#059669';
    if (m >= 10) return 'var(--accent)';
    if (m >= 8)  return '#d97706';
    return '#dc2626';
  }

  noteColor(v: number | null): string {
    if (v === null) return 'var(--text-muted)';
    if (v >= 14) return '#16a34a';
    if (v >= 10) return 'var(--text-primary)';
    if (v >= 8)  return '#d97706';
    return '#dc2626';
  }

  statutCfg(statut: string) {
    return STATUT_CFG[statut] ?? { label: statut, bg: 'rgba(107,114,128,0.1)', color: '#6b7280', icon: 'circle' };
  }

  mentionColor(mention: string | undefined): string {
    return MENTION_CFG[mention ?? '']?.color ?? '#6b7280';
  }
  mentionBg(mention: string | undefined): string {
    return MENTION_CFG[mention ?? '']?.bg ?? 'rgba(107,114,128,0.1)';
  }
}
