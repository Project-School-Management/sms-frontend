import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AcademicStore } from '@sms/academic/data-access';

@Component({
  selector: 'sms-bulletin-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/academic/bulletins" class="text-blue-600 hover:underline text-sm">← Retour</a>
        <h1 class="text-2xl font-bold text-gray-900">Bulletin de notes</h1>
      </div>

      @if (store.loading()) {
        <div class="text-gray-500">Chargement...</div>
      }

      @if (store.selectedBulletin(); as b) {
        <div class="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div class="flex items-start justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 class="text-lg font-bold text-gray-900">{{ b.studentNom }}</h2>
              <p class="text-sm text-gray-500">{{ b.promotionLibelle }} — Semestre {{ b.semestre }}</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold" [class]="moyenneClass(b.moyenne)">{{ b.moyenne }}/20</p>
              <p class="text-sm text-gray-500">Rang : {{ b.rang }}</p>
              <span [class]="statutClass(b.statut)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ b.statut }}
              </span>
            </div>
          </div>

          <table class="w-full text-sm">
            <thead class="bg-gray-50 rounded">
              <tr>
                <th class="text-left px-3 py-2 text-gray-600 font-medium">Matière</th>
                <th class="text-center px-3 py-2 text-gray-600 font-medium">Note /20</th>
                <th class="text-left px-3 py-2 text-gray-600 font-medium">Appréciation</th>
              </tr>
            </thead>
            <tbody>
              @for (note of b.notes; track note.publicId) {
                <tr class="border-b border-gray-100">
                  <td class="px-3 py-2 font-medium">{{ note.matiereLibelle }}</td>
                  <td class="px-3 py-2 text-center">
                    @if (note.absent) {
                      <span class="text-red-500 font-bold">ABS</span>
                    } @else {
                      <span [class]="noteClass(note.valeur)" class="font-bold">{{ note.valeur }}</span>
                    }
                  </td>
                  <td class="px-3 py-2 text-gray-500">{{ note.appreciation ?? '—' }}</td>
                </tr>
              }
            </tbody>
          </table>

          @if (b.pdfUrl) {
            <div class="pt-4 border-t border-gray-100">
              <a [href]="b.pdfUrl" target="_blank" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Télécharger PDF
              </a>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class BulletinDetailComponent implements OnInit {
  readonly store = inject(AcademicStore);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.loadBulletin(id);
  }

  moyenneClass(m: number): string {
    if (m >= 16) return 'text-green-600';
    if (m >= 10) return 'text-gray-700';
    return 'text-red-500';
  }
  noteClass(v: number | null): string {
    if (!v) return 'text-gray-400';
    if (v >= 14) return 'text-green-600';
    if (v >= 10) return 'text-gray-700';
    return 'text-red-500';
  }
  statutClass(statut: string): string {
    const map: Record<string, string> = {
      PUBLIE: 'bg-green-100 text-green-700', GENERE: 'bg-blue-100 text-blue-700', EN_ATTENTE: 'bg-gray-100 text-gray-600',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-600';
  }
}
