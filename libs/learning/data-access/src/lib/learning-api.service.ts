import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  ICours, IExamen, IDevoir, IResultatExamen, ICertificat,
  ISessionVirtuelle, IQuestionBanque,
} from '@sms/shared/models';
import { MOCK_COURS, MOCK_EXAMENS } from './learning.mock';
import {
  MOCK_DEVOIRS, MOCK_RESULTATS, MOCK_CERTIFICATS,
  MOCK_SESSIONS_VIRTUELLES, MOCK_QUESTIONS_BANQUE,
} from './learning-extended.mock';

@Injectable({ providedIn: 'root' })
export class LearningApiService {

  getCours(promotionPublicId?: string): Observable<ICours[]> {
    const list = promotionPublicId
      ? MOCK_COURS.filter(c => c.promotionPublicId === promotionPublicId)
      : MOCK_COURS;
    return of(list).pipe(delay(300));
  }

  getCour(publicId: string): Observable<ICours> {
    const c = MOCK_COURS.find(c => c.publicId === publicId) ?? MOCK_COURS[0];
    return of(c).pipe(delay(200));
  }

  getExamens(): Observable<IExamen[]> {
    return of(MOCK_EXAMENS).pipe(delay(300));
  }

  getExamen(publicId: string): Observable<IExamen> {
    const e = MOCK_EXAMENS.find(e => e.publicId === publicId) ?? MOCK_EXAMENS[0];
    return of(e).pipe(delay(200));
  }

  deleteExamen(publicId: string): Observable<void> {
    return of(void 0).pipe(delay(250));
  }

  createCours(data: Partial<ICours>): Observable<ICours> {
    const c: ICours = {
      publicId:           `cours-new-${Date.now()}`,
      titre:              data.titre ?? '',
      description:        data.description ?? '',
      matierePublicId:    data.matierePublicId ?? '',
      matiereLibelle:     data.matiereLibelle ?? '',
      promotionPublicId:  data.promotionPublicId ?? '',
      enseignantPublicId: data.enseignantPublicId ?? 'user-current',
      enseignantNom:      data.enseignantNom ?? '',
      statut:             data.statut ?? 'BROUILLON',
      chapitres:          data.chapitres ?? [],
      progression:        0,
      createdDate:        new Date().toISOString().split('T')[0],
      dureeHeures:        data.dureeHeures,
      niveauLibelle:      data.niveauLibelle,
    };
    MOCK_COURS.push(c);
    return of(c).pipe(delay(400));
  }

  updateCours(data: Partial<ICours>): Observable<ICours> {
    const idx = MOCK_COURS.findIndex(c => c.publicId === data.publicId);
    if (idx >= 0) Object.assign(MOCK_COURS[idx], data);
    return of(MOCK_COURS[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  createExamen(data: Partial<IExamen>): Observable<IExamen> {
    const e: IExamen = {
      publicId:         `exam-new-${Date.now()}`,
      titre:            data.titre ?? '',
      matierePublicId:  data.matierePublicId ?? '',
      matiereLibelle:   data.matiereLibelle ?? '',
      dureeMinutes:     data.dureeMinutes ?? 60,
      dateDebut:        data.dateDebut ?? '',
      dateFin:          data.dateFin ?? '',
      questions:        data.questions ?? [],
      statut:           'A_VENIR',
      niveauLibelle:    data.niveauLibelle,
    };
    MOCK_EXAMENS.push(e);
    return of(e).pipe(delay(400));
  }

  updateExamen(data: Partial<IExamen>): Observable<IExamen> {
    const idx = MOCK_EXAMENS.findIndex(e => e.publicId === data.publicId);
    if (idx >= 0) Object.assign(MOCK_EXAMENS[idx], data);
    return of(MOCK_EXAMENS[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  getDevoirs(coursPublicId?: string): Observable<IDevoir[]> {
    const list = coursPublicId
      ? MOCK_DEVOIRS.filter(d => d.coursPublicId === coursPublicId)
      : MOCK_DEVOIRS;
    return of(list).pipe(delay(300));
  }

  getDevoir(publicId: string): Observable<IDevoir> {
    const d = MOCK_DEVOIRS.find(d => d.publicId === publicId) ?? MOCK_DEVOIRS[0];
    return of(d).pipe(delay(200));
  }

  deleteDevoir(publicId: string): Observable<void> {
    return of(void 0).pipe(delay(250));
  }

  getResultats(examenPublicId?: string): Observable<IResultatExamen[]> {
    const list = examenPublicId
      ? MOCK_RESULTATS.filter(r => r.examenPublicId === examenPublicId)
      : MOCK_RESULTATS;
    return of(list).pipe(delay(300));
  }

  getSessionsVirt(): Observable<ISessionVirtuelle[]> {
    return of(MOCK_SESSIONS_VIRTUELLES).pipe(delay(300));
  }

  getCertificats(): Observable<ICertificat[]> {
    return of(MOCK_CERTIFICATS).pipe(delay(300));
  }

  getQuestionsBank(): Observable<IQuestionBanque[]> {
    return of(MOCK_QUESTIONS_BANQUE).pipe(delay(300));
  }
}
