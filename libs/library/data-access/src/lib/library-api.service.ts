import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  ILibraryResource, ILibraryCategory, ILoan, ILibraryStats,
  IReservation, IStudentLite, NiveauScolaire, TypeRessourceBiblio,
} from '@sms/shared/models';
import {
  MOCK_RESOURCES, MOCK_CATEGORIES, MOCK_LOANS,
  MOCK_RESERVATIONS, MOCK_STUDENTS,
} from './library.mock';

@Injectable({ providedIn: 'root' })
export class LibraryApiService {

  getCategories(): Observable<ILibraryCategory[]> {
    return of([...MOCK_CATEGORIES]).pipe(delay(200));
  }

  getResources(params?: {
    categorieId?: string;
    type?: string;
    niveau?: string;
    statut?: string;
    search?: string;
  }): Observable<ILibraryResource[]> {
    let list = [...MOCK_RESOURCES];
    if (params?.categorieId) list = list.filter(r => r.categorieId === params.categorieId);
    if (params?.type)        list = list.filter(r => r.type === params.type);
    if (params?.niveau)      list = list.filter(r => r.niveaux.includes(params.niveau as any));
    if (params?.statut)      list = list.filter(r => r.statut === params.statut);
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(r =>
        r.titre.toLowerCase().includes(q) ||
        r.auteur.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return of(list).pipe(delay(300));
  }

  getResource(publicId: string): Observable<ILibraryResource> {
    const r = MOCK_RESOURCES.find(r => r.publicId === publicId) ?? MOCK_RESOURCES[0];
    return of({ ...r }).pipe(delay(200));
  }

  getLoans(studentPublicId?: string): Observable<ILoan[]> {
    const list = studentPublicId
      ? MOCK_LOANS.filter(l => l.studentPublicId === studentPublicId)
      : MOCK_LOANS;
    return of([...list]).pipe(delay(250));
  }

  borrowResource(ressourcePublicId: string, studentPublicId: string, studentNom: string, dureeJours = 21): Observable<ILoan> {
    const ressource = MOCK_RESOURCES.find(r => r.publicId === ressourcePublicId);
    if (ressource && ressource.nbDisponibles > 0) {
      ressource.nbDisponibles--;
      if (ressource.nbDisponibles === 0) ressource.statut = 'EMPRUNTE';
    }
    const today = new Date();
    const retour = new Date(today);
    retour.setDate(retour.getDate() + dureeJours);
    const loan: ILoan = {
      publicId:          `loan-${Date.now()}`,
      ressourcePublicId,
      ressourceTitre:    ressource?.titre ?? '',
      ressourceAuteur:   ressource?.auteur ?? '',
      urlCouverture:     ressource?.urlCouverture,
      type:              ressource?.type ?? 'LIVRE',
      studentPublicId,
      studentNom,
      dateEmprunt:       today.toISOString().split('T')[0],
      dateRetourPrevue:  retour.toISOString().split('T')[0],
      statut:            'EN_COURS',
      nbRenouvellements: 0,
    };
    MOCK_LOANS.push(loan);
    return of(loan).pipe(delay(400));
  }

  returnResource(loanPublicId: string): Observable<ILoan> {
    const idx = MOCK_LOANS.findIndex(l => l.publicId === loanPublicId);
    if (idx >= 0) {
      MOCK_LOANS[idx] = {
        ...MOCK_LOANS[idx],
        statut: 'RETOURNE',
        dateRetourEffective: new Date().toISOString().split('T')[0],
      };
      const res = MOCK_RESOURCES.find(r => r.publicId === MOCK_LOANS[idx].ressourcePublicId);
      if (res) {
        res.nbDisponibles++;
        if (res.nbDisponibles > 0) res.statut = 'DISPONIBLE';
      }
    }
    return of(MOCK_LOANS[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  renewLoan(loanPublicId: string): Observable<ILoan> {
    const idx = MOCK_LOANS.findIndex(l => l.publicId === loanPublicId);
    if (idx >= 0 && MOCK_LOANS[idx].nbRenouvellements < 2) {
      const newDate = new Date(MOCK_LOANS[idx].dateRetourPrevue);
      newDate.setDate(newDate.getDate() + 14);
      MOCK_LOANS[idx] = {
        ...MOCK_LOANS[idx],
        dateRetourPrevue:  newDate.toISOString().split('T')[0],
        nbRenouvellements: MOCK_LOANS[idx].nbRenouvellements + 1,
        statut:            'EN_COURS',
      };
    }
    return of(MOCK_LOANS[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  getStats(): Observable<ILibraryStats> {
    const stats: ILibraryStats = {
      totalRessources:    MOCK_RESOURCES.length,
      empruntsEnCours:    MOCK_LOANS.filter(l => l.statut === 'EN_COURS').length,
      empruntsEnRetard:   MOCK_LOANS.filter(l => l.statut === 'EN_RETARD').length,
      ressourcesPopulaires: [...MOCK_RESOURCES].sort((a, b) => b.nbTelechargements - a.nbTelechargements).slice(0, 4),
      recentlyAdded:      [...MOCK_RESOURCES].sort((a, b) => b.dateAjout.localeCompare(a.dateAjout)).slice(0, 4),
    };
    return of(stats).pipe(delay(200));
  }

  // ── Élèves (sélecteur d'emprunt) ────────────────────────────────────────────
  getStudents(): Observable<IStudentLite[]> {
    return of([...MOCK_STUDENTS]).pipe(delay(150));
  }

  // ── Détail d'un emprunt ─────────────────────────────────────────────────────
  getLoan(publicId: string): Observable<ILoan> {
    const l = MOCK_LOANS.find(l => l.publicId === publicId) ?? MOCK_LOANS[0];
    return of({ ...l }).pipe(delay(200));
  }

  // ── Réservations ────────────────────────────────────────────────────────────
  getReservations(studentPublicId?: string): Observable<IReservation[]> {
    const list = studentPublicId
      ? MOCK_RESERVATIONS.filter(r => r.studentPublicId === studentPublicId)
      : MOCK_RESERVATIONS;
    return of([...list]).pipe(delay(250));
  }

  reserveResource(ressourcePublicId: string, studentPublicId: string, studentNom: string): Observable<IReservation> {
    const ressource = MOCK_RESOURCES.find(r => r.publicId === ressourcePublicId);
    const fileExistante = MOCK_RESERVATIONS.filter(
      r => r.ressourcePublicId === ressourcePublicId && r.statut === 'EN_ATTENTE',
    ).length;
    if (ressource && ressource.statut === 'DISPONIBLE') ressource.statut = 'RESERVE';
    const dispo = new Date();
    dispo.setDate(dispo.getDate() + 14 * (fileExistante + 1));
    const resa: IReservation = {
      publicId:                `resa-${Date.now()}`,
      ressourcePublicId,
      ressourceTitre:          ressource?.titre ?? '',
      ressourceAuteur:         ressource?.auteur ?? '',
      urlCouverture:           ressource?.urlCouverture,
      studentPublicId,
      studentNom,
      dateReservation:         new Date().toISOString().split('T')[0],
      rangFile:                fileExistante + 1,
      dateDisponibilitePrevue: dispo.toISOString().split('T')[0],
      statut:                  'EN_ATTENTE',
    };
    MOCK_RESERVATIONS.push(resa);
    return of(resa).pipe(delay(400));
  }

  cancelReservation(publicId: string): Observable<IReservation> {
    const idx = MOCK_RESERVATIONS.findIndex(r => r.publicId === publicId);
    if (idx >= 0) MOCK_RESERVATIONS[idx] = { ...MOCK_RESERVATIONS[idx], statut: 'ANNULEE' };
    return of(MOCK_RESERVATIONS[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  // ── CRUD ressource (admin) ──────────────────────────────────────────────────
  createResource(payload: Partial<ILibraryResource>): Observable<ILibraryResource> {
    const cat = MOCK_CATEGORIES.find(c => c.publicId === payload.categorieId);
    const exemplaires = payload.nbExemplaires ?? 1;
    const resource: ILibraryResource = {
      publicId:          `res-${Date.now()}`,
      titre:             payload.titre ?? 'Sans titre',
      auteur:            payload.auteur ?? 'Auteur inconnu',
      description:       payload.description ?? '',
      type:              (payload.type ?? 'LIVRE') as TypeRessourceBiblio,
      statut:            exemplaires > 0 ? 'DISPONIBLE' : 'INDISPONIBLE',
      categorie:         cat?.libelle ?? '',
      categorieId:       payload.categorieId ?? '',
      isbn:              payload.isbn,
      editeur:           payload.editeur,
      anneePublication:  payload.anneePublication,
      niveaux:           (payload.niveaux ?? ['TOUS']) as NiveauScolaire[],
      tags:              payload.tags ?? [],
      urlCouverture:     payload.urlCouverture,
      urlFichier:        payload.urlFichier,
      nombrePages:       payload.nombrePages,
      langue:            payload.langue ?? 'fr',
      nbExemplaires:     exemplaires,
      nbDisponibles:     exemplaires,
      nbTelechargements: 0,
      dateAjout:         new Date().toISOString().split('T')[0],
      nbAvis:            0,
      disponibleEnLigne: payload.disponibleEnLigne ?? false,
      formatNumerique:   payload.formatNumerique,
      emplacement:       payload.emplacement,
      cote:              payload.cote,
      section:           payload.section,
    };
    MOCK_RESOURCES.unshift(resource);
    return of(resource).pipe(delay(400));
  }

  updateResource(publicId: string, payload: Partial<ILibraryResource>): Observable<ILibraryResource> {
    const idx = MOCK_RESOURCES.findIndex(r => r.publicId === publicId);
    if (idx >= 0) {
      const cat = MOCK_CATEGORIES.find(c => c.publicId === (payload.categorieId ?? MOCK_RESOURCES[idx].categorieId));
      MOCK_RESOURCES[idx] = {
        ...MOCK_RESOURCES[idx],
        ...payload,
        categorie: cat?.libelle ?? MOCK_RESOURCES[idx].categorie,
      };
    }
    return of(MOCK_RESOURCES[idx >= 0 ? idx : 0]).pipe(delay(400));
  }
}
