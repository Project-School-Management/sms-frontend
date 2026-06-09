import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore } from '@sms/config-system/data-access';

@Component({
  selector: 'sms-finance-config',
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
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Référentiels financiers</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">Types de frais · Bourses · Réductions</p>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Types de frais -->
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b flex items-center gap-3" style="border-color:var(--border-color)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(22,163,74,0.12)">
          <mat-icon style="color:#16a34a;font-size:18px;height:18px;width:18px">receipt</mat-icon>
        </div>
        <h3 class="font-semibold" style="color:var(--text-primary)">Types de frais</h3>
      </div>
      <div class="divide-y" style="border-color:var(--border-color)">
        @for (f of refStore.typesFrais(); track f.publicId) {
          <div class="px-5 py-3.5 flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ f.libelle }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs px-1.5 py-0.5 rounded font-medium"
                      style="background:var(--surface-2);color:var(--text-muted)">{{ f.categorie }}</span>
                @if (f.obligatoire) {
                  <span class="text-xs" style="color:#d97706">• Obligatoire</span>
                }
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold" style="color:var(--accent)">
                {{ f.montant | number:'1.0-0' }} XOF
              </p>
              <span class="text-xs px-1.5 py-0.5 rounded-full"
                    [style.background]="f.active ? 'rgba(22,163,74,0.1)' : 'rgba(107,114,128,0.1)'"
                    [style.color]="f.active ? '#16a34a' : '#6b7280'">
                {{ f.active ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </div>
        }
      </div>
      <div class="px-5 py-3 border-t flex items-center justify-between"
           style="border-color:var(--border-color);background:var(--surface-2)">
        <span class="text-xs font-semibold" style="color:var(--text-secondary)">Frais d'inscription fixe</span>
        <span class="text-sm font-black" style="color:var(--accent)">
          {{ refStore.fraisInscriptionMontant() | number:'1.0-0' }} XOF
        </span>
      </div>
    </div>

    <!-- Types de bourses -->
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b flex items-center gap-3" style="border-color:var(--border-color)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(99,102,241,0.12)">
          <mat-icon style="color:#6366f1;font-size:18px;height:18px;width:18px">card_giftcard</mat-icon>
        </div>
        <h3 class="font-semibold" style="color:var(--text-primary)">Types de bourses</h3>
      </div>
      <div class="divide-y" style="border-color:var(--border-color)">
        @for (b of refStore.typesBourses(); track b.publicId) {
          <div class="px-5 py-3.5">
            <div class="flex items-center justify-between mb-1">
              <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ b.libelle }}</p>
              @if (b.montantMax) {
                <p class="text-sm font-bold" style="color:#16a34a">max {{ b.montantMax | number:'1.0-0' }} XOF</p>
              }
            </div>
            @if (b.conditions) {
              <p class="text-xs" style="color:var(--text-muted)">{{ b.conditions }}</p>
            }
          </div>
        }
      </div>
    </div>
  </div>
</div>
  `,
})
export class FinanceConfigComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);
  ngOnInit(): void { if (!this.refStore.loaded()) this.refStore.loadAll(); }
}
