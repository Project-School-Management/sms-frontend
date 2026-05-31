import { Injectable, inject } from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { Observable }         from 'rxjs';
import { ICurrentUser }       from '@sms/shared/models';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);

  private readonly base = '/api/v1/users';

  /** GET /api/v1/users/me — retourne l'utilisateur courant */
  getMyAccount(): Observable<ICurrentUser> {
    return this.http.get<ICurrentUser>(`${this.base}/me`);
  }
}
