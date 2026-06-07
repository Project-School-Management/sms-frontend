import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IKpiOverview, IKpiAcademique, IKpiFinancier, IRapport } from '@sms/shared/models';
import { MOCK_KPI_OVERVIEW, MOCK_KPI_ACADEMIQUE, MOCK_KPI_FINANCIER, MOCK_RAPPORTS } from './analytics.mock';

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {

  getKpiOverview(): Observable<IKpiOverview> {
    return of(MOCK_KPI_OVERVIEW).pipe(delay(300));
  }

  getKpiAcademique(): Observable<IKpiAcademique[]> {
    return of(MOCK_KPI_ACADEMIQUE).pipe(delay(300));
  }

  getKpiFinancier(): Observable<IKpiFinancier> {
    return of(MOCK_KPI_FINANCIER).pipe(delay(300));
  }

  getRapports(): Observable<IRapport[]> {
    return of(MOCK_RAPPORTS).pipe(delay(200));
  }

  generateRapport(type: string, format: string): Observable<{ reportPublicId: string; statut: string }> {
    return of({ reportPublicId: `rpt-${Date.now()}`, statut: 'EN_COURS' }).pipe(delay(500));
  }
}
