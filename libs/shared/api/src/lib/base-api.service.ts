import { inject }     from '@angular/core';
import { HttpClient,
         HttpParams }  from '@angular/common/http';
import { Observable }  from 'rxjs';

import { IPage, IPageRequest } from '@sms/shared/models';

/**
 * Service de base pour tous les ApiService de feature.
 * Fournit les méthodes CRUD + pagination communes.
 *
 * Usage :
 *   @Injectable({ providedIn: 'root' })
 *   export class StudentApiService extends BaseApiService {
 *     protected override readonly base = '/api/v1/students';
 *   }
 */
export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);

  protected abstract readonly base: string;

  /** GET /base?page=&size=&sort= */
  protected getPage<T>(req: IPageRequest, extra?: Record<string, string>): Observable<IPage<T>> {
    let params = new HttpParams()
      .set('page', String(req.page))
      .set('size', String(req.size));

    if (req.sort) params = params.set('sort', req.sort);

    if (extra) {
      Object.entries(extra).forEach(([k, v]) => { params = params.set(k, v); });
    }

    return this.http.get<IPage<T>>(this.base, { params });
  }

  /** GET /base/{publicId} */
  protected getOne<T>(publicId: string): Observable<T> {
    return this.http.get<T>(`${this.base}/${publicId}`);
  }

  /** POST /base */
  protected create<T, B>(body: B): Observable<T> {
    return this.http.post<T>(this.base, body);
  }

  /** PUT /base/{publicId} */
  protected update<T, B>(publicId: string, body: B): Observable<T> {
    return this.http.put<T>(`${this.base}/${publicId}`, body);
  }

  /** DELETE /base/{publicId} */
  protected remove(publicId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${publicId}`);
  }
}
