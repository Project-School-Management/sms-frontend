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
