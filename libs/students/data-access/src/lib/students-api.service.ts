import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IStudent } from '@sms/shared/models';
import { MOCK_STUDENTS } from './students.mock';

@Injectable({ providedIn: 'root' })
export class StudentsApiService {

  getStudents(page = 0, size = 20): Observable<IStudent[]> {
    const start = page * size;
    return of(MOCK_STUDENTS.slice(start, start + size)).pipe(delay(300));
  }

  getStudent(publicId: string): Observable<IStudent> {
    const s = MOCK_STUDENTS.find(s => s.publicId === publicId) ?? MOCK_STUDENTS[0];
    return of(s).pipe(delay(200));
  }

  createStudent(req: Partial<IStudent>): Observable<IStudent> {
    const created: IStudent = {
      publicId: `stu-${Date.now()}`,
      matricule: `LYCÉE-CI/2026/${String(MOCK_STUDENTS.length + 1).padStart(6, '0')}`,
      firstName: req.firstName ?? '',
      lastName: req.lastName ?? '',
      dateNaissance: req.dateNaissance ?? '',
      genre: req.genre ?? 'M',
      email: req.email,
      phone: req.phone,
      etablissementId: 1,
      anneeAcademiqueId: 1,
      statut: 'ACTIF',
    };
    MOCK_STUDENTS.push(created);
    return of(created).pipe(delay(300));
  }

  updateStudent(publicId: string, req: Partial<IStudent>): Observable<IStudent> {
    const idx = MOCK_STUDENTS.findIndex(s => s.publicId === publicId);
    if (idx >= 0) Object.assign(MOCK_STUDENTS[idx], req);
    return of(MOCK_STUDENTS[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  deleteStudent(publicId: string): Observable<void> {
    const idx = MOCK_STUDENTS.findIndex(s => s.publicId === publicId);
    if (idx >= 0) MOCK_STUDENTS[idx].statut = 'INACTIF';
    return of(undefined).pipe(delay(200));
  }

  getTotalCount(): number {
    return MOCK_STUDENTS.length;
  }
}
