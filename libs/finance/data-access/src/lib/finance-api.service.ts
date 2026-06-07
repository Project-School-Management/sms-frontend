import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  IFacture, IPaiement, IBourse, IFraisScolarite,
  IInitierPaiementRequest, IBourseRequest, IFraisScolariteRequest,
  StatutFacture
} from '@sms/shared/models';

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_FACTURES: IFacture[] = [
  {
    publicId: 'fac-001', numero: 'FAC-2025-0001', studentId: 1, anneeAcademiqueId: 1,
    montantTotal: 750000, montantPaye: 500000, solde: 250000, statut: 'PARTIELLEMENT_PAYEE',
    dateEcheance: '2026-03-31', createdDate: '2026-01-15',
    echeancier: [
      { publicId: 'ech-001', numero: 1, montantDu: 250000, dateEcheance: '2026-01-31', datePaiement: '2026-01-28', estPaye: true },
      { publicId: 'ech-002', numero: 2, montantDu: 250000, dateEcheance: '2026-02-28', datePaiement: '2026-02-25', estPaye: true },
      { publicId: 'ech-003', numero: 3, montantDu: 250000, dateEcheance: '2026-03-31', estPaye: false },
    ],
  },
  {
    publicId: 'fac-002', numero: 'FAC-2025-0002', studentId: 2, anneeAcademiqueId: 1,
    montantTotal: 750000, montantPaye: 0, solde: 750000, statut: 'EN_RETARD',
    dateEcheance: '2026-02-28', createdDate: '2026-01-15',
    echeancier: [
      { publicId: 'ech-004', numero: 1, montantDu: 250000, dateEcheance: '2026-01-31', estPaye: false },
      { publicId: 'ech-005', numero: 2, montantDu: 250000, dateEcheance: '2026-02-28', estPaye: false },
      { publicId: 'ech-006', numero: 3, montantDu: 250000, dateEcheance: '2026-03-31', estPaye: false },
    ],
  },
  {
    publicId: 'fac-003', numero: 'FAC-2025-0003', studentId: 3, anneeAcademiqueId: 1,
    montantTotal: 750000, montantPaye: 750000, solde: 0, statut: 'PAYEE',
    dateEcheance: '2026-03-31', createdDate: '2026-01-15',
    echeancier: [
      { publicId: 'ech-007', numero: 1, montantDu: 250000, dateEcheance: '2026-01-31', datePaiement: '2026-01-20', estPaye: true },
      { publicId: 'ech-008', numero: 2, montantDu: 250000, dateEcheance: '2026-02-28', datePaiement: '2026-02-15', estPaye: true },
      { publicId: 'ech-009', numero: 3, montantDu: 250000, dateEcheance: '2026-03-31', datePaiement: '2026-03-10', estPaye: true },
    ],
  },
];

const MOCK_PAIEMENTS: IPaiement[] = [
  { publicId: 'pay-001', facturePublicId: 'fac-001', montant: 250000, operateur: 'WAVE', telephone: '+2250712345678', referenceExterne: 'WAVE-2026-001', statut: 'CONFIRME', createdDate: '2026-01-28' },
  { publicId: 'pay-002', facturePublicId: 'fac-001', montant: 250000, operateur: 'ORANGE_MONEY', telephone: '+2250712345678', referenceExterne: 'OM-2026-002', statut: 'CONFIRME', createdDate: '2026-02-25' },
  { publicId: 'pay-003', facturePublicId: 'fac-003', montant: 750000, operateur: 'MTN_MOMO', telephone: '+2250756789012', referenceExterne: 'MTN-2026-003', statut: 'CONFIRME', createdDate: '2026-01-20' },
];

const MOCK_BOURSES: IBourse[] = [
  { publicId: 'bou-001', studentId: 1, typeBourse: 'MERITE', pourcentage: 20, anneeAcademiqueId: 1, motif: 'Mention TB au baccalauréat', createdDate: '2026-01-10' },
  { publicId: 'bou-002', studentId: 3, typeBourse: 'SOCIALE', montantDeduction: 100000, anneeAcademiqueId: 1, motif: 'Situation familiale difficile', createdDate: '2026-01-12' },
];

const MOCK_FRAIS: IFraisScolarite[] = [
  { publicId: 'fra-001', anneeAcademiqueId: 1, libelle: 'Frais de scolarité L3 GL', typeFrais: 'SCOLARITE', montant: 750000, dateEcheance: '2026-03-31', createdDate: '2025-10-01' },
  { publicId: 'fra-002', anneeAcademiqueId: 1, libelle: 'Frais d\'inscription', typeFrais: 'INSCRIPTION', montant: 50000, createdDate: '2025-10-01' },
];

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FinanceApiService {

  getFactures(page = 0, size = 20): Observable<IFacture[]> {
    return of(MOCK_FACTURES.slice(page * size, (page + 1) * size)).pipe(delay(300));
  }

  getFacturesByStudent(studentId: number): Observable<IFacture[]> {
    return of(MOCK_FACTURES.filter(f => f.studentId === studentId)).pipe(delay(300));
  }

  getFacture(publicId: string): Observable<IFacture> {
    const f = MOCK_FACTURES.find(f => f.publicId === publicId) ?? MOCK_FACTURES[0];
    return of(f).pipe(delay(200));
  }

  getTotalCount(): number {
    return MOCK_FACTURES.length;
  }

  initierPaiement(req: IInitierPaiementRequest): Observable<IPaiement> {
    const p: IPaiement = {
      publicId: `pay-${Date.now()}`,
      facturePublicId: req.facturePublicId,
      montant: req.montant,
      operateur: req.operateur,
      telephone: req.telephone,
      referenceExterne: `${req.operateur}-${Date.now()}`,
      statut: 'EN_ATTENTE',
      createdDate: new Date().toISOString(),
    };
    MOCK_PAIEMENTS.push(p);
    return of(p).pipe(delay(500));
  }

  getPaiement(publicId: string): Observable<IPaiement> {
    const p = MOCK_PAIEMENTS.find(p => p.publicId === publicId) ?? MOCK_PAIEMENTS[0];
    return of(p).pipe(delay(200));
  }

  getBourses(anneeAcademiqueId: number): Observable<IBourse[]> {
    return of(MOCK_BOURSES.filter(b => b.anneeAcademiqueId === anneeAcademiqueId)).pipe(delay(300));
  }

  getBoursesByStudent(studentId: number, anneeAcademiqueId: number): Observable<IBourse[]> {
    return of(MOCK_BOURSES.filter(b => b.studentId === studentId && b.anneeAcademiqueId === anneeAcademiqueId)).pipe(delay(300));
  }

  createBourse(req: IBourseRequest): Observable<IBourse> {
    const b: IBourse = { ...req, publicId: `bou-${Date.now()}`, createdDate: new Date().toISOString() };
    MOCK_BOURSES.push(b);
    return of(b).pipe(delay(300));
  }

  deleteBourse(publicId: string): Observable<void> {
    const idx = MOCK_BOURSES.findIndex(b => b.publicId === publicId);
    if (idx >= 0) MOCK_BOURSES.splice(idx, 1);
    return of(undefined).pipe(delay(200));
  }

  getFrais(anneeAcademiqueId: number): Observable<IFraisScolarite[]> {
    return of(MOCK_FRAIS.filter(f => f.anneeAcademiqueId === anneeAcademiqueId)).pipe(delay(300));
  }

  createFrais(req: IFraisScolariteRequest): Observable<IFraisScolarite> {
    const f: IFraisScolarite = { ...req, publicId: `fra-${Date.now()}`, createdDate: new Date().toISOString() };
    MOCK_FRAIS.push(f);
    return of(f).pipe(delay(300));
  }

  deleteFrais(publicId: string): Observable<void> {
    const idx = MOCK_FRAIS.findIndex(f => f.publicId === publicId);
    if (idx >= 0) MOCK_FRAIS.splice(idx, 1);
    return of(undefined).pipe(delay(200));
  }
}
