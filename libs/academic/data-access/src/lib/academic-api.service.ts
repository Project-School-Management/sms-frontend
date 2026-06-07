import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { INote, IBulletin, IPromotion, IFaculte } from '@sms/shared/models';
import { MOCK_NOTES, MOCK_BULLETINS, MOCK_PROMOTIONS, MOCK_FACULTES } from './academic.mock';

@Injectable({ providedIn: 'root' })
export class AcademicApiService {

  getNotes(studentPublicId?: string): Observable<INote[]> {
    const list = studentPublicId
      ? MOCK_NOTES.filter(n => n.studentPublicId === studentPublicId)
      : MOCK_NOTES;
    return of(list).pipe(delay(300));
  }

  createNote(req: Partial<INote>): Observable<INote> {
    const note: INote = {
      publicId: `note-${Date.now()}`,
      studentPublicId: req.studentPublicId ?? '',
      matierePublicId: req.matierePublicId ?? '',
      matiereLibelle: req.matiereLibelle ?? '',
      valeur: req.valeur ?? null,
      absent: req.absent ?? false,
      statut: 'SAISIE',
      createdDate: new Date().toISOString(),
    };
    MOCK_NOTES.push(note);
    return of(note).pipe(delay(300));
  }

  getBulletins(studentPublicId?: string): Observable<IBulletin[]> {
    const list = studentPublicId
      ? MOCK_BULLETINS.filter(b => b.studentPublicId === studentPublicId)
      : MOCK_BULLETINS;
    return of(list).pipe(delay(300));
  }

  getBulletin(publicId: string): Observable<IBulletin> {
    const b = MOCK_BULLETINS.find(b => b.publicId === publicId) ?? MOCK_BULLETINS[0];
    return of(b).pipe(delay(200));
  }

  getPromotions(): Observable<IPromotion[]> {
    return of(MOCK_PROMOTIONS).pipe(delay(200));
  }

  getFacultes(): Observable<IFaculte[]> {
    return of(MOCK_FACULTES).pipe(delay(200));
  }
}
