import {
  Component, ChangeDetectionStrategy, inject, OnInit, signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LibraryStore, LibraryApiService } from '@sms/library/data-access';
import { ILibraryResource, NiveauScolaire, TypeRessourceBiblio } from '@sms/shared/models';

@Component({
  selector: 'sms-resource-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="resource-form-page">
  <a routerLink="/library" class="back-link"><mat-icon>arrow_back</mat-icon> Catalogue</a>

  <h1 class="page-title">
    <mat-icon>{{ isEdit() ? 'edit' : 'add_circle' }}</mat-icon>
    {{ isEdit() ? 'Modifier la ressource' : 'Ajouter une ressource' }}
  </h1>

  <form class="rf-form" (ngSubmit)="submit()">

    <!-- Informations générales -->
    <section class="rf-section">
      <h2 class="rf-section-title">Informations générales</h2>
      <div class="rf-grid">
        <div class="rf-field span-2">
          <label>Titre <span class="req">*</span></label>
          <input type="text" [(ngModel)]="form.titre" name="titre" class="ctrl" placeholder="Ex: Algèbre linéaire" />
        </div>
        <div class="rf-field">
          <label>Auteur <span class="req">*</span></label>
          <input type="text" [(ngModel)]="form.auteur" name="auteur" class="ctrl" placeholder="Ex: J.-P. Dupont" />
        </div>
        <div class="rf-field span-3">
          <label>Description</label>
          <textarea [(ngModel)]="form.description" name="description" class="ctrl" rows="3" placeholder="Résumé de la ressource…"></textarea>
        </div>
      </div>
    </section>

    <!-- Classification -->
    <section class="rf-section">
      <h2 class="rf-section-title">Classification</h2>
      <div class="rf-grid">
        <div class="rf-field">
          <label>Type <span class="req">*</span></label>
          <select [(ngModel)]="form.type" name="type" class="ctrl">
            <option value="LIVRE">Livre</option>
            <option value="PDF">PDF</option>
            <option value="VIDEO">Vidéo</option>
            <option value="AUDIO">Audio</option>
            <option value="LIEN">Lien</option>
            <option value="PERIODIQUE">Périodique</option>
          </select>
        </div>
        <div class="rf-field">
          <label>Catégorie <span class="req">*</span></label>
          <select [(ngModel)]="form.categorieId" name="categorieId" class="ctrl">
            <option value="">— Choisir —</option>
            @for (c of store.categories(); track c.publicId) {
              <option [value]="c.publicId">{{ c.libelle }}</option>
            }
          </select>
        </div>
        <div class="rf-field">
          <label>Langue</label>
          <input type="text" [(ngModel)]="form.langue" name="langue" class="ctrl" placeholder="fr" />
        </div>
        <div class="rf-field span-3">
          <label>Niveaux scolaires</label>
          <div class="checks">
            @for (n of niveauxList; track n) {
              <label class="check"><input type="checkbox" [(ngModel)]="niveaux[n]" [name]="'niv-' + n" /> {{ n }}</label>
            }
          </div>
        </div>
        <div class="rf-field span-3">
          <label>Tags <span class="hint">(séparés par des virgules)</span></label>
          <input type="text" [(ngModel)]="form.tagsRaw" name="tagsRaw" class="ctrl" placeholder="algèbre, matrices, exercices" />
        </div>
      </div>
    </section>

    <!-- Édition / Référence -->
    <section class="rf-section">
      <h2 class="rf-section-title">Référence bibliographique</h2>
      <div class="rf-grid">
        <div class="rf-field"><label>ISBN</label><input type="text" [(ngModel)]="form.isbn" name="isbn" class="ctrl" /></div>
        <div class="rf-field"><label>Éditeur</label><input type="text" [(ngModel)]="form.editeur" name="editeur" class="ctrl" /></div>
        <div class="rf-field"><label>Année</label><input type="number" [(ngModel)]="form.anneePublication" name="annee" class="ctrl" /></div>
        <div class="rf-field"><label>Nombre de pages</label><input type="number" [(ngModel)]="form.nombrePages" name="pages" class="ctrl" /></div>
        <div class="rf-field"><label>Nombre d'exemplaires</label><input type="number" min="0" [(ngModel)]="form.nbExemplaires" name="exemplaires" class="ctrl" /></div>
        <div class="rf-field"><label>URL de couverture</label><input type="text" [(ngModel)]="form.urlCouverture" name="cover" class="ctrl" placeholder="https://…" /></div>
      </div>
    </section>

    <!-- Disponibilité -->
    <section class="rf-section">
      <h2 class="rf-section-title">Disponibilité & emplacement</h2>
      <div class="rf-grid">
        <div class="rf-field span-3">
          <label class="check check-lg"><input type="checkbox" [(ngModel)]="form.disponibleEnLigne" name="enligne" /> Disponible en version électronique</label>
        </div>
        @if (form.disponibleEnLigne) {
          <div class="rf-field"><label>Format numérique</label><input type="text" [(ngModel)]="form.formatNumerique" name="format" class="ctrl" placeholder="PDF · 12 Mo" /></div>
          <div class="rf-field span-2"><label>URL du fichier</label><input type="text" [(ngModel)]="form.urlFichier" name="fichier" class="ctrl" placeholder="/api/v1/library/files/…" /></div>
        }
        <div class="rf-field"><label>Emplacement</label><input type="text" [(ngModel)]="form.emplacement" name="emplacement" class="ctrl" placeholder="Rayon B3" /></div>
        <div class="rf-field"><label>Cote</label><input type="text" [(ngModel)]="form.cote" name="cote" class="ctrl" placeholder="512.5 DUP" /></div>
        <div class="rf-field"><label>Section</label><input type="text" [(ngModel)]="form.section" name="section" class="ctrl" placeholder="Sciences exactes" /></div>
      </div>
    </section>

    @if (errorMsg()) {
      <div class="alert alert-error"><mat-icon>error</mat-icon> {{ errorMsg() }}</div>
    }

    <div class="rf-actions">
      <button type="submit" class="btn btn-primary" [disabled]="submitting()">
        <mat-icon>save</mat-icon> {{ submitting() ? 'Enregistrement…' : (isEdit() ? 'Enregistrer les modifications' : 'Ajouter au catalogue') }}
      </button>
      <a routerLink="/library" class="btn btn-outline">Annuler</a>
    </div>
  </form>
</div>
  `,
  styles: [`
.resource-form-page { padding: 24px; max-width: 920px; margin: 0 auto; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: #6366f1; text-decoration: none; font-size: 14px; margin-bottom: 20px; }
.back-link:hover { text-decoration: underline; }
.page-title { font-size: 22px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; margin: 0 0 24px; }

.rf-section { background: #fff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,.08); margin-bottom: 16px; }
.rf-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #6366f1; margin: 0 0 16px; }
.rf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.rf-field { display: flex; flex-direction: column; }
.rf-field.span-2 { grid-column: span 2; }
.rf-field.span-3 { grid-column: span 3; }
.rf-field label { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
.req { color: #ef4444; }
.hint { font-weight: 400; color: #94a3b8; }
.ctrl { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; background: #fff; font-family: inherit; }
.ctrl:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
textarea.ctrl { resize: vertical; }

.checks { display: flex; flex-wrap: wrap; gap: 14px; }
.check { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #374151; cursor: pointer; }
.check-lg { font-size: 14px; font-weight: 500; }
.check input { width: 16px; height: 16px; cursor: pointer; }

.alert { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
.alert-error { background: #fee2e2; color: #991b1b; }

.rf-actions { display: flex; gap: 12px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; transition: all .2s; }
.btn-primary { background: #6366f1; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #4f46e5; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e2e8f0; }
.btn-outline:hover { background: #f8fafc; }

@media (max-width: 768px) { .rf-grid { grid-template-columns: 1fr; } .rf-field.span-2, .rf-field.span-3 { grid-column: span 1; } }
  `],
})
export class ResourceFormComponent implements OnInit {
  protected readonly store = inject(LibraryStore);
  private readonly api    = inject(LibraryApiService);
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isEdit = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMsg = signal<string | null>(null);
  private editId: string | null = null;

  protected readonly niveauxList: NiveauScolaire[] = ['PRIMAIRE', 'COLLEGE', 'LYCEE', 'SUPERIEUR', 'TOUS'];
  protected niveaux: Record<string, boolean> = { PRIMAIRE: false, COLLEGE: false, LYCEE: false, SUPERIEUR: false, TOUS: false };

  protected form = {
    titre: '', auteur: '', description: '', type: 'LIVRE' as TypeRessourceBiblio, categorieId: '',
    langue: 'fr', isbn: '', editeur: '', anneePublication: null as number | null, nombrePages: null as number | null,
    nbExemplaires: 1, urlCouverture: '', disponibleEnLigne: false, formatNumerique: '', urlFichier: '',
    emplacement: '', cote: '', section: '', tagsRaw: '',
  };

  ngOnInit(): void {
    this.store.loadCategories();
    const id = this.route.snapshot.paramMap.get('publicId');
    if (id) {
      this.isEdit.set(true);
      this.editId = id;
      this.api.getResource(id).subscribe(r => this.populate(r));
    }
  }

  private populate(r: ILibraryResource): void {
    this.form = {
      titre: r.titre, auteur: r.auteur, description: r.description, type: r.type, categorieId: r.categorieId,
      langue: r.langue, isbn: r.isbn ?? '', editeur: r.editeur ?? '',
      anneePublication: r.anneePublication ?? null, nombrePages: r.nombrePages ?? null,
      nbExemplaires: r.nbExemplaires, urlCouverture: r.urlCouverture ?? '',
      disponibleEnLigne: r.disponibleEnLigne, formatNumerique: r.formatNumerique ?? '', urlFichier: r.urlFichier ?? '',
      emplacement: r.emplacement ?? '', cote: r.cote ?? '', section: r.section ?? '',
      tagsRaw: r.tags.join(', '),
    };
    this.niveauxList.forEach(n => this.niveaux[n] = r.niveaux.includes(n));
  }

  protected submit(): void {
    if (!this.form.titre.trim() || !this.form.auteur.trim() || !this.form.categorieId) {
      this.errorMsg.set('Titre, auteur et catégorie sont obligatoires.');
      return;
    }
    this.errorMsg.set(null);
    this.submitting.set(true);

    const niveaux = this.niveauxList.filter(n => this.niveaux[n]);
    const payload: Partial<ILibraryResource> = {
      titre: this.form.titre.trim(),
      auteur: this.form.auteur.trim(),
      description: this.form.description.trim(),
      type: this.form.type,
      categorieId: this.form.categorieId,
      langue: this.form.langue || 'fr',
      isbn: this.form.isbn || undefined,
      editeur: this.form.editeur || undefined,
      anneePublication: this.form.anneePublication ?? undefined,
      nombrePages: this.form.nombrePages ?? undefined,
      nbExemplaires: Number(this.form.nbExemplaires) || 0,
      urlCouverture: this.form.urlCouverture || undefined,
      disponibleEnLigne: this.form.disponibleEnLigne,
      formatNumerique: this.form.disponibleEnLigne ? (this.form.formatNumerique || undefined) : undefined,
      urlFichier: this.form.disponibleEnLigne ? (this.form.urlFichier || undefined) : undefined,
      emplacement: this.form.emplacement || undefined,
      cote: this.form.cote || undefined,
      section: this.form.section || undefined,
      niveaux: niveaux.length ? niveaux : ['TOUS'],
      tags: this.form.tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
    };

    const obs = this.isEdit() && this.editId
      ? this.api.updateResource(this.editId, payload)
      : this.api.createResource(payload);

    obs.subscribe({
      next: (saved) => {
        this.store.loadResources();
        this.router.navigate(['/library/resource', saved.publicId]);
      },
      error: () => { this.submitting.set(false); this.errorMsg.set('Une erreur est survenue.'); },
    });
  }
}
