import { ChangeDetectionStrategy, Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UsersStore } from '@sms/users/data-access';
import { Role } from '@sms/shared/models';

const ROLES = ['', 'ADMIN', 'DIR', 'SECRETARIAT', 'COMPTABLE', 'ENSEIGNANT', 'ELEVE', 'PARENT'];
const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  ADMIN:       { bg: '#fee2e2', color: '#dc2626' },
  DIR:         { bg: '#dbeafe', color: '#2563eb' },
  SECRETARIAT: { bg: '#fef3c7', color: '#d97706' },
  COMPTABLE:   { bg: '#dcfce7', color: '#16a34a' },
  ENSEIGNANT:  { bg: 'var(--accent-light)', color: 'var(--accent)' },
  ELEVE:       { bg: '#e0f2fe', color: '#0891b2' },
  PARENT:      { bg: '#ede9fe', color: '#7c3aed' },
};

@Component({
  selector: 'sms-users-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Utilisateurs</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Gestion des comptes et droits d'accès</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/admin/annees"
             class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border hover:opacity-80"
             style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">calendar_month</mat-icon>
            Années académiques
          </a>
          <button (click)="showInviteForm.set(!showInviteForm())"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
                  style="background: var(--accent)">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">person_add</mat-icon>
            Inviter un utilisateur
          </button>
        </div>
      </div>

      <!-- Invite form panel -->
      @if (showInviteForm()) {
        <div class="sms-card p-5 mb-6" style="border: 2px solid var(--accent)">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--accent-light)">
              <mat-icon style="color: var(--accent); font-size: 18px; height: 18px; width: 18px">person_add</mat-icon>
            </div>
            <h3 class="font-bold" style="color: var(--text-primary)">Inviter un utilisateur</h3>
            <button (click)="showInviteForm.set(false)" class="ml-auto p-1.5 rounded-lg hover:opacity-70" style="color: var(--text-muted)">
              <mat-icon style="font-size: 18px; height: 18px; width: 18px">close</mat-icon>
            </button>
          </div>
          <form [formGroup]="inviteForm" (ngSubmit)="submitInvite()" class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label class="block text-xs font-semibold mb-1" style="color: var(--text-secondary)">Prénom *</label>
              <input formControlName="firstName" type="text" placeholder="Ex: Moussa"
                     class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                     style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" style="color: var(--text-secondary)">Nom *</label>
              <input formControlName="lastName" type="text" placeholder="Ex: Konaté"
                     class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                     style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" style="color: var(--text-secondary)">Email *</label>
              <input formControlName="email" type="email" placeholder="utilisateur@sms.ci"
                     class="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                     style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" style="color: var(--text-secondary)">Rôle *</label>
              <select formControlName="role" class="w-full px-3 py-2 rounded-xl border text-sm"
                      style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
                @for (r of availableRoles; track r) {
                  <option [value]="r">{{ r }}</option>
                }
              </select>
            </div>
            <div class="sm:col-span-2 flex items-center gap-3 pt-1">
              <button type="submit" [disabled]="inviteForm.invalid || store.saving()"
                      class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                      style="background: var(--accent)">
                @if (store.saving()) {
                  <mat-icon class="animate-spin" style="font-size: 16px; height: 16px; width: 16px">refresh</mat-icon>
                } @else {
                  <mat-icon style="font-size: 16px; height: 16px; width: 16px">send</mat-icon>
                }
                Inviter
              </button>
              @if (inviteSuccess()) {
                <span class="text-sm font-medium flex items-center gap-1" style="color: #16a34a">
                  <mat-icon style="font-size: 16px; height: 16px; width: 16px">check_circle</mat-icon>
                  Utilisateur invité avec succès !
                </span>
              }
            </div>
          </form>
        </div>
      }

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent)">group</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.users().length }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Total utilisateurs</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
            <mat-icon style="color: #16a34a">verified_user</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.activeCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Actifs</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(99,102,241,0.1)">
            <mat-icon style="color: #6366f1">school</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ enseignantsCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Enseignants</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(239,68,68,0.1)">
            <mat-icon style="color: #dc2626">shield</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ adminCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Administrateurs</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 border-b flex flex-wrap items-center gap-3" style="border-color: var(--border-color)">
          <h3 class="font-semibold flex-1" style="color: var(--text-primary)">Liste des utilisateurs</h3>
          <!-- Role filters -->
          <div class="flex items-center gap-1.5 flex-wrap">
            @for (role of roles; track role) {
              <button (click)="store.setRoleFilter(role)"
                class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                [style.background]="store.roleFilter() === role ? 'var(--accent)' : 'var(--surface-2)'"
                [style.color]="store.roleFilter() === role ? '#fff' : 'var(--text-secondary)'"
                [style.border]="'1px solid ' + (store.roleFilter() === role ? 'var(--accent)' : 'var(--border-color)')">
                {{ role || 'Tous' }}
              </button>
            }
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="background: var(--surface-2)">
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Utilisateur</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Email</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Rôle(s)</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">2FA</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Statut</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (user of store.filteredUsers(); track user.publicId) {
                <tr class="border-t hover:opacity-80 transition-opacity" style="border-color: var(--border-color)">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                           style="background: var(--accent)">
                        {{ user.firstName[0] }}{{ user.lastName[0] }}
                      </div>
                      <div>
                        <p class="font-medium" style="color: var(--text-primary)">{{ user.firstName }} {{ user.lastName }}</p>
                        <p class="text-xs" style="color: var(--text-muted)">{{ user.login }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">{{ user.email }}</td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1">
                      @for (role of user.authorities; track role) {
                        <span class="px-1.5 py-0.5 rounded text-xs font-medium"
                              [style.background]="roleStyle(role).bg"
                              [style.color]="roleStyle(role).color">
                          {{ role }}
                        </span>
                      }
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-1">
                      <mat-icon [style.color]="user.twoFaEnabled ? '#16a34a' : 'var(--text-muted)'"
                        style="font-size: 16px; height: 16px; width: 16px">
                        {{ user.twoFaEnabled ? 'shield' : 'shield_outlined' }}
                      </mat-icon>
                      <span class="text-xs" [style.color]="user.twoFaEnabled ? '#16a34a' : 'var(--text-muted)'">
                        {{ user.twoFaEnabled ? 'Actif' : '—' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                          [style.background]="user.activated ? '#dcfce7' : '#fee2e2'"
                          [style.color]="user.activated ? '#16a34a' : '#dc2626'">
                      {{ user.activated ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right relative">
                    <button (click)="toggleMenu(user.publicId)"
                            class="p-1 rounded hover:opacity-80 transition-opacity" style="color: var(--text-muted)">
                      <mat-icon style="font-size: 18px; height: 18px; width: 18px">more_vert</mat-icon>
                    </button>
                    @if (openMenuId() === user.publicId) {
                      <!-- Overlay -->
                      <div class="fixed inset-0 z-40" (click)="openMenuId.set('')"></div>
                      <!-- Dropdown -->
                      <div class="absolute right-4 top-10 z-50 rounded-xl overflow-hidden shadow-lg"
                           style="width:180px;background:var(--surface-1);border:1px solid var(--border-color)">
                        <button (click)="store.toggleActivation(user.publicId); openMenuId.set('')"
                                class="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                                style="color: var(--text-primary)">
                          <mat-icon style="font-size:16px;height:16px;width:16px"
                                    [style.color]="user.activated ? '#dc2626' : '#16a34a'">
                            {{ user.activated ? 'person_off' : 'how_to_reg' }}
                          </mat-icon>
                          {{ user.activated ? 'Désactiver' : 'Activer' }}
                        </button>
                        <div style="border-top: 1px solid var(--border-color)"></div>
                        <button (click)="copyEmail(user.email); openMenuId.set('')"
                                class="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                                style="color: var(--text-primary)">
                          <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">content_copy</mat-icon>
                          Copier l'email
                        </button>
                      </div>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6">
                    <div class="flex flex-col items-center justify-center py-16 gap-3">
                      <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">group_off</mat-icon>
                      <p style="color: var(--text-secondary)">Aucun utilisateur trouvé</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class UsersListComponent implements OnInit {
  readonly store  = inject(UsersStore);
  private  fb     = inject(FormBuilder);
  readonly roles  = ROLES;

  readonly showInviteForm = signal(false);
  readonly inviteSuccess  = signal(false);
  readonly openMenuId     = signal('');
  readonly availableRoles = ['ADMIN', 'DIR', 'SECRETARIAT', 'COMPTABLE', 'ENSEIGNANT'];

  readonly inviteForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    role:      ['ENSEIGNANT', Validators.required],
  });

  readonly enseignantsCount = computed(() =>
    this.store.users().filter(u => u.authorities.some(a => a === 'ENSEIGNANT' as any)).length
  );
  readonly adminCount = computed(() =>
    this.store.users().filter(u => u.authorities.some(a => a === 'ADMIN' as any || a === 'DIR' as any)).length
  );

  ngOnInit(): void {
    this.store.loadUsers();
  }

  submitInvite(): void {
    if (this.inviteForm.invalid) return;
    const v = this.inviteForm.value;
    this.store.createUser({
      firstName:   v.firstName ?? '',
      lastName:    v.lastName ?? '',
      email:       v.email ?? '',
      authorities: [v.role as Role],
    });
    this.inviteSuccess.set(true);
    this.inviteForm.reset({ role: 'ENSEIGNANT' });
    setTimeout(() => {
      this.inviteSuccess.set(false);
      this.showInviteForm.set(false);
    }, 2000);
  }

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? '' : id);
  }

  copyEmail(email: string): void {
    navigator.clipboard?.writeText(email).catch(() => {});
  }

  roleStyle(role: string): { bg: string; color: string } {
    return ROLE_STYLES[role] ?? { bg: '#f3f4f6', color: '#6b7280' };
  }
}
