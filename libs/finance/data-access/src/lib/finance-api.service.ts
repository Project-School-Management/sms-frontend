import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  IFacture, IPaiement, IBourse, IFraisScolarite,
  IInitierPaiementRequest, IBourseRequest, IFraisScolariteRequest,
  StatutFacture
} from '@sms/shared/models';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fac(
  n: number, studentId: number, montantTotal: number, montantPaye: number,
  statut: StatutFacture, dateEcheance: string, createdDate: string
): IFacture {
  const num = String(n).padStart(4, '0');
  const solde = montantTotal - montantPaye;
  return {
    publicId: `fac-${num}`,
    numero: `FAC-2025-${num}`,
    studentId, anneeAcademiqueId: 1,
    montantTotal, montantPaye, solde, statut,
    dateEcheance, createdDate,
    echeancier: [],
  };
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_FACTURES: IFacture[] = [
  fac(1,  1,  750000, 500000, 'PARTIELLEMENT_PAYEE', '2026-03-31', '2026-01-15'),
  fac(2,  2,  750000,      0, 'EN_RETARD',           '2026-02-28', '2026-01-15'),
  fac(3,  3,  750000, 750000, 'PAYEE',               '2026-03-31', '2026-01-15'),
  fac(4,  4,  600000,      0, 'EMISE',               '2026-04-30', '2026-02-01'),
  fac(5,  5,  450000, 450000, 'PAYEE',               '2026-03-15', '2026-01-20'),
  fac(6,  6,  750000, 250000, 'PARTIELLEMENT_PAYEE', '2026-04-30', '2026-02-01'),
  fac(7,  7,  600000,      0, 'EN_RETARD',           '2026-01-31', '2026-01-10'),
  fac(8,  8,  750000, 750000, 'PAYEE',               '2026-03-31', '2026-01-12'),
  fac(9,  9,  450000,      0, 'EMISE',               '2026-05-31', '2026-02-15'),
  fac(10, 10, 750000,      0, 'EN_RETARD',           '2026-02-15', '2026-01-15'),
  fac(11, 11, 600000, 600000, 'PAYEE',               '2026-03-31', '2026-01-18'),
  fac(12, 12, 750000, 375000, 'PARTIELLEMENT_PAYEE', '2026-04-30', '2026-02-01'),
  fac(13, 13, 450000,      0, 'EN_RETARD',           '2026-01-31', '2026-01-08'),
  fac(14, 14, 750000, 750000, 'PAYEE',               '2026-03-31', '2026-01-15'),
  fac(15, 15, 600000,      0, 'ANNULEE',             '2026-04-30', '2026-01-20'),
  fac(16, 16, 750000, 500000, 'PARTIELLEMENT_PAYEE', '2026-05-31', '2026-02-05'),
  fac(17, 17, 450000, 450000, 'PAYEE',               '2026-03-15', '2026-01-25'),
  fac(18, 18, 750000,      0, 'EN_RETARD',           '2026-02-01', '2026-01-10'),
  fac(19, 19, 600000,      0, 'EMISE',               '2026-06-30', '2026-03-01'),
  fac(20, 20, 750000, 250000, 'PARTIELLEMENT_PAYEE', '2026-04-30', '2026-02-10'),
];

// Attach student names for display
const STUDENT_NAMES: Record<number, string> = {
  1: 'Awa Diallo', 2: 'Kofi Mensah', 3: 'Fatou Traoré', 4: 'Moussa Coulibaly',
  5: 'Aminata Koné', 6: 'Ibrahima Bah', 7: 'Mariam Sanogo', 8: 'Seydou Ouedraogo',
  9: 'Kadiatou Camara', 10: 'Ousmane Diakité', 11: 'Rokhaya Ndiaye', 12: 'Bakary Kouyaté',
  13: 'Bintou Keita', 14: 'Aliou Barry', 15: 'Ndeye Faye', 16: 'Lamine Sow',
  17: 'Aïssatou Baldé', 18: 'Mamadou Sall', 19: 'Oumou Dramé', 20: 'Cheikh Mbaye',
};

export { STUDENT_NAMES };

const MOCK_PAIEMENTS: IPaiement[] = [
  { publicId: 'pay-001', facturePublicId: 'fac-0001', montant: 250000, operateur: 'WAVE', telephone: '+2250712345678', referenceExterne: 'WAVE-2026-001', statut: 'CONFIRME', createdDate: '2026-01-28' },
  { publicId: 'pay-002', facturePublicId: 'fac-0001', montant: 250000, operateur: 'ORANGE_MONEY', telephone: '+2250712345678', referenceExterne: 'OM-2026-002', statut: 'CONFIRME', createdDate: '2026-02-25' },
  { publicId: 'pay-003', facturePublicId: 'fac-0003', montant: 750000, operateur: 'MTN_MOMO', telephone: '+2250756789012', referenceExterne: 'MTN-2026-003', statut: 'CONFIRME', createdDate: '2026-01-20' },
];

const MOCK_BOURSES: IBourse[] = [
  { publicId: 'bou-001', studentId: 1, typeBourse: 'MERITE', pourcentage: 20, anneeAcademiqueId: 1, motif: 'Mention TB au baccalauréat', createdDate: '2026-01-10' },
  { publicId: 'bou-002', studentId: 3, typeBourse: 'SOCIALE', montantDeduction: 100000, anneeAcademiqueId: 1, motif: 'Situation familiale difficile', createdDate: '2026-01-12' },
  { publicId: 'bou-003', studentId: 5, typeBourse: 'MERITE', pourcentage: 15, anneeAcademiqueId: 1, motif: '1ère au concours d\'entrée', createdDate: '2026-01-14' },
];

const MOCK_FRAIS: IFraisScolarite[] = [
  { publicId: 'fra-001', anneeAcademiqueId: 1, libelle: 'Frais de scolarité L3 GL', typeFrais: 'SCOLARITE', montant: 750000, dateEcheance: '2026-03-31', createdDate: '2025-10-01' },
  { publicId: 'fra-002', anneeAcademiqueId: 1, libelle: 'Frais d\'inscription', typeFrais: 'INSCRIPTION', montant: 50000, createdDate: '2025-10-01' },
  { publicId: 'fra-003', anneeAcademiqueId: 1, libelle: 'Frais de scolarité L2 GL', typeFrais: 'SCOLARITE', montant: 600000, dateEcheance: '2026-03-31', createdDate: '2025-10-01' },
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
