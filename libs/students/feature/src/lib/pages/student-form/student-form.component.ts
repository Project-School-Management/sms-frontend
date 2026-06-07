import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StudentsStore } from '@sms/students/data-access';

@Component({
  selector: 'sms-student-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Nouvel étudiant</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Remplissez toutes les informations requises</p>
        </div>
        <a routerLink="/students" class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--text-secondary)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
          Retour
        </a>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <!-- Section Identité -->
        <div class="sms-card p-6 mb-4">
          <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: var(--text-primary)">
            <mat-icon style="color: var(--accent)">person</mat-icon>
            Identité
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Prénom *</label>
              <input formControlName="firstName" type="text"
                class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors"
                [style.border-color]="isInvalid('firstName') ? '#dc2626' : 'var(--border-color)'"
                [style.background]="'var(--surface-2)'"
                [style.color]="'var(--text-primary)'"
                placeholder="Ex: Awa" />
              @if (isInvalid('firstName')) {
                <p class="text-xs mt-1" style="color: #dc2626">Le prénom est requis</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Nom *</label>
              <input formControlName="lastName" type="text"
                class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors"
                [style.border-color]="isInvalid('lastName') ? '#dc2626' : 'var(--border-color)'"
                [style.background]="'var(--surface-2)'"
                [style.color]="'var(--text-primary)'"
                placeholder="Ex: Diallo" />
              @if (isInvalid('lastName')) {
                <p class="text-xs mt-1" style="color: #dc2626">Le nom est requis</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Date de naissance *</label>
              <input formControlName="dateNaissance" type="date"
                class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors"
                [style.border-color]="isInvalid('dateNaissance') ? '#dc2626' : 'var(--border-color)'"
                [style.background]="'var(--surface-2)'"
                [style.color]="'var(--text-primary)'" />
              @if (isInvalid('dateNaissance')) {
                <p class="text-xs mt-1" style="color: #dc2626">La date de naissance est requise</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Genre *</label>
              <select formControlName="genre"
                class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section Contact -->
        <div class="sms-card p-6 mb-4">
          <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: var(--text-primary)">
            <mat-icon style="color: var(--accent)">contact_phone</mat-icon>
            Contact
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Email</label>
              <input formControlName="email" type="email"
                class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)"
                placeholder="email@exemple.com" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Téléphone</label>
              <input formControlName="phone" type="tel"
                class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)"
                placeholder="+225 07 XX XX XX XX" />
            </div>
          </div>
        </div>

        <!-- Section Scolarité -->
        <div class="sms-card p-6 mb-6">
          <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: var(--text-primary)">
            <mat-icon style="color: var(--accent)">school</mat-icon>
            Scolarité
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Promotion *</label>
              <select formControlName="classePublicId"
                class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                [style.border-color]="isInvalid('classePublicId') ? '#dc2626' : 'var(--border-color)'"
                style="background: var(--surface-2); color: var(--text-primary)">
                <option value="">Sélectionner une promotion</option>
                <option value="promo-001">Licence 3 GL 2025</option>
                <option value="promo-002">Licence 2 GL 2025</option>
                <option value="promo-003">Master 1 RI 2025</option>
                <option value="promo-004">Licence 1 GL 2025</option>
                <option value="promo-005">Master 2 RI 2025</option>
              </select>
              @if (isInvalid('classePublicId')) {
                <p class="text-xs mt-1" style="color: #dc2626">La promotion est requise</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-secondary)">Statut</label>
              <select formControlName="statut"
                class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button type="submit" [disabled]="form.invalid || store.saving()"
            class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
            style="background: var(--accent)">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">
              {{ store.saving() ? 'hourglass_empty' : 'save' }}
            </mat-icon>
            {{ store.saving() ? 'Enregistrement...' : 'Créer l\'étudiant' }}
          </button>
          <a routerLink="/students"
            class="px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
            style="border: 1px solid var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            Annuler
          </a>
        </div>
      </form>
    </div>
  `,
})
export class StudentFormComponent {
  readonly store = inject(StudentsStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.group({
    firstName:      ['', Validators.required],
    lastName:       ['', Validators.required],
    dateNaissance:  ['', Validators.required],
    genre:          ['M', Validators.required],
    email:          [''],
    phone:          [''],
    classePublicId: ['', Validators.required],
    statut:         ['ACTIF'],
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.createStudent(this.form.value as any);
    this.router.navigate(['/students']);
  }
}
