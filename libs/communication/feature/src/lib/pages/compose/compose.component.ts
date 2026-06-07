import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

const CONTACT_SUGGESTIONS = [
  'Tous les étudiants',
  'Tous les parents',
  'Tous les enseignants',
  'Comité pédagogique',
  'Mamadou Koné',
  'Fatoumata Bah',
  'Ibrahim Coulibaly',
  'Aminata Traoré',
  'Seydou Diallo',
  'M. Ouédraogo',
];

@Component({
  selector: 'sms-compose',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold" style="color: var(--text-primary)">
            {{ isDraft() ? 'Reprendre le brouillon' : 'Nouveau message' }}
          </h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">
            {{ draftSaved() ? 'Brouillon sauvegardé automatiquement' : 'Composez votre message' }}
          </p>
        </div>
        <a routerLink="/communication/inbox"
           class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--text-secondary)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
          Retour
        </a>
      </div>

      <!-- Draft saved indicator -->
      @if (draftSaved()) {
        <div class="flex items-center gap-2 px-4 py-2 rounded-lg mb-4 text-sm"
             style="background: rgba(22,163,74,0.08); color: #16a34a">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">check_circle</mat-icon>
          Brouillon sauvegardé automatiquement
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="send()" class="sms-card p-6 flex flex-col gap-4">
        <!-- À -->
        <div>
          <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">À *</label>
          <div class="relative">
            <input formControlName="to" type="text" placeholder="Destinataire ou groupe..."
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)"
              (input)="filterSuggestions($event)"
              (focus)="showSuggestions.set(true)"
              (blur)="hideSuggestions()" />
            @if (showSuggestions() && filteredSuggestions().length > 0) {
              <div class="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border shadow-lg overflow-hidden"
                   style="background: var(--surface-1); border-color: var(--border-color)">
                @for (s of filteredSuggestions(); track s) {
                  <button type="button"
                    (mousedown)="selectSuggestion(s)"
                    class="w-full text-left px-3 py-2 text-sm hover:opacity-80 transition-opacity"
                    style="color: var(--text-primary)">
                    {{ s }}
                  </button>
                }
              </div>
            }
          </div>
          @if (isInvalid('to')) {
            <p class="text-xs mt-1" style="color: #dc2626">Le destinataire est requis</p>
          }
        </div>

        <!-- Cc -->
        <div>
          <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Cc (optionnel)</label>
          <input formControlName="cc" type="text" placeholder="Copie à..."
            class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)" />
        </div>

        <!-- Objet -->
        <div>
          <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Objet *</label>
          <input formControlName="subject" type="text" placeholder="Objet du message..."
            class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            [style.border-color]="isInvalid('subject') ? '#dc2626' : 'var(--border-color)'"
            style="background: var(--surface-2); color: var(--text-primary)" />
          @if (isInvalid('subject')) {
            <p class="text-xs mt-1" style="color: #dc2626">L'objet est requis</p>
          }
        </div>

        <!-- Corps -->
        <div>
          <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Message *</label>
          <textarea formControlName="body" rows="8"
            placeholder="Rédigez votre message ici..."
            class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none"
            [style.border-color]="isInvalid('body') ? '#dc2626' : 'var(--border-color)'"
            style="background: var(--surface-2); color: var(--text-primary)">
          </textarea>
          @if (isInvalid('body')) {
            <p class="text-xs mt-1" style="color: #dc2626">Le message est requis</p>
          }
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-2 border-t" style="border-color: var(--border-color)">
          <button type="submit" [disabled]="form.invalid || sending()"
            class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 hover:opacity-90"
            style="background: var(--accent)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">
              {{ sending() ? 'hourglass_empty' : 'send' }}
            </mat-icon>
            {{ sending() ? 'Envoi...' : 'Envoyer' }}
          </button>
          <button type="button" (click)="saveDraft()"
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border hover:opacity-80 transition-opacity"
            style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">save</mat-icon>
            Sauvegarder brouillon
          </button>
          <a routerLink="/communication/inbox"
             class="px-4 py-2.5 rounded-lg text-sm hover:opacity-80 transition-opacity ml-auto"
             style="color: var(--text-secondary)">
            Annuler
          </a>
        </div>
      </form>
    </div>
  `,
})
export class ComposeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly sending = signal(false);
  readonly draftSaved = signal(false);
  readonly showSuggestions = signal(false);
  readonly isDraft = signal(false);
  readonly filteredSuggestions = signal<string[]>([]);

  form = this.fb.group({
    to:      ['', Validators.required],
    cc:      [''],
    subject: ['', Validators.required],
    body:    ['', Validators.required],
  });

  ngOnInit(): void {
    const draftId = this.route.snapshot.queryParamMap.get('draft');
    if (draftId) {
      this.isDraft.set(true);
      this.form.patchValue({
        to: 'Tous les parents',
        subject: 'Réunion de parents — Trimestre 2',
        body: 'Chers parents, nous avons le plaisir de vous convier à la réunion...',
      });
    }
  }

  filterSuggestions(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredSuggestions.set(
      CONTACT_SUGGESTIONS.filter(s => s.toLowerCase().includes(val)).slice(0, 5)
    );
  }

  selectSuggestion(s: string): void {
    this.form.patchValue({ to: s });
    this.showSuggestions.set(false);
  }

  hideSuggestions(): void {
    setTimeout(() => this.showSuggestions.set(false), 150);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  saveDraft(): void {
    this.draftSaved.set(true);
    setTimeout(() => this.draftSaved.set(false), 3000);
  }

  send(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.sending.set(true);
    setTimeout(() => {
      this.sending.set(false);
      this.router.navigate(['/communication/sent']);
    }, 1000);
  }
}
