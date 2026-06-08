import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IStudent, IInscription, IAuditEntry, IDocument, StudentStatut, ActionAudit } from '@sms/shared/models';
import {
  MOCK_STUDENTS,
  MOCK_INSCRIPTIONS,
  MOCK_AUDIT,
  MOCK_DOCUMENTS,
} from './students.mock';

// ── Helpers ───────────────────────────────────────────────────────────────────
function newAuditEntry(
  action: ActionAudit,
  details: string,
  ancienneValeur?: string,
  nouvelleValeur?: string,
): IAuditEntry {
  return {
    id:            `aud-${Date.now()}`,
    action,
    responsable:   'Adm. Utilisateur courant',
    date:          new Date().toISOString(),
    ancienneValeur,
    nouvelleValeur,
    details,
  };
}

@Injectable({ providedIn: 'root' })
export class StudentsApiService {

  // ── Read ──────────────────────────────────────────────────────────────────

  getStudents(page = 0, size = 20): Observable<IStudent[]> {
    const start = page * size;
    return of(MOCK_STUDENTS.slice(start, start + size)).pipe(delay(300));
  }

  getStudent(publicId: string): Observable<IStudent> {
    const s = MOCK_STUDENTS.find(s => s.publicId === publicId) ?? MOCK_STUDENTS[0];
    return of(s).pipe(delay(200));
  }

  getTotalCount(): number {
    return MOCK_STUDENTS.length;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  createStudent(req: Partial<IStudent>): Observable<IStudent> {
    const created: IStudent = {
      publicId:          `stu-${Date.now()}`,
      matricule:         `LYCÉE-CI/2026/${String(MOCK_STUDENTS.length + 1).padStart(6, '0')}`,
      firstName:         req.firstName ?? '',
      lastName:          req.lastName ?? '',
      dateNaissance:     req.dateNaissance ?? '',
      genre:             req.genre ?? 'M',
      email:             req.email,
      phone:             req.phone,
      nationalite:       req.nationalite,
      lieuNaissance:     req.lieuNaissance,
      adresse:           req.adresse,
      ville:             req.ville,
      parents:           req.parents ?? [],
      etablissementId:   1,
      anneeAcademiqueId: 1,
      classePublicId:    req.classePublicId,
      classeLibelle:     req.classeLibelle,
      niveauLibelle:     req.niveauLibelle,
      filiereLibelle:    req.filiereLibelle,
      statut:            'PRE_INSCRIT',
      dateInscription:   new Date().toISOString().split('T')[0],
      observations:      req.observations,
    };
    MOCK_STUDENTS.push(created);
    // Init audit
    if (!MOCK_AUDIT[created.publicId]) MOCK_AUDIT[created.publicId] = [];
    MOCK_AUDIT[created.publicId].unshift(newAuditEntry('CREATION', `Inscription — ${created.classeLibelle ?? 'classe non définie'}`));
    return of(created).pipe(delay(300));
  }

  // ── Update ────────────────────────────────────────────────────────────────

  updateStudent(publicId: string, req: Partial<IStudent>): Observable<IStudent> {
    const idx = MOCK_STUDENTS.findIndex(s => s.publicId === publicId);
    if (idx >= 0) {
      const old = { ...MOCK_STUDENTS[idx] };
      Object.assign(MOCK_STUDENTS[idx], req);
      // Audit
      if (!MOCK_AUDIT[publicId]) MOCK_AUDIT[publicId] = [];
      const changes: string[] = [];
      if (req.firstName && req.firstName !== old.firstName) changes.push(`Prénom: ${old.firstName} → ${req.firstName}`);
      if (req.lastName  && req.lastName  !== old.lastName)  changes.push(`Nom: ${old.lastName} → ${req.lastName}`);
      if (req.email     && req.email     !== old.email)     changes.push(`Email: ${old.email ?? '—'} → ${req.email}`);
      if (req.classePublicId && req.classePublicId !== old.classePublicId) {
        MOCK_AUDIT[publicId].unshift(newAuditEntry('CHANGEMENT_CLASSE', `Changement de classe`, old.classeLibelle, req.classeLibelle));
      }
      if (changes.length > 0) {
        MOCK_AUDIT[publicId].unshift(newAuditEntry('MODIFICATION', changes.join(' · ')));
      }
    }
    return of(MOCK_STUDENTS[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  // ── Status changes ────────────────────────────────────────────────────────

  changeStatut(publicId: string, statut: StudentStatut, motif?: string): Observable<IStudent> {
    const idx = MOCK_STUDENTS.findIndex(s => s.publicId === publicId);
    if (idx >= 0) {
      const old = MOCK_STUDENTS[idx].statut;
      MOCK_STUDENTS[idx].statut      = statut;
      MOCK_STUDENTS[idx].motifStatut = motif;
      if (!MOCK_AUDIT[publicId]) MOCK_AUDIT[publicId] = [];
      const actionMap: Partial<Record<StudentStatut, ActionAudit>> = {
        INSCRIPTION_ANNULEE: 'ANNULATION_INSCRIPTION',
        ACTIF:               'REACTIVATION',
        SUSPENDU:            'SUSPENSION',
        TRANSFERE:           'TRANSFERT',
        DIPLOME:             'DIPLOME',
        EXCLUS:              'EXCLUSION',
      };
      const action = actionMap[statut] ?? 'MODIFICATION';
      MOCK_AUDIT[publicId].unshift(newAuditEntry(action, motif ?? `Changement de statut`, old, statut));
      // Ajouter à l'historique d'inscription si statut significatif
      if (['INSCRIPTION_ANNULEE', 'SUSPENDU', 'ACTIF'].includes(statut)) {
        const stu = MOCK_STUDENTS[idx];
        if (!MOCK_INSCRIPTIONS[publicId]) MOCK_INSCRIPTIONS[publicId] = [];
        const last = MOCK_INSCRIPTIONS[publicId][0];
        if (last) {
          last.statut           = statut;
          last.dateModification = new Date().toISOString().split('T')[0];
          last.motif            = motif;
        }
      }
    }
    return of(MOCK_STUDENTS[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  cancelInscription(publicId: string, motif: string): Observable<IStudent> {
    return this.changeStatut(publicId, 'INSCRIPTION_ANNULEE', motif);
  }

  reactiverInscription(publicId: string): Observable<IStudent> {
    return this.changeStatut(publicId, 'ACTIF', 'Réactivation de l\'inscription');
  }

  deleteStudent(publicId: string): Observable<void> {
    const idx = MOCK_STUDENTS.findIndex(s => s.publicId === publicId);
    if (idx >= 0) MOCK_STUDENTS[idx].statut = 'INACTIF';
    return of(undefined).pipe(delay(200));
  }

  // ── History & Audit ───────────────────────────────────────────────────────

  getHistorique(publicId: string): Observable<IInscription[]> {
    return of(MOCK_INSCRIPTIONS[publicId] ?? []).pipe(delay(200));
  }

  getAudit(publicId: string): Observable<IAuditEntry[]> {
    return of(MOCK_AUDIT[publicId] ?? []).pipe(delay(200));
  }

  getDocuments(publicId: string): Observable<IDocument[]> {
    const docs = MOCK_DOCUMENTS[publicId] ?? MOCK_DOCUMENTS['default'];
    // Clone to avoid mutation issues
    return of(JSON.parse(JSON.stringify(docs))).pipe(delay(200));
  }
}
