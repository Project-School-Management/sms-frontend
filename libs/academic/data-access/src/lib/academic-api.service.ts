import { Injectable } from '@angular/core';
import { Observable, of, delay, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  INote, IBulletin, IPromotion, IFaculte, IEvaluation, IEleveContext, StatutEvaluation,
} from '@sms/shared/models';
import {
  MOCK_NOTES, MOCK_BULLETINS, MOCK_PROMOTIONS, MOCK_FACULTES,
  MOCK_EVALUATIONS, ELEVES_BY_CLASSE, MATIERES_BY_CLASSE,
} from './academic.mock';

// ── Helpers ───────────────────────────────────────────────────────────────────
function appreciationFor(v: number | null): string | undefined {
  if (v === null) return undefined;
  if (v >= 16) return 'Excellent travail, continuez ainsi !';
  if (v >= 14) return 'Bon travail, quelques progrès à faire.';
  if (v >= 10) return 'Résultats acceptables, des efforts sont nécessaires.';
  return 'Des difficultés persistantes, un soutien est recommandé.';
}

@Injectable({ providedIn: 'root' })
export class AcademicApiService {

  // ── Read ──────────────────────────────────────────────────────────────────

  getNotes(studentPublicId?: string, evaluationPublicId?: string): Observable<INote[]> {
    let list = [...MOCK_NOTES];
    if (studentPublicId)   list = list.filter(n => n.studentPublicId === studentPublicId);
    if (evaluationPublicId) list = list.filter(n => n.evaluationPublicId === evaluationPublicId);
    return of(list).pipe(delay(300));
  }

  getBulletins(studentPublicId?: string): Observable<IBulletin[]> {
    const list = studentPublicId
      ? MOCK_BULLETINS.filter(b => b.studentPublicId === studentPublicId)
      : MOCK_BULLETINS;
    return of(list).pipe(delay(300));
  }

  getBulletin(publicId: string): Observable<IBulletin> {
    const b = MOCK_BULLETINS.find(b => b.publicId === publicId) ?? MOCK_BULLETINS[0];
    return of(b).pipe(delay(200));
  }

  getPromotions(): Observable<IPromotion[]> {
    return of(MOCK_PROMOTIONS).pipe(delay(200));
  }

  getFacultes(): Observable<IFaculte[]> {
    return of(MOCK_FACULTES).pipe(delay(200));
  }

  // ── Évaluations ───────────────────────────────────────────────────────────

  getEvaluations(classeId?: string): Observable<IEvaluation[]> {
    const list = classeId
      ? MOCK_EVALUATIONS.filter(e => e.promotionPublicId === classeId)
      : MOCK_EVALUATIONS;
    return of([...list]).pipe(delay(250));
  }

  createEvaluation(req: Partial<IEvaluation>): Observable<IEvaluation> {
    const eval_: IEvaluation = {
      publicId:          `eval-${Date.now()}`,
      titre:             req.titre ?? '',
      type:              req.type ?? 'DEVOIR',
      periode:           req.periode ?? 'T1',
      matierePublicId:   req.matierePublicId ?? '',
      matiereLibelle:    req.matiereLibelle ?? '',
      coefficient:       req.coefficient ?? 1,
      promotionPublicId: req.promotionPublicId ?? '',
      promotionLibelle:  req.promotionLibelle ?? '',
      enseignantPublicId: req.enseignantPublicId ?? '',
      enseignantNom:     req.enseignantNom ?? '',
      anneeAcademique:   req.anneeAcademique ?? '2025-2026',
      dateEvaluation:    req.dateEvaluation ?? new Date().toISOString().split('T')[0],
      statut:            'BROUILLON',
      nbEleves:          req.nbEleves ?? 0,
      nbSaisis:          0,
      createdDate:       new Date().toISOString().split('T')[0],
    };
    MOCK_EVALUATIONS.push(eval_);
    return of(eval_).pipe(delay(300));
  }

  // ── Élèves pour la saisie ─────────────────────────────────────────────────

  getElevesByClasse(classeId: string): Observable<IEleveContext[]> {
    return of(ELEVES_BY_CLASSE[classeId] ?? []).pipe(delay(350));
  }

  getMatieresByClasse(classeId: string): Observable<{ publicId: string; libelle: string; coeff: number; enseignant: string }[]> {
    return of(MATIERES_BY_CLASSE[classeId] ?? []).pipe(delay(200));
  }

  // ── Saisie en masse ───────────────────────────────────────────────────────

  saveNotesBatch(
    evaluationPublicId: string,
    entries: Array<{ studentPublicId: string; valeur: number | null; casParticulier?: string; appreciation?: string }>,
    statut: 'BROUILLON' | 'SAISIE' = 'SAISIE',
  ): Observable<INote[]> {
    const eval_ = MOCK_EVALUATIONS.find(e => e.publicId === evaluationPublicId);
    const savedNotes: INote[] = [];

    for (const entry of entries) {
      // Remove existing note for this student/evaluation if any
      const existingIdx = MOCK_NOTES.findIndex(
        n => n.studentPublicId === entry.studentPublicId && n.evaluationPublicId === evaluationPublicId
      );
      if (existingIdx >= 0) {
        MOCK_NOTES.splice(existingIdx, 1);
      }
      const absent = entry.casParticulier === 'ABS' || entry.valeur === null;
      const note: INote = {
        publicId:           `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentPublicId:    entry.studentPublicId,
        matierePublicId:    eval_?.matierePublicId ?? '',
        matiereLibelle:     eval_?.matiereLibelle ?? '',
        evaluationPublicId,
        valeur:             absent ? null : entry.valeur,
        casParticulier:     entry.casParticulier as any,
        absent,
        coefficient:        eval_?.coefficient ?? 1,
        appreciation:       entry.appreciation ?? appreciationFor(entry.valeur),
        statut:             statut as any,
        createdDate:        new Date().toISOString().split('T')[0],
      };
      MOCK_NOTES.push(note);
      savedNotes.push(note);
    }

    // Update eval stats
    if (eval_) {
      eval_.nbSaisis = entries.filter(e => e.valeur !== null || e.casParticulier).length;
      if (statut === 'SAISIE') eval_.statut = 'SAISIE';
    }

    return of(savedNotes).pipe(delay(400));
  }

  validateEvaluation(evaluationPublicId: string): Observable<IEvaluation> {
    const eval_ = MOCK_EVALUATIONS.find(e => e.publicId === evaluationPublicId);
    if (eval_) {
      eval_.statut = 'VALIDEE';
      MOCK_NOTES
        .filter(n => n.evaluationPublicId === evaluationPublicId)
        .forEach(n => { n.statut = 'VALIDEE'; });
    }
    return of(eval_!).pipe(delay(400));
  }

  publishEvaluation(evaluationPublicId: string): Observable<IEvaluation> {
    const eval_ = MOCK_EVALUATIONS.find(e => e.publicId === evaluationPublicId);
    if (eval_) {
      eval_.statut = 'PUBLIE';
      MOCK_NOTES
        .filter(n => n.evaluationPublicId === evaluationPublicId)
        .forEach(n => { n.statut = 'PUBLIE'; });
    }
    return of(eval_!).pipe(delay(400));
  }

  updateNote(publicId: string, changes: { valeur?: number | null; motif?: string }): Observable<INote> {
    const idx = MOCK_NOTES.findIndex(n => n.publicId === publicId);
    if (idx >= 0) {
      const old = MOCK_NOTES[idx].valeur;
      MOCK_NOTES[idx] = {
        ...MOCK_NOTES[idx],
        valeur:     changes.valeur ?? MOCK_NOTES[idx].valeur,
        statut:     'MODIFIEE',
        updatedDate: new Date().toISOString(),
        historique: [
          ...(MOCK_NOTES[idx].historique ?? []),
          {
            id:            `hist-${Date.now()}`,
            notePublicId:  publicId,
            ancienneValeur: old,
            nouvelleValeur: changes.valeur ?? old,
            auteur:        'Utilisateur courant',
            date:          new Date().toISOString(),
            motif:         changes.motif,
          },
        ],
      };
    }
    return of(MOCK_NOTES[idx >= 0 ? idx : 0]).pipe(delay(200));
  }

  // ── Single note create (compat) ───────────────────────────────────────────

  createNote(req: Partial<INote>): Observable<INote> {
    const note: INote = {
      publicId:       `note-${Date.now()}`,
      studentPublicId: req.studentPublicId ?? '',
      matierePublicId: req.matierePublicId ?? '',
      matiereLibelle:  req.matiereLibelle ?? '',
      valeur:          req.valeur ?? null,
      absent:          req.absent ?? false,
      statut:          'SAISIE',
      createdDate:     new Date().toISOString(),
    };
    MOCK_NOTES.push(note);
    return of(note).pipe(delay(300));
  }
}
