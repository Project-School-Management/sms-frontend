import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

type WizardStep = 1 | 2 | 3;

interface ITargetGroup {
  id: string;
  label: string;
  count: number;
  selected: boolean;
}

@Component({
  selector: 'sms-broadcast-compose',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatIconModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold" style="color: var(--text-primary)">Nouvelle diffusion</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Étape {{ currentStep() }} sur 3</p>
        </div>
        <a routerLink="/communication/broadcast"
           class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--text-secondary)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
          Retour
        </a>
      </div>

      <!-- Stepper -->
      <div class="flex items-center mb-8">
        @for (step of stepNumbers; track step) {
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                 [style.background]="currentStep() >= step ? 'var(--accent)' : 'var(--surface-2)'"
                 [style.color]="currentStep() >= step ? '#fff' : 'var(--text-muted)'"
                 [style.border]="currentStep() >= step ? 'none' : '2px solid var(--border-color)'">
              @if (currentStep() > step) {
                <mat-icon style="font-size: 16px; height: 16px; width: 16px">check</mat-icon>
              } @else {
                {{ step }}
              }
            </div>
            <span class="ml-2 text-xs font-medium hidden sm:block"
                  [style.color]="currentStep() === step ? 'var(--text-primary)' : 'var(--text-muted)'">
              {{ stepLabels[step - 1] }}
            </span>
          </div>
          @if (step < 3) {
            <div class="flex-1 h-0.5 mx-3"
                 [style.background]="currentStep() > step ? 'var(--accent)' : 'var(--border-color)'"></div>
          }
        }
      </div>

      <!-- ÉTAPE 1 : Destinataires -->
      @if (currentStep() === 1) {
        <div class="sms-card p-6">
          <h2 class="font-semibold mb-4 flex items-center gap-2" style="color: var(--text-primary)">
            <mat-icon style="color: var(--accent)">people</mat-icon>
            Sélectionner les destinataires
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (group of targetGroups(); track group.id) {
              <label class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                     [style.border-color]="group.selected ? 'var(--accent)' : 'var(--border-color)'"
                     [style.background]="group.selected ? 'var(--accent-light)' : 'var(--surface-2)'">
                <input type="checkbox" [checked]="group.selected"
                  (change)="toggleGroup(group.id)"
                  class="w-4 h-4" />
                <div class="flex-1">
                  <p class="text-sm font-medium" style="color: var(--text-primary)">{{ group.label }}</p>
                  <p class="text-xs" style="color: var(--text-secondary)">{{ group.count }} personnes</p>
                </div>
              </label>
            }
          </div>

          <!-- Count -->
          <div class="mt-5 p-3 rounded-xl flex items-center gap-2"
               style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent); font-size: 18px; height: 18px; width: 18px">people</mat-icon>
            <p class="text-sm font-semibold" style="color: var(--accent)">
              {{ totalSelected() }} destinataire(s) sélectionné(s)
            </p>
          </div>
        </div>
      }

      <!-- ÉTAPE 2 : Message -->
      @if (currentStep() === 2) {
        <form [formGroup]="msgForm" class="sms-card p-6 flex flex-col gap-4">
          <h2 class="font-semibold flex items-center gap-2" style="color: var(--text-primary)">
            <mat-icon style="color: var(--accent)">edit</mat-icon>
            Rédiger le message
          </h2>

          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Objet *</label>
            <input formControlName="subject" type="text" placeholder="Objet de la diffusion..."
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Corps du message *</label>
            <textarea formControlName="body" rows="8"
              placeholder="Rédigez votre message ici..."
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none"
              style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
            </textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Pièce jointe (optionnel)</label>
            <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed"
                 style="border-color: var(--border-color); background: var(--surface-2)">
              <mat-icon style="color: var(--text-muted); font-size: 20px; height: 20px; width: 20px">attach_file</mat-icon>
              <p class="text-sm" style="color: var(--text-muted)">Glissez un fichier ou cliquez pour parcourir</p>
            </div>
          </div>
        </form>
      }

      <!-- ÉTAPE 3 : Planification & Confirmation -->
      @if (currentStep() === 3) {
        <div class="sms-card p-6 flex flex-col gap-5">
          <h2 class="font-semibold flex items-center gap-2" style="color: var(--text-primary)">
            <mat-icon style="color: var(--accent)">schedule</mat-icon>
            Planification & Confirmation
          </h2>

          <!-- Send mode -->
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sendMode" value="now" [checked]="sendNow()" (change)="sendNow.set(true)" class="w-4 h-4" />
              <span class="text-sm" style="color: var(--text-primary)">Envoyer maintenant</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sendMode" value="schedule" [checked]="!sendNow()" (change)="sendNow.set(false)" class="w-4 h-4" />
              <span class="text-sm" style="color: var(--text-primary)">Planifier</span>
            </label>
          </div>

          @if (!sendNow()) {
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Date</label>
                <input type="date" [(ngModel)]="scheduleDate"
                  class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                  style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Heure</label>
                <input type="time" [(ngModel)]="scheduleTime"
                  class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                  style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)" />
              </div>
            </div>
          }

          <!-- Summary -->
          <div class="rounded-xl p-4 flex flex-col gap-3" style="background: var(--surface-2); border: 1px solid var(--border-color)">
            <p class="text-sm font-semibold" style="color: var(--text-primary)">Résumé</p>
            <div class="flex flex-col gap-2 text-sm">
              <div class="flex justify-between">
                <span style="color: var(--text-secondary)">Destinataires :</span>
                <span class="font-medium" style="color: var(--text-primary)">{{ totalSelected() }} personnes</span>
              </div>
              <div class="flex justify-between">
                <span style="color: var(--text-secondary)">Objet :</span>
                <span class="font-medium truncate max-w-xs" style="color: var(--text-primary)">
                  {{ msgForm.value.subject || '—' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span style="color: var(--text-secondary)">Envoi :</span>
                <span class="font-medium" style="color: var(--text-primary)">
                  {{ sendNow() ? 'Immédiat' : (scheduleDate + ' à ' + scheduleTime) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Navigation -->
      <div class="flex items-center gap-3 mt-6">
        @if (currentStep() > 1) {
          <button (click)="prevStep()"
            class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm border hover:opacity-80"
            style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
            Précédent
          </button>
        }

        @if (currentStep() < 3) {
          <button (click)="nextStep()" [disabled]="!canNext()"
            class="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 hover:opacity-90"
            style="background: var(--accent)">
            Suivant
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_forward</mat-icon>
          </button>
        }

        @if (currentStep() === 3) {
          <button (click)="send()" [disabled]="sending()"
            class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 hover:opacity-90"
            style="background: var(--accent)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">
              {{ sending() ? 'hourglass_empty' : 'send' }}
            </mat-icon>
            {{ sending() ? 'Envoi en cours...' : 'Envoyer la diffusion' }}
          </button>
        }
      </div>
    </div>
  `,
})
export class BroadcastComposeComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly currentStep = signal<WizardStep>(1);
  readonly sending = signal(false);
  readonly sendNow = signal(true);
  scheduleDate = '';
  scheduleTime = '';

  readonly stepNumbers: WizardStep[] = [1, 2, 3];
  readonly stepLabels = ['Destinataires', 'Message', 'Planification'];

  readonly targetGroups = signal<ITargetGroup[]>([
    { id: 'all-students',  label: 'Tous les étudiants',       count: 347, selected: false },
    { id: 'all-parents',   label: 'Tous les parents',          count: 312, selected: false },
    { id: 'all-teachers',  label: 'Tous les enseignants',      count: 34,  selected: false },
    { id: 'all-admins',    label: 'Tous les administrateurs',  count: 8,   selected: false },
    { id: 'class-l3-gl',   label: 'Classe L3 GL',              count: 62,  selected: false },
    { id: 'class-l2',      label: 'Classe L2 Gestion',         count: 54,  selected: false },
    { id: 'class-m1',      label: 'Master 1 RI',               count: 38,  selected: false },
  ]);

  readonly totalSelected = computed(() =>
    this.targetGroups()
      .filter(g => g.selected)
      .reduce((acc, g) => acc + g.count, 0)
  );

  msgForm = this.fb.group({
    subject: ['', Validators.required],
    body:    ['', Validators.required],
  });

  toggleGroup(id: string): void {
    this.targetGroups.update(groups =>
      groups.map(g => g.id === id ? { ...g, selected: !g.selected } : g)
    );
  }

  canNext(): boolean {
    if (this.currentStep() === 1) return this.totalSelected() > 0;
    if (this.currentStep() === 2) return this.msgForm.valid;
    return true;
  }

  nextStep(): void {
    if (this.currentStep() < 3 && this.canNext()) {
      this.currentStep.update(s => (s + 1) as WizardStep);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => (s - 1) as WizardStep);
    }
  }

  send(): void {
    this.sending.set(true);
    setTimeout(() => {
      this.sending.set(false);
      this.router.navigate(['/communication/broadcast']);
    }, 1200);
  }
}
