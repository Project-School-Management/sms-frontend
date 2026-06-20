import {
  Component, ChangeDetectionStrategy, input, model, signal, computed,
  inject, ElementRef, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { IStudentLite } from '@sms/shared/models';

/**
 * Sélecteur d'élève avec recherche directe par nom, prénom, matricule ou classe.
 * Usage : <sms-student-picker [students]="list" [(value)]="studentId" />
 */
@Component({
  selector: 'sms-student-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
<div class="picker">
  @if (selected(); as s) {
    <!-- Élève sélectionné -->
    <div class="picked">
      <div class="avatar">{{ initials(s.nom) }}</div>
      <div class="info">
        <span class="nom">{{ s.nom }}</span>
        <span class="meta">{{ s.classe }} · {{ s.matricule }}</span>
      </div>
      <button type="button" class="clear" (click)="clear()" title="Changer d'élève">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  } @else {
    <!-- Champ de recherche -->
    <div class="search-box" [class.focused]="open()">
      <mat-icon class="s-ic">search</mat-icon>
      <input
        type="text"
        class="s-input"
        [ngModel]="query()"
        (ngModelChange)="query.set($event)"
        (focus)="open.set(true)"
        placeholder="Rechercher par nom, prénom ou matricule…" />
    </div>

    @if (open()) {
      @if (filtered().length) {
        <div class="dropdown">
          @for (s of filtered(); track s.publicId) {
            <button type="button" class="opt" (click)="pick(s)">
              <div class="avatar">{{ initials(s.nom) }}</div>
              <div class="info">
                <span class="nom" [innerHTML]="highlight(s.nom)"></span>
                <span class="meta">{{ s.classe }} · <span [innerHTML]="highlight(s.matricule)"></span></span>
              </div>
            </button>
          }
        </div>
      } @else {
        <div class="dropdown empty">
          <mat-icon>person_off</mat-icon> Aucun élève ne correspond à « {{ query() }} »
        </div>
      }
    }
  }
</div>
  `,
  styles: [`
:host { display: block; }
.picker { position: relative; }

/* Recherche */
.search-box { display: flex; align-items: center; gap: 8px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 12px; background: #fff; transition: all .2s; }
.search-box.focused { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.s-ic { color: #94a3b8; font-size: 20px !important; height: 20px !important; width: 20px !important; }
.s-input { flex: 1; border: none; outline: none; padding: 10px 0; font-size: 14px; background: transparent; font-family: inherit; }

/* Dropdown */
.dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,.12); max-height: 280px; overflow-y: auto; z-index: 50; padding: 4px; }
.dropdown.empty { display: flex; align-items: center; gap: 8px; padding: 16px; color: #94a3b8; font-size: 13px; }
.dropdown.empty mat-icon { font-size: 18px !important; height: 18px !important; width: 18px !important; }

.opt { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border: none; background: transparent; border-radius: 8px; cursor: pointer; text-align: left; transition: background .15s; }
.opt:hover { background: #f1f5f9; }

/* Avatar + infos (partagés) */
.avatar { width: 34px; height: 34px; min-width: 34px; border-radius: 9999px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.info { display: flex; flex-direction: column; min-width: 0; }
.nom { font-size: 14px; font-weight: 600; color: #1e293b; }
.meta { font-size: 12px; color: #94a3b8; }
:host ::ng-deep mark { background: #fef08a; color: inherit; border-radius: 2px; padding: 0 1px; }

/* Sélectionné */
.picked { display: flex; align-items: center; gap: 10px; border: 1px solid #c7d2fe; background: #eef2ff; border-radius: 8px; padding: 8px 10px; }
.picked .info { flex: 1; }
.clear { width: 30px; height: 30px; border: none; background: transparent; border-radius: 6px; cursor: pointer; color: #6366f1; display: flex; align-items: center; justify-content: center; transition: background .15s; }
.clear:hover { background: #e0e7ff; }
.clear mat-icon { font-size: 18px !important; height: 18px !important; width: 18px !important; }
  `],
})
export class StudentPickerComponent {
  readonly students = input<IStudentLite[]>([]);
  readonly value    = model<string>('');   // publicId de l'élève sélectionné

  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly query = signal('');
  protected readonly open  = signal(false);

  protected readonly selected = computed(() =>
    this.students().find(s => s.publicId === this.value()) ?? null,
  );

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.students();
    return this.students().filter(s =>
      s.nom.toLowerCase().includes(q) ||
      s.matricule.toLowerCase().includes(q) ||
      s.classe.toLowerCase().includes(q),
    );
  });

  @HostListener('document:click', ['$event'])
  protected onDocClick(e: MouseEvent): void {
    if (!this.host.nativeElement.contains(e.target)) this.open.set(false);
  }

  protected pick(s: IStudentLite): void {
    this.value.set(s.publicId);
    this.query.set('');
    this.open.set(false);
  }

  protected clear(): void {
    this.value.set('');
    this.query.set('');
    this.open.set(true);
  }

  protected initials(nom: string): string {
    return nom.split(/\s+/).map(p => p[0] ?? '').slice(0, 2).join('').toUpperCase();
  }

  protected highlight(text: string): string {
    const q = this.query().trim();
    if (!q) return text;
    const safe = q.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${safe})`, 'ig'), '<mark>$1</mark>');
  }
}
