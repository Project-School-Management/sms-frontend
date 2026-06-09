import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore } from '@sms/config-system/data-access';

@Component({
  selector: 'sms-calendar-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6">
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/config" class="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
       style="background:var(--surface-2);color:var(--text-secondary)">
      <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
    </a>
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Calendrier académique</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">Années académiques · Trimestres · Semestres · Sessions</p>
    </div>
  </div>

  <!-- Années académiques -->
  <div class="sms-card overflow-hidden mb-6">
    <div class="px-5 py-4 border-b" style="border-color:var(--border-color)">
      <h3 class="font-semibold" style="color:var(--text-primary)">Années académiques</h3>
    </div>
    <div class="divide-y" style="border-color:var(--border-color)">
      @for (a of refStore.annees(); track a.publicId) {
        <div class="px-5 py-4 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               [style.background]="a.active ? 'rgba(22,163,74,0.12)' : 'var(--surface-2)'">
            <mat-icon [style.color]="a.active ? '#16a34a' : 'var(--text-muted)'"
                      style="font-size:20px;height:20px;width:20px">
              {{ a.active ? 'event_available' : 'calendar_today' }}
            </mat-icon>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold" style="color:var(--text-primary)">{{ a.libelle }}</h3>
              @if (a.active) {
                <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                      style="background:rgba(22,163,74,0.12);color:#16a34a">En cours</span>
              }
            </div>
            <p class="text-xs" style="color:var(--text-secondary)">
              {{ a.dateDebut | date:'dd/MM/yyyy' }} → {{ a.dateFin | date:'dd/MM/yyyy' }}
            </p>
            @if (a.description) {
              <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ a.description }}</p>
            }
          </div>
          <!-- Périodes de cette année -->
          <div class="flex gap-2 flex-wrap">
            @for (p of periodesForAnnee(a.publicId); track p.publicId) {
              <span class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                    [style.background]="p.active ? 'rgba(8,145,178,0.1)' : 'var(--surface-2)'"
                    [style.color]="p.active ? '#0891b2' : 'var(--text-muted)'">
                <mat-icon style="font-size:12px;height:12px;width:12px">schedule</mat-icon>
                {{ p.libelle }}
              </span>
            }
          </div>
        </div>
      }
    </div>
  </div>

  <!-- Timeline des périodes -->
  <div class="sms-card p-5">
    <h3 class="font-semibold mb-4" style="color:var(--text-primary)">Périodes 2025-2026</h3>
    <div class="space-y-3">
      @for (p of refStore.periodes(); track p.publicId) {
        <div class="flex items-center gap-4 p-3 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
               [style.background]="p.type === 'TRIMESTRE' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)'">
            <span class="text-xs font-black"
                  [style.color]="p.type === 'TRIMESTRE' ? '#d97706' : '#6366f1'">{{ p.ordre }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ p.libelle }}</p>
              <span class="text-xs px-1.5 py-0.5 rounded font-medium"
                    [style.background]="p.type === 'TRIMESTRE' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)'"
                    [style.color]="p.type === 'TRIMESTRE' ? '#d97706' : '#6366f1'">{{ p.type }}</span>
            </div>
            <p class="text-xs" style="color:var(--text-secondary)">
              {{ p.dateDebut | date:'dd MMM yyyy' }} → {{ p.dateFin | date:'dd MMM yyyy' }}
            </p>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full"
                [style.background]="p.active ? 'rgba(22,163,74,0.1)' : 'var(--surface-2)'"
                [style.color]="p.active ? '#16a34a' : 'var(--text-muted)'">
            {{ p.active ? 'En cours' : 'À venir' }}
          </span>
        </div>
      }
    </div>
  </div>
</div>
  `,
})
export class CalendarConfigComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);
  ngOnInit(): void { if (!this.refStore.loaded()) this.refStore.loadAll(); }
  periodesForAnnee(anneeId: string) {
    return this.refStore.periodes().filter(p => p.anneeAcademiquePublicId === anneeId);
  }
}
