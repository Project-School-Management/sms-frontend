import {
  Component, inject, OnInit, ChangeDetectionStrategy, signal, computed,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import { ICertificat }   from '@sms/shared/models';

const MENTION_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  'Excellent':  { color:'#16a34a', bg:'rgba(22,163,74,0.10)',   icon:'emoji_events'       },
  'Très Bien':  { color:'#10b981', bg:'rgba(16,185,129,0.10)',  icon:'military_tech'      },
  'Bien':       { color:'var(--accent)', bg:'var(--accent-light)', icon:'workspace_premium' },
  'Assez Bien': { color:'#d97706', bg:'rgba(217,119,6,0.10)',   icon:'star'               },
  'Passable':   { color:'#6b7280', bg:'rgba(107,114,128,0.10)', icon:'verified'           },
};

@Component({
  selector:        'sms-certificats',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-5 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Certificats de réussite</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        {{ store.nbCertificats() }} certificats émis · Année académique 2025-2026
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/learning"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        Tableau de bord
      </a>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">download</mat-icon>
        Exporter tout
      </button>
    </div>
  </div>

  <!-- ── KPIs ──────────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    <div class="sms-card p-4 text-center">
      <p class="text-3xl font-bold" style="color:#8b5cf6">{{ store.nbCertificats() }}</p>
      <p class="text-xs mt-1 font-semibold" style="color:var(--text-muted)">Total émis</p>
    </div>
    <div class="sms-card p-4 text-center">
      <p class="text-3xl font-bold" style="color:#16a34a">{{ nbExcellents() }}</p>
      <p class="text-xs mt-1 font-semibold" style="color:var(--text-muted)">Excellent & Très Bien</p>
    </div>
    <div class="sms-card p-4 text-center">
      <p class="text-3xl font-bold" style="color:var(--accent)">{{ moyenneScore() }}%</p>
      <p class="text-xs mt-1 font-semibold" style="color:var(--text-muted)">Score moyen</p>
    </div>
    <div class="sms-card p-4 text-center">
      <p class="text-3xl font-bold" style="color:#f59e0b">{{ nbCours() }}</p>
      <p class="text-xs mt-1 font-semibold" style="color:var(--text-muted)">Cours concernés</p>
    </div>
  </div>

  <!-- ── Filtre cours ───────────────────────────────────────────────────────── -->
  <div class="flex flex-wrap gap-2 mb-5">
    <button (click)="coursFilter.set('')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            [style.background]="coursFilter()==='' ? 'var(--accent)' : 'var(--surface-2)'"
            [style.color]="coursFilter()==='' ? '#fff' : 'var(--text-secondary)'">
      Tous les cours
    </button>
    @for (c of coursOptions(); track c) {
      <button (click)="coursFilter.set(coursFilter()===c ? '' : c)"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              [style.background]="coursFilter()===c ? 'var(--accent)' : 'var(--surface-2)'"
              [style.color]="coursFilter()===c ? '#fff' : 'var(--text-secondary)'">
        {{ c }}
      </button>
    }
  </div>

  <!-- ── Grille certificats ─────────────────────────────────────────────────── -->
  @if (store.loading()) {
    <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
    </div>
  } @else {
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      @for (cert of certsFiltres(); track cert.publicId) {
        <div class="sms-card p-5 flex flex-col gap-4 relative overflow-hidden">
          <!-- Fond décoratif -->
          <div class="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5"
               [style.background]="mentionCfg(cert.mention).color"
               style="transform:translate(30%,-30%)"></div>

          <!-- Header -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                 [style.background]="mentionCfg(cert.mention).bg">
              <mat-icon [style.color]="mentionCfg(cert.mention).color"
                        style="font-size:22px;height:22px;width:22px">
                {{ mentionCfg(cert.mention).icon }}
              </mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm" style="color:var(--text-primary)">{{ cert.etudiantNom }}</p>
              <p class="text-xs mt-0.5" style="color:var(--text-secondary)">{{ cert.coursLibelle }}</p>
            </div>
          </div>

          <!-- Score -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-3xl font-bold" [style.color]="mentionCfg(cert.mention).color">
                {{ cert.score }}%
              </p>
              <p class="text-xs mt-0.5 font-semibold"
                 [style.color]="mentionCfg(cert.mention).color">{{ cert.mention }}</p>
            </div>
            <div class="relative w-16 h-16">
              <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none"
                        [attr.stroke]="mentionCfg(cert.mention).bg" stroke-width="3"/>
                <circle cx="18" cy="18" r="16" fill="none"
                        [attr.stroke]="mentionCfg(cert.mention).color"
                        stroke-width="3"
                        stroke-linecap="round"
                        [attr.stroke-dasharray]="(cert.score / 100) * 100.53 + ' 100.53'"/>
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-xs font-bold"
                    [style.color]="mentionCfg(cert.mention).color">
                {{ cert.score }}
              </span>
            </div>
          </div>

          <!-- Barre score -->
          <div>
            <div class="rounded-full h-2" style="background:var(--surface-2)">
              <div class="h-2 rounded-full transition-all"
                   [style.background]="mentionCfg(cert.mention).color"
                   [style.width]="cert.score + '%'"></div>
            </div>
          </div>

          <!-- Date + actions -->
          <div class="flex items-center justify-between pt-2 border-t"
               style="border-color:var(--border-color)">
            <p class="text-xs" style="color:var(--text-muted)">
              <mat-icon style="font-size:12px;height:12px;width:12px;vertical-align:middle">event</mat-icon>
              Émis le {{ cert.dateEmission }}
            </p>
            <button (click)="telecharger(cert)"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80"
                    [style.background]="mentionCfg(cert.mention).bg"
                    [style.color]="mentionCfg(cert.mention).color">
              <mat-icon style="font-size:13px;height:13px;width:13px">download</mat-icon>
              Télécharger
            </button>
          </div>
        </div>
      }
    </div>

    @if (certsFiltres().length === 0) {
      <div class="flex flex-col items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
        <mat-icon style="font-size:48px;height:48px;width:48px;opacity:0.3">workspace_premium</mat-icon>
        <p class="font-semibold">Aucun certificat pour ce filtre</p>
      </div>
    }
  }

</div>
  `,
})
export class CertificatsComponent implements OnInit {
  readonly store = inject(LearningStore);

  coursFilter = signal('');

  ngOnInit() { this.store.loadCertificats(); }

  coursOptions = computed(() =>
    [...new Set(this.store.certificats().map(c => c.coursLibelle))]
  );

  certsFiltres = computed(() => {
    const f = this.coursFilter();
    const list = this.store.certificats();
    return f ? list.filter(c => c.coursLibelle === f) : list;
  });

  nbExcellents = computed(() =>
    this.store.certificats().filter(c => c.mention === 'Excellent' || c.mention === 'Très Bien').length
  );

  moyenneScore = computed(() => {
    const list = this.store.certificats();
    if (!list.length) return 0;
    return Math.round(list.reduce((s, c) => s + c.score, 0) / list.length);
  });

  nbCours = computed(() => new Set(this.store.certificats().map(c => c.coursPublicId)).size);

  telecharger(cert: ICertificat) {
    console.log('Téléchargement du certificat', cert.publicId);
  }

  mentionCfg(mention: string) {
    return MENTION_CFG[mention] ?? MENTION_CFG['Bien'];
  }
}
