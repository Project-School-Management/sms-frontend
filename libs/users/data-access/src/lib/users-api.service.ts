import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IUser, IEtablissement, IAnneeAcademique } from '@sms/shared/models';
import { MOCK_USERS, MOCK_ETABLISSEMENTS, MOCK_ANNEES } from './users.mock';

@Injectable({ providedIn: 'root' })
export class UsersApiService {

  getUsers(): Observable<IUser[]> {
    return of(MOCK_USERS).pipe(delay(300));
  }

  getUser(publicId: string): Observable<IUser> {
    const u = MOCK_USERS.find(u => u.publicId === publicId) ?? MOCK_USERS[0];
    return of(u).pipe(delay(200));
  }

  createUser(req: Partial<IUser>): Observable<IUser> {
    const user: IUser = {
      publicId: `usr-${Date.now()}`,
      login: req.email ?? '',
      email: req.email ?? '',
      firstName: req.firstName ?? '',
      lastName: req.lastName ?? '',
      authorities: req.authorities ?? [],
      etablissementId: 1,
      langKey: 'fr',
      twoFaEnabled: false,
      activated: true,
      createdDate: new Date().toISOString(),
    };
    MOCK_USERS.push(user);
    return of(user).pipe(delay(300));
  }

  toggleActivation(publicId: string): Observable<IUser> {
    const u = MOCK_USERS.find(u => u.publicId === publicId);
    if (u) u.activated = !u.activated;
    return of(u!).pipe(delay(200));
  }

  getEtablissements(): Observable<IEtablissement[]> {
    return of(MOCK_ETABLISSEMENTS).pipe(delay(200));
  }

  getAnnees(): Observable<IAnneeAcademique[]> {
    return of([...MOCK_ANNEES].sort((a, b) => b.libelle.localeCompare(a.libelle))).pipe(delay(200));
  }

  createAnnee(req: Partial<IAnneeAcademique>): Observable<IAnneeAcademique> {
    const annee: IAnneeAcademique = {
      publicId:  `annee-${Date.now()}`,
      libelle:   req.libelle ?? '',
      dateDebut: req.dateDebut ?? '',
      dateFin:   req.dateFin ?? '',
      active:    false,
      description: req.description,
    };
    MOCK_ANNEES.push(annee);
    return of(annee).pipe(delay(300));
  }

  updateAnnee(publicId: string, req: Partial<IAnneeAcademique>): Observable<IAnneeAcademique> {
    const idx = MOCK_ANNEES.findIndex(a => a.publicId === publicId);
    if (idx >= 0) Object.assign(MOCK_ANNEES[idx], req);
    return of(MOCK_ANNEES[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  activerAnnee(publicId: string): Observable<IAnneeAcademique[]> {
    MOCK_ANNEES.forEach(a => (a.active = a.publicId === publicId));
    return of([...MOCK_ANNEES]).pipe(delay(400));
  }

  updateUser(data: Partial<IUser>): Observable<IUser> {
    const idx = MOCK_USERS.findIndex(u => u.publicId === data.publicId);
    if (idx >= 0) Object.assign(MOCK_USERS[idx], data);
    return of(MOCK_USERS[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  resetPassword(publicId: string): Observable<{ tempPassword: string }> {
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$';
    const tempPassword = Array.from({ length: 12 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    return of({ tempPassword }).pipe(delay(600));
  }
}
