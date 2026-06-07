import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ISalle, ITimeSlot, ISeance } from '@sms/shared/models';
import { MOCK_SALLES, MOCK_TIME_SLOTS, MOCK_SEANCES } from './schedule.mock';

@Injectable({ providedIn: 'root' })
export class ScheduleApiService {

  getSalles(): Observable<ISalle[]> {
    return of(MOCK_SALLES).pipe(delay(200));
  }

  getTimeSlots(promotionPublicId?: string): Observable<ITimeSlot[]> {
    const list = promotionPublicId
      ? MOCK_TIME_SLOTS.filter(t => t.promotionPublicId === promotionPublicId)
      : MOCK_TIME_SLOTS;
    return of(list).pipe(delay(300));
  }

  getSeances(): Observable<ISeance[]> {
    return of(MOCK_SEANCES).pipe(delay(300));
  }

  annulerSeance(publicId: string, motif: string): Observable<ISeance> {
    const idx = MOCK_SEANCES.findIndex(s => s.publicId === publicId);
    if (idx >= 0) {
      MOCK_SEANCES[idx] = { ...MOCK_SEANCES[idx], statut: 'ANNULEE', motifAnnulation: motif };
    }
    return of(MOCK_SEANCES[idx >= 0 ? idx : 0]).pipe(delay(300));
  }
}
