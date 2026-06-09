import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import {
  MOCK_CATEGORIES, MOCK_DEVOIRS, MOCK_RESSOURCES_BIBLIO, MOCK_DISCUSSIONS,
  MOCK_ANNONCES, MOCK_PARTICIPANTS, MOCK_SESSIONS_VIRTUELLES, MOCK_EVENEMENTS,
  MOCK_CERTIFICATS, MOCK_FAVORIS, MOCK_HISTORIQUE_COURS,
} from '@sms/learning/data-access';

// ── Types locaux ─────────────────────────────────────────────────────────────
type LmsTab = 'cours' | 'devoirs' | 'ressources' | 'discussions' | 'annonces'
            | 'participants' | 'sessions' | 'calendrier' | 'certificats';

const STATUT_COURS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  PUBLIE:    { label:'Publié',    bg:'rgba(22,163,74,0.10)',   color:'#16a34a' },
  BROUILLON: { label:'Brouillon', bg:'rgba(107,114,128,0.10)', color:'#6b7280' },
  ARCHIVE:   { label:'Archivé',   bg:'rgba(245,158,11,0.10)',  color:'#d97706' },
};

const STATUT_DEVOIR_CFG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  OUVERT:  { label:'Ouvert',    bg:'rgba(99,102,241,0.10)',   color:'#6366f1', icon:'lock_open'     },
  FERME:   { label:'Fermé',     bg:'rgba(239,68,68,0.10)',    color:'#dc2626', icon:'lock'          },
  CORRIGE: { label:'Corrigé',   bg:'rgba(22,163,74,0.10)',    color:'#16a34a', icon:'check_circle'  },
};

const TYPE_RESSOURCE_CFG: Record<string, { icon: string; color: string; bg: string }> = {
  PDF:          { icon:'picture_as_pdf', color:'#ef4444', bg:'rgba(239,68,68,0.10)'   },
  VIDEO:        { icon:'play_circle',    color:'#6366f1', bg:'rgba(99,102,241,0.10)'  },
  IMAGE:        { icon:'image',          color:'#10b981', bg:'rgba(16,185,129,0.10)'  },
  AUDIO:        { icon:'headphones',     color:'#8b5cf6', bg:'rgba(139,92,246,0.10)'  },
  PRESENTATION: { icon:'slideshow',      color:'#f59e0b', bg:'rgba(245,158,11,0.10)'  },
  DOCUMENT:     { icon:'description',    color:'#0891b2', bg:'rgba(8,145,178,0.10)'   },
  ZIP:          { icon:'folder_zip',     color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
  LIEN:         { icon:'link',           color:'#ec4899', bg:'rgba(236,72,153,0.10)'  },
};

const STATUT_SESSION_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PLANIFIEE: { label:'Planifiée',  color:'#6366f1', bg:'rgba(99,102,241,0.10)',  icon:'event'         },
  EN_COURS:  { label:'En direct',  color:'#16a34a', bg:'rgba(22,163,74,0.10)',   icon:'radio_button_checked' },
  TERMINEE:  { label:'Terminée',   color:'#6b7280', bg:'rgba(107,114,128,0.10)', icon:'check_circle'  },
  ANNULEE:   { label:'Annulée',    color:'#dc2626', bg:'rgba(239,68,68,0.10)',   icon:'cancel'        },
};

const TYPE_EVENEMENT_CFG: Record<string, { icon: string; color: string }> = {
  COURS:   { icon:'menu_book',    color:'#6366f1' },
  DEVOIR:  { icon:'assignment',   color:'#f59e0b' },
  EXAMEN:  { icon:'quiz',         color:'#ef4444' },
  SESSION: { icon:'video_call',   color:'#10b981' },
};

// ── Composant ─────────────────────────────────────────────────────────────────
@Component({
  selector:        'sms-cours-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6 max-w-full">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-5 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">E-Learning</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Plateforme LMS · Cours, devoirs, ressources et suivi pédagogique
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Recherche avancée -->
      <div class="flex items-center gap-2 px-3 py-2 rounded-xl border"
           style="background:var(--surface-2);border-color:var(--border-color)">
        <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
        <input [(ngModel)]="searchQuery" placeholder="Rechercher un cours, une ressource…"
               class="text-sm bg-transparent outline-none w-52"
               style="color:var(--text-primary)"/>
        @if (searchQuery) {
          <button (click)="searchQuery=''" style="color:var(--text-muted)">
            <mat-icon style="font-size:14px;height:14px;width:14px">close</mat-icon>
          </button>
        }
      </div>
      <a routerLink="/learning/examens"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">quiz</mat-icon>
        Examens
      </a>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
        Nouveau cours
      </button>
    </div>
  </div>

  <!-- ── KPI Cards ─────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:var(--accent-light)">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">menu_book</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.nbCours() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Cours</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(22,163,74,0.10)">
        <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">publish</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.coursPublies().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Publiés</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(6,182,212,0.10)">
        <mat-icon style="color:#0891b2;font-size:20px;height:20px;width:20px">people</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ participants.length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Inscrits</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(139,92,246,0.10)">
        <mat-icon style="color:#8b5cf6;font-size:20px;height:20px;width:20px">layers</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ totalChapitres() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Chapitres</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(245,158,11,0.10)">
        <mat-icon style="color:#f59e0b;font-size:20px;height:20px;width:20px">assignment</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ devoirs.length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Devoirs</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(16,185,129,0.10)">
        <mat-icon style="color:#10b981;font-size:20px;height:20px;width:20px">trending_up</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ moyenneProgression() }}%</p>
        <p class="text-xs" style="color:var(--text-secondary)">Progression moy.</p>
      </div>
    </div>
  </div>

  <!-- ── Barre onglets LMS ─────────────────────────────────────────────────── -->
  <div class="flex gap-0.5 mb-5 p-1 rounded-2xl overflow-x-auto"
       style="background:var(--surface-2);border:1px solid var(--border-color)">
    @for (tab of lmsTabs; track tab.id) {
      <button (click)="activeTab.set(tab.id)"
              class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
              [style.background]="activeTab()===tab.id ? 'var(--surface-1)' : 'transparent'"
              [style.color]="activeTab()===tab.id ? 'var(--text-primary)' : 'var(--text-secondary)'"
              [style.box-shadow]="activeTab()===tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'">
        <mat-icon style="font-size:15px;height:15px;width:15px">{{ tab.icon }}</mat-icon>
        {{ tab.label }}
        @if (tab.badge && tab.badge() > 0) {
          <span class="px-1.5 py-0.5 rounded-full text-xs font-bold"
                [style.background]="activeTab()===tab.id ? 'var(--accent)' : 'rgba(99,102,241,0.15)'"
                [style.color]="activeTab()===tab.id ? '#fff' : 'var(--accent)'">
            {{ tab.badge() }}
          </span>
        }
      </button>
    }
  </div>


  <!-- ████████ ONGLET COURS ████████ -->
  @if (activeTab() === 'cours') {

    <!-- Filtres & Catégories -->
    <div class="flex flex-wrap gap-3 mb-5 items-center">
      <!-- Filtre statut -->
      <div class="flex gap-1 p-1 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
        @for (f of statutFilters; track f.value) {
          <button (click)="statutFilter.set(f.value)"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  [style.background]="statutFilter()===f.value ? 'var(--accent)' : 'transparent'"
                  [style.color]="statutFilter()===f.value ? '#fff' : 'var(--text-secondary)'">
            {{ f.label }}
          </button>
        }
      </div>
      <!-- Filtre catégorie -->
      <select [(ngModel)]="categorieFilter"
              class="px-3 py-2 rounded-xl border text-xs font-medium"
              style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
        <option value="">Toutes les catégories</option>
        @for (cat of categories; track cat.publicId) {
          <option [value]="cat.publicId">{{ cat.libelle }}</option>
        }
      </select>
      <div class="flex-1"></div>
      <!-- Bascule vue -->
      <div class="flex gap-1 p-1 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
        <button (click)="coursView.set('grille')"
                class="p-1.5 rounded-lg transition-all"
                [style.background]="coursView()==='grille' ? 'var(--accent)' : 'transparent'"
                [style.color]="coursView()==='grille' ? '#fff' : 'var(--text-secondary)'">
          <mat-icon style="font-size:16px;height:16px;width:16px">grid_view</mat-icon>
        </button>
        <button (click)="coursView.set('liste')"
                class="p-1.5 rounded-lg transition-all"
                [style.background]="coursView()==='liste' ? 'var(--accent)' : 'transparent'"
                [style.color]="coursView()==='liste' ? '#fff' : 'var(--text-secondary)'">
          <mat-icon style="font-size:16px;height:16px;width:16px">view_list</mat-icon>
        </button>
      </div>
    </div>

    <!-- Catégories chips -->
    <div class="flex flex-wrap gap-2 mb-5">
      @for (cat of categories; track cat.publicId) {
        <button (click)="categorieFilter = categorieFilter===cat.publicId ? '' : cat.publicId"
                class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border"
                [style.background]="categorieFilter===cat.publicId ? cat.couleur + '20' : 'var(--surface-2)'"
                [style.border-color]="categorieFilter===cat.publicId ? cat.couleur + '50' : 'var(--border-color)'"
                [style.color]="categorieFilter===cat.publicId ? cat.couleur : 'var(--text-secondary)'">
          <mat-icon style="font-size:14px;height:14px;width:14px">{{ cat.icon }}</mat-icon>
          {{ cat.libelle }}
          <span class="px-1.5 py-0.5 rounded-full text-xs"
                [style.background]="cat.couleur + '20'"
                [style.color]="cat.couleur">{{ cat.nbCours }}</span>
        </button>
      }
    </div>

    @if (store.loading()) {
      <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
        <mat-icon class="animate-spin">refresh</mat-icon> Chargement des cours…
      </div>
    } @else if (coursFiltres().length === 0) {
      <div class="sms-card flex flex-col items-center justify-center py-16 gap-3">
        <mat-icon style="font-size:48px;height:48px;width:48px;color:var(--text-muted)">search_off</mat-icon>
        <p class="font-semibold" style="color:var(--text-secondary)">Aucun cours trouvé</p>
      </div>
    } @else {

      <!-- Vue grille -->
      @if (coursView() === 'grille') {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (cours of coursFiltres(); track cours.publicId) {
            <div class="sms-card overflow-hidden group hover:shadow-md transition-shadow">
              <!-- Bandeau couleur -->
              <div class="h-2" [style.background]="coursColor(cours.matiereLibelle)"></div>
              <div class="p-5">
                <!-- En-tête -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                            [style.background]="statutCoursColor(cours.statut).bg"
                            [style.color]="statutCoursColor(cours.statut).color">
                        {{ statutCoursColor(cours.statut).label }}
                      </span>
                      @if (isFavori(cours.publicId)) {
                        <mat-icon style="font-size:14px;height:14px;width:14px;color:#f59e0b">star</mat-icon>
                      }
                    </div>
                    <h3 class="font-bold text-sm leading-snug" style="color:var(--text-primary)">{{ cours.titre }}</h3>
                  </div>
                  <button (click)="toggleFavori(cours.publicId)"
                          class="ml-2 p-1 rounded-lg hover:opacity-70 transition-opacity shrink-0"
                          [style.color]="isFavori(cours.publicId) ? '#f59e0b' : 'var(--text-muted)'">
                    <mat-icon style="font-size:18px;height:18px;width:18px">
                      {{ isFavori(cours.publicId) ? 'star' : 'star_border' }}
                    </mat-icon>
                  </button>
                </div>
                <!-- Métadonnées -->
                <p class="text-xs mb-3 line-clamp-2" style="color:var(--text-secondary)">{{ cours.description }}</p>
                <div class="flex items-center gap-3 text-xs flex-wrap mb-4">
                  <span class="flex items-center gap-1" style="color:var(--text-muted)">
                    <mat-icon style="font-size:13px;height:13px;width:13px">person</mat-icon>
                    {{ shortName(cours.enseignantNom) }}
                  </span>
                  @if (cours.niveauLibelle) {
                    <span class="flex items-center gap-1" style="color:var(--text-muted)">
                      <mat-icon style="font-size:13px;height:13px;width:13px">school</mat-icon>
                      {{ cours.niveauLibelle }}
                    </span>
                  }
                  @if (cours.dureeHeures) {
                    <span class="flex items-center gap-1" style="color:var(--text-muted)">
                      <mat-icon style="font-size:13px;height:13px;width:13px">schedule</mat-icon>
                      {{ cours.dureeHeures }}h
                    </span>
                  }
                  <span class="flex items-center gap-1" style="color:var(--text-muted)">
                    <mat-icon style="font-size:13px;height:13px;width:13px">layers</mat-icon>
                    {{ cours.chapitres.length }} chapitres
                  </span>
                </div>
                <!-- Progression -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs" style="color:var(--text-muted)">Progression</span>
                    <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ cours.progression }}%</span>
                  </div>
                  <div class="rounded-full h-2" style="background:var(--surface-2)">
                    <div class="h-2 rounded-full transition-all"
                         [style.width]="cours.progression + '%'"
                         [style.background]="cours.progression===100 ? '#16a34a' : 'var(--accent)'"></div>
                  </div>
                </div>
                <!-- Matière badge -->
                <div class="flex items-center justify-between">
                  <span class="text-xs px-2 py-1 rounded-xl font-semibold"
                        [style.background]="coursColor(cours.matiereLibelle) + '15'"
                        [style.color]="coursColor(cours.matiereLibelle)">
                    {{ cours.matiereLibelle }}
                  </span>
                  <a [routerLink]="['/learning', cours.publicId]"
                     class="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl hover:opacity-80 transition-opacity text-white"
                     style="background:var(--accent)">
                    Ouvrir <mat-icon style="font-size:13px;height:13px;width:13px">arrow_forward</mat-icon>
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Vue liste -->
      @if (coursView() === 'liste') {
        <div class="sms-card overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr style="background:var(--surface-2)">
                <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Titre</th>
                <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Enseignant</th>
                <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Niveau</th>
                <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Chapitres</th>
                <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Progression</th>
                <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Statut</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (cours of coursFiltres(); track cours.publicId) {
                <tr class="border-t hover:opacity-80 transition-opacity" style="border-color:var(--border-color)">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-1.5 h-8 rounded-full shrink-0" [style.background]="coursColor(cours.matiereLibelle)"></div>
                      <div>
                        <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ cours.titre }}</p>
                        <p class="text-xs" style="color:var(--text-muted)">{{ cours.matiereLibelle }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ shortName(cours.enseignantNom) }}</td>
                  <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ cours.niveauLibelle ?? '—' }}</td>
                  <td class="px-4 py-3 text-sm font-semibold" style="color:var(--text-primary)">{{ cours.chapitres.length }}</td>
                  <td class="px-4 py-3 w-32">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 rounded-full h-1.5" style="background:var(--surface-2)">
                        <div class="h-1.5 rounded-full" [style.width]="cours.progression + '%'"
                             [style.background]="cours.progression===100 ? '#16a34a' : 'var(--accent)'"></div>
                      </div>
                      <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ cours.progression }}%</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                          [style.background]="statutCoursColor(cours.statut).bg"
                          [style.color]="statutCoursColor(cours.statut).color">
                      {{ statutCoursColor(cours.statut).label }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <a [routerLink]="['/learning', cours.publicId]"
                       class="text-xs font-semibold px-2.5 py-1 rounded-lg hover:opacity-80"
                       style="background:var(--accent-light);color:var(--accent)">
                      Ouvrir
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    }

    <!-- Récemment consultés + Favoris -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <div class="sms-card p-5">
        <h3 class="font-bold text-sm mb-4 flex items-center gap-2" style="color:var(--text-primary)">
          <mat-icon style="font-size:18px;height:18px;width:18px;color:var(--accent)">history</mat-icon>
          Récemment consultés
        </h3>
        <div class="flex flex-col gap-3">
          @for (h of historiqueCoursData; track h.coursPublicId) {
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full shrink-0" style="background:var(--accent)"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate" style="color:var(--text-primary)">{{ h.coursLibelle }}</p>
                <p class="text-xs" style="color:var(--text-muted)">{{ h.dernierAcces }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <div class="w-16 rounded-full h-1.5" style="background:var(--surface-2)">
                  <div class="h-1.5 rounded-full" style="background:var(--accent)"
                       [style.width]="h.progression + '%'"></div>
                </div>
                <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ h.progression }}%</span>
              </div>
            </div>
          }
        </div>
      </div>
      <div class="sms-card p-5">
        <h3 class="font-bold text-sm mb-4 flex items-center gap-2" style="color:var(--text-primary)">
          <mat-icon style="font-size:18px;height:18px;width:18px;color:#f59e0b">star</mat-icon>
          Cours favoris
        </h3>
        @if (coursFavoris().length === 0) {
          <p class="text-sm italic" style="color:var(--text-muted)">Aucun favori pour l'instant</p>
        } @else {
          <div class="flex flex-col gap-3">
            @for (c of coursFavoris(); track c.publicId) {
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                     [style.background]="coursColor(c.matiereLibelle) + '20'">
                  <mat-icon [style.color]="coursColor(c.matiereLibelle)"
                            style="font-size:16px;height:16px;width:16px">menu_book</mat-icon>
                </div>
                <p class="text-sm font-medium flex-1 truncate" style="color:var(--text-primary)">{{ c.titre }}</p>
                <a [routerLink]="['/learning', c.publicId]"
                   class="text-xs font-semibold px-2 py-1 rounded-lg"
                   style="background:var(--accent-light);color:var(--accent)">Ouvrir</a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  }


  <!-- ████████ ONGLET DEVOIRS ████████ -->
  @if (activeTab() === 'devoirs') {
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Devoirs & Travaux</h2>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
        Nouveau devoir
      </button>
    </div>
    <!-- Stats devoirs -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      <div class="sms-card p-4 text-center">
        <p class="text-3xl font-bold" style="color:#6366f1">{{ devoirsOuverts() }}</p>
        <p class="text-xs mt-1" style="color:var(--text-secondary)">Ouverts</p>
      </div>
      <div class="sms-card p-4 text-center">
        <p class="text-3xl font-bold" style="color:#dc2626">{{ devoirsFermes() }}</p>
        <p class="text-xs mt-1" style="color:var(--text-secondary)">Fermés</p>
      </div>
      <div class="sms-card p-4 text-center">
        <p class="text-3xl font-bold" style="color:#16a34a">{{ devoirsCorrigesCount() }}</p>
        <p class="text-xs mt-1" style="color:var(--text-secondary)">Corrigés</p>
      </div>
    </div>
    <!-- Liste devoirs -->
    <div class="flex flex-col gap-3">
      @for (dev of devoirs; track dev.publicId) {
        <div class="sms-card p-5 border-l-4"
             [style.border-left-color]="devoirStatutCfg(dev.statut).color">
          <div class="flex items-start gap-4 flex-wrap">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [style.background]="devoirStatutCfg(dev.statut).bg">
              <mat-icon [style.color]="devoirStatutCfg(dev.statut).color"
                        style="font-size:20px;height:20px;width:20px">{{ devoirStatutCfg(dev.statut).icon }}</mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="font-bold text-sm" style="color:var(--text-primary)">{{ dev.titre }}</h3>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                      [style.background]="devoirStatutCfg(dev.statut).bg"
                      [style.color]="devoirStatutCfg(dev.statut).color">
                  {{ devoirStatutCfg(dev.statut).label }}
                </span>
              </div>
              <p class="text-xs mb-2 line-clamp-2" style="color:var(--text-secondary)">{{ dev.description }}</p>
              <div class="flex flex-wrap gap-3 text-xs" style="color:var(--text-muted)">
                <span class="flex items-center gap-1">
                  <mat-icon style="font-size:12px;height:12px;width:12px">menu_book</mat-icon>
                  {{ dev.coursLibelle }}
                </span>
                <span class="flex items-center gap-1">
                  <mat-icon style="font-size:12px;height:12px;width:12px">event</mat-icon>
                  Limite : {{ dev.dateLimite }}
                </span>
                <span class="flex items-center gap-1">
                  <mat-icon style="font-size:12px;height:12px;width:12px">grade</mat-icon>
                  Barème : {{ dev.bareme }} pts
                </span>
                @if (dev.pieceJointe) {
                  <span class="flex items-center gap-1" style="color:#6366f1">
                    <mat-icon style="font-size:12px;height:12px;width:12px">attach_file</mat-icon>
                    {{ dev.pieceJointe }}
                  </span>
                }
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs" style="color:var(--text-muted)">Soumissions</p>
              <p class="text-xl font-bold mt-0.5"
                 [style.color]="dev.nbSoumissions === dev.nbEtudiants ? '#16a34a' : 'var(--text-primary)'">
                {{ dev.nbSoumissions }}/{{ dev.nbEtudiants }}
              </p>
              <div class="w-24 rounded-full h-1.5 mt-1" style="background:var(--surface-2)">
                <div class="h-1.5 rounded-full"
                     [style.background]="dev.nbSoumissions===dev.nbEtudiants ? '#16a34a' : 'var(--accent)'"
                     [style.width]="((dev.nbSoumissions / dev.nbEtudiants) * 100) + '%'"></div>
              </div>
              <div class="flex gap-1 mt-3">
                <button class="text-xs px-2.5 py-1 rounded-lg font-semibold hover:opacity-80"
                        style="background:var(--accent-light);color:var(--accent)">Voir</button>
                @if (dev.statut === 'OUVERT') {
                  <button class="text-xs px-2.5 py-1 rounded-lg font-semibold hover:opacity-80"
                          style="background:rgba(22,163,74,0.10);color:#16a34a">Corriger</button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  }


  <!-- ████████ ONGLET RESSOURCES ████████ -->
  @if (activeTab() === 'ressources') {
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Bibliothèque des ressources</h2>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">upload</mat-icon>
        Ajouter une ressource
      </button>
    </div>
    <!-- Filtres type -->
    <div class="flex gap-2 flex-wrap mb-5">
      <button (click)="typeRessourceFilter.set('')"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
              [style.background]="typeRessourceFilter()==='' ? 'var(--accent)' : 'var(--surface-2)'"
              [style.color]="typeRessourceFilter()==='' ? '#fff' : 'var(--text-secondary)'"
              [style.border-color]="typeRessourceFilter()==='' ? 'var(--accent)' : 'var(--border-color)'">
        Tous ({{ ressources.length }})
      </button>
      @for (t of typeRessourceOptions; track t.value) {
        <button (click)="typeRessourceFilter.set(t.value)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
                [style.background]="typeRessourceFilter()===t.value ? typeRessCfg(t.value).bg : 'var(--surface-2)'"
                [style.color]="typeRessourceFilter()===t.value ? typeRessCfg(t.value).color : 'var(--text-secondary)'"
                [style.border-color]="typeRessourceFilter()===t.value ? typeRessCfg(t.value).color + '50' : 'var(--border-color)'">
          <mat-icon style="font-size:13px;height:13px;width:13px">{{ typeRessCfg(t.value).icon }}</mat-icon>
          {{ t.label }}
        </button>
      }
    </div>
    <!-- Grille ressources -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      @for (res of ressourcesFiltrees(); track res.publicId) {
        <div class="sms-card p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               [style.background]="typeRessCfg(res.type).bg">
            <mat-icon [style.color]="typeRessCfg(res.type).color"
                      style="font-size:20px;height:20px;width:20px">{{ typeRessCfg(res.type).icon }}</mat-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm truncate" style="color:var(--text-primary)">{{ res.titre }}</p>
            @if (res.coursLibelle) {
              <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ res.coursLibelle }}</p>
            }
            <div class="flex items-center gap-3 mt-2 text-xs" style="color:var(--text-muted)">
              @if (res.taille) {
                <span>{{ res.taille }}</span>
              }
              <span class="flex items-center gap-0.5">
                <mat-icon style="font-size:11px;height:11px;width:11px">download</mat-icon>
                {{ res.nbTelechargements }}
              </span>
              <span>{{ res.uploadDate }}</span>
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
              @for (tag of res.tags.slice(0,3); track tag) {
                <span class="px-1.5 py-0.5 rounded text-xs"
                      style="background:var(--surface-2);color:var(--text-muted)">#{{ tag }}</span>
              }
            </div>
          </div>
          <div class="flex flex-col gap-1 shrink-0">
            <button class="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                    style="background:var(--accent-light);color:var(--accent)">
              <mat-icon style="font-size:16px;height:16px;width:16px">visibility</mat-icon>
            </button>
            <button class="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                    style="background:rgba(16,185,129,0.10);color:#10b981">
              <mat-icon style="font-size:16px;height:16px;width:16px">download</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  }


  <!-- ████████ ONGLET DISCUSSIONS ████████ -->
  @if (activeTab() === 'discussions') {
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Forum & Discussions</h2>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">add_comment</mat-icon>
        Nouvelle discussion
      </button>
    </div>
    <div class="flex flex-col gap-3">
      @for (d of discussions; track d.publicId) {
        <div class="sms-card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                 [style.background]="d.couleurAvatar">{{ d.initiales }}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <h3 class="font-semibold text-sm" style="color:var(--text-primary)">{{ d.titre }}</h3>
                @if (d.resolu) {
                  <span class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                        style="background:rgba(22,163,74,0.10);color:#16a34a">
                    <mat-icon style="font-size:11px;height:11px;width:11px">check_circle</mat-icon>
                    Résolu
                  </span>
                }
              </div>
              <p class="text-xs mb-2 line-clamp-2" style="color:var(--text-secondary)">{{ d.preview }}</p>
              <div class="flex items-center gap-3 text-xs" style="color:var(--text-muted)">
                <span>{{ d.auteur }}</span>
                @if (d.coursLibelle) {
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:11px;height:11px;width:11px">menu_book</mat-icon>
                    {{ d.coursLibelle }}
                  </span>
                }
                <span>{{ d.date }}</span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="flex items-center gap-1 justify-end" style="color:var(--text-muted)">
                <mat-icon style="font-size:14px;height:14px;width:14px">chat_bubble_outline</mat-icon>
                <span class="text-sm font-bold" style="color:var(--text-primary)">{{ d.nbReponses }}</span>
              </div>
              <p class="text-xs mt-0.5" style="color:var(--text-muted)">réponses</p>
            </div>
          </div>
        </div>
      }
    </div>
  }


  <!-- ████████ ONGLET ANNONCES ████████ -->
  @if (activeTab() === 'annonces') {
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Annonces</h2>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">campaign</mat-icon>
        Nouvelle annonce
      </button>
    </div>
    <div class="flex flex-col gap-3">
      @for (a of annonces; track a.publicId) {
        <div class="sms-card p-5 border-l-4"
             [style.border-left-color]="a.priorite==='HAUTE' ? '#ef4444' : a.priorite==='NORMALE' ? 'var(--accent)' : '#6b7280'"
             [style.background]="!a.lu ? 'rgba(99,102,241,0.02)' : 'var(--surface-1)'">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [style.background]="a.priorite==='HAUTE' ? 'rgba(239,68,68,0.10)' : 'var(--accent-light)'">
              <mat-icon [style.color]="a.priorite==='HAUTE' ? '#ef4444' : 'var(--accent)'"
                        style="font-size:20px;height:20px;width:20px">
                {{ a.priorite==='HAUTE' ? 'priority_high' : 'campaign' }}
              </mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="font-bold text-sm" style="color:var(--text-primary)">{{ a.titre }}</h3>
                @if (!a.lu) {
                  <span class="w-2 h-2 rounded-full" style="background:var(--accent)"></span>
                }
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                      [style.background]="a.priorite==='HAUTE' ? 'rgba(239,68,68,0.10)' : 'rgba(99,102,241,0.10)'"
                      [style.color]="a.priorite==='HAUTE' ? '#dc2626' : 'var(--accent)'">
                  {{ a.priorite === 'HAUTE' ? 'Urgent' : a.priorite === 'NORMALE' ? 'Normal' : 'Info' }}
                </span>
              </div>
              <p class="text-sm mb-2" style="color:var(--text-secondary)">{{ a.contenu }}</p>
              <div class="flex items-center gap-3 text-xs" style="color:var(--text-muted)">
                <span>{{ a.auteur }}</span>
                @if (a.coursLibelle) {
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:11px;height:11px;width:11px">menu_book</mat-icon>
                    {{ a.coursLibelle }}
                  </span>
                }
                <span>{{ a.date }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  }


  <!-- ████████ ONGLET PARTICIPANTS ████████ -->
  @if (activeTab() === 'participants') {
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Participants</h2>
      <div class="flex items-center gap-2">
        <span class="text-sm" style="color:var(--text-muted)">{{ participants.length }} inscrits</span>
        <button class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
          <mat-icon style="font-size:14px;height:14px;width:14px">download</mat-icon>
          Exporter
        </button>
      </div>
    </div>
    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      <div class="sms-card p-4 text-center">
        <p class="text-3xl font-bold" style="color:#16a34a">{{ participantsActifs() }}</p>
        <p class="text-xs mt-1" style="color:var(--text-secondary)">Actifs</p>
      </div>
      <div class="sms-card p-4 text-center">
        <p class="text-3xl font-bold" style="color:var(--accent)">{{ participantsComplets() }}</p>
        <p class="text-xs mt-1" style="color:var(--text-secondary)">Complétés</p>
      </div>
      <div class="sms-card p-4 text-center">
        <p class="text-3xl font-bold" style="color:#dc2626">{{ participantsInactifs() }}</p>
        <p class="text-xs mt-1" style="color:var(--text-secondary)">Inactifs</p>
      </div>
    </div>
    <!-- Table participants -->
    <div class="sms-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr style="background:var(--surface-2)">
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Étudiant</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Classe</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Progression</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Leçons</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Dernière activité</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Statut</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          @for (p of participants; track p.publicId) {
            <tr class="border-t hover:opacity-80 transition-opacity" style="border-color:var(--border-color)">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                       style="background:var(--accent)">{{ p.initiales }}</div>
                  <div>
                    <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ p.nom }}</p>
                    <p class="text-xs" style="color:var(--text-muted)">{{ p.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ p.classe }}</td>
              <td class="px-4 py-3 w-36">
                <div class="flex items-center gap-2">
                  <div class="flex-1 rounded-full h-1.5" style="background:var(--surface-2)">
                    <div class="h-1.5 rounded-full"
                         [style.background]="p.progression===100 ? '#16a34a' : 'var(--accent)'"
                         [style.width]="p.progression + '%'"></div>
                  </div>
                  <span class="text-xs font-bold shrink-0" style="color:var(--text-secondary)">{{ p.progression }}%</span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs font-semibold" style="color:var(--text-primary)">
                {{ p.nbLeconTerminees }}/{{ p.nbLeconTotal }}
              </td>
              <td class="px-4 py-3 text-xs" style="color:var(--text-muted)">{{ p.derniereActivite }}</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                      [style.background]="p.statut==='ACTIF' ? 'rgba(22,163,74,0.10)' : p.statut==='COMPLETE' ? 'rgba(99,102,241,0.10)' : 'rgba(239,68,68,0.10)'"
                      [style.color]="p.statut==='ACTIF' ? '#16a34a' : p.statut==='COMPLETE' ? '#6366f1' : '#dc2626'">
                  {{ p.statut==='ACTIF' ? 'Actif' : p.statut==='COMPLETE' ? 'Complété' : 'Inactif' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-1">
                  <button class="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                          style="background:var(--accent-light);color:var(--accent)">
                    <mat-icon style="font-size:14px;height:14px;width:14px">person</mat-icon>
                  </button>
                  <button class="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                          style="background:rgba(6,182,212,0.10);color:#0891b2">
                    <mat-icon style="font-size:14px;height:14px;width:14px">chat</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }


  <!-- ████████ ONGLET SESSIONS VIRTUELLES ████████ -->
  @if (activeTab() === 'sessions') {
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Sessions virtuelles</h2>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">video_call</mat-icon>
        Planifier une session
      </button>
    </div>
    <!-- Session en cours (badge live) -->
    @for (s of sessions; track s.publicId) {
      @if (s.statut === 'EN_COURS') {
        <div class="sms-card p-4 mb-4 border-2 flex items-center gap-4"
             style="border-color:#16a34a;background:rgba(22,163,74,0.03)">
          <div class="w-2 h-2 rounded-full animate-pulse" style="background:#16a34a"></div>
          <div class="flex-1">
            <span class="text-xs font-bold px-2 py-0.5 rounded-full mr-2"
                  style="background:rgba(22,163,74,0.10);color:#16a34a">EN DIRECT</span>
            <span class="font-semibold text-sm" style="color:var(--text-primary)">{{ s.titre }}</span>
            <span class="text-xs ml-2" style="color:var(--text-muted)">{{ s.coursLibelle }}</span>
          </div>
          <a [href]="s.lienJoin" target="_blank"
             class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80"
             style="background:#16a34a">
            <mat-icon style="font-size:16px;height:16px;width:16px">video_call</mat-icon>
            Rejoindre
          </a>
        </div>
      }
    }
    <!-- Liste sessions -->
    <div class="flex flex-col gap-3">
      @for (s of sessions; track s.publicId) {
        <div class="sms-card p-5 flex items-center gap-4 flex-wrap">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
               [style.background]="sessionStatutCfg(s.statut).bg">
            <mat-icon [style.color]="sessionStatutCfg(s.statut).color"
                      style="font-size:22px;height:22px;width:22px">{{ sessionStatutCfg(s.statut).icon }}</mat-icon>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <h3 class="font-bold text-sm" style="color:var(--text-primary)">{{ s.titre }}</h3>
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    [style.background]="sessionStatutCfg(s.statut).bg"
                    [style.color]="sessionStatutCfg(s.statut).color">
                {{ sessionStatutCfg(s.statut).label }}
              </span>
            </div>
            <p class="text-xs" style="color:var(--text-muted)">
              {{ s.coursLibelle }} · {{ s.enseignant }}
            </p>
            <div class="flex flex-wrap gap-3 mt-2 text-xs" style="color:var(--text-muted)">
              <span class="flex items-center gap-1">
                <mat-icon style="font-size:12px;height:12px;width:12px">event</mat-icon>
                {{ s.date }} à {{ s.heure }}
              </span>
              <span class="flex items-center gap-1">
                <mat-icon style="font-size:12px;height:12px;width:12px">schedule</mat-icon>
                {{ s.dureeMinutes }} min
              </span>
              <span class="flex items-center gap-1">
                <mat-icon style="font-size:12px;height:12px;width:12px">people</mat-icon>
                {{ s.nbInscrits }} inscrits
              </span>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            @if (s.statut === 'PLANIFIEE' && s.lienJoin) {
              <a [href]="s.lienJoin" target="_blank"
                 class="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl text-white hover:opacity-80"
                 style="background:var(--accent)">
                <mat-icon style="font-size:14px;height:14px;width:14px">video_call</mat-icon>
                Rejoindre
              </a>
            }
            @if (s.statut === 'TERMINEE') {
              <button class="text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-80"
                      style="background:var(--surface-2);color:var(--text-secondary)">
                Enregistrement
              </button>
            }
          </div>
        </div>
      }
    </div>
  }


  <!-- ████████ ONGLET CALENDRIER ████████ -->
  @if (activeTab() === 'calendrier') {
    <h2 class="font-bold text-lg mb-5" style="color:var(--text-primary)">Calendrier pédagogique</h2>
    <!-- Légende -->
    <div class="flex flex-wrap gap-3 mb-5">
      @for (t of typeEvenementOptions; track t.value) {
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded" [style.background]="typeEvtCfg(t.value).color"></span>
          <span class="text-xs font-medium" style="color:var(--text-secondary)">{{ t.label }}</span>
        </div>
      }
    </div>
    <!-- Timeline événements -->
    <div class="flex flex-col gap-2">
      @for (ev of evenements; track ev.publicId) {
        <div class="sms-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
               [style.background]="typeEvtCfg(ev.type).color + '15'">
            <mat-icon [style.color]="typeEvtCfg(ev.type).color"
                      style="font-size:22px;height:22px;width:22px">{{ typeEvtCfg(ev.type).icon }}</mat-icon>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ ev.titre }}</p>
              @if (ev.urgent) {
                <span class="text-xs px-1.5 py-0.5 rounded font-bold"
                      style="background:rgba(239,68,68,0.10);color:#dc2626">Urgent</span>
              }
            </div>
            @if (ev.coursLibelle) {
              <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ ev.coursLibelle }}</p>
            }
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm font-bold" style="color:var(--text-primary)">{{ ev.date }}</p>
            @if (ev.heure) {
              <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ ev.heure }}</p>
            }
          </div>
          <div class="w-3 h-8 rounded-full shrink-0" [style.background]="typeEvtCfg(ev.type).color"></div>
        </div>
      }
    </div>
  }


  <!-- ████████ ONGLET CERTIFICATS ████████ -->
  @if (activeTab() === 'certificats') {
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Certificats & Attestations</h2>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
              style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
        <mat-icon style="font-size:16px;height:16px;width:16px">download</mat-icon>
        Tout exporter
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      @for (cert of certificats; track cert.publicId) {
        <div class="sms-card p-6 flex flex-col gap-4">
          <!-- Médaille -->
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                 style="background:linear-gradient(135deg,#f59e0b,#d97706)">
              <mat-icon style="color:#fff;font-size:28px;height:28px;width:28px">workspace_premium</mat-icon>
            </div>
            <div>
              <p class="font-bold text-sm" style="color:var(--text-primary)">{{ cert.coursLibelle }}</p>
              <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ cert.dateEmission }}</p>
            </div>
          </div>
          <!-- Étudiant -->
          <div class="p-3 rounded-xl" style="background:var(--surface-2)">
            <p class="text-xs font-semibold uppercase tracking-wide mb-1" style="color:var(--text-muted)">Étudiant</p>
            <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ cert.etudiantNom }}</p>
          </div>
          <!-- Score / Mention -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs" style="color:var(--text-muted)">Score final</p>
              <p class="text-2xl font-bold" style="color:var(--accent)">{{ cert.score }}/20</p>
            </div>
            <span class="px-3 py-1.5 rounded-xl text-sm font-bold"
                  [style.background]="cert.score >= 16 ? 'rgba(22,163,74,0.10)' : cert.score >= 12 ? 'rgba(99,102,241,0.10)' : 'rgba(245,158,11,0.10)'"
                  [style.color]="cert.score >= 16 ? '#16a34a' : cert.score >= 12 ? '#6366f1' : '#d97706'">
              {{ cert.mention }}
            </span>
          </div>
          <!-- Actions -->
          <div class="flex gap-2 pt-2 border-t" style="border-color:var(--border-color)">
            <button class="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold hover:opacity-80 text-white"
                    style="background:var(--accent)">
              <mat-icon style="font-size:14px;height:14px;width:14px">download</mat-icon>
              Télécharger PDF
            </button>
            <button class="px-3 py-2 rounded-xl hover:opacity-70 transition-opacity"
                    style="background:var(--surface-2);color:var(--text-secondary)">
              <mat-icon style="font-size:16px;height:16px;width:16px">share</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  }

</div>
  `,
})
export class CoursListComponent implements OnInit {
  readonly store = inject(LearningStore);

  // ── Données LMS étendues ─────────────────────────────────────────────────────
  readonly categories     = MOCK_CATEGORIES;
  readonly devoirs        = MOCK_DEVOIRS;
  readonly ressources     = MOCK_RESSOURCES_BIBLIO;
  readonly discussions    = MOCK_DISCUSSIONS;
  readonly annonces       = MOCK_ANNONCES;
  readonly participants   = MOCK_PARTICIPANTS;
  readonly sessions       = MOCK_SESSIONS_VIRTUELLES;
  readonly evenements     = MOCK_EVENEMENTS;
  readonly certificats    = MOCK_CERTIFICATS;
  readonly historiqueCoursData = MOCK_HISTORIQUE_COURS;

  // ── State local ──────────────────────────────────────────────────────────────
  activeTab           = signal<LmsTab>('cours');
  coursView           = signal<'grille' | 'liste'>('grille');
  searchQuery         = '';
  statutFilter        = signal('');
  categorieFilter     = '';
  typeRessourceFilter = signal('');
  favoris             = signal<string[]>([...MOCK_FAVORIS]);

  readonly statutFilters = [
    { value: '',         label: 'Tous'       },
    { value: 'PUBLIE',   label: 'Publiés'    },
    { value: 'BROUILLON',label: 'Brouillons' },
    { value: 'ARCHIVE',  label: 'Archivés'   },
  ];

  readonly typeRessourceOptions = [
    { value:'PDF',          label:'PDF'          },
    { value:'VIDEO',        label:'Vidéo'        },
    { value:'PRESENTATION', label:'Slides'       },
    { value:'DOCUMENT',     label:'Document'     },
    { value:'ZIP',          label:'Archives'     },
    { value:'LIEN',         label:'Liens'        },
  ];

  readonly typeEvenementOptions = [
    { value:'COURS',   label:'Cours'   },
    { value:'DEVOIR',  label:'Devoir'  },
    { value:'EXAMEN',  label:'Examen'  },
    { value:'SESSION', label:'Session' },
  ];

  // ── Onglets LMS ──────────────────────────────────────────────────────────────
  readonly lmsTabs: { id: LmsTab; label: string; icon: string; badge?: () => number }[] = [
    { id:'cours',        label:'Cours',         icon:'menu_book',       badge: () => this.store.nbCours() },
    { id:'devoirs',      label:'Devoirs',        icon:'assignment',      badge: () => this.devoirsOuverts() },
    { id:'ressources',   label:'Ressources',     icon:'folder_open',     badge: () => this.ressources.length },
    { id:'discussions',  label:'Discussions',    icon:'forum',           badge: () => this.discussions.filter(d=>!d.resolu).length },
    { id:'annonces',     label:'Annonces',       icon:'campaign',        badge: () => this.annonces.filter(a=>!a.lu).length },
    { id:'participants', label:'Participants',   icon:'people',          badge: () => this.participants.length },
    { id:'sessions',     label:'Sessions',       icon:'video_call',      badge: () => this.sessions.filter(s=>s.statut==='EN_COURS'||s.statut==='PLANIFIEE').length },
    { id:'calendrier',   label:'Calendrier',     icon:'calendar_month',  badge: () => this.evenements.length },
    { id:'certificats',  label:'Certificats',    icon:'workspace_premium', badge: () => this.certificats.length },
  ];

  // ── Init ─────────────────────────────────────────────────────────────────────
  ngOnInit() { this.store.loadCours({}); }

  // ── KPI computed ─────────────────────────────────────────────────────────────
  totalChapitres = computed(() =>
    this.store.cours().reduce((s, c) => s + c.chapitres.length, 0)
  );

  moyenneProgression = computed(() => {
    const cours = this.store.cours();
    if (!cours.length) return 0;
    return Math.round(cours.reduce((s, c) => s + c.progression, 0) / cours.length);
  });

  // ── Filtres cours ─────────────────────────────────────────────────────────────
  coursFiltres = computed(() => {
    let list = this.store.cours();
    if (this.statutFilter()) list = list.filter(c => c.statut === this.statutFilter());
    if (this.searchQuery)    list = list.filter(c =>
      c.titre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.matiereLibelle.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return list;
  });

  coursFavoris = computed(() =>
    this.store.cours().filter(c => this.favoris().includes(c.publicId))
  );

  // ── Favoris ──────────────────────────────────────────────────────────────────
  isFavori(id: string): boolean { return this.favoris().includes(id); }
  toggleFavori(id: string): void {
    const curr = this.favoris();
    this.favoris.set(curr.includes(id) ? curr.filter(f => f !== id) : [...curr, id]);
  }

  // ── Devoirs ──────────────────────────────────────────────────────────────────
  devoirsOuverts()      { return this.devoirs.filter(d => d.statut === 'OUVERT').length; }
  devoirsFermes()       { return this.devoirs.filter(d => d.statut === 'FERME').length; }
  devoirsCorrigesCount(){ return this.devoirs.filter(d => d.statut === 'CORRIGE').length; }

  // ── Ressources ───────────────────────────────────────────────────────────────
  ressourcesFiltrees = computed(() => {
    const f = this.typeRessourceFilter();
    return f ? this.ressources.filter(r => r.type === f) : this.ressources;
  });

  // ── Participants ─────────────────────────────────────────────────────────────
  participantsActifs()   { return this.participants.filter(p => p.statut === 'ACTIF').length; }
  participantsComplets() { return this.participants.filter(p => p.statut === 'COMPLETE').length; }
  participantsInactifs() { return this.participants.filter(p => p.statut === 'INACTIF').length; }

  // ── Config helpers ────────────────────────────────────────────────────────────
  statutCoursColor(statut: string) { return STATUT_COURS_CFG[statut] ?? STATUT_COURS_CFG['BROUILLON']; }
  devoirStatutCfg(statut: string)  { return STATUT_DEVOIR_CFG[statut] ?? STATUT_DEVOIR_CFG['OUVERT']; }
  typeRessCfg(type: string)        { return TYPE_RESSOURCE_CFG[type]   ?? TYPE_RESSOURCE_CFG['DOCUMENT']; }
  sessionStatutCfg(s: string)      { return STATUT_SESSION_CFG[s]      ?? STATUT_SESSION_CFG['PLANIFIEE']; }
  typeEvtCfg(t: string)            { return TYPE_EVENEMENT_CFG[t]       ?? TYPE_EVENEMENT_CFG['COURS']; }

  coursColor(matiere: string): string {
    const colors: Record<string, string> = {
      'Algorithmique':'#6366f1', 'Mathématiques':'#f59e0b',
      'Réseaux':'#0ea5e9', 'BDD':'#10b981', 'Sécurité':'#ef4444',
      'Cloud':'#06b6d4', 'IA':'#8b5cf6', 'Systèmes':'#d97706',
      'Gestion':'#a855f7', 'POO':'#ec4899',
    };
    const key = Object.keys(colors).find(k => matiere.toLowerCase().includes(k.toLowerCase()));
    return key ? colors[key] : '#6366f1';
  }

  shortName(nom: string): string {
    const parts = nom.replace(/^(M\.|Mme|Dr)\s*/, '').split(' ');
    return parts.length > 1 ? `${parts[0][0]}. ${parts[1]}` : nom;
  }
}
