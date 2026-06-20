import {
  Component, ChangeDetectionStrategy, inject, OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule }    from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LibraryStore } from '@sms/library/data-access';

@Component({
  selector: 'sms-resource-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, MatTooltipModule],
  template: `
<div class="resource-detail">

  <!-- Retour -->
  <a routerLink="/library" class="back-link">
    <mat-icon>arrow_back</mat-icon> Retour au catalogue
  </a>

  @if (store.loading()) {
    <div class="loading-state"><mat-icon class="spin">sync</mat-icon><p>Chargement…</p></div>
  } @else if (store.selectedResource()) {
    @if (store.selectedResource(); as res) {
    <div class="detail-layout">

      <!-- Panneau gauche — couverture + actions -->
      <div class="detail-aside">
        <div class="aside-cover">
          @if (res.urlCouverture) {
            <img [src]="res.urlCouverture" [alt]="res.titre" class="cover-large" />
          } @else {
            <div class="cover-placeholder-lg">
              <mat-icon>{{ typeIcon(res.type) }}</mat-icon>
            </div>
          }
        </div>

        <div class="aside-statut" [class]="'statut-' + res.statut.toLowerCase()">
          <mat-icon>{{ res.statut === 'DISPONIBLE' ? 'check_circle' : 'cancel' }}</mat-icon>
          {{ statutLabel(res.statut) }}
        </div>

        <!-- ── Disponibilité (papier / électronique / emplacement) ── -->
        <div class="aside-dispo">
          <h3 class="dispo-title"><mat-icon class="dispo-title-ic">inventory</mat-icon> Disponibilité</h3>

          <!-- Version papier -->
          <div class="dispo-row">
            <mat-icon class="dispo-ic">menu_book</mat-icon>
            <div class="dispo-txt">
              <span class="dispo-label">Version papier</span>
              <span class="dispo-value">{{ res.nbDisponibles }}/{{ res.nbExemplaires }} exemplaire(s)</span>
            </div>
            <span class="dispo-pill" [class.on]="res.nbDisponibles > 0">
              {{ res.nbDisponibles > 0 ? 'Disponible' : 'Épuisé' }}
            </span>
          </div>

          <!-- Version électronique -->
          <div class="dispo-row">
            <mat-icon class="dispo-ic">cloud_download</mat-icon>
            <div class="dispo-txt">
              <span class="dispo-label">Version électronique</span>
              <span class="dispo-value">{{ res.disponibleEnLigne ? (res.formatNumerique || 'Consultable en ligne') : 'Non numérisé' }}</span>
            </div>
            <span class="dispo-pill" [class.on]="res.disponibleEnLigne">
              {{ res.disponibleEnLigne ? 'En ligne' : 'Non' }}
            </span>
          </div>

          <!-- Emplacement physique -->
          @if (res.emplacement) {
            <div class="dispo-loc">
              <mat-icon class="dispo-ic">location_on</mat-icon>
              <div class="dispo-txt">
                <span class="dispo-label">Emplacement</span>
                <span class="dispo-value">
                  {{ res.emplacement }}@if (res.cote) { · Cote {{ res.cote }}}
                </span>
                @if (res.section) { <span class="dispo-sub">{{ res.section }}</span> }
              </div>
            </div>
          }
        </div>

        <div class="aside-actions">
          @if (res.nbDisponibles > 0) {
            <a [routerLink]="['/library/borrow', res.publicId]" class="btn btn-primary btn-full">
              <mat-icon>bookmark_add</mat-icon> Emprunter (papier)
            </a>
          } @else {
            <a [routerLink]="['/library/reserve', res.publicId]" class="btn btn-warn btn-full">
              <mat-icon>event_available</mat-icon> Réserver
            </a>
          }
          @if (res.disponibleEnLigne) {
            <a [routerLink]="['/library/read', res.publicId]" class="btn btn-outline btn-full">
              <mat-icon>{{ res.type === 'VIDEO' ? 'play_circle' : 'menu_book' }}</mat-icon>
              {{ res.type === 'VIDEO' ? 'Regarder en ligne' : 'Lire en ligne' }}
            </a>
            @if (res.urlFichier) {
              <a [href]="res.urlFichier" target="_blank" class="btn btn-ghost btn-full">
                <mat-icon>download</mat-icon> Télécharger
              </a>
            }
          }
          <a [routerLink]="['/library/manage', res.publicId, 'edit']" class="btn btn-ghost btn-full">
            <mat-icon>edit</mat-icon> Modifier la fiche
          </a>
        </div>
      </div>

      <!-- Panneau droit — infos -->
      <div class="detail-main">
        <div class="detail-header">
          <span class="type-badge type-{{ res.type.toLowerCase() }}">
            <mat-icon class="badge-ic">{{ typeIcon(res.type) }}</mat-icon>
            {{ res.type }}
          </span>
          <span class="categorie-badge">{{ res.categorie }}</span>
        </div>

        <h1 class="detail-titre">{{ res.titre }}</h1>
        <p class="detail-auteur">par <strong>{{ res.auteur }}</strong></p>

        @if (res.notesMoyenne) {
          <div class="detail-rating">
            @for (i of [1,2,3,4,5]; track i) {
              <mat-icon class="star" [class.filled]="i <= (res.notesMoyenne ?? 0)">star</mat-icon>
            }
            <span class="rating-num">{{ res.notesMoyenne }}/5</span>
            <span class="rating-avis">({{ res.nbAvis }} avis)</span>
          </div>
        }

        <div class="detail-divider"></div>

        <h2 class="detail-section-title">Description</h2>
        <p class="detail-description">{{ res.description }}</p>

        <!-- Fiche technique -->
        <h2 class="detail-section-title">Fiche technique</h2>
        <div class="specs-grid">
          <div class="spec"><span class="spec-k">Langue</span><span class="spec-v">{{ res.langue | uppercase }}</span></div>
          @if (res.nombrePages) {
            <div class="spec"><span class="spec-k">Pages</span><span class="spec-v">{{ res.nombrePages }}</span></div>
          }
          @if (res.isbn) {
            <div class="spec"><span class="spec-k">ISBN</span><span class="spec-v">{{ res.isbn }}</span></div>
          }
          @if (res.editeur) {
            <div class="spec"><span class="spec-k">Éditeur</span><span class="spec-v">{{ res.editeur }}</span></div>
          }
          @if (res.anneePublication) {
            <div class="spec"><span class="spec-k">Année</span><span class="spec-v">{{ res.anneePublication }}</span></div>
          }
          @if (res.cote) {
            <div class="spec"><span class="spec-k">Cote</span><span class="spec-v">{{ res.cote }}</span></div>
          }
        </div>

        <!-- Niveaux -->
        <h2 class="detail-section-title">Niveaux scolaires</h2>
        <div class="niveaux-list">
          @for (n of res.niveaux; track n) {
            <span class="niveau-chip">{{ n }}</span>
          }
        </div>

        <!-- Tags -->
        @if (res.tags.length) {
          <h2 class="detail-section-title">Tags</h2>
          <div class="tags-list">
            @for (tag of res.tags; track tag) {
              <span class="tag">{{ tag }}</span>
            }
          </div>
        }

        <!-- Statistiques d'usage -->
        @if (res.nbTelechargements) {
          <div class="detail-divider"></div>
          <div class="usage-stats">
            <div class="usage-item">
              <mat-icon>download</mat-icon>
              <span>{{ res.nbTelechargements }} téléchargements</span>
            </div>
            <div class="usage-item">
              <mat-icon>calendar_today</mat-icon>
              <span>Ajouté le {{ res.dateAjout | date:'dd MMM yyyy' }}</span>
            </div>
          </div>
        }
      </div>
    </div>
    }
  }
</div>
  `,
  styles: [`
.resource-detail { padding: 24px; max-width: 1100px; margin: 0 auto; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: #6366f1; text-decoration: none; font-size: 14px; margin-bottom: 24px; }
.back-link:hover { text-decoration: underline; }

.loading-state { text-align: center; padding: 80px; color: #64748b; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; display: inline-block; }

.detail-layout { display: grid; grid-template-columns: 300px 1fr; gap: 32px; }

/* Aside */
.detail-aside { display: flex; flex-direction: column; gap: 16px; }
.aside-cover { border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,.15); }
.cover-large { width: 100%; display: block; }
.cover-placeholder-lg { height: 340px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
.cover-placeholder-lg mat-icon { font-size: 80px !important; height: 80px !important; width: 80px !important; color: #94a3b8; }

.aside-statut { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; font-weight: 600; font-size: 14px; }
.statut-disponible { background: #d1fae5; color: #065f46; }
.statut-emprunte { background: #fee2e2; color: #991b1b; }
.statut-reserve { background: #fef3c7; color: #92400e; }

/* Disponibilité */
.aside-dispo { background: #fff; border-radius: 10px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.dispo-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #374151; margin: 0 0 12px; text-transform: uppercase; letter-spacing: .04em; }
.dispo-title-ic { font-size: 16px !important; height: 16px !important; width: 16px !important; color: #6366f1; }
.dispo-row, .dispo-loc { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
.dispo-loc { border-bottom: none; align-items: flex-start; }
.dispo-ic { font-size: 20px !important; height: 20px !important; width: 20px !important; color: #94a3b8; flex-shrink: 0; }
.dispo-txt { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.dispo-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .03em; }
.dispo-value { font-size: 13px; color: #374151; font-weight: 500; }
.dispo-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.dispo-pill { font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; background: #f1f5f9; color: #94a3b8; text-transform: uppercase; flex-shrink: 0; }
.dispo-pill.on { background: #d1fae5; color: #065f46; }

.aside-actions { display: flex; flex-direction: column; gap: 10px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; transition: all .2s; }
.btn-primary { background: #6366f1; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #4f46e5; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e2e8f0; }
.btn-outline:hover { background: #f8fafc; }
.btn-warn { background: #f59e0b; color: #fff; }
.btn-warn:hover { background: #d97706; }
.btn-ghost { background: transparent; color: #64748b; border: 1px solid transparent; }
.btn-ghost:hover { background: #f1f5f9; color: #374151; }
.btn-full { width: 100%; }

/* Main */
.detail-header { display: flex; gap: 8px; margin-bottom: 12px; }
.type-badge, .categorie-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.type-badge { color: #fff; }
.badge-ic { font-size: 14px !important; height: 14px !important; width: 14px !important; }
.type-livre { background: #6366f1; } .type-pdf { background: #EF4444; } .type-video { background: #10B981; } .type-audio { background: #F59E0B; } .type-lien { background: #3B82F6; }
.categorie-badge { background: #f1f5f9; color: #475569; }

.detail-titre { font-size: 26px; font-weight: 700; color: #1e293b; margin: 0 0 8px; line-height: 1.3; }
.detail-auteur { font-size: 15px; color: #64748b; margin: 0 0 12px; }

.detail-rating { display: flex; align-items: center; gap: 2px; margin-bottom: 4px; }
.star { font-size: 20px !important; height: 20px !important; width: 20px !important; color: #e2e8f0; }
.star.filled { color: #F59E0B; }
.rating-num { font-size: 14px; font-weight: 600; color: #374151; margin-left: 6px; }
.rating-avis { font-size: 13px; color: #94a3b8; }

.detail-divider { height: 1px; background: #f1f5f9; margin: 20px 0; }
.detail-section-title { font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: .05em; margin: 20px 0 10px; }
.detail-description { font-size: 14px; color: #475569; line-height: 1.7; margin: 0; }

.specs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
.spec { display: flex; flex-direction: column; background: #f8fafc; border-radius: 8px; padding: 8px 12px; }
.spec-k { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .03em; }
.spec-v { font-size: 13px; color: #1e293b; font-weight: 600; }

.niveaux-list, .tags-list { display: flex; flex-wrap: wrap; gap: 8px; }
.niveau-chip { background: #ede9fe; color: #5b21b6; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
.tag { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 12px; }

.usage-stats { display: flex; gap: 24px; }
.usage-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; }
.usage-item mat-icon { font-size: 18px !important; height: 18px !important; width: 18px !important; }

@media (max-width: 768px) { .detail-layout { grid-template-columns: 1fr; } }
  `],
})
export class ResourceDetailComponent implements OnInit {
  protected readonly store = inject(LibraryStore);
  private readonly route  = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('publicId');
    if (id) this.store.loadResource(id);
  }

  protected typeIcon(type: string): string {
    const icons: Record<string, string> = {
      LIVRE: 'book', PDF: 'picture_as_pdf', VIDEO: 'play_circle',
      AUDIO: 'headphones', LIEN: 'link', PERIODIQUE: 'newspaper',
    };
    return icons[type] ?? 'description';
  }

  protected statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      DISPONIBLE: 'Disponible', EMPRUNTE: 'Emprunté',
      RESERVE: 'Réservé', INDISPONIBLE: 'Indisponible',
    };
    return labels[statut] ?? statut;
  }
}
