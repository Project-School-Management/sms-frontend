import { ISalle, ITimeSlot, ISeance } from '@sms/shared/models';

export const MOCK_SALLES: ISalle[] = [
  { publicId: 'sal-001', code: 'A101', libelle: 'Amphi A101', capacite: 150, type: 'AMPHI' },
  { publicId: 'sal-002', code: 'B12', libelle: 'Salle TD B12', capacite: 35, type: 'TD' },
  { publicId: 'sal-003', code: 'LABO-1', libelle: 'Labo Informatique 1', capacite: 25, type: 'LABO' },
  { publicId: 'sal-004', code: 'TP-2', libelle: 'Salle TP 2', capacite: 20, type: 'TP' },
  { publicId: 'sal-005', code: 'C201', libelle: 'Salle de Cours C201', capacite: 50, type: 'CM' },
];

export const MOCK_TIME_SLOTS: ITimeSlot[] = [
  { publicId: 'ts-001', jour: 'LUNDI', heureDebut: '08:00', heureFin: '10:00', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', promotionPublicId: 'promo-001', promotionLibelle: 'L3 GL 2025', sallePublicId: 'sal-001', salleLibelle: 'Amphi A101', enseignantPublicId: 'usr-ens-001', enseignantNom: 'Coulibaly Oumar' },
  { publicId: 'ts-002', jour: 'LUNDI', heureDebut: '10:00', heureFin: '12:00', matierePublicId: 'mat-002', matiereLibelle: 'Base de données', promotionPublicId: 'promo-001', promotionLibelle: 'L3 GL 2025', sallePublicId: 'sal-003', salleLibelle: 'Labo Informatique 1', enseignantPublicId: 'usr-ens-002', enseignantNom: 'Diallo Seydou' },
  { publicId: 'ts-003', jour: 'LUNDI', heureDebut: '14:00', heureFin: '16:00', matierePublicId: 'mat-005', matiereLibelle: 'Mathématiques', promotionPublicId: 'promo-002', promotionLibelle: 'L2 GL 2025', sallePublicId: 'sal-005', salleLibelle: 'Salle de Cours C201', enseignantPublicId: 'usr-ens-004', enseignantNom: 'Ouedraogo Serge' },
  { publicId: 'ts-004', jour: 'MARDI', heureDebut: '08:00', heureFin: '10:00', matierePublicId: 'mat-003', matiereLibelle: 'Réseaux', promotionPublicId: 'promo-001', promotionLibelle: 'L3 GL 2025', sallePublicId: 'sal-002', salleLibelle: 'Salle TD B12', enseignantPublicId: 'usr-ens-003', enseignantNom: 'Touré Kader' },
  { publicId: 'ts-005', jour: 'MARDI', heureDebut: '10:00', heureFin: '12:00', matierePublicId: 'mat-006', matiereLibelle: 'Français', promotionPublicId: 'promo-002', promotionLibelle: 'L2 GL 2025', sallePublicId: 'sal-005', salleLibelle: 'Salle de Cours C201', enseignantPublicId: 'usr-ens-005', enseignantNom: 'Sylla Mariama' },
  { publicId: 'ts-006', jour: 'MARDI', heureDebut: '14:00', heureFin: '16:00', matierePublicId: 'mat-008', matiereLibelle: 'Anglais', promotionPublicId: 'promo-003', promotionLibelle: 'M1 RI 2025', sallePublicId: 'sal-005', salleLibelle: 'Salle de Cours C201', enseignantPublicId: 'usr-ens-006', enseignantNom: 'Konaté Aïcha' },
  { publicId: 'ts-007', jour: 'MERCREDI', heureDebut: '08:00', heureFin: '10:00', matierePublicId: 'mat-007', matiereLibelle: 'Physique-Chimie', promotionPublicId: 'promo-004', promotionLibelle: 'L1 GL 2025', sallePublicId: 'sal-004', salleLibelle: 'Salle TP 2', enseignantPublicId: 'usr-ens-007', enseignantNom: 'Bamba Ibrahim' },
  { publicId: 'ts-008', jour: 'MERCREDI', heureDebut: '10:00', heureFin: '12:00', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', promotionPublicId: 'promo-002', promotionLibelle: 'L2 GL 2025', sallePublicId: 'sal-001', salleLibelle: 'Amphi A101', enseignantPublicId: 'usr-ens-001', enseignantNom: 'Coulibaly Oumar' },
  { publicId: 'ts-009', jour: 'MERCREDI', heureDebut: '14:00', heureFin: '16:00', matierePublicId: 'mat-005', matiereLibelle: 'Mathématiques', promotionPublicId: 'promo-004', promotionLibelle: 'L1 GL 2025', sallePublicId: 'sal-001', salleLibelle: 'Amphi A101', enseignantPublicId: 'usr-ens-004', enseignantNom: 'Ouedraogo Serge' },
  { publicId: 'ts-010', jour: 'JEUDI', heureDebut: '08:00', heureFin: '10:00', matierePublicId: 'mat-002', matiereLibelle: 'Base de données', promotionPublicId: 'promo-002', promotionLibelle: 'L2 GL 2025', sallePublicId: 'sal-003', salleLibelle: 'Labo Informatique 1', enseignantPublicId: 'usr-ens-002', enseignantNom: 'Diallo Seydou' },
  { publicId: 'ts-011', jour: 'JEUDI', heureDebut: '10:00', heureFin: '12:00', matierePublicId: 'mat-009', matiereLibelle: 'SVT', promotionPublicId: 'promo-004', promotionLibelle: 'L1 GL 2025', sallePublicId: 'sal-005', salleLibelle: 'Salle de Cours C201', enseignantPublicId: 'usr-ens-008', enseignantNom: 'Traoré Boubacar' },
  { publicId: 'ts-012', jour: 'JEUDI', heureDebut: '14:00', heureFin: '16:00', matierePublicId: 'mat-003', matiereLibelle: 'Réseaux', promotionPublicId: 'promo-003', promotionLibelle: 'M1 RI 2025', sallePublicId: 'sal-002', salleLibelle: 'Salle TD B12', enseignantPublicId: 'usr-ens-003', enseignantNom: 'Touré Kader' },
  { publicId: 'ts-013', jour: 'VENDREDI', heureDebut: '08:00', heureFin: '10:00', matierePublicId: 'mat-004', matiereLibelle: 'Histoire-Géo', promotionPublicId: 'promo-004', promotionLibelle: 'L1 GL 2025', sallePublicId: 'sal-005', salleLibelle: 'Salle de Cours C201', enseignantPublicId: 'usr-ens-009', enseignantNom: 'Kaboré Fatou' },
  { publicId: 'ts-014', jour: 'VENDREDI', heureDebut: '10:00', heureFin: '12:00', matierePublicId: 'mat-008', matiereLibelle: 'Anglais', promotionPublicId: 'promo-005', promotionLibelle: 'M2 RI 2025', sallePublicId: 'sal-005', salleLibelle: 'Salle de Cours C201', enseignantPublicId: 'usr-ens-006', enseignantNom: 'Konaté Aïcha' },
  { publicId: 'ts-015', jour: 'VENDREDI', heureDebut: '14:00', heureFin: '16:00', matierePublicId: 'mat-006', matiereLibelle: 'Français', promotionPublicId: 'promo-001', promotionLibelle: 'L3 GL 2025', sallePublicId: 'sal-005', salleLibelle: 'Salle de Cours C201', enseignantPublicId: 'usr-ens-005', enseignantNom: 'Sylla Mariama' },
];

export const MOCK_SEANCES: ISeance[] = [
  { publicId: 'sea-001', timeSlotPublicId: 'ts-001', date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-002', timeSlotPublicId: 'ts-002', date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-003', timeSlotPublicId: 'ts-003', date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-004', timeSlotPublicId: 'ts-004', date: '2026-06-03', statut: 'PLANIFIEE' },
  { publicId: 'sea-005', timeSlotPublicId: 'ts-005', date: '2026-06-03', statut: 'PLANIFIEE' },
  { publicId: 'sea-006', timeSlotPublicId: 'ts-006', date: '2026-06-03', statut: 'EFFECTUEE' },
  { publicId: 'sea-007', timeSlotPublicId: 'ts-007', date: '2026-06-04', statut: 'EFFECTUEE' },
  { publicId: 'sea-008', timeSlotPublicId: 'ts-008', date: '2026-06-04', statut: 'PLANIFIEE' },
  { publicId: 'sea-009', timeSlotPublicId: 'ts-001', date: '2026-06-09', statut: 'ANNULEE', motifAnnulation: 'Enseignant absent' },
  { publicId: 'sea-010', timeSlotPublicId: 'ts-010', date: '2026-06-05', statut: 'EFFECTUEE' },
  { publicId: 'sea-011', timeSlotPublicId: 'ts-012', date: '2026-06-05', statut: 'PLANIFIEE' },
  { publicId: 'sea-012', timeSlotPublicId: 'ts-013', date: '2026-06-06', statut: 'EFFECTUEE' },
  { publicId: 'sea-013', timeSlotPublicId: 'ts-015', date: '2026-06-06', statut: 'REPORTEE', motifAnnulation: 'Salle indisponible — reportée au 13/06' },
  { publicId: 'sea-014', timeSlotPublicId: 'ts-009', date: '2026-05-27', statut: 'EFFECTUEE' },
  { publicId: 'sea-015', timeSlotPublicId: 'ts-011', date: '2026-05-29', statut: 'EFFECTUEE' },
];
