import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import { ToastService } from '@sms/shared/ui';
import { IDevoir } from '@sms/shared/models';

type Step = 1 | 2;

@Component({
  selector:        'sms-devoir-editor',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6 max-w-3xl mx-auto">

  <!-- ── Navigation ──────────────────────────────────────────────────────── -->
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/learning/devoirs"
       class="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80"
       style="color:var(--text-secondary)">
      <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
      Devoirs
    </a>
    <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">chevron_right</mat-icon>
    <span class="text-sm font-semibold" style="color:var(--text-primary)">
      {{ isEdit() ? 'Modifier le devoir' : 'Nouveau devoir' }}
    </span>
  </div>

  <!-- ── Indicateur d'étapes ──────────────────────────────────────────────── -->
  <div class="flex items-center gap-3 mb-7">
    @for (s of steps; track s.n) {
      <div class="flex items-center gap-2" [class.opacity-40]="step() > s.n && step() !== s.n">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
             [style.background]="step() === s.n ? 'var(--accent)' : step() > s.n ? '#16a34a' : 'var(--surface-2)'"
             [style.color]="step() >= s.n ? '#fff' : 'var(--text-muted)'">
          @if (step() > s.n) {
            <mat-icon style="font-size:16px;height:16px;width:16px">check</mat-icon>
          } @else {
            {{ s.n }}
          }
        </div>
        <span class="text-sm font-semibold hidden sm:block"
              [style.color]="step() === s.n ? 'var(--text-primary)' : 'var(--text-muted)'">
          {{ s.label }}
        </span>
      </div>
      @if (!$last) {
        <div class="flex-1 h-px" style="background:var(--border-color)"></div>
      }
    }
  </div>

  <!-- ════ ÉTAPE 1 — Informations générales ════════════════════════════════ -->
  @if (step() === 1) {
    <div class="sms-card p-6 flex flex-col gap-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Informations générales</h2>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold" style="color:var(--text-secondary)">Titre *</label>
        <input [(ngModel)]="titre" placeholder="ex : TP noté — Algorithmes de tri"
               class="px-3 py-2.5 rounded-xl border text-sm outline-none"
               style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold" style="color:var(--text-secondary)">Description</label>
        <textarea [(ngModel)]="description" rows="4"
                  placeholder="Consignes, objectifs, attendus…"
                  class="px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)"></textarea>
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
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Barème (points) *</label>
          <input [(ngModel)]="bareme" type="number" min="1" max="100" placeholder="20"
                 class="px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date de début *</label>
          <input [(ngModel)]="dateDebut" type="date"
                 class="px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date limite *</label>
          <input [(ngModel)]="dateLimite" type="date"
                 class="px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold" style="color:var(--text-secondary)">Pièce jointe (nom du fichier)</label>
        <div class="flex items-center gap-2">
          <mat-icon style="color:var(--text-muted);font-size:18px;height:18px;width:18px">attach_file</mat-icon>
          <input [(ngModel)]="pieceJointe" placeholder="ex : enonce-tp1.pdf"
                 class="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <p class="text-xs" style="color:var(--text-muted)">Nom du fichier de l'énoncé à distribuer aux étudiants</p>
      </div>

      <div class="flex justify-end pt-2">
        <button (click)="nextStep()"
                [disabled]="!canNextStep1()"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                style="background:var(--accent)">
          Suivant
          <mat-icon style="font-size:18px;height:18px;width:18px">arrow_forward</mat-icon>
        </button>
      </div>
    </div>
  }

  <!-- ════ ÉTAPE 2 — Récapitulatif ═════════════════════════════════════════ -->
  @if (step() === 2) {
    <div class="sms-card p-6 flex flex-col gap-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Récapitulatif</h2>

      <div class="rounded-2xl p-5 flex flex-col gap-4"
           style="background:var(--surface-2);border:1px solid var(--border-color)">

        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
               style="background:var(--accent-light)">
            <mat-icon style="color:var(--accent);font-size:24px;height:24px;width:24px">assignment</mat-icon>
          </div>
          <div>
            <h3 class="font-bold text-lg" style="color:var(--text-primary)">{{ titre }}</h3>
            <p class="text-sm mt-1" style="color:var(--text-secondary)">{{ description || 'Aucune description' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-semibold" style="color:var(--text-muted)">Cours</span>
            <span class="text-sm font-medium" style="color:var(--text-primary)">{{ coursLibelle() || '—' }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-semibold" style="color:var(--text-muted)">Barème</span>
            <span class="text-sm font-medium" style="color:var(--text-primary)">{{ bareme }} points</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-semibold" style="color:var(--text-muted)">Date de début</span>
            <span class="text-sm font-medium" style="color:var(--text-primary)">{{ dateDebut }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-semibold" style="color:var(--text-muted)">Date limite</span>
            <span class="text-sm font-medium" style="color:var(--text-primary)">{{ dateLimite }}</span>
          </div>
          @if (pieceJointe) {
            <div class="flex flex-col gap-0.5 col-span-2">
              <span class="text-xs font-semibold" style="color:var(--text-muted)">Pièce jointe</span>
              <span class="text-sm font-medium flex items-center gap-1" style="color:var(--text-primary)">
                <mat-icon style="font-size:14px;height:14px;width:14px">attach_file</mat-icon>
                {{ pieceJointe }}
              </span>
            </div>
          }
        </div>
      </div>

      <div class="flex items-center gap-3 p-4 rounded-xl"
           style="background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.2)">
        <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">lock_open</mat-icon>
        <p class="text-sm" style="color:var(--text-secondary)">
          Le devoir sera créé avec le statut <strong style="color:#16a34a">Ouvert</strong>
          — les étudiants pourront soumettre leurs travaux dès la date de début.
        </p>
      </div>

      <div class="flex items-center justify-between pt-2">
        <button (click)="step.set(1)"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
          <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
          Retour
        </button>
        <button (click)="submit()"
                [disabled]="store.saving()"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-80 disabled:opacity-50"
                style="background:var(--accent)">
          @if (store.saving()) {
            <mat-icon class="animate-spin" style="font-size:18px;height:18px;width:18px">refresh</mat-icon>
            Enregistrement…
          } @else {
            <mat-icon style="font-size:18px;height:18px;width:18px">check</mat-icon>
            {{ isEdit() ? 'Enregistrer' : 'Créer le devoir' }}
          }
        </button>
      </div>
    </div>
  }

</div>
  `,
})
export class DevoirEditorComponent implements OnInit {
  readonly store   = inject(LearningStore);
  private router   = inject(Router);
  private route    = inject(ActivatedRoute);
  private toast    = inject(ToastService);

  step = signal<Step>(1);

  readonly steps = [
    { n: 1 as Step, label: 'Informations' },
    { n: 2 as Step, label: 'Récapitulatif' },
  ];

  titre         = '';
  description   = '';
  coursPublicId = '';
  bareme        = 20;
  dateDebut     = '';
  dateLimite    = '';
  pieceJointe   = '';

  isEdit = signal(false);
  editId = signal<string | null>(null);

  ngOnInit(): void {
    this.store.loadCours({});
    const id = this.route.snapshot.paramMap.get('publicId');
    if (id) {
      this.isEdit.set(true);
      this.editId.set(id);
      this.store.selectDevoir(id);
      const d = this.store.selectedDevoir();
      if (d) this.prefill(d);
    }
  }

  private prefill(d: IDevoir): void {
    this.titre         = d.titre;
    this.description   = d.description;
    this.coursPublicId = d.coursPublicId;
    this.bareme        = d.bareme;
    this.dateDebut     = d.dateDebut;
    this.dateLimite    = d.dateLimite;
    this.pieceJointe   = d.pieceJointe ?? '';
  }

  coursLibelle = computed(() => {
    const c = this.store.cours().find(c => c.publicId === this.coursPublicId);
    return c?.titre ?? '';
  });

  onCoursChange(id: string): void {
    this.coursPublicId = id;
  }

  canNextStep1(): boolean {
    return !!(this.titre.trim() && this.coursPublicId && this.bareme > 0 && this.dateDebut && this.dateLimite);
  }

  nextStep(): void {
    if (this.canNextStep1()) this.step.set(2);
  }

  submit(): void {
    const payload: Partial<IDevoir> = {
      titre:         this.titre.trim(),
      description:   this.description.trim(),
      coursPublicId: this.coursPublicId,
      coursLibelle:  this.coursLibelle(),
      bareme:        this.bareme,
      dateDebut:     this.dateDebut,
      dateLimite:    this.dateLimite,
      pieceJointe:   this.pieceJointe.trim() || undefined,
    };

    if (this.isEdit() && this.editId()) {
      this.store.updateDevoir({ ...payload, publicId: this.editId()! });
      this.toast.success('Devoir mis à jour avec succès');
    } else {
      this.store.createDevoir(payload);
      this.toast.success('Devoir créé avec succès');
    }
    this.router.navigate(['/learning/devoirs']);
  }
}
