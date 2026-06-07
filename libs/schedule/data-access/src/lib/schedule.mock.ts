import { ISalle, ITimeSlot, ISeance } from '@sms/shared/models';

export const MOCK_SALLES: ISalle[] = [
  { publicId: 'sal-001', code: 'A101', libelle: 'Amphi A101', capacite: 150, type: 'AMPHI' },
  { publicId: 'sal-002', code: 'B12', libelle: 'Salle TD B12', capacite: 35, type: 'TD' },
  { publicId: 'sal-003', code: 'LABO-1', libelle: 'Labo Informatique 1', capacite: 25, type: 'LABO' },
  { publicId: 'sal-004', code: 'TP-2', libelle: 'Salle TP2', capacite: 20, type: 'TP' },
];

export const MOCK_TIME_SLOTS: ITimeSlot[] = [
  {
    publicId: 'ts-001', jour: 'LUNDI', heureDebut: '08:00', heureFin: '10:00',
    matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique',
    promotionPublicId: 'promo-001', promotionLibelle: 'L3 GL 2025',
    sallePublicId: 'sal-001', salleLibelle: 'Amphi A101',
    enseignantPublicId: 'usr-ens-001', enseignantNom: 'Coulibaly Oumar',
  },
  {
    publicId: 'ts-002', jour: 'LUNDI', heureDebut: '10:00', heureFin: '12:00',
    matierePublicId: 'mat-002', matiereLibelle: 'Base de données',
    promotionPublicId: 'promo-001', promotionLibelle: 'L3 GL 2025',
    sallePublicId: 'sal-003', salleLibelle: 'Labo Informatique 1',
    enseignantPublicId: 'usr-ens-002', enseignantNom: 'Diallo Seydou',
  },
  {
    publicId: 'ts-003', jour: 'MARDI', heureDebut: '08:00', heureFin: '10:00',
    matierePublicId: 'mat-003', matiereLibelle: 'Réseaux',
    promotionPublicId: 'promo-001', promotionLibelle: 'L3 GL 2025',
    sallePublicId: 'sal-002', salleLibelle: 'Salle TD B12',
    enseignantPublicId: 'usr-ens-003', enseignantNom: 'Touré Kader',
  },
  {
    publicId: 'ts-004', jour: 'MERCREDI', heureDebut: '14:00', heureFin: '16:00',
    matierePublicId: 'mat-004', matiereLibelle: 'Mathématiques',
    promotionPublicId: 'promo-002', promotionLibelle: 'L2 GL 2025',
    sallePublicId: 'sal-001', salleLibelle: 'Amphi A101',
    enseignantPublicId: 'usr-ens-001', enseignantNom: 'Coulibaly Oumar',
  },
];

export const MOCK_SEANCES: ISeance[] = [
  { publicId: 'sea-001', timeSlotPublicId: 'ts-001', date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-002', timeSlotPublicId: 'ts-002', date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-003', timeSlotPublicId: 'ts-003', date: '2026-06-03', statut: 'PLANIFIEE' },
  { publicId: 'sea-004', timeSlotPublicId: 'ts-001', date: '2026-06-09', statut: 'ANNULEE', motifAnnulation: 'Enseignant absent' },
];
