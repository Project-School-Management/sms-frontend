import {
  Component, ChangeDetectionStrategy, inject, OnInit, signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule }    from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LibraryStore } from '@sms/library/data-access';
import { ILibraryResource } from '@sms/shared/models';

@Component({
  selector: 'sms-library-catalog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatTooltipModule],
  template: `
<div class="library-catalog">

  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <div class="catalog-header">
    <div class="header-content">
      <div class="header-text">
        <h1 class="page-title">
          <mat-icon class="title-icon">local_library</mat-icon>
          Bibliothèque Numérique
        </h1>
        <p class="page-subtitle">{{ store.resources().length }} ressources disponibles</p>
      </div>
      <div class="header-actions">
        <a routerLink="my-loans" class="btn btn-outline">
          <mat-icon>bookmark</mat-icon> Mes emprunts
          @if (store.activeLoans().length) {
            <span class="badge">{{ store.activeLoans().length }}</span>
          }
        </a>
        <a routerLink="loan-management" class="btn btn-outline">
          <mat-icon>manage_search</mat-icon> Gestion emprunts
        </a>
        <a routerLink="manage/new" class="btn btn-primary">
          <mat-icon>add</mat-icon> Ajouter
        </a>
      </div>
    </div>
  </div>

  <!-- ── Stats ──────────────────────────────────────────────────────────── -->
  @if (store.stats()) {
    <div class="stats-row">
      <div class="stat-card">
        <mat-icon class="stat-icon text-blue">menu_book</mat-icon>
        <div><p class="stat-value">{{ store.stats()!.totalRessources }}</p><p class="stat-label">Ressources</p></div>
      </div>
      <div class="stat-card">
        <mat-icon class="stat-icon text-green">check_circle</mat-icon>
        <div><p class="stat-value">{{ store.resources().length - store.stats()!.empruntsEnCours }}</p><p class="stat-label">Disponibles</p></div>
      </div>
      <div class="stat-card">
        <mat-icon class="stat-icon text-orange">hourglass_empty</mat-icon>
        <div><p class="stat-value">{{ store.stats()!.empruntsEnCours }}</p><p class="stat-label">En prêt</p></div>
      </div>
      <div class="stat-card">
        <mat-icon class="stat-icon text-red">warning</mat-icon>
        <div><p class="stat-value">{{ store.stats()!.empruntsEnRetard }}</p><p class="stat-label">En retard</p></div>
      </div>
    </div>
  }

  <!-- ── Catégories ─────────────────────────────────────────────────────── -->
  <div class="categories-section">
    <h2 class="section-title">Catégories</h2>
    <div class="categories-grid">
      <button
        class="category-chip"
        [class.active]="store.filterCategorie() === ''"
        (click)="store.clearFilters()">
        Tout
      </button>
      @for (cat of store.categories(); track cat.publicId) {
        <button
          class="category-chip"
          [class.active]="store.filterCategorie() === cat.publicId"
          (click)="store.setFilterCategorie(cat.publicId)">
          <mat-icon style="font-size:16px !important;height:16px !important;width:16px !important;">{{ cat.icon }}</mat-icon>
          {{ cat.libelle }}
          <span class="cat-count">{{ cat.nbRessources }}</span>
        </button>
      }
    </div>
  </div>

  <!-- ── Barre de recherche & filtres ───────────────────────────────────── -->
  <div class="search-bar-row">
    <div class="search-input-wrap">
      <mat-icon class="search-icon">search</mat-icon>
      <input
        type="text"
        class="search-input"
        placeholder="Rechercher par titre, auteur, tag…"
        [ngModel]="store.searchQuery()"
        (ngModelChange)="store.setSearchQuery($event)" />
      @if (store.searchQuery()) {
        <button class="clear-btn" (click)="store.setSearchQuery('')">
          <mat-icon style="font-size:18px !important;height:18px !important;width:18px !important;">close</mat-icon>
        </button>
      }
    </div>

    <select class="filter-select" [ngModel]="store.filterType()" (ngModelChange)="store.setFilterType($event)">
      <option value="">Tous les types</option>
      <option value="LIVRE">Livre</option>
      <option value="PDF">PDF</option>
      <option value="VIDEO">Vidéo</option>
      <option value="AUDIO">Audio</option>
      <option value="LIEN">Lien</option>
    </select>

    <select class="filter-select" [ngModel]="store.filterNiveau()" (ngModelChange)="store.setFilterNiveau($event)">
      <option value="">Tous les niveaux</option>
      <option value="PRIMAIRE">Primaire</option>
      <option value="COLLEGE">Collège</option>
      <option value="LYCEE">Lycée</option>
      <option value="SUPERIEUR">Supérieur</option>
    </select>

    <select class="filter-select" [ngModel]="store.filterStatut()" (ngModelChange)="store.setFilterStatut($event)">
      <option value="">Tous les statuts</option>
      <option value="DISPONIBLE">Disponible</option>
      <option value="EMPRUNTE">Emprunté</option>
      <option value="RESERVE">Réservé</option>
    </select>

    <div class="view-toggle">
      <button class="view-btn" [class.active]="viewMode() === 'grid'" (click)="viewMode.set('grid')" matTooltip="Grille">
        <mat-icon>grid_view</mat-icon>
      </button>
      <button class="view-btn" [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')" matTooltip="Liste">
        <mat-icon>view_list</mat-icon>
      </button>
    </div>
  </div>

  <!-- ── Résultats ──────────────────────────────────────────────────────── -->
  @if (store.loading()) {
    <div class="loading-state">
      <mat-icon class="spin">sync</mat-icon>
      <p>Chargement des ressources…</p>
    </div>
  } @else if (store.filteredResources().length === 0) {
    <div class="empty-state">
      <mat-icon class="empty-icon">search_off</mat-icon>
      <h3>Aucune ressource trouvée</h3>
      <p>Essayez de modifier vos filtres ou votre recherche.</p>
      <button class="btn btn-outline" (click)="store.clearFilters()">Réinitialiser les filtres</button>
    </div>
  } @else {
    <p class="results-count">{{ store.filteredResources().length }} ressource(s) trouvée(s)</p>

    <!-- Vue grille -->
    @if (viewMode() === 'grid') {
      <div class="resources-grid">
        @for (res of store.filteredResources(); track res.publicId) {
          <div class="resource-card" [class.emprunte]="res.statut === 'EMPRUNTE'" [routerLink]="['resource', res.publicId]">
            <div class="card-cover">
              @if (res.urlCouverture) {
                <img [src]="res.urlCouverture" [alt]="res.titre" class="cover-img" />
              } @else {
                <div class="cover-placeholder">
                  <mat-icon>{{ typeIcon(res.type) }}</mat-icon>
                </div>
              }
              <div class="card-type-badge" [class]="'type-' + res.type.toLowerCase()">
                <mat-icon style="font-size:14px !important;height:14px !important;width:14px !important;">{{ typeIcon(res.type) }}</mat-icon>
                {{ res.type }}
              </div>
              <div class="card-statut" [class]="'statut-' + res.statut.toLowerCase()">
                {{ statutLabel(res.statut) }}
              </div>
            </div>
            <div class="card-body">
              <h3 class="card-titre" [title]="res.titre">{{ res.titre }}</h3>
              <p class="card-auteur">{{ res.auteur }}</p>
              <p class="card-categorie">{{ res.categorie }}</p>
              @if (res.notesMoyenne) {
                <div class="card-rating">
                  <mat-icon class="rating-star">star</mat-icon>
                  <span class="rating-val">{{ res.notesMoyenne }}</span>
                  <span class="rating-nb">({{ res.nbAvis }})</span>
                </div>
              }
              <div class="card-exemplaires">
                <mat-icon style="font-size:14px !important;height:14px !important;width:14px !important;">inventory_2</mat-icon>
                {{ res.nbDisponibles }}/{{ res.nbExemplaires }} disponible(s)
              </div>
            </div>
          </div>
        }
      </div>
    }

    <!-- Vue liste -->
    @if (viewMode() === 'list') {
      <div class="resources-list">
        @for (res of store.filteredResources(); track res.publicId) {
          <div class="list-row" [routerLink]="['resource', res.publicId]">
            <div class="list-cover">
              @if (res.urlCouverture) {
                <img [src]="res.urlCouverture" [alt]="res.titre" class="list-img" />
              } @else {
                <div class="list-placeholder">
                  <mat-icon>{{ typeIcon(res.type) }}</mat-icon>
                </div>
              }
            </div>
            <div class="list-info">
              <h3 class="list-titre">{{ res.titre }}</h3>
              <p class="list-auteur">{{ res.auteur }} · {{ res.categorie }}</p>
              <p class="list-desc">{{ res.description | slice:0:120 }}…</p>
              <div class="list-tags">
                @for (tag of res.tags; track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>
            </div>
            <div class="list-meta">
              <span class="type-pill" [class]="'type-' + res.type.toLowerCase()">
                <mat-icon style="font-size:14px !important;height:14px !important;width:14px !important;">{{ typeIcon(res.type) }}</mat-icon>
                {{ res.type }}
              </span>
              <span class="statut-pill" [class]="'statut-' + res.statut.toLowerCase()">
                {{ statutLabel(res.statut) }}
              </span>
              @if (res.notesMoyenne) {
                <span class="rating-inline">
                  <mat-icon style="font-size:14px !important;height:14px !important;width:14px !important;color:#F59E0B;">star</mat-icon>
                  {{ res.notesMoyenne }}
                </span>
              }
              <span class="dispo-inline">{{ res.nbDisponibles }}/{{ res.nbExemplaires }} dispo</span>
            </div>
          </div>
        }
      </div>
    }
  }
</div>
  `,
  styles: [`
.library-catalog { padding: 24px; max-width: 1400px; margin: 0 auto; }

/* Header */
.catalog-header { margin-bottom: 24px; }
.header-content { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.header-text { display: flex; align-items: center; gap: 12px; }
.page-title { font-size: 24px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; margin: 0; }
.title-icon { font-size: 28px; color: #6366f1; }
.page-subtitle { color: #64748b; margin: 4px 0 0 36px; font-size: 14px; }
.header-actions { display: flex; gap: 12px; }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; transition: all .2s; }
.btn-primary { background: #6366f1; color: #fff; }
.btn-primary:hover { background: #4f46e5; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e2e8f0; }
.btn-outline:hover { background: #f8fafc; }
.badge { background: #ef4444; color: #fff; border-radius: 9999px; font-size: 11px; padding: 1px 6px; min-width: 18px; text-align: center; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.08); display: flex; align-items: center; gap: 12px; }
.stat-icon { font-size: 28px; }
.stat-value { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; }
.stat-label { font-size: 12px; color: #64748b; margin: 2px 0 0; }
.text-blue { color: #3B82F6; } .text-green { color: #10B981; } .text-orange { color: #F59E0B; } .text-red { color: #EF4444; }

/* Categories */
.categories-section { margin-bottom: 20px; }
.section-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 10px; text-transform: uppercase; letter-spacing: .05em; }
.categories-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.category-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #e2e8f0; background: #fff; font-size: 13px; cursor: pointer; transition: all .2s; color: #374151; }
.category-chip:hover, .category-chip.active { background: #6366f1; color: #fff; border-color: #6366f1; }
.cat-count { background: rgba(0,0,0,.1); border-radius: 9999px; font-size: 11px; padding: 1px 6px; }
.category-chip.active .cat-count { background: rgba(255,255,255,.25); }

/* Search bar */
.search-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.search-input-wrap { flex: 1; min-width: 240px; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; color: #94a3b8; font-size: 20px; }
.search-input { width: 100%; padding: 10px 36px 10px 40px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; background: #fff; }
.search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.clear-btn { position: absolute; right: 8px; background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; align-items: center; }
.filter-select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; background: #fff; color: #374151; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #6366f1; }
.view-toggle { display: flex; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.view-btn { padding: 8px 12px; border: none; background: #fff; cursor: pointer; color: #94a3b8; display: flex; align-items: center; transition: all .2s; }
.view-btn.active, .view-btn:hover { background: #6366f1; color: #fff; }

/* States */
.loading-state, .empty-state { text-align: center; padding: 60px 24px; color: #64748b; }
.empty-icon { font-size: 64px; color: #cbd5e1; margin-bottom: 16px; }
.results-count { font-size: 13px; color: #64748b; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; display: inline-block; font-size: 32px; }

/* Grid */
.resources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.resource-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); cursor: pointer; transition: transform .2s, box-shadow .2s; }
.resource-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.12); }
.card-cover { position: relative; height: 180px; background: #f1f5f9; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; }
.cover-placeholder .mat-icon { font-size: 48px; color: #94a3b8; }
.card-type-badge { position: absolute; top: 8px; left: 8px; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #fff; }
.card-statut { position: absolute; top: 8px; right: 8px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.card-body { padding: 14px; }
.card-titre { font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 4px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-auteur { font-size: 12px; color: #6366f1; margin: 0 0 4px; font-weight: 500; }
.card-categorie { font-size: 11px; color: #94a3b8; margin: 0 0 8px; }
.card-rating { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #374151; margin-bottom: 6px; }
.rating-star { font-size: 14px; color: #F59E0B; }
.rating-nb { color: #94a3b8; }
.card-exemplaires { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #64748b; }

/* Type colors */
.type-livre { background: #6366f1; } .type-pdf { background: #EF4444; } .type-video { background: #10B981; } .type-audio { background: #F59E0B; } .type-lien { background: #3B82F6; }

/* Statut colors */
.statut-disponible { background: #d1fae5; color: #065f46; }
.statut-emprunte { background: #fee2e2; color: #991b1b; }
.statut-reserve { background: #fef3c7; color: #92400e; }
.statut-indisponible { background: #f1f5f9; color: #475569; }

/* List view */
.resources-list { display: flex; flex-direction: column; gap: 12px; }
.list-row { display: flex; align-items: flex-start; gap: 16px; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.08); cursor: pointer; transition: box-shadow .2s; }
.list-row:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
.list-img, .list-placeholder { width: 60px; height: 80px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.list-placeholder { background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
.list-info { flex: 1; min-width: 0; }
.list-titre { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.list-auteur { font-size: 13px; color: #6366f1; margin: 0 0 6px; }
.list-desc { font-size: 12px; color: #64748b; margin: 0 0 8px; line-height: 1.5; }
.list-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.tag { background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
.list-meta { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; flex-shrink: 0; }
.type-pill, .statut-pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; color: #fff; }
.rating-inline, .dispo-inline { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px; }

/* Tailles d'icônes — override du .mat-icon { !important } global */
.title-icon  { font-size: 28px !important; height: 28px !important; width: 28px !important; color: #6366f1; }
.stat-icon   { font-size: 28px !important; height: 28px !important; width: 28px !important; }
.empty-icon  { font-size: 64px !important; height: 64px !important; width: 64px !important; }
.spin        { font-size: 32px !important; height: 32px !important; width: 32px !important; }
.rating-star { font-size: 14px !important; height: 14px !important; width: 14px !important; }
.cover-placeholder .mat-icon { font-size: 48px !important; height: 48px !important; width: 48px !important; }
  `],
})
export class LibraryCatalogComponent implements OnInit {
  protected readonly store = inject(LibraryStore);
  protected readonly viewMode = signal<'grid' | 'list'>('grid');

  ngOnInit(): void {
    this.store.loadResources();
    this.store.loadCategories();
    this.store.loadStats();
    this.store.loadLoans(undefined);
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
