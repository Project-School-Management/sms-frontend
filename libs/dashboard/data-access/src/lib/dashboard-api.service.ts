import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface IDashboardSummary {
  totalEtudiants:     number;
  totalEnseignants:   number;
  tauxReussite:       number;
  tauxRecouvrement:   number;
  nbNotifications:    number;
  nbFacturesEnRetard: number;
}

const MOCK_SUMMARY: IDashboardSummary = {
  totalEtudiants:     248,
  totalEnseignants:   32,
  tauxReussite:       78.4,
  tauxRecouvrement:   62.1,
  nbNotifications:    3,
  nbFacturesEnRetard: 18,
};

@Injectable({ providedIn: 'root' })
export class DashboardApiService {

  getSummary(): Observable<IDashboardSummary> {
    return of(MOCK_SUMMARY).pipe(delay(400));
  }
}
