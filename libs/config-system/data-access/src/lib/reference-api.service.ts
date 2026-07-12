import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  IEtablissement, ICycle, INiveau, IFiliere, ISpecialite,
  IDepartementRef, IFaculteRef, IClasseRef, IMatiereRef,
  IAnneeAcademiqueRef, IPeriodeRef, IBatimentRef, ISalleRef,
  ITypeFraisRef, ITypeBourseRef, IGradeRef, ITypeDocumentRef,
  ITypeEvaluationRef, CategoriePersonnel, TypeSalle, IConfigSnapshot,
  IEspaceConfig, EspaceWorkspaceType,
} from './reference.types';
import {
  MOCK_ETABLISSEMENT, MOCK_CYCLES, MOCK_NIVEAUX, MOCK_FILIERES,
  MOCK_SPECIALITES, MOCK_DEPARTEMENTS, MOCK_FACULTES, MOCK_CLASSES,
  MOCK_MATIERES, MOCK_ANNEES, MOCK_PERIODES, MOCK_BATIMENTS, MOCK_SALLES,
  MOCK_TYPES_FRAIS, MOCK_TYPES_BOURSES, MOCK_GRADES, MOCK_TYPES_DOCUMENTS,
  MOCK_TYPES_EVALUATION, MOCK_CONFIG_SNAPSHOT, MOCK_ESPACES,
} from './reference-data.mock';

/**
 * ReferenceApiService — Mock du futur microservice reference-service
 *
 * Contrat API respecté :  referenceService.getXxx() → Observable<T>
 * Migration future       :  remplacer les Observable<of(MOCK_*)> par des appels HTTP
 *                           sans aucun changement dans les consommateurs.
 */
@Injectable({ providedIn: 'root' })
export class ReferenceApiService {

  private readonly _d = 150; // délai simulé (ms)

  // ── Établissement ──────────────────────────────────────────────────────────
  getEtablissement(): Observable<IEtablissement> {
    return of(MOCK_ETABLISSEMENT).pipe(delay(this._d));
  }

  /** PUT /api/v1/etablissements/{id} (docs/api-contracts/06-administration-service.md). */
  updateEtablissement(data: Partial<IEtablissement>): Observable<IEtablissement> {
    Object.assign(MOCK_ETABLISSEMENT, data);
    return of({ ...MOCK_ETABLISSEMENT }).pipe(delay(300));
  }

  /** POST /api/v1/etablissements/{id}/logo — mock : URL locale (objectURL) du fichier choisi. */
  uploadLogo(file: File): Observable<{ logoUrlSignee: string }> {
    const logoUrlSignee = URL.createObjectURL(file);
    MOCK_ETABLISSEMENT.logoUrl = logoUrlSignee;
    return of({ logoUrlSignee }).pipe(delay(400));
  }

  // ── Espaces (docs/architecture/tenancy-model.md §2-3, §5, §13.3) ──────────
  getEspaces(): Observable<IEspaceConfig[]> {
    return of([...MOCK_ESPACES]).pipe(delay(this._d));
  }

  /** Déclare un nouvel espace pour ce tenant — action Phase 1 (super-admin), doc §5.1/§13.3. */
  createEspace(workspaceType: EspaceWorkspaceType, label: string): Observable<IEspaceConfig> {
    const slug = label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
    const created: IEspaceConfig = {
      publicId: `esp-${Date.now()}`,
      workspaceType,
      label,
      groupPath: `/complexe-horizon/${slug}`,
      active: true,
      dateCreation: new Date().toISOString().split('T')[0],
    };
    MOCK_ESPACES.push(created);
    return of(created).pipe(delay(400));
  }

  toggleEspace(publicId: string, active: boolean): Observable<void> {
    const espace = MOCK_ESPACES.find(e => e.publicId === publicId);
    if (espace) espace.active = active;
    return of(undefined).pipe(delay(150));
  }

  // ── Structure pédagogique ──────────────────────────────────────────────────
  getCycles(): Observable<ICycle[]> {
    return of(MOCK_CYCLES.filter(c => c.active)).pipe(delay(this._d));
  }

  getNiveaux(cyclePublicId?: string): Observable<INiveau[]> {
    const list = cyclePublicId
      ? MOCK_NIVEAUX.filter(n => n.cyclePublicId === cyclePublicId && n.active)
      : MOCK_NIVEAUX.filter(n => n.active);
    return of(list).pipe(delay(this._d));
  }

  getFilieres(cyclePublicId?: string): Observable<IFiliere[]> {
    const list = cyclePublicId
      ? MOCK_FILIERES.filter(f => f.cyclePublicId === cyclePublicId && f.active)
      : MOCK_FILIERES.filter(f => f.active);
    return of(list).pipe(delay(this._d));
  }

  getSpecialites(departementPublicId?: string): Observable<ISpecialite[]> {
    const list = departementPublicId
      ? MOCK_SPECIALITES.filter(s => s.departementPublicId === departementPublicId && s.active)
      : MOCK_SPECIALITES.filter(s => s.active);
    return of(list).pipe(delay(this._d));
  }

  getDepartements(facultePublicId?: string): Observable<IDepartementRef[]> {
    const list = facultePublicId
      ? MOCK_DEPARTEMENTS.filter(d => d.facultePublicId === facultePublicId && d.active)
      : MOCK_DEPARTEMENTS.filter(d => d.active);
    return of(list).pipe(delay(this._d));
  }

  getFacultes(): Observable<IFaculteRef[]> {
    return of(MOCK_FACULTES.filter(f => f.active)).pipe(delay(this._d));
  }

  // ── Classes ────────────────────────────────────────────────────────────────
  getClasses(params?: { niveauId?: string; anneeId?: string; cycleId?: string }): Observable<IClasseRef[]> {
    let list = MOCK_CLASSES.filter(c => c.active);
    if (params?.niveauId) list = list.filter(c => c.niveauPublicId === params.niveauId);
    if (params?.anneeId)  list = list.filter(c => c.anneeAcademiquePublicId === params.anneeId);
    if (params?.cycleId)  list = list.filter(c => c.cyclePublicId === params.cycleId);
    return of(list).pipe(delay(this._d));
  }

  getClasse(publicId: string): Observable<IClasseRef | null> {
    return of(MOCK_CLASSES.find(c => c.publicId === publicId) ?? null).pipe(delay(50));
  }

  // ── Pédagogie ─────────────────────────────────────────────────────────────
  getMatieres(niveauPublicId?: string): Observable<IMatiereRef[]> {
    const list = niveauPublicId
      ? MOCK_MATIERES.filter(m => m.niveauxPublicIds.includes(niveauPublicId) && m.active)
      : MOCK_MATIERES.filter(m => m.active);
    return of(list).pipe(delay(this._d));
  }

  getTypesEvaluation(): Observable<ITypeEvaluationRef[]> {
    return of(MOCK_TYPES_EVALUATION.filter(t => t.active)).pipe(delay(this._d));
  }

  // ── Calendrier ────────────────────────────────────────────────────────────
  getAnneesAcademiques(): Observable<IAnneeAcademiqueRef[]> {
    return of(MOCK_ANNEES).pipe(delay(this._d));
  }

  getAnneeActive(): Observable<IAnneeAcademiqueRef | null> {
    return of(MOCK_ANNEES.find(a => a.active) ?? null).pipe(delay(50));
  }

  getPeriodes(anneePublicId?: string): Observable<IPeriodeRef[]> {
    const list = anneePublicId
      ? MOCK_PERIODES.filter(p => p.anneeAcademiquePublicId === anneePublicId)
      : MOCK_PERIODES;
    return of(list).pipe(delay(this._d));
  }

  // ── Logistique ────────────────────────────────────────────────────────────
  getBatiments(): Observable<IBatimentRef[]> {
    return of(MOCK_BATIMENTS.filter(b => b.active)).pipe(delay(this._d));
  }

  getSalles(batimentPublicId?: string): Observable<ISalleRef[]> {
    const list = batimentPublicId
      ? MOCK_SALLES.filter(s => s.batimentPublicId === batimentPublicId && s.active)
      : MOCK_SALLES.filter(s => s.active);
    return of(list).pipe(delay(this._d));
  }

  getSallesByType(type: TypeSalle): Observable<ISalleRef[]> {
    return of(MOCK_SALLES.filter(s => s.type === type && s.active)).pipe(delay(this._d));
  }

  // ── Finance ───────────────────────────────────────────────────────────────
  getTypesFrais(cyclePublicId?: string): Observable<ITypeFraisRef[]> {
    const list = cyclePublicId
      ? MOCK_TYPES_FRAIS.filter(f => (!f.cyclePublicId || f.cyclePublicId === cyclePublicId) && f.active)
      : MOCK_TYPES_FRAIS.filter(f => f.active);
    return of(list).pipe(delay(this._d));
  }

  getTypesBourses(): Observable<ITypeBourseRef[]> {
    return of(MOCK_TYPES_BOURSES.filter(b => b.active)).pipe(delay(this._d));
  }

  // ── RH ────────────────────────────────────────────────────────────────────
  getGrades(categorie?: CategoriePersonnel): Observable<IGradeRef[]> {
    const list = categorie
      ? MOCK_GRADES.filter(g => g.categorie === categorie && g.active)
      : MOCK_GRADES.filter(g => g.active);
    return of(list).pipe(delay(this._d));
  }

  // ── Documents ─────────────────────────────────────────────────────────────
  getTypesDocuments(): Observable<ITypeDocumentRef[]> {
    return of(MOCK_TYPES_DOCUMENTS.filter(d => d.active)).pipe(delay(this._d));
  }

  // ── Snapshot complet (chargement initial) ─────────────────────────────────
  getConfigSnapshot(): Observable<IConfigSnapshot> {
    return of(MOCK_CONFIG_SNAPSHOT).pipe(delay(300));
  }

  // ── CRUD Admin (simulation — remplacé par HTTP PUT/POST/DELETE) ───────────

  upsertClasse(data: Partial<IClasseRef>): Observable<IClasseRef> {
    const idx = MOCK_CLASSES.findIndex(c => c.publicId === data.publicId);
    if (idx >= 0) {
      Object.assign(MOCK_CLASSES[idx], data);
      return of(MOCK_CLASSES[idx]).pipe(delay(200));
    }
    const newClasse: IClasseRef = { ...data, publicId: `cls-${Date.now()}`, active: true } as IClasseRef;
    MOCK_CLASSES.push(newClasse);
    return of(newClasse).pipe(delay(200));
  }

  upsertSalle(data: Partial<ISalleRef>): Observable<ISalleRef> {
    const idx = MOCK_SALLES.findIndex(s => s.publicId === data.publicId);
    if (idx >= 0) {
      Object.assign(MOCK_SALLES[idx], data);
      return of(MOCK_SALLES[idx]).pipe(delay(200));
    }
    const newSalle: ISalleRef = { ...data, publicId: `sal-${Date.now()}`, active: true } as ISalleRef;
    MOCK_SALLES.push(newSalle);
    return of(newSalle).pipe(delay(200));
  }

  upsertTypeFrais(data: Partial<ITypeFraisRef>): Observable<ITypeFraisRef> {
    const idx = MOCK_TYPES_FRAIS.findIndex(f => f.publicId === data.publicId);
    if (idx >= 0) {
      Object.assign(MOCK_TYPES_FRAIS[idx], data);
      return of(MOCK_TYPES_FRAIS[idx]).pipe(delay(200));
    }
    const newFrais: ITypeFraisRef = { ...data, publicId: `frais-${Date.now()}`, active: true } as ITypeFraisRef;
    MOCK_TYPES_FRAIS.push(newFrais);
    return of(newFrais).pipe(delay(200));
  }

  upsertMatiere(data: Partial<IMatiereRef>): Observable<IMatiereRef> {
    const idx = MOCK_MATIERES.findIndex(m => m.publicId === data.publicId);
    if (idx >= 0) {
      Object.assign(MOCK_MATIERES[idx], data);
      return of(MOCK_MATIERES[idx]).pipe(delay(200));
    }
    const newMat: IMatiereRef = { ...data, publicId: `mat-${Date.now()}`, active: true } as IMatiereRef;
    MOCK_MATIERES.push(newMat);
    return of(newMat).pipe(delay(200));
  }

  toggleActive(collection: 'classes' | 'salles' | 'matieres', publicId: string, active: boolean): Observable<void> {
    const map = { classes: MOCK_CLASSES, salles: MOCK_SALLES, matieres: MOCK_MATIERES };
    const item = (map[collection] as { publicId: string; active: boolean }[]).find(i => i.publicId === publicId);
    if (item) item.active = active;
    return of(undefined).pipe(delay(100));
  }
}
