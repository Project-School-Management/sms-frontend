import {
  ChangeDetectionStrategy, Component, inject, OnInit,
  computed, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UsersStore } from '@sms/users/data-access';
import { ToastService } from '@sms/shared/ui';
import { Role, IUser } from '@sms/shared/models';

// ── Config visuels rôles ──────────────────────────────────────────────────────
const ROLE_CFG: Record<string, { bg: string; color: string; icon: string; label: string }> = {
  SUPER_ADMIN:  { bg:'#fee2e2', color:'#991b1b', icon:'admin_panel_settings', label:'Super Admin'  },
  ADMIN:        { bg:'#fee2e2', color:'#dc2626', icon:'shield',               label:'Administrateur'},
  DIR:          { bg:'#dbeafe', color:'#1d4ed8', icon:'business',             label:'Directeur'    },
  SECRETARIAT:  { bg:'#fef3c7', color:'#d97706', icon:'badge',                label:'Secrétariat'  },
  COMPTABLE:    { bg:'#dcfce7', color:'#16a34a', icon:'account_balance',      label:'Comptable'    },
  ENSEIGNANT:   { bg:'rgba(37,99,235,0.10)', color:'var(--accent)', icon:'school', label:'Enseignant' },
  ELEVE:        { bg:'#e0f2fe', color:'#0891b2', icon:'menu_book',            label:'Élève'        },
  PARENT:       { bg:'#ede9fe', color:'#7c3aed', icon:'family_restroom',      label:'Parent'       },
};

const EDITABLE_ROLES: Role[] = [
  Role.ADMIN, Role.DIR, Role.SECRETARIAT, Role.COMPTABLE,
  Role.ENSEIGNANT, Role.ELEVE, Role.PARENT,
];

interface UserForm {
  publicId?:  string;
  firstName:  string;
  lastName:   string;
  email:      string;
  roles:      Set<Role>;
  twoFa:      boolean;
  langKey:    string;
}

const EMPTY_FORM = (): UserForm => ({
  firstName:'', lastName:'', email:'', roles: new Set([Role.ENSEIGNANT]),
  twoFa:false, langKey:'fr',
});

@Component({
  selector:        'sms-users-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Utilisateurs</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Gestion des comptes et droits d'accès · {{ store.users().length }} utilisateurs
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/admin/rbac"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">security</mat-icon>
        Rôles & Permissions
      </a>
      <a routerLink="/admin/annees"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">calendar_month</mat-icon>
        Années
      </a>
      <button (click)="openCreateDialog()"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:18px;height:18px;width:18px">person_add</mat-icon>
        Nouvel utilisateur
      </button>
    </div>
  </div>

  <!-- ── KPI Cards ─────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:var(--accent-light)">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">group</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.users().length }}</p>
        <p class="text-sm" style="color:var(--text-secondary)">Total</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(22,163,74,0.10)">
        <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">verified_user</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.activeCount() }}</p>
        <p class="text-sm" style="color:var(--text-secondary)">Actifs</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(37,99,235,0.10)">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">school</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ enseignantsCount() }}</p>
        <p class="text-sm" style="color:var(--text-secondary)">Enseignants</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(220,38,38,0.10)">
        <mat-icon style="color:#dc2626;font-size:20px;height:20px;width:20px">shield</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ adminCount() }}</p>
        <p class="text-sm" style="color:var(--text-secondary)">Admins / Dir.</p>
      </div>
    </div>
  </div>

  <!-- ── Filtres & Recherche ───────────────────────────────────────────────── -->
  <div class="sms-card p-4 mb-5 flex flex-wrap items-center gap-3">
    <div class="relative flex-1 min-w-48">
      <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
      <input type="text" [(ngModel)]="searchQuery"
             placeholder="Nom, prénom, email…"
             class="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
             style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
    </div>
    <!-- Filtres rôles -->
    <div class="flex items-center gap-1.5 flex-wrap">
      <button (click)="store.setRoleFilter('')"
              class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              [style.background]="store.roleFilter()==='' ? 'var(--accent)' : 'var(--surface-2)'"
              [style.color]="store.roleFilter()==='' ? '#fff' : 'var(--text-secondary)'">
        Tous
      </button>
      @for (role of editableRoles; track role) {
        <button (click)="store.setRoleFilter(store.roleFilter() === role ? '' : role)"
                class="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                [style.background]="store.roleFilter()===role ? roleCfg(role).bg : 'var(--surface-2)'"
                [style.color]="store.roleFilter()===role ? roleCfg(role).color : 'var(--text-secondary)'"
                [style.border]="'1px solid ' + (store.roleFilter()===role ? roleCfg(role).color : 'var(--border-color)')">
          {{ roleCfg(role).label }}
        </button>
      }
    </div>
  </div>

  <!-- ── Table utilisateurs ────────────────────────────────────────────────── -->
  @if (store.loading()) {
    <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
    </div>
  } @else {
    <div class="sms-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of ['Utilisateur','Email','Rôle(s)','2FA','Statut','Créé le','']; track h) {
                <th class="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (user of filteredUsers(); track user.publicId) {
              <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
                <!-- Avatar + nom -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                         style="background:linear-gradient(135deg,var(--accent),#3b82f6)">
                      {{ user.firstName[0] }}{{ user.lastName[0] }}
                    </div>
                    <div>
                      <p class="font-semibold" style="color:var(--text-primary)">{{ user.firstName }} {{ user.lastName }}</p>
                      <p class="text-xs" style="color:var(--text-muted)">{{ user.login }}</p>
                    </div>
                  </div>
                </td>
                <!-- Email -->
                <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ user.email }}</td>
                <!-- Rôles -->
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    @for (role of user.authorities; track role) {
                      <span class="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                            [style.background]="roleCfg(role).bg"
                            [style.color]="roleCfg(role).color">
                        {{ roleCfg(role).label }}
                      </span>
                    }
                  </div>
                </td>
                <!-- 2FA -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <mat-icon style="font-size:16px;height:16px;width:16px"
                              [style.color]="user.twoFaEnabled ? '#16a34a' : 'var(--border-color)'">
                      {{ user.twoFaEnabled ? 'verified_user' : 'no_encryption' }}
                    </mat-icon>
                    <span class="text-xs" [style.color]="user.twoFaEnabled ? '#16a34a' : 'var(--text-muted)'">
                      {{ user.twoFaEnabled ? 'Actif' : '—' }}
                    </span>
                  </div>
                </td>
                <!-- Statut -->
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                        [style.background]="user.activated ? 'rgba(22,163,74,0.10)' : 'rgba(239,68,68,0.10)'"
                        [style.color]="user.activated ? '#16a34a' : '#dc2626'">
                    {{ user.activated ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <!-- Date création -->
                <td class="px-4 py-3 text-xs" style="color:var(--text-muted)">
                  {{ user.createdDate | date:'dd/MM/yyyy' }}
                </td>
                <!-- Actions -->
                <td class="px-4 py-3 text-right relative">
                  <button (click)="toggleMenu(user.publicId)"
                          class="p-1.5 rounded-lg hover:opacity-80"
                          style="color:var(--text-muted)">
                    <mat-icon style="font-size:18px;height:18px;width:18px">more_vert</mat-icon>
                  </button>
                  @if (openMenuId() === user.publicId) {
                    <div class="fixed inset-0 z-40" (click)="openMenuId.set('')"></div>
                    <div class="absolute right-4 top-10 z-50 rounded-2xl overflow-hidden shadow-xl"
                         style="min-width:200px;background:var(--surface-1);border:1px solid var(--border-color)">
                      <button (click)="editUser(user); openMenuId.set('')"
                              class="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:opacity-80 transition-opacity text-left">
                        <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--accent)">edit</mat-icon>
                        <span style="color:var(--text-primary)">Modifier</span>
                      </button>
                      <div style="border-top:1px solid var(--border-color)"></div>
                      <button (click)="openResetPwd(user); openMenuId.set('')"
                              class="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:opacity-80 transition-opacity text-left">
                        <mat-icon style="font-size:16px;height:16px;width:16px;color:#d97706">lock_reset</mat-icon>
                        <span style="color:var(--text-primary)">Réinitialiser MDP</span>
                      </button>
                      <div style="border-top:1px solid var(--border-color)"></div>
                      <button (click)="store.toggleActivation(user.publicId); openMenuId.set('')"
                              class="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:opacity-80 transition-opacity text-left">
                        <mat-icon style="font-size:16px;height:16px;width:16px"
                                  [style.color]="user.activated ? '#dc2626' : '#16a34a'">
                          {{ user.activated ? 'person_off' : 'how_to_reg' }}
                        </mat-icon>
                        <span [style.color]="user.activated ? '#dc2626' : '#16a34a'">
                          {{ user.activated ? 'Désactiver' : 'Activer' }}
                        </span>
                      </button>
                      <div style="border-top:1px solid var(--border-color)"></div>
                      <button (click)="copyEmail(user.email); openMenuId.set('')"
                              class="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:opacity-80 transition-opacity text-left">
                        <mat-icon style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">content_copy</mat-icon>
                        <span style="color:var(--text-secondary)">Copier l'email</span>
                      </button>
                    </div>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="px-4 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <mat-icon style="font-size:48px;height:48px;width:48px;opacity:0.3">group_off</mat-icon>
                  <p class="font-semibold" style="color:var(--text-secondary)">Aucun utilisateur trouvé</p>
                </div>
              </td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3 border-t text-xs" style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-muted)">
        {{ filteredUsers().length }} utilisateur(s) affiché(s) sur {{ store.users().length }}
      </div>
    </div>
  }

</div>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- SLIDE-OVER : CRÉER / MODIFIER UTILISATEUR                                  -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
@if (showUserDialog()) {
  <div class="fixed inset-0 z-50 flex" style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="closeDialogs()">
    <div class="ml-auto w-full max-w-lg h-full flex flex-col shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:var(--border-color)">
        <div>
          <h2 class="font-bold text-lg" style="color:var(--text-primary)">
            {{ userForm.publicId ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
          </h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
            Informations du compte et droits d'accès
          </p>
        </div>
        <button (click)="closeDialogs()"
                class="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>

      <!-- Corps -->
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Prénom *</label>
            <input [(ngModel)]="userForm.firstName" placeholder="ex : Moussa"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Nom *</label>
            <input [(ngModel)]="userForm.lastName" placeholder="ex : Konaté"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">
            Email *
            @if (userForm.publicId) {
              <span class="ml-1 font-normal text-xs" style="color:var(--text-muted)">(non modifiable)</span>
            }
          </label>
          <input [(ngModel)]="userForm.email" type="email"
                 [readonly]="!!userForm.publicId"
                 placeholder="utilisateur@sms.ci"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 [style.opacity]="userForm.publicId ? '0.6' : '1'"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <!-- Rôles multi-select -->
        <div class="flex flex-col gap-2">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Rôles *</label>
          <div class="grid grid-cols-2 gap-2">
            @for (role of editableRoles; track role) {
              <label class="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all"
                     [style.background]="userForm.roles.has(role) ? roleCfg(role).bg : 'var(--surface-2)'"
                     [style.border-color]="userForm.roles.has(role) ? roleCfg(role).color : 'var(--border-color)'">
                <input type="checkbox"
                       [checked]="userForm.roles.has(role)"
                       (change)="toggleRole(role)"
                       class="rounded w-4 h-4">
                <mat-icon style="font-size:16px;height:16px;width:16px"
                          [style.color]="userForm.roles.has(role) ? roleCfg(role).color : 'var(--text-muted)'">
                  {{ roleCfg(role).icon }}
                </mat-icon>
                <span class="text-xs font-semibold"
                      [style.color]="userForm.roles.has(role) ? roleCfg(role).color : 'var(--text-secondary)'">
                  {{ roleCfg(role).label }}
                </span>
              </label>
            }
          </div>
          @if (userForm.roles.size === 0) {
            <p class="text-xs" style="color:#dc2626">Au moins un rôle est requis</p>
          }
        </div>

        <!-- 2FA toggle -->
        <div class="flex items-center justify-between p-4 rounded-xl"
             style="background:var(--surface-2);border:1px solid var(--border-color)">
          <div>
            <p class="font-semibold text-sm" style="color:var(--text-primary)">Authentification à deux facteurs</p>
            <p class="text-xs mt-0.5" style="color:var(--text-muted)">
              Renforce la sécurité du compte (recommandé pour les admins)
            </p>
          </div>
          <button (click)="userForm.twoFa = !userForm.twoFa"
                  class="relative w-12 h-6 rounded-full transition-all"
                  [style.background]="userForm.twoFa ? '#16a34a' : 'var(--border-color)'">
            <div class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                 [style.left]="userForm.twoFa ? '26px' : '2px'"></div>
          </button>
        </div>

        <!-- Langue -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Langue de l'interface</label>
          <select [(ngModel)]="userForm.langKey"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t flex items-center justify-end gap-3" style="border-color:var(--border-color)">
        <button (click)="closeDialogs()"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
        <button (click)="saveUser()"
                [disabled]="store.saving() || userForm.roles.size === 0"
                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                style="background:var(--accent)">
          @if (store.saving()) {
            <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
          } @else {
            <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
          }
          {{ userForm.publicId ? 'Enregistrer' : 'Créer l\'utilisateur' }}
        </button>
      </div>
    </div>
  </div>
}

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- DIALOG : RÉINITIALISATION MDP                                               -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
@if (resetPwdTarget()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
       style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="closeDialogs()">
    <div class="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <div class="px-6 py-5 border-b" style="border-color:var(--border-color)">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center"
               style="background:rgba(217,119,6,0.12)">
            <mat-icon style="color:#d97706;font-size:20px;height:20px;width:20px">lock_reset</mat-icon>
          </div>
          <div>
            <h2 class="font-bold" style="color:var(--text-primary)">Réinitialiser le mot de passe</h2>
            <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
              {{ resetPwdTarget()?.firstName }} {{ resetPwdTarget()?.lastName }}
            </p>
          </div>
        </div>
      </div>

      @if (!tempPassword()) {
        <!-- Confirmation -->
        <div class="px-6 py-5 flex flex-col gap-4">
          <div class="p-4 rounded-xl" style="background:rgba(217,119,6,0.08);border:1px solid rgba(217,119,6,0.20)">
            <p class="text-sm" style="color:var(--text-primary)">
              Un nouveau mot de passe temporaire sera généré et communiqué à l'utilisateur.
              Il devra le changer à sa prochaine connexion.
            </p>
          </div>
          <div class="flex gap-3">
            <button (click)="closeDialogs()"
                    class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80"
                    style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
            <button (click)="doResetPwd()"
                    [disabled]="store.saving()"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                    style="background:#d97706">
              @if (store.saving()) {
                <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
              } @else {
                <mat-icon style="font-size:16px;height:16px;width:16px">lock_reset</mat-icon>
              }
              Réinitialiser
            </button>
          </div>
        </div>
      } @else {
        <!-- Résultat -->
        <div class="px-6 py-5 flex flex-col gap-4">
          <div class="flex items-center gap-2 text-sm font-semibold" style="color:#16a34a">
            <mat-icon style="font-size:18px;height:18px;width:18px">check_circle</mat-icon>
            Mot de passe réinitialisé avec succès
          </div>
          <div>
            <p class="text-xs font-semibold mb-2" style="color:var(--text-secondary)">
              Mot de passe temporaire :
            </p>
            <div class="flex items-center gap-3 p-3 rounded-xl"
                 style="background:var(--surface-2);border:1px solid var(--border-color)">
              <code class="flex-1 font-mono text-lg font-bold tracking-widest"
                    style="color:var(--text-primary)">{{ tempPassword() }}</code>
              <button (click)="copyPassword()"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80"
                      style="background:var(--accent-light);color:var(--accent)">
                <mat-icon style="font-size:14px;height:14px;width:14px">content_copy</mat-icon>
                Copier
              </button>
            </div>
          </div>
          <p class="text-xs p-3 rounded-xl" style="background:rgba(239,68,68,0.06);color:#dc2626;border:1px solid rgba(239,68,68,0.15)">
            ⚠️ Communiquez ce mot de passe de façon sécurisée. Il expire dans 24h.
          </p>
          <button (click)="closeDialogs()"
                  class="w-full px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80"
                  style="background:var(--accent);color:#fff">Fermer</button>
        </div>
      }
    </div>
  </div>
}
  `,
})
export class UsersListComponent implements OnInit {
  readonly store = inject(UsersStore);
  readonly toast = inject(ToastService);

  // ── UI state ──────────────────────────────────────────────────────────────
  searchQuery   = '';
  openMenuId    = signal('');
  showUserDialog = signal(false);
  resetPwdTarget = signal<IUser | null>(null);
  tempPassword   = signal('');

  // ── Form ──────────────────────────────────────────────────────────────────
  userForm: UserForm = EMPTY_FORM();
  readonly editableRoles = EDITABLE_ROLES;

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly filteredUsers = computed(() => {
    let list = this.store.filteredUsers();
    const s = this.searchQuery.toLowerCase();
    if (s) list = list.filter(u =>
      u.firstName.toLowerCase().includes(s) ||
      u.lastName.toLowerCase().includes(s)  ||
      u.email.toLowerCase().includes(s)
    );
    return list;
  });

  readonly enseignantsCount = computed(() =>
    this.store.users().filter(u => u.authorities.some(a => (a as string) === 'ENSEIGNANT')).length
  );
  readonly adminCount = computed(() =>
    this.store.users().filter(u => u.authorities.some(a => ['ADMIN','DIR'].includes(a as string))).length
  );

  ngOnInit(): void { this.store.loadUsers(); }

  // ── Dialog Utilisateur ────────────────────────────────────────────────────
  openCreateDialog(): void {
    this.userForm = EMPTY_FORM();
    this.showUserDialog.set(true);
  }

  editUser(u: IUser): void {
    this.userForm = {
      publicId:  u.publicId,
      firstName: u.firstName,
      lastName:  u.lastName,
      email:     u.email,
      roles:     new Set(u.authorities),
      twoFa:     u.twoFaEnabled,
      langKey:   u.langKey,
    };
    this.showUserDialog.set(true);
  }

  saveUser(): void {
    if (!this.userForm.firstName || !this.userForm.email || this.userForm.roles.size === 0) {
      this.toast.error('Prénom, email et au moins un rôle sont obligatoires');
      return;
    }
    const payload: Partial<IUser> = {
      publicId:     this.userForm.publicId,
      firstName:    this.userForm.firstName,
      lastName:     this.userForm.lastName,
      email:        this.userForm.email,
      login:        this.userForm.email,
      authorities:  [...this.userForm.roles],
      twoFaEnabled: this.userForm.twoFa,
      langKey:      this.userForm.langKey,
    };
    if (this.userForm.publicId) {
      this.store.updateUser(payload);
      this.toast.success('Utilisateur mis à jour');
    } else {
      this.store.createUser(payload);
      this.toast.success('Utilisateur créé avec succès');
    }
    this.closeDialogs();
  }

  // ── Dialog Reset Password ─────────────────────────────────────────────────
  openResetPwd(u: IUser): void {
    this.resetPwdTarget.set(u);
    this.tempPassword.set('');
  }

  doResetPwd(): void {
    const u = this.resetPwdTarget();
    if (!u) return;
    this.store.resetPassword({
      publicId: u.publicId,
      onSuccess: (pwd) => {
        this.tempPassword.set(pwd);
        this.toast.success('Mot de passe réinitialisé');
      },
    });
  }

  copyPassword(): void {
    navigator.clipboard.writeText(this.tempPassword())
      .then(() => this.toast.success('Mot de passe copié'));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  toggleRole(role: Role): void {
    this.userForm.roles.has(role)
      ? this.userForm.roles.delete(role)
      : this.userForm.roles.add(role);
  }

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? '' : id);
  }

  copyEmail(email: string): void {
    navigator.clipboard.writeText(email)
      .then(() => this.toast.success('Email copié'));
  }

  closeDialogs(): void {
    this.showUserDialog.set(false);
    this.resetPwdTarget.set(null);
    this.tempPassword.set('');
  }

  roleCfg(role: string) {
    return ROLE_CFG[role] ?? { bg:'var(--surface-2)', color:'var(--text-secondary)', icon:'person', label: role };
  }
}
