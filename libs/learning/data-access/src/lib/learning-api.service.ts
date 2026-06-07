import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ICours, IExamen } from '@sms/shared/models';
import { MOCK_COURS, MOCK_EXAMENS } from './learning.mock';

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
}
