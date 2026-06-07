import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StudentsStore } from '@sms/students/data-access';

@Component({
  selector: 'sms-student-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/students" class="text-blue-600 hover:underline text-sm">← Retour</a>
        <h1 class="text-2xl font-bold text-gray-900">Nouvel étudiant</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input formControlName="firstName" type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input formControlName="lastName" type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
            <input formControlName="dateNaissance" type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Genre *</label>
            <select formControlName="genre"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input formControlName="email" type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input formControlName="phone" type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" [disabled]="form.invalid || store.saving()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
            {{ store.saving() ? 'Enregistrement...' : 'Créer l\'étudiant' }}
          </button>
          <a routerLink="/students"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
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
    firstName:     ['', Validators.required],
    lastName:      ['', Validators.required],
    dateNaissance: ['', Validators.required],
    genre:         ['M', Validators.required],
    email:         [''],
    phone:         [''],
  });

  submit() {
    if (this.form.invalid) return;
    this.store.createStudent(this.form.value as any);
    this.router.navigate(['/students']);
  }
}
