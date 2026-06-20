import {
  ChangeDetectionStrategy, Component, inject, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import { ToastService } from '@sms/shared/ui';

@Component({
  selector:        'sms-session-virtuelle-editor',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6 max-w-2xl mx-auto">

  <!-- ── Navigation ──────────────────────────────────────────────────────── -->
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/learning/sessions"
       class="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80"
       style="color:var(--text-secondary)">
      <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
      Sessions virtuelles
    </a>
    <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">chevron_right</mat-icon>
    <span class="text-sm font-semibold" style="color:var(--text-primary)">Planifier une session</span>
  </div>

  <!-- ── Formulaire ──────────────────────────────────────────────────────── -->
  <div class="sms-card p-6 flex flex-col gap-5">

    <div class="flex items-center gap-3 mb-1">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:var(--accent-light)">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">videocam</mat-icon>
      </div>
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Nouvelle session virtuelle</h2>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold" style="color:var(--text-secondary)">Titre de la session *</label>
      <input [(ngModel)]="titre" placeholder="ex : Révision — Chapitre 3 : Récursivité"
             class="px-3 py-2.5 rounded-xl border text-sm outline-none"
             style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold" style="color:var(--text-secondary)">Cours associé *</label>
        <select [(ngModel)]="coursPublicId" (ngModelChange)="onCoursChange($event)"
                class="px-3 py-2.5 rounded-xl border text-sm outline-none"
                style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          <option value="">— Sélectionner —</option>
          @for (c of store.cours(); track c.publicId) {
            <option [value]="c.publicId">{{ c.titre }}</option>
          }
        </select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold" style="color:var(--text-secondary)">Enseignant *</label>
        <input [(ngModel)]="enseignant" placeholder="ex : M. Koné"
               class="px-3 py-2.5 rounded-xl border text-sm outline-none"
               style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date *</label>
        <input [(ngModel)]="date" type="date"
               class="px-3 py-2.5 rounded-xl border text-sm outline-none"
               style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold" style="color:var(--text-secondary)">Heure *</label>
        <input [(ngModel)]="heure" type="time"
               class="px-3 py-2.5 rounded-xl border text-sm outline-none"
               style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold" style="color:var(--text-secondary)">Durée (min) *</label>
        <input [(ngModel)]="dureeMinutes" type="number" min="15" max="300" step="15"
               class="px-3 py-2.5 rounded-xl border text-sm outline-none"
               style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold" style="color:var(--text-secondary)">Lien de participation (optionnel)</label>
      <div class="flex items-center gap-2">
        <mat-icon style="color:var(--text-muted);font-size:18px;height:18px;width:18px">link</mat-icon>
        <input [(ngModel)]="lienJoin" placeholder="https://meet.google.com/… ou autre"
               class="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none"
               style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      </div>
    </div>

    <!-- Info statut -->
    <div class="flex items-center gap-3 p-4 rounded-xl"
         style="background:rgba(37,99,235,0.07);border:1px solid rgba(37,99,235,0.15)">
      <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">event</mat-icon>
      <p class="text-sm" style="color:var(--text-secondary)">
        La session sera planifiée et passera automatiquement
        <strong style="color:var(--accent)">En direct</strong> à la date et heure définie.
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between pt-2">
      <a routerLink="/learning/sessions"
         class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80"
         style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
        Annuler
      </a>
      <button (click)="submit()"
              [disabled]="!canSubmit() || store.saving()"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              style="background:var(--accent)">
        @if (store.saving()) {
          <mat-icon class="animate-spin" style="font-size:18px;height:18px;width:18px">refresh</mat-icon>
          Enregistrement…
        } @else {
          <mat-icon style="font-size:18px;height:18px;width:18px">check</mat-icon>
          Planifier la session
        }
      </button>
    </div>
  </div>

</div>
  `,
})
export class SessionVirtuelleEditorComponent implements OnInit {
  readonly store = inject(LearningStore);
  private router = inject(Router);
  private toast  = inject(ToastService);

  titre         = '';
  coursPublicId = '';
  coursLibelle  = '';
  enseignant    = '';
  date          = '';
  heure         = '';
  dureeMinutes  = 60;
  lienJoin      = '';

  ngOnInit(): void {
    this.store.loadCours({});
  }

  onCoursChange(id: string): void {
    this.coursPublicId = id;
    const c = this.store.cours().find(c => c.publicId === id);
    this.coursLibelle = c?.titre ?? '';
    if (c) this.enseignant = c.enseignantNom;
  }

  canSubmit(): boolean {
    return !!(this.titre.trim() && this.coursPublicId && this.enseignant.trim() && this.date && this.heure && this.dureeMinutes > 0);
  }

  submit(): void {
    this.store.createSessionVirt({
      titre:        this.titre.trim(),
      coursLibelle: this.coursLibelle,
      enseignant:   this.enseignant.trim(),
      date:         this.date,
      heure:        this.heure,
      dureeMinutes: this.dureeMinutes,
      lienJoin:     this.lienJoin.trim() || undefined,
    });
    this.toast.success('Session virtuelle planifiée');
    this.router.navigate(['/learning/sessions']);
  }
}
