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
    return of(MOCK_ANNEES).pipe(delay(200));
  }
}
