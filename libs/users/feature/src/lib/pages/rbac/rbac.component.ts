import {
  ChangeDetectionStrategy, Component, signal, computed,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Permission {
  key:         string;
  label:       string;
  description: string;
  keycloakName: string; // Nom dans Keycloak
}

interface PermissionGroup {
  module:      string;
  icon:        string;
  color:       string;
  permissions: Permission[];
}

type RoleKey = 'ADMIN' | 'DIR' | 'SECRETARIAT' | 'COMPTABLE' | 'ENSEIGNANT' | 'ELEVE' | 'PARENT';

// ── Définition des rôles ──────────────────────────────────────────────────────
const ROLES: { key: RoleKey; label: string; icon: string; color: string; bg: string }[] = [
  { key:'ADMIN',       label:'Admin',        icon:'shield',              color:'#dc2626', bg:'rgba(220,38,38,0.10)'   },
  { key:'DIR',         label:'Directeur',    icon:'business',            color:'#1d4ed8', bg:'rgba(29,78,216,0.10)'   },
  { key:'SECRETARIAT', label:'Secrétariat',  icon:'badge',               color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
  { key:'COMPTABLE',   label:'Comptable',    icon:'account_balance',     color:'#16a34a', bg:'rgba(22,163,74,0.10)'   },
  { key:'ENSEIGNANT',  label:'Enseignant',   icon:'school',              color:'var(--accent)', bg:'var(--accent-light)' },
  { key:'ELEVE',       label:'Élève',        icon:'menu_book',           color:'#0891b2', bg:'rgba(8,145,178,0.10)'   },
  { key:'PARENT',      label:'Parent',       icon:'family_restroom',     color:'#7c3aed', bg:'rgba(124,58,237,0.10)'  },
];

// ── Matrice des permissions par groupe ────────────────────────────────────────
const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module:'Tableau de bord', icon:'space_dashboard', color:'#6b7280',
    permissions:[
      { key:'dashboard:view', label:'Voir le dashboard', description:'Accès au tableau de bord principal', keycloakName:'sms:dashboard:view' },
    ],
  },
  {
    module:'Académique', icon:'menu_book', color:'var(--accent)',
    permissions:[
      { key:'notes:view',       label:'Voir les notes',        description:'Consulter les notes et moyennes',       keycloakName:'sms:notes:view'       },
      { key:'notes:saisir',     label:'Saisir des notes',      description:'Entrer des notes pour une évaluation',  keycloakName:'sms:notes:write'      },
      { key:'notes:valider',    label:'Valider les notes',     description:'Valider et verrouiller une saisie',     keycloakName:'sms:notes:validate'   },
      { key:'bulletins:view',   label:'Voir les bulletins',    description:'Consulter les bulletins scolaires',     keycloakName:'sms:bulletins:view'   },
      { key:'bulletins:publish',label:'Publier les bulletins', description:'Diffuser les bulletins aux familles',   keycloakName:'sms:bulletins:publish'},
      { key:'classes:manage',   label:'Gérer les classes',     description:'Créer, modifier les classes',           keycloakName:'sms:classes:write'    },
      { key:'evals:manage',     label:'Gérer les évaluations', description:'CRUD des évaluations',                  keycloakName:'sms:evals:write'      },
    ],
  },
  {
    module:'Finance', icon:'account_balance_wallet', color:'#16a34a',
    permissions:[
      { key:'finance:view',      label:'Voir les finances',    description:'Consulter les factures et paiements',  keycloakName:'sms:finance:view'      },
      { key:'finance:factures',  label:'Créer des factures',   description:'Créer et éditer des factures',         keycloakName:'sms:finance:write'     },
      { key:'finance:encaisser', label:'Encaisser',            description:'Enregistrer des paiements',            keycloakName:'sms:finance:pay'       },
      { key:'finance:bourses',   label:'Gérer les bourses',    description:'Attribuer et modifier les bourses',    keycloakName:'sms:finance:bourses'   },
      { key:'finance:rapports',  label:'Rapports financiers',  description:'Accéder aux rapports et exports',      keycloakName:'sms:finance:reports'   },
    ],
  },
  {
    module:'Évaluations en ligne', icon:'quiz', color:'#8b5cf6',
    permissions:[
      { key:'learning:view',    label:'Voir les cours',          description:'Accéder aux cours et ressources',     keycloakName:'sms:learning:view'    },
      { key:'learning:create',  label:'Créer des cours/examens', description:'Publier des cours et examens',        keycloakName:'sms:learning:write'   },
      { key:'learning:pass',    label:'Passer des examens',      description:'Participer aux examens en ligne',     keycloakName:'sms:learning:exam'    },
      { key:'learning:correct', label:'Corriger des examens',    description:'Corriger les réponses ouvertes',      keycloakName:'sms:learning:correct' },
    ],
  },
  {
    module:'Emplois du temps', icon:'calendar_month', color:'#d97706',
    permissions:[
      { key:'schedule:view',   label:'Voir les emplois du temps', description:'Consulter le planning des cours',   keycloakName:'sms:schedule:view'  },
      { key:'schedule:manage', label:'Gérer les séances',         description:'Créer et modifier les séances',     keycloakName:'sms:schedule:write' },
    ],
  },
  {
    module:'Communication', icon:'chat_bubble_outline', color:'#0891b2',
    permissions:[
      { key:'comm:view',       label:'Voir les messages',    description:'Lire les messages reçus',              keycloakName:'sms:comm:view'      },
      { key:'comm:send',       label:'Envoyer des messages', description:'Envoyer des messages individuels',     keycloakName:'sms:comm:write'     },
      { key:'comm:broadcast',  label:'Diffusion de masse',   description:'Envoyer à des groupes',                keycloakName:'sms:comm:broadcast' },
    ],
  },
  {
    module:'Élèves', icon:'group', color:'#10b981',
    permissions:[
      { key:'students:view',   label:'Voir les élèves',       description:'Consulter les fiches élèves',         keycloakName:'sms:students:view'  },
      { key:'students:write',  label:'Gérer les élèves',      description:'Inscrire, modifier, archiver',         keycloakName:'sms:students:write' },
    ],
  },
  {
    module:'Administration', icon:'settings', color:'#dc2626',
    permissions:[
      { key:'admin:users',     label:'Gérer les utilisateurs', description:'CRUD des comptes utilisateurs',      keycloakName:'sms:admin:users'  },
      { key:'admin:config',    label:'Configuration système',  description:'Accéder aux référentiels',           keycloakName:'sms:admin:config' },
      { key:'admin:annees',    label:'Années académiques',     description:'Gérer les années et périodes',       keycloakName:'sms:admin:annees' },
      { key:'admin:rbac',      label:'Gestion RBAC',          description:'Modifier les rôles et permissions',  keycloakName:'sms:admin:rbac'   },
    ],
  },
];

// ── Matrice par défaut (rôle → set de permissions) ────────────────────────────
const DEFAULT_MATRIX: Record<RoleKey, Set<string>> = {
  ADMIN:       new Set([
    'dashboard:view',
    'notes:view','notes:saisir','notes:valider','bulletins:view','bulletins:publish','classes:manage','evals:manage',
    'finance:view','finance:factures','finance:encaisser','finance:bourses','finance:rapports',
    'learning:view','learning:create','learning:correct',
    'schedule:view','schedule:manage',
    'comm:view','comm:send','comm:broadcast',
    'students:view','students:write',
    'admin:users','admin:config','admin:annees','admin:rbac',
  ]),
  DIR:         new Set([
    'dashboard:view',
    'notes:view','notes:valider','bulletins:view','bulletins:publish','classes:manage','evals:manage',
    'finance:view','finance:rapports',
    'learning:view','learning:create',
    'schedule:view','schedule:manage',
    'comm:view','comm:send','comm:broadcast',
    'students:view','students:write',
    'admin:config','admin:annees',
  ]),
  SECRETARIAT: new Set([
    'dashboard:view',
    'notes:view','bulletins:view',
    'schedule:view',
    'comm:view','comm:send',
    'students:view','students:write',
    'admin:annees',
  ]),
  COMPTABLE:   new Set([
    'dashboard:view',
    'finance:view','finance:factures','finance:encaisser','finance:bourses','finance:rapports',
    'students:view',
  ]),
  ENSEIGNANT:  new Set([
    'dashboard:view',
    'notes:view','notes:saisir','notes:valider','bulletins:view','evals:manage',
    'learning:view','learning:create','learning:correct',
    'schedule:view',
    'comm:view','comm:send',
    'students:view',
  ]),
  ELEVE:       new Set([
    'dashboard:view',
    'notes:view','bulletins:view',
    'learning:view','learning:pass',
    'schedule:view',
    'comm:view','comm:send',
  ]),
  PARENT:      new Set([
    'dashboard:view',
    'notes:view','bulletins:view',
    'comm:view','comm:send',
  ]),
};

@Component({
  selector:        'sms-rbac',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Rôles & Permissions</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Matrice de contrôle d'accès RBAC · Keycloak-ready
      </p>
    </div>
    <div class="flex items-center gap-2">
      <a routerLink="/admin"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        Utilisateurs
      </a>
      <button (click)="saveChanges()"
              [disabled]="!hasChanges()"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 disabled:opacity-40"
              style="background:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
        Enregistrer{{ hasChanges() ? ' (' + changeCount() + ')' : '' }}
      </button>
    </div>
  </div>

  <!-- ── Bannière Keycloak ─────────────────────────────────────────────────── -->
  <div class="sms-card p-4 mb-6 flex items-start gap-4"
       style="background:rgba(37,99,235,0.04);border-color:rgba(37,99,235,0.20)">
    <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
         style="background:var(--accent-light)">
      <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">verified_user</mat-icon>
    </div>
    <div class="flex-1">
      <p class="font-semibold text-sm" style="color:var(--text-primary)">
        Architecture Keycloak-ready
      </p>
      <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
        Chaque permission correspond à un scope Keycloak (ex: <code class="font-mono"
        style="background:var(--surface-2);padding:1px 4px;border-radius:4px">sms:notes:validate</code>).
        En production, ces permissions seront synchronisées automatiquement via l'API Keycloak Admin.
        Les modifications ici seront reflétées dans les realm-roles Keycloak.
      </p>
    </div>
    <div class="shrink-0">
      <span class="px-2 py-1 rounded-lg text-xs font-bold"
            style="background:rgba(22,163,74,0.10);color:#16a34a">
        {{ totalPermissions() }} permissions · {{ roles.length }} rôles
      </span>
    </div>
  </div>

  <!-- ── KPI chips rôles ────────────────────────────────────────────────────── -->
  <div class="flex flex-wrap gap-2 mb-5">
    @for (role of roles; track role.key) {
      <button (click)="selectedRole.set(selectedRole() === role.key ? null : role.key)"
              class="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all"
              [style.background]="selectedRole()===role.key ? role.bg : 'var(--surface-2)'"
              [style.border-color]="selectedRole()===role.key ? role.color : 'var(--border-color)'"
              [style.color]="selectedRole()===role.key ? role.color : 'var(--text-secondary)'">
        <mat-icon style="font-size:15px;height:15px;width:15px">{{ role.icon }}</mat-icon>
        {{ role.label }}
        <span class="px-1.5 py-0.5 rounded-full text-xs font-bold ml-1"
              [style.background]="selectedRole()===role.key ? 'rgba(0,0,0,0.10)' : 'var(--border-color)'"
              [style.color]="selectedRole()===role.key ? role.color : 'var(--text-muted)'">
          {{ matrix().get(role.key)?.size ?? 0 }}
        </span>
      </button>
    }
  </div>

  <!-- ── Matrice ────────────────────────────────────────────────────────────── -->
  <div class="sms-card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <!-- Header rôles -->
        <thead>
          <tr style="background:var(--surface-2)">
            <th class="text-left px-5 py-4 font-bold text-xs uppercase tracking-wide min-w-[220px]"
                style="color:var(--text-secondary)">Permission</th>
            @for (role of roles; track role.key) {
              <th class="px-3 py-4 min-w-[90px]"
                  [style.background]="selectedRole()===role.key ? role.bg : 'var(--surface-2)'"
                  style="border-left:1px solid var(--border-color)">
                <div class="flex flex-col items-center gap-1">
                  <mat-icon style="font-size:16px;height:16px;width:16px"
                            [style.color]="selectedRole()===role.key ? role.color : 'var(--text-muted)'">
                    {{ role.icon }}
                  </mat-icon>
                  <span class="text-xs font-bold"
                        [style.color]="selectedRole()===role.key ? role.color : 'var(--text-secondary)'">
                    {{ role.label }}
                  </span>
                </div>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (group of groups; track group.module) {
            <!-- En-tête groupe -->
            <tr style="background:var(--surface-2)">
              <td colspan="8" class="px-5 py-2.5">
                <div class="flex items-center gap-2">
                  <mat-icon [style.color]="group.color"
                            style="font-size:16px;height:16px;width:16px">{{ group.icon }}</mat-icon>
                  <span class="text-xs font-black uppercase tracking-wider"
                        [style.color]="group.color">{{ group.module }}</span>
                </div>
              </td>
            </tr>
            <!-- Lignes permissions -->
            @for (perm of group.permissions; track perm.key) {
              <tr class="border-t hover:opacity-95 transition-opacity"
                  style="border-color:var(--border-color)">
                <td class="px-5 py-3">
                  <p class="font-semibold text-xs" style="color:var(--text-primary)">{{ perm.label }}</p>
                  <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ perm.description }}</p>
                  <code class="text-xs font-mono mt-0.5 inline-block"
                        style="color:var(--text-muted);font-size:9px">{{ perm.keycloakName }}</code>
                </td>
                @for (role of roles; track role.key) {
                  <td class="px-3 py-3 text-center"
                      style="border-left:1px solid var(--border-color)"
                      [style.background]="selectedRole()===role.key ? role.bg + '50' : 'transparent'">
                    <button (click)="togglePermission(role.key, perm.key)"
                            class="w-7 h-7 rounded-xl flex items-center justify-center mx-auto transition-all hover:opacity-80"
                            [style.background]="hasPermission(role.key, perm.key) ? group.color + '20' : 'var(--surface-2)'"
                            [title]="(hasPermission(role.key, perm.key) ? 'Révoquer' : 'Accorder') + ' : ' + perm.label + ' → ' + role.label">
                      <mat-icon style="font-size:16px;height:16px;width:16px"
                                [style.color]="hasPermission(role.key, perm.key) ? group.color : 'var(--border-color)'">
                        {{ hasPermission(role.key, perm.key) ? 'check_circle' : 'radio_button_unchecked' }}
                      </mat-icon>
                    </button>
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    <!-- Footer info -->
    <div class="px-5 py-3 border-t flex items-center justify-between"
         style="border-color:var(--border-color);background:var(--surface-2)">
      <div class="flex items-center gap-4 text-xs" style="color:var(--text-muted)">
        <span class="flex items-center gap-1">
          <mat-icon style="font-size:14px;height:14px;width:14px;color:#16a34a">check_circle</mat-icon>
          = Permission accordée
        </span>
        <span class="flex items-center gap-1">
          <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--border-color)">radio_button_unchecked</mat-icon>
          = Accès refusé
        </span>
      </div>
      @if (hasChanges()) {
        <span class="text-xs font-semibold px-2 py-1 rounded-lg"
              style="background:rgba(245,158,11,0.10);color:#d97706">
          {{ changeCount() }} modification(s) non enregistrée(s)
        </span>
      }
    </div>
  </div>

</div>
  `,
})
export class RbacComponent {
  readonly roles  = ROLES;
  readonly groups = PERMISSION_GROUPS;

  selectedRole = signal<RoleKey | null>(null);

  // Matrice mutable (copie profonde du défaut)
  private _matrix = new Map<RoleKey, Set<string>>(
    ROLES.map(r => [r.key, new Set(DEFAULT_MATRIX[r.key])])
  );
  private _original = new Map<RoleKey, Set<string>>(
    ROLES.map(r => [r.key, new Set(DEFAULT_MATRIX[r.key])])
  );

  // Signal de version pour forcer la mise à jour
  private _version = signal(0);

  readonly matrix = computed(() => {
    this._version(); // dépendance
    return this._matrix;
  });

  readonly hasChanges = computed(() => {
    this._version();
    for (const role of ROLES) {
      const cur = this._matrix.get(role.key)!;
      const orig = this._original.get(role.key)!;
      if (cur.size !== orig.size) return true;
      for (const p of cur) if (!orig.has(p)) return true;
    }
    return false;
  });

  readonly changeCount = computed(() => {
    this._version();
    let count = 0;
    for (const role of ROLES) {
      const cur = this._matrix.get(role.key)!;
      const orig = this._original.get(role.key)!;
      for (const p of cur)  if (!orig.has(p)) count++;
      for (const p of orig) if (!cur.has(p))  count++;
    }
    return count;
  });

  readonly totalPermissions = computed(() =>
    PERMISSION_GROUPS.reduce((s, g) => s + g.permissions.length, 0)
  );

  hasPermission(roleKey: RoleKey, permKey: string): boolean {
    this._version();
    return this._matrix.get(roleKey)?.has(permKey) ?? false;
  }

  togglePermission(roleKey: RoleKey, permKey: string): void {
    const set = this._matrix.get(roleKey);
    if (!set) return;
    set.has(permKey) ? set.delete(permKey) : set.add(permKey);
    this._version.update(v => v + 1);
  }

  saveChanges(): void {
    // Simulation : en production, appel Keycloak Admin API
    this._original = new Map<RoleKey, Set<string>>(
      ROLES.map(r => [r.key, new Set(this._matrix.get(r.key))])
    );
    this._version.update(v => v + 1);
    // Toast simulé
    console.log('RBAC changes saved — would sync with Keycloak');
  }
}
