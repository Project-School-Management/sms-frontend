import {
  ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal, computed,
} from '@angular/core';
import { CommonModule }              from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule }               from '@angular/forms';
import { MatIconModule }             from '@angular/material/icon';
import { StudentsStore }                        from '@sms/students/data-access';
import { CLASSES_MAP_REF as CLASSES_MAP } from '@sms/config-system/data-access';
import { IStudent, StudentStatut, IAuditEntry, IStudentCard } from '@sms/shared/models';
import {
  SkeletonTableComponent,
  DetailPageSkeletonComponent,
  TimelineSkeletonComponent,
  DocumentSkeletonComponent,
  EmptyStateComponent,
  DocumentService,
} from '@sms/shared/ui';
import { EleveCarteComponent } from '@sms/students/ui';
import { AuthStore }           from '@sms/shared/auth';

// ── Statut config ─────────────────────────────────────────────────────────────
const STATUT_CFG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  PRE_INSCRIT:          { label: 'Pré-inscrit',        bg: 'rgba(245,158,11,0.12)',  color: '#d97706', icon: 'pending'       },
  INSCRIT:              { label: 'Inscrit',             bg: 'rgba(59,130,246,0.12)',  color: '#2563eb', icon: 'how_to_reg'    },
  INSCRIPTION_VALIDEE:  { label: 'Validé',             bg: 'rgba(16,185,129,0.12)',  color: '#059669', icon: 'verified'      },
  ACTIF:                { label: 'Actif',               bg: 'rgba(22,163,74,0.12)',   color: '#16a34a', icon: 'check_circle'  },
  INACTIF:              { label: 'Inactif',             bg: 'rgba(107,114,128,0.12)', color: '#6b7280', icon: 'pause_circle'  },
  INSCRIPTION_ANNULEE:  { label: 'Inscription annulée', bg: 'rgba(239,68,68,0.12)',   color: '#dc2626', icon: 'cancel'        },
  SUSPENDU:             { label: 'Suspendu',            bg: 'rgba(217,119,6,0.12)',   color: '#d97706', icon: 'block'         },
  ABANDONNE:            { label: 'Abandonné',           bg: 'rgba(239,68,68,0.10)',   color: '#ef4444', icon: 'exit_to_app'   },
  TRANSFERE:            { label: 'Transféré',           bg: 'rgba(99,102,241,0.12)',  color: '#6366f1', icon: 'swap_horiz'    },
  DIPLOME:              { label: 'Diplômé',             bg: 'rgba(99,102,241,0.15)',  color: '#4f46e5', icon: 'school'        },
  EXCLUS:               { label: 'Exclu',               bg: 'rgba(239,68,68,0.15)',   color: '#dc2626', icon: 'gavel'         },
};

const AUDIT_CFG: Record<string, { label: string; icon: string; color: string }> = {
  CREATION:              { label: 'Création',            icon: 'person_add',   color: '#16a34a' },
  MODIFICATION:          { label: 'Modification',        icon: 'edit',         color: '#2563eb' },
  CHANGEMENT_CLASSE:     { label: 'Changement de classe',icon: 'swap_horiz',   color: '#d97706' },
  ANNULATION_INSCRIPTION:{ label: 'Annulation',          icon: 'cancel',       color: '#dc2626' },
  REACTIVATION:          { label: 'Réactivation',        icon: 'restart_alt',  color: '#16a34a' },
  SUSPENSION:            { label: 'Suspension',          icon: 'block',        color: '#d97706' },
  TRANSFERT:             { label: 'Transfert',           icon: 'swap_horiz',   color: '#6366f1' },
  VALIDATION:            { label: 'Validation',          icon: 'verified',     color: '#059669' },
  DIPLOME:               { label: 'Diplôme',             icon: 'school',       color: '#4f46e5' },
  EXCLUSION:             { label: 'Exclusion',           icon: 'gavel',        color: '#dc2626' },
};

type Tab = 'infos' | 'notes' | 'bulletins' | 'factures' | 'absences' | 'historique' | 'audit' | 'documents';

// ── Typed mock data ────────────────────────────────────────────────────────────

interface MockNote {
  matiere: string; valeur: number; coeff: number; date: string;
}
interface MockFacture {
  numero: string; montant: number; paye: number; statut: string; echeance: string;
  typeFrais: string; dateEmission: string;
}
interface MockAbsence {
  date: string; matiere: string; type: 'ABSENCE' | 'RETARD'; justifie: boolean; motif: string | null;
}
interface MockBulletinNote {
  matiere: string; coeff: number; valeur: number; moyenneClasse: number; appreciation: string;
}
interface MockBulletin {
  periode: string; moyenne: number; rang: number; effectif: number; mention: string;
  notes: MockBulletinNote[];
}

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector:        'sms-student-detail',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [
    CommonModule, RouterLink, FormsModule, MatIconModule,
    SkeletonTableComponent, DetailPageSkeletonComponent,
    TimelineSkeletonComponent, DocumentSkeletonComponent,
    EmptyStateComponent,
    EleveCarteComponent,
  ],
  template: `
<div class="p-6 max-w-5xl mx-auto">

  <!-- Breadcrumb -->
  <div class="flex items-center gap-2 mb-6 text-sm">
    <a routerLink="/students" class="hover:opacity-70" style="color: var(--accent)">Élèves</a>
    <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">chevron_right</mat-icon>
    <span style="color:var(--text-secondary)">Fiche étudiant</span>
  </div>

  <!-- ── Loading ── -->
  @if (store.loading() && !store.selectedStudent()) {
    <sms-skeleton-detail-page />
  } @else {

  @if (store.selectedStudent(); as s) {

    <!-- ════════════════════════════════════════════════════════════
         PROFILE HEADER
    ════════════════════════════════════════════════════════════ -->
    <div class="sms-card p-6 mb-4">
      <div class="flex flex-wrap items-start gap-5">

        <!-- Avatar / Photo -->
        <div class="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden"
             style="background: linear-gradient(135deg,#6366f1,#8b5cf6)">
          @if (s.photoUrl) {
            <img [src]="s.photoUrl" [alt]="s.firstName + ' ' + s.lastName"
                 class="w-full h-full object-cover">
          } @else {
            <div class="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
              {{ s.firstName[0] }}{{ s.lastName[0] }}
            </div>
          }
        </div>

        <!-- Name + meta -->
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <h1 class="text-2xl font-bold" style="color:var(--text-primary)">
              {{ s.firstName }} {{ s.lastName }}
            </h1>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                  [style.background]="statut(s).bg" [style.color]="statut(s).color">
              <mat-icon style="font-size:12px;height:12px;width:12px">{{ statut(s).icon }}</mat-icon>
              {{ statut(s).label }}
            </span>
          </div>
          <p class="font-mono text-sm mb-2" style="color:var(--text-secondary)">{{ s.matricule }}</p>

          <div class="flex flex-wrap gap-4 text-sm" style="color:var(--text-secondary)">
            @if (s.classeLibelle) {
              <span class="flex items-center gap-1">
                <mat-icon style="font-size:16px;height:16px;width:16px">school</mat-icon>{{ s.classeLibelle }}
              </span>
            }
            @if (s.niveauLibelle) {
              <span class="flex items-center gap-1">
                <mat-icon style="font-size:16px;height:16px;width:16px">layers</mat-icon>{{ s.niveauLibelle }}
              </span>
            }
            @if (s.filiereLibelle) {
              <span class="flex items-center gap-1">
                <mat-icon style="font-size:16px;height:16px;width:16px">category</mat-icon>{{ s.filiereLibelle }}
              </span>
            }
            <span class="flex items-center gap-1">
              <mat-icon style="font-size:16px;height:16px;width:16px">cake</mat-icon>
              {{ s.dateNaissance | date:'dd/MM/yyyy' }}
            </span>
            <span class="flex items-center gap-1">
              <mat-icon style="font-size:16px;height:16px;width:16px">person</mat-icon>
              {{ s.genre === 'M' ? 'Masculin' : 'Féminin' }}
            </span>
            @if (s.nationalite) {
              <span class="flex items-center gap-1">
                <mat-icon style="font-size:16px;height:16px;width:16px">flag</mat-icon>{{ s.nationalite }}
              </span>
            }
          </div>

          @if (s.motifStatut) {
            <div class="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg text-sm"
                 style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15)">
              <mat-icon style="font-size:15px;height:15px;width:15px;color:#dc2626;margin-top:1px;flex-shrink:0">info</mat-icon>
              <span style="color:#dc2626">{{ s.motifStatut }}</span>
            </div>
          }
        </div>

        <!-- Actions -->
        <div class="flex items-start gap-2 flex-shrink-0">

          <!-- Bouton principal : Modifier -->
          <a [routerLink]="['/students', s.publicId, 'edit']"
             class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
             style="background:var(--accent)">
            <mat-icon style="font-size:16px;height:16px;width:16px">edit</mat-icon>
            Modifier
          </a>

          <!-- Menu kebab ⋮ -->
          <div class="relative">
            <button (click)="toggleMenu()"
                    class="flex items-center justify-center w-9 h-9 rounded-lg border transition-all hover:opacity-80"
                    [style.background]="menuOpen() ? 'var(--accent-light)' : 'var(--surface-2)'"
                    [style.border-color]="menuOpen() ? 'var(--accent)' : 'var(--border-color)'"
                    [style.color]="menuOpen() ? 'var(--accent)' : 'var(--text-secondary)'"
                    title="Plus d'actions">
              <mat-icon style="font-size:20px;height:20px;width:20px">more_vert</mat-icon>
            </button>

            @if (menuOpen()) {
              <!-- Backdrop invisible pour fermer au clic extérieur -->
              <div class="fixed inset-0 z-40" (click)="menuOpen.set(false)"></div>

              <!-- Dropdown -->
              <div class="absolute right-0 top-11 z-50 w-56 rounded-xl overflow-hidden"
                   style="background:var(--surface-1);border:1px solid var(--border-color);
                          box-shadow:0 8px 32px rgba(0,0,0,0.12)">

                <!-- ── Scolarité ── -->
                <p class="px-3 pt-2.5 pb-1 text-xs font-semibold uppercase tracking-wider"
                   style="color:var(--text-muted);background:var(--surface-2)">Scolarité</p>

                @if (canReactivate(s.statut)) {
                  <button (click)="reactivate(s.publicId); menuOpen.set(false)"
                          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                          style="background:transparent">
                    <mat-icon style="font-size:16px;height:16px;width:16px;color:#16a34a">restart_alt</mat-icon>
                    <span style="color:#16a34a;font-weight:500">Réactiver</span>
                  </button>
                }
                @if (canReinscrire(s.statut)) {
                  <a [routerLink]="['/students', s.publicId, 'edit']" (click)="menuOpen.set(false)"
                     class="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity">
                    <mat-icon style="font-size:16px;height:16px;width:16px;color:#6366f1">assignment_turned_in</mat-icon>
                    <span style="color:#6366f1;font-weight:500">Réinscrire</span>
                  </a>
                }
                @if (s.statut === 'ACTIF' || s.statut === 'INSCRIT' || s.statut === 'INSCRIPTION_VALIDEE') {
                  <button (click)="showChangeClasseDialog.set(true); menuOpen.set(false)"
                          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                          style="background:transparent">
                    <mat-icon style="font-size:16px;height:16px;width:16px;color:#d97706">swap_horiz</mat-icon>
                    <span style="color:var(--text-primary)">Changer de classe</span>
                  </button>
                }
                @if (canCancel(s.statut)) {
                  <button (click)="showCancelDialog.set(true); menuOpen.set(false)"
                          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                          style="background:transparent">
                    <mat-icon style="font-size:16px;height:16px;width:16px;color:#dc2626">cancel</mat-icon>
                    <span style="color:#dc2626">Annuler l'inscription</span>
                  </button>
                }

                <!-- ── Divider ── -->
                <div class="my-1" style="height:1px;background:var(--border-color)"></div>

                <!-- ── Navigation rapide ── -->
                <p class="px-3 pt-1.5 pb-1 text-xs font-semibold uppercase tracking-wider"
                   style="color:var(--text-muted);background:var(--surface-2)">Consulter</p>

                <button (click)="activeTab.set('notes'); menuOpen.set(false)"
                        class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                        style="background:transparent;color:var(--text-primary)">
                  <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--accent)">grade</mat-icon>
                  Notes & résultats
                </button>
                <button (click)="activeTab.set('bulletins'); menuOpen.set(false)"
                        class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                        style="background:transparent;color:var(--text-primary)">
                  <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--accent)">description</mat-icon>
                  Bulletins scolaires
                </button>
                <button (click)="activeTab.set('factures'); menuOpen.set(false)"
                        class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                        style="background:transparent;color:var(--text-primary)">
                  <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--accent)">receipt_long</mat-icon>
                  Paiements & factures
                </button>

                <!-- ── Divider ── -->
                <div class="my-1" style="height:1px;background:var(--border-color)"></div>

                <!-- ── Documents ── -->
                <p class="px-3 pt-1.5 pb-1 text-xs font-semibold uppercase tracking-wider"
                   style="color:var(--text-muted);background:var(--surface-2)">Imprimer / Exporter</p>

                <button (click)="exportPdf(s); menuOpen.set(false)"
                        class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                        style="background:transparent;color:var(--text-primary)">
                  <mat-icon style="font-size:16px;height:16px;width:16px;color:#6366f1">picture_as_pdf</mat-icon>
                  Exporter PDF complet
                </button>
                <button (click)="printCard(s); menuOpen.set(false)"
                        class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left pb-2.5"
                        style="background:transparent;color:var(--text-primary)">
                  <mat-icon style="font-size:16px;height:16px;width:16px;color:#6366f1">badge</mat-icon>
                  Imprimer la carte
                </button>

              </div>
            }
          </div>

        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════
         RÉSUMÉS CROISÉS (Academic · Finance · Assiduité · Documents)
    ════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

      <!-- Résumé académique -->
      <button (click)="activeTab.set('notes')"
              class="sms-card p-4 text-left hover:opacity-90 transition-opacity cursor-pointer w-full">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
               style="background:rgba(99,102,241,0.1)">
            <mat-icon style="font-size:15px;height:15px;width:15px;color:#6366f1">grade</mat-icon>
          </div>
          <p class="text-xs font-semibold" style="color:var(--text-muted)">ACADÉMIQUE</p>
        </div>
        <p class="text-xl font-bold" [style.color]="noteColor(moyennePond())">
          {{ moyennePond() | number:'1.1-1' }}/20
        </p>
        <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
          Rang {{ dernierBulletin()?.rang }}{{ dernierBulletin()?.rang === 1 ? 'er' : 'ème' }}/{{ dernierBulletin()?.effectif }}
          &nbsp;·&nbsp;{{ dernierBulletin()?.mention }}
        </p>
        <div class="mt-1.5 flex items-center gap-2 text-xs">
          <span style="color:#16a34a">✔ {{ notesValidees() }} validées</span>
          @if (notesInsuffisantes() > 0) {
            <span style="color:#dc2626">✖ {{ notesInsuffisantes() }} insuf.</span>
          }
        </div>
      </button>

      <!-- Résumé financier -->
      <button (click)="activeTab.set('factures')"
              class="sms-card p-4 text-left hover:opacity-90 transition-opacity cursor-pointer w-full">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
               style="background:rgba(22,163,74,0.1)">
            <mat-icon style="font-size:15px;height:15px;width:15px;color:#16a34a">account_balance_wallet</mat-icon>
          </div>
          <p class="text-xs font-semibold" style="color:var(--text-muted)">FINANCES</p>
        </div>
        <p class="text-xl font-bold" [style.color]="soldeFact() > 0 ? '#ef4444' : '#16a34a'">
          {{ fmtXof(soldeFact()) }}
        </p>
        <p class="text-xs mt-0.5" style="color:var(--text-secondary)">Solde restant</p>
        <div class="mt-1.5 text-xs" style="color:var(--text-muted)">
          {{ fmtXof(totalPayeFact()) }} payé / {{ fmtXof(totalFact()) }}
        </div>
      </button>

      <!-- Résumé assiduité -->
      <button (click)="activeTab.set('absences')"
              class="sms-card p-4 text-left hover:opacity-90 transition-opacity cursor-pointer w-full">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
               style="background:rgba(239,68,68,0.1)">
            <mat-icon style="font-size:15px;height:15px;width:15px;color:#dc2626">event_busy</mat-icon>
          </div>
          <p class="text-xs font-semibold" style="color:var(--text-muted)">ASSIDUITÉ</p>
        </div>
        <p class="text-xl font-bold" [style.color]="absenceCount() > 3 ? '#dc2626' : 'var(--text-primary)'">
          {{ absenceCount() }} abs · {{ retardCount() }} ret
        </p>
        <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
          {{ nonJustifieCount() }} non justifié(e)(s)
        </p>
        <div class="mt-1.5">
          <div class="w-full rounded-full h-1.5" style="background:var(--border-color)">
            <div class="h-1.5 rounded-full" style="background:#16a34a"
                 [style.width.%]="totalAbsences() > 0 ? (justifieCount() / totalAbsences()) * 100 : 100">
            </div>
          </div>
        </div>
      </button>

      <!-- Résumé dossier -->
      <button (click)="activeTab.set('documents')"
              class="sms-card p-4 text-left hover:opacity-90 transition-opacity cursor-pointer w-full">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
               style="background:rgba(99,102,241,0.1)">
            <mat-icon style="font-size:15px;height:15px;width:15px;color:#6366f1">folder_open</mat-icon>
          </div>
          <p class="text-xs font-semibold" style="color:var(--text-muted)">DOSSIER</p>
        </div>
        <p class="text-xl font-bold"
           [style.color]="docsManquants() > 0 ? '#d97706' : '#16a34a'">
          {{ docsFournis() }}/{{ store.documents().length || 5 }}
        </p>
        <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
          Documents fournis
        </p>
        <div class="mt-1.5">
          <div class="w-full rounded-full h-1.5" style="background:var(--border-color)">
            <div class="h-1.5 rounded-full"
                 [style.background]="docsManquants() > 0 ? '#d97706' : '#16a34a'"
                 [style.width.%]="store.documents().length > 0 ? (docsFournis() / store.documents().length) * 100 : 0">
            </div>
          </div>
          @if (docsManquants() > 0) {
            <p class="text-xs mt-1" style="color:#d97706">{{ docsManquants() }} manquant(s)</p>
          }
        </div>
      </button>
    </div>

    <!-- Dernière opération (issue de l'audit) -->
    @if (store.audit().length > 0) {
      <div class="mb-4 flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs"
           style="background:var(--surface-2);border:1px solid var(--border-color)">
        <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">manage_search</mat-icon>
        <span style="color:var(--text-muted)">Dernière opération :</span>
        <span class="font-semibold" [style.color]="auditColor(store.audit()[0])">
          {{ auditLabel(store.audit()[0]) }}
        </span>
        <span style="color:var(--text-muted)">—</span>
        <span style="color:var(--text-secondary)">{{ store.audit()[0].responsable }}</span>
        <span style="color:var(--text-muted)">·</span>
        <span style="color:var(--text-muted)">{{ store.audit()[0].date | date:'dd/MM/yyyy' }}</span>
      </div>
    }

    <!-- Dernière inscription (issue de l'historique) -->
    @if (store.historique().length > 0) {
      <div class="mb-5 flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs"
           style="background:var(--surface-2);border:1px solid var(--border-color)">
        <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">history_edu</mat-icon>
        <span style="color:var(--text-muted)">Inscription en cours :</span>
        <span class="font-semibold" style="color:var(--text-primary)">{{ store.historique()[0].anneeAcademique }}</span>
        <span style="color:var(--text-muted)">·</span>
        <span style="color:var(--text-secondary)">{{ store.historique()[0].classeLibelle }}</span>
        <span style="color:var(--text-muted)">·</span>
        <span class="px-1.5 py-0.5 rounded"
              [style.background]="statut(store.historique()[0]).bg"
              [style.color]="statut(store.historique()[0]).color">
          {{ statut(store.historique()[0]).label }}
        </span>
      </div>
    }

    <!-- ════ TABS ════ -->
    <div class="flex flex-wrap gap-1 mb-5 p-1 rounded-xl"
         style="background:var(--surface-2);border:1px solid var(--border-color)">
      @for (tab of tabs(); track tab.key) {
        <button (click)="activeTab.set(tab.key)"
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                [style.background]="activeTab() === tab.key ? 'var(--surface-1)' : 'transparent'"
                [style.color]="activeTab() === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)'"
                [style.box-shadow]="activeTab() === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'">
          <mat-icon style="font-size:15px;height:15px;width:15px">{{ tab.icon }}</mat-icon>
          {{ tab.label }}
          @if (tab.badge && tab.badge > 0) {
            <span class="px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style="background:rgba(239,68,68,0.15);color:#dc2626;min-width:18px;text-align:center">
              {{ tab.badge }}
            </span>
          }
        </button>
      }
    </div>

    <!-- ════ TAB : INFOS ════ -->
    @if (activeTab() === 'infos') {
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- Infos personnelles -->
        <div class="sms-card p-5">
          <h3 class="font-semibold mb-4 flex items-center gap-2" style="color:var(--text-primary)">
            <mat-icon style="font-size:18px;height:18px;width:18px;color:var(--accent)">person</mat-icon>
            Informations personnelles
          </h3>
          <div class="space-y-2.5">
            @for (f of personalFields(s); track f.label) {
              <div class="flex items-start justify-between py-2" style="border-bottom:1px solid var(--border-color)">
                <span class="text-sm" style="color:var(--text-secondary)">{{ f.label }}</span>
                <span class="text-sm font-medium text-right" style="color:var(--text-primary)">{{ f.value || '—' }}</span>
              </div>
            }
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <!-- Contact -->
          <div class="sms-card p-5">
            <h3 class="font-semibold mb-3 flex items-center gap-2" style="color:var(--text-primary)">
              <mat-icon style="font-size:18px;height:18px;width:18px;color:#10b981">contact_phone</mat-icon>
              Contact
            </h3>
            <div class="space-y-2.5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(99,102,241,0.1)">
                  <mat-icon style="font-size:15px;height:15px;width:15px;color:#6366f1">email</mat-icon>
                </div>
                <div>
                  <p class="text-xs" style="color:var(--text-muted)">Email</p>
                  <p class="text-sm font-medium" style="color:var(--text-primary)">{{ s.email || '—' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(16,185,129,0.1)">
                  <mat-icon style="font-size:15px;height:15px;width:15px;color:#10b981">phone</mat-icon>
                </div>
                <div>
                  <p class="text-xs" style="color:var(--text-muted)">Téléphone</p>
                  <p class="text-sm font-medium" style="color:var(--text-primary)">{{ s.phone || '—' }}</p>
                </div>
              </div>
              @if (s.adresse) {
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(245,158,11,0.1)">
                    <mat-icon style="font-size:15px;height:15px;width:15px;color:#f59e0b">location_on</mat-icon>
                  </div>
                  <div>
                    <p class="text-xs" style="color:var(--text-muted)">Adresse</p>
                    <p class="text-sm font-medium" style="color:var(--text-primary)">{{ s.adresse }}, {{ s.ville }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Scolarité -->
          <div class="sms-card p-5">
            <h3 class="font-semibold mb-3 flex items-center gap-2" style="color:var(--text-primary)">
              <mat-icon style="font-size:18px;height:18px;width:18px;color:#f59e0b">school</mat-icon>
              Scolarité
            </h3>
            <div class="space-y-2">
              @for (f of scolariteFields(s); track f.label) {
                <div class="flex justify-between">
                  <span class="text-sm" style="color:var(--text-secondary)">{{ f.label }}</span>
                  <span class="text-sm font-medium" style="color:var(--text-primary)">{{ f.value || '—' }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Observations -->
        @if (s.observations) {
          <div class="md:col-span-2 sms-card p-5">
            <h3 class="font-semibold mb-3 flex items-center gap-2" style="color:var(--text-primary)">
              <mat-icon style="font-size:18px;height:18px;width:18px;color:#f59e0b">sticky_note_2</mat-icon>
              Observations / Notes internes
            </h3>
            <p class="text-sm leading-relaxed p-3 rounded-xl"
               style="color:var(--text-secondary);background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.15)">
              {{ s.observations }}
            </p>
          </div>
        }

        <!-- Parents / Tuteurs -->
        @if ((s.parents ?? []).length > 0) {
          <div class="md:col-span-2 sms-card p-5">
            <h3 class="font-semibold mb-4 flex items-center gap-2" style="color:var(--text-primary)">
              <mat-icon style="font-size:18px;height:18px;width:18px;color:#8b5cf6">family_restroom</mat-icon>
              Parents / Tuteurs ({{ s.parents!.length }})
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              @for (p of s.parents; track p.nom) {
                <div class="flex items-start gap-3 p-3 rounded-xl"
                     style="background:var(--surface-2);border:1px solid var(--border-color)">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                       style="background:rgba(139,92,246,0.12)">
                    <mat-icon style="font-size:20px;height:20px;width:20px;color:#8b5cf6">
                      {{ p.relation === 'PERE' ? 'man' : p.relation === 'MERE' ? 'woman' : 'person' }}
                    </mat-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ p.nom }}</p>
                    <p class="text-xs mb-1.5" style="color:var(--accent)">
                      {{ p.relation }}{{ p.profession ? ' · ' + p.profession : '' }}
                    </p>
                    <p class="text-xs flex items-center gap-1" style="color:var(--text-secondary)">
                      <mat-icon style="font-size:12px;height:12px;width:12px">phone</mat-icon>{{ p.telephone }}
                    </p>
                    @if (p.email) {
                      <p class="text-xs flex items-center gap-1 mt-0.5" style="color:var(--text-secondary)">
                        <mat-icon style="font-size:12px;height:12px;width:12px">email</mat-icon>{{ p.email }}
                      </p>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- ════ TAB : NOTES ════ -->
    @if (activeTab() === 'notes') {
      <!-- KPI stats calculés depuis mockNotes + mockBulletins -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div class="sms-card p-4 text-center">
          <p class="text-2xl font-bold" [style.color]="noteColor(moyennePond())">
            {{ moyennePond() | number:'1.1-1' }}
          </p>
          <p class="text-xs mt-1" style="color:var(--text-secondary)">Moyenne /20</p>
        </div>
        <div class="sms-card p-4 text-center">
          <p class="text-2xl font-bold" style="color:#16a34a">
            {{ dernierBulletin()?.rang }}<sup class="text-sm">{{ dernierBulletin()?.rang === 1 ? 'er' : 'ème' }}</sup>
          </p>
          <p class="text-xs mt-1" style="color:var(--text-secondary)">
            / {{ dernierBulletin()?.effectif }} élèves
          </p>
        </div>
        <div class="sms-card p-4 text-center">
          <p class="text-2xl font-bold" style="color:#6366f1">{{ notesValidees() }}</p>
          <p class="text-xs mt-1" style="color:var(--text-secondary)">Matières validées</p>
        </div>
        <div class="sms-card p-4 text-center">
          <p class="text-2xl font-bold" [style.color]="notesInsuffisantes() > 0 ? '#dc2626' : '#16a34a'">
            {{ notesInsuffisantes() }}
          </p>
          <p class="text-xs mt-1" style="color:var(--text-secondary)">En insuffisance</p>
        </div>
      </div>

      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 flex items-center justify-between" style="border-bottom:1px solid var(--border-color)">
          <h3 class="font-semibold" style="color:var(--text-primary)">Dernières notes</h3>
          <a routerLink="/academic" class="text-sm font-medium" style="color:var(--accent)">
            Voir toutes →
          </a>
        </div>
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of ['Matière','Note /20','Coeff.','Pts pondérés','Statut','Date']; track h) {
                <th class="text-left px-4 py-3 font-medium" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (n of mockNotes; track n.matiere) {
              <tr style="border-top:1px solid var(--border-color)">
                <td class="px-4 py-3 font-medium" style="color:var(--text-primary)">{{ n.matiere }}</td>
                <td class="px-4 py-3 font-bold tabular-nums" [style.color]="noteColor(n.valeur)">{{ n.valeur }}/20</td>
                <td class="px-4 py-3 text-center tabular-nums" style="color:var(--text-secondary)">{{ n.coeff }}</td>
                <td class="px-4 py-3 tabular-nums" style="color:var(--text-secondary)">{{ (n.valeur * n.coeff) | number:'1.1-1' }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="n.valeur >= 10 ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)'"
                        [style.color]="n.valeur >= 10 ? '#16a34a' : '#dc2626'">
                    {{ n.valeur >= 10 ? 'Validée' : 'Insuffisante' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ n.date }}</td>
              </tr>
            }
          </tbody>
          <tfoot style="background:var(--surface-2);border-top:2px solid var(--border-color)">
            <tr>
              <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">Moyenne pondérée</td>
              <td class="px-4 py-3 font-bold text-lg" [style.color]="noteColor(moyennePond())">
                {{ moyennePond() | number:'1.2-2' }}/20
              </td>
              <td class="px-4 py-3 tabular-nums text-center" style="color:var(--text-secondary)">
                {{ totalCoeff() }}
              </td>
              <td class="px-4 py-3 tabular-nums font-semibold" style="color:var(--accent)">
                {{ totalPoints() | number:'1.1-1' }}
              </td>
              <td colspan="2" class="px-4 py-3">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold"
                      [style.background]="dernierBulletin()?.mention === 'Très Bien' ? 'rgba(22,163,74,0.15)' : 'rgba(99,102,241,0.12)'"
                      [style.color]="dernierBulletin()?.mention === 'Très Bien' ? '#16a34a' : '#6366f1'">
                  {{ dernierBulletin()?.mention }}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    }

    <!-- ════ TAB : BULLETINS ════ -->
    @if (activeTab() === 'bulletins') {
      <div class="flex flex-col gap-4">
        @for (bulletin of mockBulletins; track bulletin.periode) {
          <div class="sms-card overflow-hidden">
            <div class="px-5 py-4 flex items-center justify-between"
                 style="border-bottom:1px solid var(--border-color)">
              <div>
                <h3 class="font-semibold" style="color:var(--text-primary)">{{ bulletin.periode }}</h3>
                <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
                  Moyenne : <span class="font-bold" [style.color]="noteColor(bulletin.moyenne)">
                    {{ bulletin.moyenne }}/20</span>
                  &nbsp;·&nbsp;Rang :
                  <span class="font-bold" style="color:var(--accent)">
                    {{ bulletin.rang }}{{ bulletin.rang === 1 ? 'er' : 'ème' }}/{{ bulletin.effectif }}
                  </span>
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                      [style.background]="bulletin.mention === 'Très Bien' ? 'rgba(22,163,74,0.12)' : bulletin.mention === 'Bien' ? 'rgba(99,102,241,0.12)' : 'rgba(217,119,6,0.12)'"
                      [style.color]="bulletin.mention === 'Très Bien' ? '#16a34a' : bulletin.mention === 'Bien' ? '#6366f1' : '#d97706'">
                  {{ bulletin.mention }}
                </span>
                <button (click)="downloadBulletin(bulletin.periode)"
                        class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                        style="background:var(--accent-light);color:var(--accent)">
                  <mat-icon style="font-size:14px;height:14px;width:14px">download</mat-icon>PDF
                </button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead style="background:var(--surface-2)">
                  <tr>
                    @for (h of ['Matière','Coeff','Note /20','Moy. classe','Appréciation']; track h) {
                      <th class="text-left px-4 py-2.5 font-medium text-xs" style="color:var(--text-secondary)">{{ h }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (n of bulletin.notes; track n.matiere) {
                    <tr style="border-top:1px solid var(--border-color)">
                      <td class="px-4 py-2.5 font-medium" style="color:var(--text-primary)">{{ n.matiere }}</td>
                      <td class="px-4 py-2.5 text-center tabular-nums" style="color:var(--text-secondary)">{{ n.coeff }}</td>
                      <td class="px-4 py-2.5 font-bold tabular-nums" [style.color]="noteColor(n.valeur)">{{ n.valeur }}/20</td>
                      <td class="px-4 py-2.5 tabular-nums" style="color:var(--text-muted)">{{ n.moyenneClasse }}/20</td>
                      <td class="px-4 py-2.5 text-xs" style="color:var(--text-secondary)">{{ n.appreciation }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot style="background:var(--surface-2);border-top:2px solid var(--border-color)">
                  <tr>
                    <td class="px-4 py-2.5 font-semibold" style="color:var(--text-primary)">Moyenne générale</td>
                    <td class="px-4 py-2.5"></td>
                    <td class="px-4 py-2.5 font-bold" [style.color]="noteColor(bulletin.moyenne)">
                      {{ bulletin.moyenne }}/20
                    </td>
                    <td class="px-4 py-2.5"></td>
                    <td class="px-4 py-2.5 font-semibold text-xs" style="color:var(--accent)">{{ bulletin.mention }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        }
        @if (mockBulletins.length === 0) {
          <div class="sms-card">
            <sms-empty-state type="bulletins" />
          </div>
        }
      </div>
    }

    <!-- ════ TAB : FACTURATION ════ -->
    @if (activeTab() === 'factures') {
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 flex items-center justify-between" style="border-bottom:1px solid var(--border-color)">
          <h3 class="font-semibold" style="color:var(--text-primary)">Factures</h3>
          <a routerLink="/finance/invoices" class="text-sm font-medium" style="color:var(--accent)">
            Gérer dans Finance →
          </a>
        </div>
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of ['Numéro','Montant (XOF)','Payé (XOF)','Solde (XOF)','Statut','Échéance','']; track h) {
                <th class="text-left px-4 py-3 font-medium" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (f of mockFactures; track f.numero) {
              <tr style="border-top:1px solid var(--border-color)">
                <td class="px-4 py-3 font-mono text-xs" style="color:var(--text-secondary)">{{ f.numero }}</td>
                <td class="px-4 py-3 font-medium tabular-nums" style="color:var(--text-primary)">
                  {{ f.montant | number }}
                </td>
                <td class="px-4 py-3 tabular-nums font-semibold" style="color:#16a34a">
                  {{ f.paye | number }}
                </td>
                <td class="px-4 py-3 tabular-nums font-semibold"
                    [style.color]="(f.montant - f.paye) > 0 ? '#ef4444' : '#16a34a'">
                  {{ (f.montant - f.paye) | number }}
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="f.statut === 'PAYEE' ? 'rgba(22,163,74,0.12)' : 'rgba(245,158,11,0.12)'"
                        [style.color]="f.statut === 'PAYEE' ? '#16a34a' : '#d97706'">
                    {{ f.statut === 'PAYEE' ? 'Payée' : 'En attente' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ f.echeance }}</td>
                <td class="px-4 py-3 text-right">
                  <button (click)="printRecu(f)" title="Imprimer le reçu"
                          class="p-1.5 rounded-lg hover:opacity-70"
                          style="color:var(--accent);background:var(--surface-2)">
                    <mat-icon style="font-size:16px;height:16px;width:16px">receipt</mat-icon>
                  </button>
                </td>
              </tr>
            }
          </tbody>
          <tfoot style="background:var(--surface-2);border-top:2px solid var(--border-color)">
            <tr>
              <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">Total</td>
              <td class="px-4 py-3 font-bold tabular-nums" style="color:var(--text-primary)">
                {{ totalFact() | number }}
              </td>
              <td class="px-4 py-3 font-bold tabular-nums" style="color:#16a34a">
                {{ totalPayeFact() | number }}
              </td>
              <td class="px-4 py-3 font-bold tabular-nums text-lg"
                  [style.color]="soldeFact() > 0 ? '#ef4444' : '#16a34a'">
                {{ soldeFact() | number }}
              </td>
              <td colspan="3" class="px-4 py-3 text-xs" style="color:var(--text-muted)">
                Taux : {{ tauxRecouvrement() }}%
                <div class="w-24 rounded-full h-1.5 mt-1 inline-block ml-2" style="background:var(--border-color)">
                  <div class="h-1.5 rounded-full" style="background:#16a34a"
                       [style.width.%]="tauxRecouvrement()"></div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    }

    <!-- ════ TAB : ABSENCES ════ -->
    @if (activeTab() === 'absences') {
      <!-- Stats calculées depuis mockAbsences -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(99,102,241,0.10)">
            <mat-icon style="font-size:20px;height:20px;width:20px;color:#6366f1">event_busy</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ absenceCount() }}</p>
            <p class="text-sm" style="color:var(--text-secondary)">Total absences</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(217,119,6,0.10)">
            <mat-icon style="font-size:20px;height:20px;width:20px;color:#d97706">schedule</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ retardCount() }}</p>
            <p class="text-sm" style="color:var(--text-secondary)">Retards</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(239,68,68,0.10)">
            <mat-icon style="font-size:20px;height:20px;width:20px;color:#ef4444">warning_amber</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ nonJustifieCount() }}</p>
            <p class="text-sm" style="color:var(--text-secondary)">Non justifié(e)s</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(16,185,129,0.10)">
            <mat-icon style="font-size:20px;height:20px;width:20px;color:#10b981">check_circle</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ justifieCount() }}</p>
            <p class="text-sm" style="color:var(--text-secondary)">Justifié(e)s</p>
          </div>
        </div>
      </div>

      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 flex items-center justify-between"
             style="border-bottom:1px solid var(--border-color)">
          <h3 class="font-semibold" style="color:var(--text-primary)">
            Historique des absences & retards
          </h3>
          <div class="flex gap-2">
            @for (f of absenceFilters; track f.value) {
              <button (click)="absenceTypeFilter.set(f.value)"
                      class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                      [style.background]="absenceTypeFilter() === f.value ? 'var(--accent)' : 'var(--surface-2)'"
                      [style.color]="absenceTypeFilter() === f.value ? '#fff' : 'var(--text-secondary)'">
                {{ f.label }}
              </button>
            }
          </div>
        </div>
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of ['Date','Matière','Type','Statut','Motif']; track h) {
                <th class="text-left px-4 py-3 font-medium" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (a of filteredAbsences(); track a.date + a.matiere) {
              <tr style="border-top:1px solid var(--border-color)">
                <td class="px-4 py-3" style="color:var(--text-primary)">{{ a.date }}</td>
                <td class="px-4 py-3 font-medium" style="color:var(--text-primary)">{{ a.matiere }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="a.type === 'RETARD' ? 'rgba(217,119,6,0.12)' : 'rgba(239,68,68,0.12)'"
                        [style.color]="a.type === 'RETARD' ? '#d97706' : '#dc2626'">
                    {{ a.type === 'RETARD' ? 'Retard' : 'Absence' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="a.justifie ? 'rgba(22,163,74,0.12)' : 'rgba(107,114,128,0.12)'"
                        [style.color]="a.justifie ? '#16a34a' : '#6b7280'">
                    {{ a.justifie ? 'Justifié(e)' : 'Non justifié(e)' }}
                  </span>
                </td>
                <td class="px-4 py-3" style="color:var(--text-secondary)">{{ a.motif || '—' }}</td>
              </tr>
            }
            @if (filteredAbsences().length === 0) {
              <tr>
                <td colspan="5" class="px-4 py-8 text-center text-sm" style="color:var(--text-secondary)">
                  Aucune {{ absenceTypeFilter() === 'RETARD' ? 'retard' : 'absence' }} enregistré(e)
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- ════ TAB : HISTORIQUE ════ -->
    @if (activeTab() === 'historique') {
      @if (store.loading()) {
        <sms-skeleton-timeline [count]="3" />
      } @else if (store.historique().length === 0) {
        <div class="sms-card">
          <sms-empty-state type="academic"
            title="Aucun historique d'inscription"
            description="L'historique apparaîtra ici après les premières inscriptions." />
        </div>
      } @else {
        <div class="flex flex-col gap-3">
          @for (ins of store.historique(); track ins.id; let first = $first) {
            <div class="sms-card p-5 flex items-start gap-4"
                 [style.border-left]="first ? '3px solid var(--accent)' : '3px solid var(--border-color)'">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                   [style.background]="first ? 'var(--accent-light)' : 'var(--surface-2)'">
                <mat-icon [style.color]="first ? 'var(--accent)' : 'var(--text-muted)'"
                          style="font-size:18px;height:18px;width:18px">
                  {{ first ? 'star' : 'history_edu' }}
                </mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <p class="font-semibold" style="color:var(--text-primary)">{{ ins.anneeAcademique }}</p>
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="statut(ins).bg"
                        [style.color]="statut(ins).color">
                    {{ statut(ins).label }}
                  </span>
                  @if (first) {
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                          style="background:var(--accent-light);color:var(--accent)">En cours</span>
                  }
                </div>
                <div class="flex flex-wrap gap-4 text-sm" style="color:var(--text-secondary)">
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:14px;height:14px;width:14px">school</mat-icon>
                    {{ ins.classeLibelle }}
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:14px;height:14px;width:14px">event</mat-icon>
                    Inscrit le {{ ins.dateInscription | date:'dd/MM/yyyy' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:14px;height:14px;width:14px">sync</mat-icon>
                    {{ ins.typeInscription }}
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:14px;height:14px;width:14px">person</mat-icon>
                    {{ ins.responsable }}
                  </span>
                </div>
                @if (ins.motif) {
                  <p class="text-sm mt-1.5 flex items-center gap-1" style="color:#dc2626">
                    <mat-icon style="font-size:13px;height:13px;width:13px">info</mat-icon>
                    Motif : {{ ins.motif }}
                  </p>
                }
              </div>
              <p class="text-xs flex-shrink-0" style="color:var(--text-muted)">
                {{ ins.dateModification | date:'dd/MM/yyyy' }}
              </p>
            </div>
          }
        </div>
      }
    }

    <!-- ════ TAB : AUDIT ════ -->
    @if (activeTab() === 'audit') {
      @if (store.audit().length === 0) {
        <div class="sms-card">
          <sms-empty-state type="generic" title="Aucune entrée dans le journal d'audit"
            description="Les actions sur ce dossier seront enregistrées ici." />
        </div>
      } @else {
        <div class="sms-card overflow-hidden">
          <div class="px-5 py-4 border-b flex items-center gap-2" style="border-color:var(--border-color)">
            <mat-icon style="font-size:18px;height:18px;width:18px;color:var(--accent)">manage_search</mat-icon>
            <h3 class="font-semibold" style="color:var(--text-primary)">Journal d'audit</h3>
            <span class="ml-auto text-xs" style="color:var(--text-muted)">
              {{ store.audit().length }} entrée(s)
            </span>
          </div>
          <div class="divide-y" style="border-color:var(--border-color)">
            @for (entry of store.audit(); track entry.id) {
              <div class="px-5 py-4 flex items-start gap-4">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                     [style.background]="auditBg(entry)">
                  <mat-icon [style.color]="auditColor(entry)"
                            style="font-size:17px;height:17px;width:17px">
                    {{ auditIcon(entry) }}
                  </mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-0.5">
                    <span class="text-sm font-semibold" style="color:var(--text-primary)">
                      {{ auditLabel(entry) }}
                    </span>
                    <span class="text-xs px-1.5 py-0.5 rounded"
                          [style.background]="auditBg(entry)"
                          [style.color]="auditColor(entry)">
                      {{ entry.action }}
                    </span>
                  </div>
                  @if (entry.details) {
                    <p class="text-sm" style="color:var(--text-secondary)">{{ entry.details }}</p>
                  }
                  @if (entry.ancienneValeur || entry.nouvelleValeur) {
                    <div class="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
                      @if (entry.ancienneValeur) {
                        <span class="px-2 py-0.5 rounded"
                              style="background:rgba(239,68,68,0.08);color:#dc2626">
                          Avant : {{ entry.ancienneValeur }}
                        </span>
                      }
                      @if (entry.ancienneValeur && entry.nouvelleValeur) {
                        <mat-icon style="font-size:12px;height:12px;width:12px;color:var(--text-muted)">arrow_forward</mat-icon>
                      }
                      @if (entry.nouvelleValeur) {
                        <span class="px-2 py-0.5 rounded"
                              style="background:rgba(22,163,74,0.08);color:#16a34a">
                          Après : {{ entry.nouvelleValeur }}
                        </span>
                      }
                    </div>
                  }
                  <div class="flex items-center gap-3 mt-1.5 text-xs" style="color:var(--text-muted)">
                    <span class="flex items-center gap-1">
                      <mat-icon style="font-size:11px;height:11px;width:11px">person</mat-icon>
                      {{ entry.responsable }}
                    </span>
                    <span class="flex items-center gap-1">
                      <mat-icon style="font-size:11px;height:11px;width:11px">schedule</mat-icon>
                      {{ entry.date | date:'dd/MM/yyyy à HH:mm' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    }

    <!-- ════ TAB : DOCUMENTS ════ -->
    @if (activeTab() === 'documents') {
      <!-- ════ Documents à générer (imprimables, données mockées) ════ -->
      <div class="sms-card overflow-hidden mb-4">
        <div class="px-5 py-4 border-b flex items-center gap-2" style="border-color:var(--border-color)">
          <mat-icon style="font-size:18px;height:18px;width:18px;color:#6366f1">print</mat-icon>
          <h3 class="font-semibold" style="color:var(--text-primary)">Documents à générer</h3>
        </div>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button (click)="printCard(store.selectedStudent()!)"
                  class="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-opacity hover:opacity-80"
                  style="background:var(--surface-2);border:1px solid var(--border-color)">
            <mat-icon style="color:#7c3aed">badge</mat-icon>
            <span class="text-sm font-semibold" style="color:var(--text-primary)">Carte virtuelle</span>
            <span class="text-xs" style="color:var(--text-muted)">Format ISO ID-1, QR code</span>
          </button>
          <button (click)="printCertificat()"
                  class="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-opacity hover:opacity-80"
                  style="background:var(--surface-2);border:1px solid var(--border-color)">
            <mat-icon style="color:#0891b2">verified</mat-icon>
            <span class="text-sm font-semibold" style="color:var(--text-primary)">Certificat de scolarité</span>
            <span class="text-xs" style="color:var(--text-muted)">Année académique en cours</span>
          </button>
          <button (click)="printAttestationInscription()"
                  class="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-opacity hover:opacity-80"
                  style="background:var(--surface-2);border:1px solid var(--border-color)">
            <mat-icon style="color:#16a34a">how_to_reg</mat-icon>
            <span class="text-sm font-semibold" style="color:var(--text-primary)">Attestation d'inscription</span>
            <span class="text-xs" style="color:var(--text-muted)">Preuve d'inscription officielle</span>
          </button>
          <button (click)="printAttestationPresence()"
                  class="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-opacity hover:opacity-80"
                  style="background:var(--surface-2);border:1px solid var(--border-color)">
            <mat-icon style="color:#d97706">event_available</mat-icon>
            <span class="text-sm font-semibold" style="color:var(--text-primary)">Attestation de présence</span>
            <span class="text-xs" style="color:var(--text-muted)">Assiduité aux cours</span>
          </button>
          @for (bulletin of mockBulletins; track bulletin.periode) {
            <button (click)="printReleve(bulletin.periode)"
                    class="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-opacity hover:opacity-80"
                    style="background:var(--surface-2);border:1px solid var(--border-color)">
              <mat-icon style="color:#2563eb">summarize</mat-icon>
              <span class="text-sm font-semibold" style="color:var(--text-primary)">Relevé de notes</span>
              <span class="text-xs" style="color:var(--text-muted)">{{ bulletin.periode }}</span>
            </button>
          }
        </div>
      </div>

      @if (store.loading()) {
        <sms-skeleton-document [count]="5" />
      } @else if (store.documents().length === 0) {
        <div class="sms-card">
          <sms-empty-state type="documents" actionLabel="Ajouter un document" />
        </div>
      } @else {
        <div class="sms-card overflow-hidden">
          <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color:var(--border-color)">
            <h3 class="font-semibold flex items-center gap-2" style="color:var(--text-primary)">
              <mat-icon style="font-size:18px;height:18px;width:18px;color:#6366f1">folder_open</mat-icon>
              Documents du dossier
            </h3>
            <div class="flex items-center gap-3 text-xs">
              <span class="flex items-center gap-1" style="color:#16a34a">
                <mat-icon style="font-size:13px;height:13px;width:13px">check_circle</mat-icon>
                {{ docsFournis() }} fourni(s)
              </span>
              <span style="color:var(--text-muted)">·</span>
              <span class="flex items-center gap-1" style="color:#ef4444">
                <mat-icon style="font-size:13px;height:13px;width:13px">cancel</mat-icon>
                {{ docsManquants() }} manquant(s)
              </span>
              <!-- Taux de complétude -->
              <div class="flex items-center gap-1.5 ml-2">
                <div class="w-20 rounded-full h-1.5" style="background:var(--border-color)">
                  <div class="h-1.5 rounded-full"
                       [style.background]="docsManquants() > 0 ? '#d97706' : '#16a34a'"
                       [style.width.%]="store.documents().length > 0 ? (docsFournis() / store.documents().length) * 100 : 0">
                  </div>
                </div>
                <span style="color:var(--text-muted)">
                  {{ store.documents().length > 0 ? ((docsFournis() / store.documents().length) * 100 | number:'1.0-0') : 0 }}%
                </span>
              </div>
            </div>
          </div>
          <div class="divide-y" style="border-color:var(--border-color)">
            @for (doc of store.documents(); track doc.id) {
              <div class="px-5 py-4 flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     [style.background]="doc.provided ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.08)'">
                  <mat-icon [style.color]="doc.provided ? '#16a34a' : '#ef4444'"
                            style="font-size:20px;height:20px;width:20px">
                    {{ doc.provided ? 'task' : 'upload_file' }}
                  </mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ doc.label }}</p>
                  <p class="text-xs mt-0.5" style="color:var(--text-muted)">
                    {{ doc.required ? '• Obligatoire' : '• Optionnel' }}
                    @if (doc.dateDepot) { · Déposé le {{ doc.dateDepot | date:'dd/MM/yyyy' }} }
                  </p>
                </div>
                <span class="px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
                      [style.background]="doc.provided ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.08)'"
                      [style.color]="doc.provided ? '#16a34a' : '#ef4444'">
                  {{ doc.provided ? 'Fourni' : 'Manquant' }}
                </span>
              </div>
            }
          </div>
        </div>
      }
    }

  } @else {
    <!-- Étudiant non trouvé -->
    <div class="sms-card">
      <sms-empty-state type="notfound"
        title="Étudiant non trouvé"
        description="Ce dossier n'existe pas ou a été supprimé."
        actionLabel="Retour à la liste"
        actionLink="/students" />
    </div>
  }
  }

</div>

<!-- ══════════════════════════════════════════════════════════════════
     DIALOG : Changement de classe
══════════════════════════════════════════════════════════════════ -->
@if (showChangeClasseDialog()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
       style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px)">
    <div class="sms-card w-full max-w-md overflow-hidden">
      <div class="px-6 py-5 border-b flex items-center gap-3" style="border-color:var(--border-color)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center"
             style="background:rgba(217,119,6,0.1)">
          <mat-icon style="color:#d97706;font-size:20px;height:20px;width:20px">swap_horiz</mat-icon>
        </div>
        <div>
          <h3 class="font-bold" style="color:var(--text-primary)">Changer de classe</h3>
          <p class="text-sm" style="color:var(--text-secondary)">
            Actuelle : <strong>{{ store.selectedStudent()?.classeLibelle || '—' }}</strong>
          </p>
        </div>
        <button (click)="showChangeClasseDialog.set(false)" class="ml-auto p-1.5 rounded-lg hover:opacity-70"
                style="color:var(--text-muted);background:var(--surface-2)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>
      <div class="px-6 py-5">
        <label class="block text-sm font-semibold mb-2" style="color:var(--text-primary)">
          Nouvelle classe <span style="color:#ef4444">*</span>
        </label>
        <select [(ngModel)]="selectedClasseId"
                class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
          <option value="">Sélectionner une classe</option>
          @for (entry of classeOptions; track entry.id) {
            <option [value]="entry.id">{{ entry.libelle }} — {{ entry.niveau }}</option>
          }
        </select>
        @if (changeClasseTouched() && !selectedClasseId) {
          <p class="text-xs mt-1.5 flex items-center gap-1" style="color:#ef4444">
            <mat-icon style="font-size:13px;height:13px;width:13px">error_outline</mat-icon>
            Veuillez sélectionner une classe
          </p>
        }
      </div>
      <div class="px-6 py-4 border-t flex gap-3 justify-end" style="border-color:var(--border-color)">
        <button (click)="showChangeClasseDialog.set(false)"
                class="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
          Annuler
        </button>
        <button (click)="confirmChangeClasse()" [disabled]="store.saving()"
                class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style="background:#d97706">
          @if (store.saving()) {
            <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
          } @else {
            <mat-icon style="font-size:16px;height:16px;width:16px">swap_horiz</mat-icon>
          }
          {{ store.saving() ? 'Traitement…' : 'Confirmer le changement' }}
        </button>
      </div>
    </div>
  </div>
}

<!-- ══════════════════════════════════════════════════════════════════
     DIALOG : Annulation d'inscription
══════════════════════════════════════════════════════════════════ -->
@if (showCancelDialog()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
       style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px)">
    <div class="sms-card w-full max-w-lg overflow-hidden">
      <div class="px-6 py-5 border-b flex items-center gap-3" style="border-color:var(--border-color)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center"
             style="background:rgba(239,68,68,0.1)">
          <mat-icon style="color:#dc2626;font-size:20px;height:20px;width:20px">cancel</mat-icon>
        </div>
        <div>
          <h3 class="font-bold" style="color:var(--text-primary)">Annuler l'inscription</h3>
          <p class="text-sm" style="color:var(--text-secondary)">
            {{ store.selectedStudent()?.firstName }} {{ store.selectedStudent()?.lastName }}
            — {{ store.selectedStudent()?.matricule }}
          </p>
        </div>
      </div>
      <div class="px-6 py-5">
        <div class="flex items-start gap-3 mb-5 p-4 rounded-xl"
             style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25)">
          <mat-icon style="color:#d97706;flex-shrink:0;font-size:18px;height:18px;width:18px;margin-top:1px">warning</mat-icon>
          <div>
            <p class="text-sm font-semibold" style="color:#d97706">Attention</p>
            <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
              L'inscription sera annulée. L'élève ne sera plus scolarisé.
              Cette action peut être annulée via "Réactiver".
            </p>
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2" style="color:var(--text-primary)">
            Motif de l'annulation <span style="color:#ef4444">*</span>
          </label>
          <textarea [(ngModel)]="cancelMotif" rows="4"
                    placeholder="Précisez la raison de l'annulation (déménagement, abandon, erreur, etc.)"
                    class="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                    style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </textarea>
          @if (cancelMotifTouched() && !cancelMotif.trim()) {
            <p class="text-xs mt-1.5 flex items-center gap-1" style="color:#ef4444">
              <mat-icon style="font-size:13px;height:13px;width:13px">error_outline</mat-icon>
              Le motif est obligatoire
            </p>
          }
        </div>
      </div>
      <div class="px-6 py-4 border-t flex gap-3 justify-end" style="border-color:var(--border-color)">
        <button (click)="closeCancelDialog()"
                class="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
          Fermer
        </button>
        <button (click)="confirmCancel()" [disabled]="store.saving()"
                class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style="background:#dc2626">
          @if (store.saving()) {
            <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
          } @else {
            <mat-icon style="font-size:16px;height:16px;width:16px">cancel</mat-icon>
          }
          {{ store.saving() ? 'Traitement…' : "Confirmer l'annulation" }}
        </button>
      </div>
    </div>
  </div>
}

<!-- ════ DIALOG : Carte virtuelle (ISO ID-1) ════ -->
@if (showCard() && studentCard(); as card) {
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-4 sms-no-print"
       style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px)" (click)="showCard.set(false)">
    <div (click)="$event.stopPropagation()" class="flex flex-col items-center gap-3">
      <sms-eleve-carte [card]="card" />
      <button (click)="showCard.set(false)"
              class="sms-no-print px-4 py-2 rounded-lg text-sm font-semibold"
              style="background:var(--surface-1);color:var(--text-primary);border:1px solid var(--border-color)">
        Fermer
      </button>
    </div>
  </div>
}
  `,
})
export class StudentDetailComponent implements OnInit, OnDestroy {
  protected readonly store  = inject(StudentsStore);
  private  readonly route   = inject(ActivatedRoute);
  private  readonly docSvc  = inject(DocumentService);
  private  readonly authStore = inject(AuthStore);

  // ── UI state ──────────────────────────────────────────────────────────────
  protected readonly activeTab              = signal<Tab>('infos');
  protected readonly menuOpen               = signal(false);
  protected readonly showCard               = signal(false);

  /** Carte virtuelle (ISO ID-1) construite depuis l'élève + le contexte d'espace. */
  protected readonly studentCard = computed<IStudentCard | null>(() => {
    const s = this.store.selectedStudent();
    if (!s) return null;
    return {
      matricule:        s.matricule,
      nom:              s.lastName,
      prenom:           s.firstName,
      photoUrl:         s.photoUrl ?? null,
      etablissementNom: 'KalanBlonw',
      workspaceType:    this.authStore.workspaceType(),
      groupeLibelle:    s.classeLibelle ?? s.filiereLibelle ?? null,
      anneeAcademique:  this.store.historique()[0]?.anneeAcademique ?? null,
      dateEmission:     new Date().toLocaleDateString('fr-FR'),
    };
  });
  protected readonly showCancelDialog       = signal(false);
  protected readonly cancelMotifTouched     = signal(false);
  protected readonly showChangeClasseDialog = signal(false);
  protected readonly changeClasseTouched    = signal(false);
  protected readonly absenceTypeFilter      = signal<'TOUS' | 'ABSENCE' | 'RETARD'>('TOUS');
  protected cancelMotif    = '';
  protected selectedClasseId = '';

  // ── Reference data ────────────────────────────────────────────────────────
  protected readonly classeOptions = Object.entries(CLASSES_MAP).map(([id, v]) => ({
    id, libelle: v.libelle, niveau: v.niveau, filiere: v.filiere,
  }));
  protected readonly absenceFilters: { value: 'TOUS' | 'ABSENCE' | 'RETARD'; label: string }[] = [
    { value: 'TOUS',    label: 'Tous'     },
    { value: 'ABSENCE', label: 'Absences' },
    { value: 'RETARD',  label: 'Retards'  },
  ];

  // ── Mock data (typed) ─────────────────────────────────────────────────────
  protected readonly mockNotes: MockNote[] = [
    { matiere: 'Mathématiques',  valeur: 15.5, coeff: 5, date: '15/05/2026' },
    { matiere: 'Français',       valeur: 12.0, coeff: 4, date: '12/05/2026' },
    { matiere: 'Anglais',        valeur: 14.5, coeff: 3, date: '10/05/2026' },
    { matiere: 'Physique-Chimie',valeur:  9.5, coeff: 4, date: '08/05/2026' },
    { matiere: 'SVT',            valeur: 16.0, coeff: 3, date: '05/05/2026' },
    { matiere: "Histoire-Géo",   valeur: 11.5, coeff: 3, date: '03/05/2026' },
  ];

  protected readonly mockFactures: MockFacture[] = [
    { numero: 'FACT-2025-0123', montant: 350_000, paye: 350_000, statut: 'PAYEE',      echeance: '31/01/2026', typeFrais: 'Scolarité — 1er Semestre', dateEmission: '02/01/2026' },
    { numero: 'FACT-2025-0247', montant: 350_000, paye: 175_000, statut: 'EN_ATTENTE', echeance: '30/04/2026', typeFrais: 'Scolarité — 2ème Semestre', dateEmission: '01/04/2026' },
    { numero: 'FACT-2025-0389', montant:  50_000, paye:       0, statut: 'EN_ATTENTE', echeance: '30/06/2026', typeFrais: 'Frais d\'examen',           dateEmission: '01/06/2026' },
  ];

  protected readonly mockAbsences: MockAbsence[] = [
    { date: '20/05/2026', matiere: 'Mathématiques', type: 'ABSENCE', justifie: false, motif: null              },
    { date: '18/05/2026', matiere: 'Anglais',        type: 'RETARD',  justifie: true,  motif: 'Transport'       },
    { date: '15/05/2026', matiere: 'Anglais',        type: 'ABSENCE', justifie: true,  motif: 'Rendez-vous médical' },
    { date: '12/05/2026', matiere: "Histoire-Géo",   type: 'RETARD',  justifie: false, motif: null              },
    { date: '10/05/2026', matiere: 'Physique',        type: 'ABSENCE', justifie: false, motif: null              },
    { date: '06/05/2026', matiere: 'Mathématiques',  type: 'RETARD',  justifie: true,  motif: 'Embouteillage'   },
    { date: '03/05/2026', matiere: 'SVT',             type: 'ABSENCE', justifie: true,  motif: 'Maladie'         },
    { date: '28/04/2026', matiere: 'Français',        type: 'ABSENCE', justifie: false, motif: null              },
  ];

  protected readonly mockBulletins: MockBulletin[] = [
    {
      periode: '1er Semestre 2025-2026', moyenne: 13.4, rang: 5, effectif: 32, mention: 'Assez Bien',
      notes: [
        { matiere: 'Mathématiques',  coeff: 5, valeur: 15.5, moyenneClasse: 12.8, appreciation: 'Excellent travail'           },
        { matiere: 'Français',       coeff: 4, valeur: 12.0, moyenneClasse: 11.5, appreciation: 'Satisfaisant'                },
        { matiere: 'Anglais',        coeff: 3, valeur: 14.5, moyenneClasse: 13.2, appreciation: 'Très bien'                   },
        { matiere: 'Physique-Chimie',coeff: 4, valeur:  9.5, moyenneClasse: 10.1, appreciation: 'Des efforts sont nécessaires' },
        { matiere: 'SVT',            coeff: 3, valeur: 16.0, moyenneClasse: 12.9, appreciation: 'Remarquable'                 },
        { matiere: "Histoire-Géo",   coeff: 3, valeur: 11.5, moyenneClasse: 11.0, appreciation: 'Correct'                    },
      ],
    },
    {
      periode: '2ème Semestre 2024-2025', moyenne: 14.1, rang: 3, effectif: 32, mention: 'Bien',
      notes: [
        { matiere: 'Mathématiques',  coeff: 5, valeur: 16.0, moyenneClasse: 12.5, appreciation: 'Très bon travail'  },
        { matiere: 'Français',       coeff: 4, valeur: 13.5, moyenneClasse: 11.8, appreciation: 'Bien'              },
        { matiere: 'Anglais',        coeff: 3, valeur: 15.0, moyenneClasse: 13.0, appreciation: 'Excellent'         },
        { matiere: 'Physique-Chimie',coeff: 4, valeur: 11.0, moyenneClasse: 10.5, appreciation: 'Acceptable'        },
        { matiere: 'SVT',            coeff: 3, valeur: 16.5, moyenneClasse: 13.1, appreciation: 'Brillant'          },
        { matiere: "Histoire-Géo",   coeff: 3, valeur: 12.0, moyenneClasse: 11.2, appreciation: "Peut mieux faire"  },
      ],
    },
  ];

  // ── Computed — Notes ───────────────────────────────────────────────────────
  protected readonly totalCoeff       = computed(() => this.mockNotes.reduce((s, n) => s + n.coeff, 0));
  protected readonly totalPoints      = computed(() => this.mockNotes.reduce((s, n) => s + n.valeur * n.coeff, 0));
  protected readonly moyennePond      = computed(() => this.totalCoeff() > 0 ? this.totalPoints() / this.totalCoeff() : 0);
  protected readonly notesValidees    = computed(() => this.mockNotes.filter(n => n.valeur >= 10).length);
  protected readonly notesInsuffisantes = computed(() => this.mockNotes.filter(n => n.valeur < 10).length);
  protected readonly dernierBulletin  = computed(() => this.mockBulletins[0] ?? null);

  // ── Computed — Factures ────────────────────────────────────────────────────
  protected readonly totalFact        = computed(() => this.mockFactures.reduce((s, f) => s + f.montant, 0));
  protected readonly totalPayeFact    = computed(() => this.mockFactures.reduce((s, f) => s + f.paye, 0));
  protected readonly soldeFact        = computed(() => this.totalFact() - this.totalPayeFact());
  protected readonly tauxRecouvrement = computed(() =>
    this.totalFact() > 0 ? Math.round((this.totalPayeFact() / this.totalFact()) * 100) : 0
  );

  // ── Computed — Absences ────────────────────────────────────────────────────
  protected readonly absenceCount    = computed(() => this.mockAbsences.filter(a => a.type === 'ABSENCE').length);
  protected readonly retardCount     = computed(() => this.mockAbsences.filter(a => a.type === 'RETARD').length);
  protected readonly nonJustifieCount= computed(() => this.mockAbsences.filter(a => !a.justifie).length);
  protected readonly justifieCount   = computed(() => this.mockAbsences.filter(a => a.justifie).length);
  protected readonly totalAbsences   = computed(() => this.mockAbsences.length);

  protected readonly filteredAbsences = computed(() => {
    const f = this.absenceTypeFilter();
    if (f === 'TOUS') return this.mockAbsences;
    return this.mockAbsences.filter(a => a.type === f);
  });

  // ── Tabs ──────────────────────────────────────────────────────────────────
  protected readonly tabs = computed(() => [
    { key: 'infos'      as Tab, label: 'Infos',       icon: 'person',        badge: 0 },
    { key: 'notes'      as Tab, label: 'Notes',        icon: 'grade',         badge: this.notesInsuffisantes() },
    { key: 'bulletins'  as Tab, label: 'Bulletins',    icon: 'description',   badge: 0 },
    { key: 'factures'   as Tab, label: 'Facturation',  icon: 'receipt_long',  badge: this.mockFactures.filter(f => f.statut !== 'PAYEE').length },
    { key: 'absences'   as Tab, label: 'Absences',     icon: 'event_busy',    badge: this.nonJustifieCount() },
    { key: 'historique' as Tab, label: 'Historique',   icon: 'history_edu',   badge: this.store.historique().length },
    { key: 'audit'      as Tab, label: 'Audit',        icon: 'manage_search', badge: this.store.audit().length },
    { key: 'documents'  as Tab, label: 'Documents',    icon: 'folder_open',   badge: this.docsManquants() },
  ]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.loadStudent(id);
    this.store.loadHistorique(id);
    this.store.loadAudit(id);
    this.store.loadDocuments(id);
  }

  ngOnDestroy(): void {
    this.store.clearSelected();
  }

  // ── Statut helpers ─────────────────────────────────────────────────────────
  protected statut(s: Pick<IStudent, 'statut'>) {
    return STATUT_CFG[s.statut] ?? { label: s.statut, bg: 'rgba(107,114,128,0.1)', color: '#6b7280', icon: 'circle' };
  }

  protected canCancel(statut: StudentStatut): boolean {
    return ['PRE_INSCRIT', 'INSCRIT', 'INSCRIPTION_VALIDEE', 'ACTIF', 'SUSPENDU'].includes(statut);
  }

  protected canReactivate(statut: StudentStatut): boolean {
    return ['INSCRIPTION_ANNULEE', 'SUSPENDU', 'INACTIF', 'ABANDONNE'].includes(statut);
  }

  protected canReinscrire(statut: StudentStatut): boolean {
    return ['DIPLOME', 'TRANSFERE', 'EXCLUS'].includes(statut);
  }

  protected toggleMenu(): void { this.menuOpen.set(!this.menuOpen()); }

  // ── Confirm change classe ──────────────────────────────────────────────────
  protected confirmChangeClasse(): void {
    this.changeClasseTouched.set(true);
    if (!this.selectedClasseId) return;
    const publicId = this.store.selectedStudent()?.publicId;
    if (!publicId) return;
    const classeInfo = CLASSES_MAP[this.selectedClasseId];
    this.store.updateStudent({
      publicId,
      data: {
        classePublicId: this.selectedClasseId,
        classeLibelle:  classeInfo?.libelle,
        niveauLibelle:  classeInfo?.niveau,
        filiereLibelle: classeInfo?.filiere,
      },
    });
    setTimeout(() => {
      this.store.loadHistorique(publicId);
      this.store.loadAudit(publicId);
      this.showChangeClasseDialog.set(false);
      this.selectedClasseId = '';
      this.changeClasseTouched.set(false);
    }, 400);
  }

  // ── Cancel dialog ──────────────────────────────────────────────────────────
  protected closeCancelDialog(): void {
    this.showCancelDialog.set(false);
    this.cancelMotif = '';
    this.cancelMotifTouched.set(false);
  }

  protected confirmCancel(): void {
    this.cancelMotifTouched.set(true);
    if (!this.cancelMotif.trim()) return;
    const publicId = this.store.selectedStudent()?.publicId;
    if (!publicId) return;
    this.store.cancelInscription({ publicId, motif: this.cancelMotif.trim() });
    setTimeout(() => {
      this.store.loadHistorique(publicId);
      this.store.loadAudit(publicId);
      this.closeCancelDialog();
    }, 400);
  }

  protected reactivate(publicId: string): void {
    this.store.reactiverInscription(publicId);
    setTimeout(() => {
      this.store.loadHistorique(publicId);
      this.store.loadAudit(publicId);
    }, 400);
  }

  // ── Document actions ───────────────────────────────────────────────────────
  protected exportPdf(s: IStudent): void { this.docSvc.printStudentProfile(s); }
  protected printCard(_s: IStudent): void { this.showCard.set(true); }

  protected downloadBulletin(periode: string): void {
    const s = this.store.selectedStudent();
    if (!s) return;
    const bulletin = this.mockBulletins.find(b => b.periode === periode) ?? this.mockBulletins[0];
    if (!bulletin) return;
    this.docSvc.printBulletin({
      student: s, periode: bulletin.periode, annee: '2025-2026',
      moyenne: bulletin.moyenne, rang: bulletin.rang,
      effectif: bulletin.effectif, mention: bulletin.mention,
      notes: bulletin.notes,
    });
  }

  protected printCertificat(): void {
    const s = this.store.selectedStudent();
    if (!s) return;
    this.docSvc.printCertificatScolarite(s);
  }

  protected printAttestationInscription(): void {
    const s = this.store.selectedStudent();
    if (!s) return;
    this.docSvc.printAttestation(s, 'inscription');
  }

  protected printAttestationPresence(): void {
    const s = this.store.selectedStudent();
    if (!s) return;
    this.docSvc.printAttestation(s, 'presence');
  }

  protected printReleve(periode: string): void {
    const s = this.store.selectedStudent();
    if (!s) return;
    const bulletin = this.mockBulletins.find(b => b.periode === periode) ?? this.mockBulletins[0];
    if (!bulletin) return;
    this.docSvc.printReleveNotes(s, bulletin.notes, bulletin.periode);
  }

  protected printRecu(f: MockFacture): void {
    const s = this.store.selectedStudent();
    if (!s) return;
    this.docSvc.printPaymentReceipt({
      numero: f.numero, student: s, montant: f.montant, paye: f.paye,
      solde: f.montant - f.paye, statut: f.statut, dateEmission: f.dateEmission,
      dateEcheance: f.echeance, typeFrais: f.typeFrais,
    });
  }

  // ── Info field builders ────────────────────────────────────────────────────
  protected personalFields(s: IStudent) {
    return [
      { label: 'Prénom',             value: s.firstName },
      { label: 'Nom',                value: s.lastName },
      { label: 'Date de naissance',  value: s.dateNaissance ? new Date(s.dateNaissance).toLocaleDateString('fr-FR') : '' },
      { label: 'Genre',              value: s.genre === 'M' ? 'Masculin' : 'Féminin' },
      { label: 'Lieu de naissance',  value: s.lieuNaissance ?? '' },
      { label: 'Nationalité',        value: s.nationalite ?? '' },
      { label: 'Adresse',            value: s.adresse ? `${s.adresse}, ${s.ville ?? ''}`.trim() : '' },
    ];
  }

  protected scolariteFields(s: IStudent) {
    return [
      { label: 'Matricule',        value: s.matricule },
      { label: 'Année académique', value: '2025–2026' },
      { label: 'Classe',           value: s.classeLibelle ?? s.classePublicId ?? '' },
      { label: 'Niveau',           value: s.niveauLibelle ?? '' },
      { label: 'Filière',          value: s.filiereLibelle ?? '' },
      { label: 'Inscrit le',       value: s.dateInscription ? new Date(s.dateInscription).toLocaleDateString('fr-FR') : '' },
    ];
  }

  // ── Audit helpers ──────────────────────────────────────────────────────────
  protected auditIcon(e:  IAuditEntry): string { return AUDIT_CFG[e.action]?.icon  ?? 'info'; }
  protected auditColor(e: IAuditEntry): string { return AUDIT_CFG[e.action]?.color ?? '#6b7280'; }
  protected auditBg(e:    IAuditEntry): string {
    const c = AUDIT_CFG[e.action]?.color ?? '#6b7280';
    return `${c}1a`;
  }
  protected auditLabel(e: IAuditEntry): string { return AUDIT_CFG[e.action]?.label ?? e.action; }

  // ── UI helpers ─────────────────────────────────────────────────────────────
  protected noteColor(v: number): string {
    return v >= 14 ? '#16a34a' : v >= 10 ? '#d97706' : '#dc2626';
  }

  protected fmtXof(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' M';
    return new Intl.NumberFormat('fr-FR').format(n) + ' XOF';
  }

  protected docsFournis():   number { return this.store.documents().filter(d => d.provided).length; }
  protected docsManquants(): number { return this.store.documents().filter(d => !d.provided && d.required).length; }
}
