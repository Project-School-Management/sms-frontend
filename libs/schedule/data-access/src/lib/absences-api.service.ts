import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IAbsence, IAbsenceRecap, IAbsenceParMatiere, ISaisirAbsencesRequest } from '@sms/shared/models';
import { MOCK_ABSENCES } from './absences.mock';

/**
 * Mock du contrat AbsenceController (academic-service, story 4-2).
 * - POST /api/v1/absences               → saisirAbsences
 * - PATCH /api/v1/absences/{id}/justifier → justifierAbsence
 * - GET  /api/v1/absences?elevePublicId  → getRecapByEleve
 * - GET  /api/v1/absences?classePublicId → getByClasse
 */
@Injectable({ providedIn: 'root' })
export class AbsencesApiService {

  /** GET liste brute (pour la vue suivi/justification — hors contrat strict, pratique en mock). */
  getAbsences(): Observable<IAbsence[]> {
    return of([...MOCK_ABSENCES]).pipe(delay(300));
  }

  /** AC-4 — Récapitulatif absences par élève. */
  getRecapByEleve(elevePublicId: string): Observable<IAbsenceRecap> {
    const detail = MOCK_ABSENCES.filter(a => a.elevePublicId === elevePublicId);
    const parMatiereMap = new Map<string, IAbsenceParMatiere>();
    for (const a of detail) {
      const cur = parMatiereMap.get(a.matierePublicId) ?? {
        matierePublicId: a.matierePublicId, matiereLibelle: a.matiereLibelle,
        total: 0, justifiees: 0, nonJustifiees: 0,
      };
      cur.total++;
      if (a.statut === 'JUSTIFIEE') cur.justifiees++; else cur.nonJustifiees++;
      parMatiereMap.set(a.matierePublicId, cur);
    }
    const recap: IAbsenceRecap = {
      elevePublicId,
      eleveNom: detail[0]?.eleveNom ?? '',
      totalAbsences: detail.length,
      absencesJustifiees:    detail.filter(a => a.statut === 'JUSTIFIEE').length,
      absencesNonJustifiees: detail.filter(a => a.statut === 'NON_JUSTIFIEE').length,
      absencesParMatiere: [...parMatiereMap.values()],
      detail,
    };
    return of(recap).pipe(delay(300));
  }

  /** AC-5 — Absences par classe (période). */
  getByClasse(classePublicId: string): Observable<IAbsence[]> {
    return of(MOCK_ABSENCES.filter(a => a.classePublicId === classePublicId)).pipe(delay(300));
  }

  /** AC-1 — Saisie d'absences par séance (une entrée par élève absent). */
  saisirAbsences(req: ISaisirAbsencesRequest, meta: {
    matiereLibelle: string; classeLibelle: string;
    enseignantPublicId: string; enseignantNom: string;
    eleves: { publicId: string; nom: string; matricule: string }[];
  }): Observable<IAbsence[]> {
    const created: IAbsence[] = req.elevePublicIds.map((elevePublicId, i) => {
      const eleve = meta.eleves.find(e => e.publicId === elevePublicId);
      return {
        publicId: `abs-${Date.now()}-${i}`,
        elevePublicId,
        eleveNom:       eleve?.nom ?? '',
        eleveMatricule: eleve?.matricule ?? '',
        matierePublicId: req.matierePublicId, matiereLibelle: meta.matiereLibelle,
        classePublicId:  req.classePublicId,  classeLibelle:  meta.classeLibelle,
        enseignantPublicId: meta.enseignantPublicId, enseignantNom: meta.enseignantNom,
        heureAbsence: req.heureAbsence, statut: 'NON_JUSTIFIEE',
      };
    });
    MOCK_ABSENCES.unshift(...created);
    return of(created).pipe(delay(400));
  }

  /** AC-2 — Justification d'une absence par le secrétariat. */
  justifierAbsence(publicId: string, motif: string, agent: { publicId: string; nom: string }): Observable<IAbsence> {
    const idx = MOCK_ABSENCES.findIndex(a => a.publicId === publicId);
    if (idx >= 0) {
      MOCK_ABSENCES[idx] = {
        ...MOCK_ABSENCES[idx],
        statut: 'JUSTIFIEE',
        motifJustification: motif,
        dateJustification: new Date().toISOString(),
        justifieParPublicId: agent.publicId,
        justifieParNom: agent.nom,
      };
      return of(MOCK_ABSENCES[idx]).pipe(delay(300));
    }
    return of(MOCK_ABSENCES[0]).pipe(delay(300));
  }
}
