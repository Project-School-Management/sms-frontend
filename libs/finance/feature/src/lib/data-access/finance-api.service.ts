import { Injectable }  from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable }  from 'rxjs';

import {
  IFacture, IPaiement, IBourse, IFraisScolarite,
  IInitierPaiementRequest, IBourseRequest, IFraisScolariteRequest
} from '@sms/shared/models';

const BASE = '/api/v1';

@Injectable({ providedIn: 'root' })
export class FinanceApiService {

  constructor(private http: HttpClient) {}

  // ── Factures ──────────────────────────────────────────────────────────────
  getFactures(page = 0, size = 20): Observable<IFacture[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<IFacture[]>(`${BASE}/factures`, { params });
  }

  getFacturesByStudent(studentId: number): Observable<IFacture[]> {
    return this.http.get<IFacture[]>(`${BASE}/factures/student/${studentId}`);
  }

  getFacture(publicId: string): Observable<IFacture> {
    return this.http.get<IFacture>(`${BASE}/factures/${publicId}`);
  }

  // ── Paiements ─────────────────────────────────────────────────────────────
  initierPaiement(req: IInitierPaiementRequest): Observable<IPaiement> {
    return this.http.post<IPaiement>(`${BASE}/payments/initiate`, req);
  }

  getPaiement(publicId: string): Observable<IPaiement> {
    return this.http.get<IPaiement>(`${BASE}/payments/${publicId}`);
  }

  // ── Bourses ───────────────────────────────────────────────────────────────
  getBourses(anneeAcademiqueId: number): Observable<IBourse[]> {
    const params = new HttpParams().set('anneeAcademiqueId', anneeAcademiqueId);
    return this.http.get<IBourse[]>(`${BASE}/bourses`, { params });
  }

  getBoursesByStudent(studentId: number, anneeAcademiqueId: number): Observable<IBourse[]> {
    const params = new HttpParams().set('anneeAcademiqueId', anneeAcademiqueId);
    return this.http.get<IBourse[]>(`${BASE}/bourses/student/${studentId}`, { params });
  }

  createBourse(req: IBourseRequest): Observable<IBourse> {
    return this.http.post<IBourse>(`${BASE}/bourses`, req);
  }

  deleteBourse(publicId: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/bourses/${publicId}`);
  }

  // ── Frais scolarité ───────────────────────────────────────────────────────
  getFrais(anneeAcademiqueId: number): Observable<IFraisScolarite[]> {
    const params = new HttpParams().set('anneeAcademiqueId', anneeAcademiqueId);
    return this.http.get<IFraisScolarite[]>(`${BASE}/frais`, { params });
  }

  createFrais(req: IFraisScolariteRequest): Observable<IFraisScolarite> {
    return this.http.post<IFraisScolarite>(`${BASE}/frais`, req);
  }

  deleteFrais(publicId: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/frais/${publicId}`);
  }
}
