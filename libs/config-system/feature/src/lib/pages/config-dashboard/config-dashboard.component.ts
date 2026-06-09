import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore } from '@sms/config-system/data-access';

interface ConfigSection {
  title:       string;
  description: string;
  icon:        string;
  color:       string;
  bg:          string;
  route:       string;
  stats:       { label: string; value: () => string | number }[];
}

@Component({
  selector:        'sms-config-dashboard',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Configuration Système</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Référentiels centralisés — source unique de vérité pour toute la plateforme
      </p>
    </div>
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
         style="background:rgba(22,163,74,0.1);color:#16a34a;border:1px solid rgba(22,163,74,0.2)">
      <mat-icon style="font-size:14px;height:14px;width:14px">check_circle</mat-icon>
      {{ refStore.anneeActiveLib() }} — Actif
    </div>
  </div>

  <!-- Établissement banner -->
  @if (refStore.etablissement(); as etab) {
    <div class="sms-card p-5 mb-6 flex items-center gap-5"
         style="background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.06));border-color:rgba(99,102,241,0.2)">
      <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
           style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
        <mat-icon style="color:#fff;font-size:28px;height:28px;width:28px">account_balance</mat-icon>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="text-lg font-bold" style="color:var(--text-primary)">{{ etab.libelle }}</h2>
        <div class="flex flex-wrap gap-4 mt-1 text-sm" style="color:var(--text-secondary)">
          <span class="flex items-center gap-1">
            <mat-icon style="font-size:14px;height:14px;width:14px">category</mat-icon>{{ etab.type }}
          </span>
          <span class="flex items-center gap-1">
            <mat-icon style="font-size:14px;height:14px;width:14px">location_on</mat-icon>{{ etab.ville }}, {{ etab.pays }}
          </span>
          <span class="flex items-center gap-1">
            <mat-icon style="font-size:14px;height:14px;width:14px">email</mat-icon>{{ etab.email }}
          </span>
        </div>
      </div>
      <div class="hidden md:grid grid-cols-3 gap-4 text-center flex-shrink-0">
        <div>
          <p class="text-2xl font-black" style="color:var(--accent)">{{ refStore.totalEffectif() }}</p>
          <p class="text-xs" style="color:var(--text-muted)">Élèves</p>
        </div>
        <div>
          <p class="text-2xl font-black" style="color:var(--accent)">{{ refStore.totalClasses() }}</p>
          <p class="text-xs" style="color:var(--text-muted)">Classes</p>
        </div>
        <div>
          <p class="text-2xl font-black" style="color:var(--accent)">{{ refStore.tauxRemplissage() }}%</p>
          <p class="text-xs" style="color:var(--text-muted)">Occupation</p>
        </div>
      </div>
    </div>
  }

  <!-- KPI globaux -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(99,102,241,0.1)">
        <mat-icon style="color:#6366f1">school</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ refStore.classes().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Classes configurées</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(245,158,11,0.1)">
        <mat-icon style="color:#f59e0b">menu_book</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ refStore.matieres().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Matières</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(8,145,178,0.1)">
        <mat-icon style="color:#0891b2">meeting_room</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ refStore.salles().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Salles</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(22,163,74,0.1)">
        <mat-icon style="color:#16a34a">payments</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ refStore.typesFrais().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Types de frais</p>
      </div>
    </div>
  </div>

  <!-- Sections de configuration -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    @for (section of sections; track section.route) {
      <a [routerLink]="section.route"
         class="sms-card p-5 hover:opacity-90 transition-opacity group block">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               [style.background]="section.bg">
            <mat-icon style="font-size:22px;height:22px;width:22px" [style.color]="section.color">{{ section.icon }}</mat-icon>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold flex items-center gap-2" style="color:var(--text-primary)">
              {{ section.title }}
              <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</mat-icon>
            </h3>
            <p class="text-xs mt-0.5" style="color:var(--text-secondary)">{{ section.description }}</p>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          @for (stat of section.stats; track stat.label) {
            <div class="p-3 rounded-xl text-center" style="background:var(--surface-2)">
              <p class="text-lg font-bold" [style.color]="section.color">{{ stat.value() }}</p>
              <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ stat.label }}</p>
            </div>
          }
        </div>
      </a>
    }
  </div>

  <!-- Avertissement données codées en dur restantes -->
  @if (!refStore.loaded()) {
    <div class="mt-6 flex items-start gap-3 p-4 rounded-xl"
         style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25)">
      <mat-icon style="color:#d97706;flex-shrink:0">warning</mat-icon>
      <div>
        <p class="text-sm font-semibold" style="color:#d97706">Chargement des référentiels en cours…</p>
        <p class="text-xs mt-0.5" style="color:var(--text-secondary)">
          Les données sont récupérées depuis le service de référentiels centralisé.
        </p>
      </div>
    </div>
  }
</div>
  `,
})
export class ConfigDashboardComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);

  readonly sections = [
    {
      title:       'Référentiels académiques',
      description: 'Cycles, niveaux, filières, classes, matières',
      icon:        'school',
      color:       '#6366f1',
      bg:          'rgba(99,102,241,0.1)',
      route:       'academic',
      stats: [
        { label: 'Cycles',   value: () => this.refStore.cycles().length    },
        { label: 'Niveaux',  value: () => this.refStore.niveaux().length   },
        { label: 'Classes',  value: () => this.refStore.classes().length   },
      ],
    },
    {
      title:       'Calendrier académique',
      description: 'Années, trimestres, semestres, sessions',
      icon:        'calendar_month',
      color:       '#0891b2',
      bg:          'rgba(8,145,178,0.1)',
      route:       'calendar',
      stats: [
        { label: 'Années',   value: () => this.refStore.annees().length    },
        { label: 'Périodes', value: () => this.refStore.periodes().length  },
        { label: 'Active',   value: () => this.refStore.anneeActiveLib()   },
      ],
    },
    {
      title:       'Salles & infrastructure',
      description: 'Bâtiments, salles, amphithéâtres, labos',
      icon:        'meeting_room',
      color:       '#d97706',
      bg:          'rgba(217,119,6,0.1)',
      route:       'rooms',
      stats: [
        { label: 'Bâtiments',value: () => this.refStore.batiments().length },
        { label: 'Salles',   value: () => this.refStore.salles().length    },
        { label: 'Amphi',    value: () => this.refStore.sallesAmphi().length },
      ],
    },
    {
      title:       'Référentiels financiers',
      description: 'Frais, bourses, réductions, pénalités',
      icon:        'payments',
      color:       '#16a34a',
      bg:          'rgba(22,163,74,0.1)',
      route:       'finance',
      stats: [
        { label: 'Types frais', value: () => this.refStore.typesFrais().length   },
        { label: 'Bourses',     value: () => this.refStore.typesBourses().length },
        { label: 'Obligatoires',value: () => this.refStore.typesFrais().filter(f => f.obligatoire).length },
      ],
    },
  ];

  ngOnInit(): void {
    if (!this.refStore.loaded()) {
      this.refStore.loadAll();
    }
  }
}
