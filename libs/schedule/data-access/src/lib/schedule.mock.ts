import { ISalle, ITimeSlot, ISeance } from '@sms/shared/models';

// ─── Salles ──────────────────────────────────────────────────────────────────
export const MOCK_SALLES: ISalle[] = [
  { publicId: 'sal-001', code: 'A101',  libelle: 'Salle A101',           capacite: 55,  type: 'TD'   },
  { publicId: 'sal-002', code: 'B12',   libelle: 'Salle B12',            capacite: 45,  type: 'TD'   },
  { publicId: 'sal-003', code: 'C201',  libelle: 'Salle C201',           capacite: 50,  type: 'TD'   },
  { publicId: 'sal-004', code: 'D05',   libelle: 'Salle D05',            capacite: 40,  type: 'TD'   },
  { publicId: 'sal-005', code: 'AMPHI-1', libelle: 'Amphithéâtre 1',    capacite: 200, type: 'AMPHI' },
  { publicId: 'sal-006', code: 'LABO-PHYS', libelle: 'Labo Physique',   capacite: 30,  type: 'LABO'  },
  { publicId: 'sal-007', code: 'LABO-SVT',  libelle: 'Labo SVT',        capacite: 30,  type: 'LABO'  },
  { publicId: 'sal-008', code: 'TP-INFO',   libelle: 'Salle TP Info',   capacite: 25,  type: 'TP'    },
  { publicId: 'sal-009', code: 'A102',  libelle: 'Salle A102',           capacite: 40,  type: 'TD'   },
  { publicId: 'sal-010', code: 'E10',   libelle: 'Salle E10',            capacite: 35,  type: 'TD'   },
];

// ─── Classes meta ────────────────────────────────────────────────────────────
export interface IClasse {
  id: string;
  libelle: string;
  niveau: string;
  filiere: string;
  effectif: number;
  professeurPrincipal: string;
  sallePrincipale: string;
}

export const MOCK_CLASSES: IClasse[] = [
  { id: 'cls-terminale-s1', libelle: 'Terminale S1', niveau: 'Terminale', filiere: 'Scientifique', effectif: 42, professeurPrincipal: 'Mme Coulibaly Fatou',  sallePrincipale: 'B12'   },
  { id: 'cls-terminale-a1', libelle: 'Terminale A1', niveau: 'Terminale', filiere: 'Littéraire',   effectif: 38, professeurPrincipal: 'M. Diallo Seydou',     sallePrincipale: 'A102'  },
  { id: 'cls-premiere-d',   libelle: 'Première D',   niveau: 'Première',  filiere: 'Scientifique', effectif: 45, professeurPrincipal: 'M. Touré Kader',       sallePrincipale: 'C201'  },
  { id: 'cls-seconde',      libelle: 'Seconde A',    niveau: 'Seconde',   filiere: 'Générale',     effectif: 52, professeurPrincipal: 'Mme Koné Mariame',     sallePrincipale: 'A101'  },
  { id: 'cls-troisieme',    libelle: '3ème B',       niveau: '3ème',      filiere: 'Collège',      effectif: 35, professeurPrincipal: 'M. Bah Ibrahim',        sallePrincipale: 'D05'   },
];

// ─── Time Slots ──────────────────────────────────────────────────────────────
export const MOCK_TIME_SLOTS: ITimeSlot[] = [

  // ══════════════════ TERMINALE S1 ══════════════════
  // LUNDI
  { publicId: 'ts-ts1-lun-1', jour: 'LUNDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-001', enseignantNom: 'M. Kaboré Aristide' },
  { publicId: 'ts-ts1-lun-2', jour: 'LUNDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-006', salleLibelle: 'LABO-PHYS', enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata' },
  { publicId: 'ts-ts1-lun-3', jour: 'LUNDI',    heureDebut: '09:30', heureFin: '10:30', matierePublicId: 'mat-svt',    matiereLibelle: 'SVT',             promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-007', salleLibelle: 'LABO-SVT',  enseignantPublicId: 'ens-003', enseignantNom: 'M. Ouédraogo Luc' },
  { publicId: 'ts-ts1-lun-4', jour: 'LUNDI',    heureDebut: '10:30', heureFin: '11:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-004', enseignantNom: 'Mme Coulibaly Fatou' },
  { publicId: 'ts-ts1-lun-5', jour: 'LUNDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  // MARDI
  { publicId: 'ts-ts1-mar-1', jour: 'MARDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-001', enseignantNom: 'M. Kaboré Aristide' },
  { publicId: 'ts-ts1-mar-2', jour: 'MARDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },
  { publicId: 'ts-ts1-mar-3', jour: 'MARDI',    heureDebut: '10:30', heureFin: '11:30', matierePublicId: 'mat-philo',  matiereLibelle: 'Philosophie',     promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-007', enseignantNom: 'M. Bamba Isidore' },
  { publicId: 'ts-ts1-mar-4', jour: 'MARDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-svt',    matiereLibelle: 'SVT',             promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-007', salleLibelle: 'LABO-SVT',  enseignantPublicId: 'ens-003', enseignantNom: 'M. Ouédraogo Luc' },
  { publicId: 'ts-ts1-mar-5', jour: 'MARDI',    heureDebut: '15:00', heureFin: '16:00', matierePublicId: 'mat-eps',    matiereLibelle: 'EPS',             promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'Terrain',   enseignantPublicId: 'ens-008', enseignantNom: 'M. Koné Jean-Pierre' },
  // MERCREDI
  { publicId: 'ts-ts1-mer-1', jour: 'MERCREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-006', salleLibelle: 'LABO-PHYS', enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata' },
  { publicId: 'ts-ts1-mer-2', jour: 'MERCREDI', heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-001', enseignantNom: 'M. Kaboré Aristide' },
  { publicId: 'ts-ts1-mer-3', jour: 'MERCREDI', heureDebut: '10:30', heureFin: '11:30', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  // JEUDI
  { publicId: 'ts-ts1-jeu-1', jour: 'JEUDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-004', enseignantNom: 'Mme Coulibaly Fatou' },
  { publicId: 'ts-ts1-jeu-2', jour: 'JEUDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-006', salleLibelle: 'LABO-PHYS', enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata' },
  { publicId: 'ts-ts1-jeu-3', jour: 'JEUDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-001', enseignantNom: 'M. Kaboré Aristide' },
  { publicId: 'ts-ts1-jeu-4', jour: 'JEUDI',    heureDebut: '15:00', heureFin: '16:00', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },
  // VENDREDI
  { publicId: 'ts-ts1-ven-1', jour: 'VENDREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-svt',    matiereLibelle: 'SVT',             promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-007', salleLibelle: 'LABO-SVT',  enseignantPublicId: 'ens-003', enseignantNom: 'M. Ouédraogo Luc' },
  { publicId: 'ts-ts1-ven-2', jour: 'VENDREDI', heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-philo',  matiereLibelle: 'Philosophie',     promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-007', enseignantNom: 'M. Bamba Isidore' },
  { publicId: 'ts-ts1-ven-3', jour: 'VENDREDI', heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-004', enseignantNom: 'Mme Coulibaly Fatou' },
  // SAMEDI (réduit)
  { publicId: 'ts-ts1-sam-1', jour: 'SAMEDI',   heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-001', enseignantNom: 'M. Kaboré Aristide' },
  { publicId: 'ts-ts1-sam-2', jour: 'SAMEDI',   heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-002', salleLibelle: 'B12',       enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-ts1-sam-3', jour: 'SAMEDI',   heureDebut: '10:30', heureFin: '11:30', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1', sallePublicId: 'sal-006', salleLibelle: 'LABO-PHYS', enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata' },

  // ══════════════════ TERMINALE A1 ══════════════════
  // LUNDI
  { publicId: 'ts-ta1-lun-1', jour: 'LUNDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-009', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-ta1-lun-2', jour: 'LUNDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-philo',  matiereLibelle: 'Philosophie',     promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-007', enseignantNom: 'M. Bamba Isidore' },
  { publicId: 'ts-ta1-lun-3', jour: 'LUNDI',    heureDebut: '09:30', heureFin: '10:30', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-ta1-lun-4', jour: 'LUNDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },
  // MARDI
  { publicId: 'ts-ta1-mar-1', jour: 'MARDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-009', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-ta1-mar-2', jour: 'MARDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-lat',    matiereLibelle: 'Latin',           promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-010', enseignantNom: 'Mme Koné Evelyne' },
  { publicId: 'ts-ta1-mar-3', jour: 'MARDI',    heureDebut: '10:30', heureFin: '11:30', matierePublicId: 'mat-esp',    matiereLibelle: 'Espagnol',        promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-011', enseignantNom: 'Mme Diabaté Rosa' },
  { publicId: 'ts-ta1-mar-4', jour: 'MARDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-philo',  matiereLibelle: 'Philosophie',     promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-007', enseignantNom: 'M. Bamba Isidore' },
  // MERCREDI
  { publicId: 'ts-ta1-mer-1', jour: 'MERCREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },
  { publicId: 'ts-ta1-mer-2', jour: 'MERCREDI', heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-009', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-ta1-mer-3', jour: 'MERCREDI', heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-eps',    matiereLibelle: 'EPS',             promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'Terrain',   enseignantPublicId: 'ens-008', enseignantNom: 'M. Koné Jean-Pierre' },
  // JEUDI
  { publicId: 'ts-ta1-jeu-1', jour: 'JEUDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-ta1-jeu-2', jour: 'JEUDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-lat',    matiereLibelle: 'Latin',           promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-010', enseignantNom: 'Mme Koné Evelyne' },
  { publicId: 'ts-ta1-jeu-3', jour: 'JEUDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-009', enseignantNom: 'M. Diallo Seydou' },
  // VENDREDI
  { publicId: 'ts-ta1-ven-1', jour: 'VENDREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-esp',    matiereLibelle: 'Espagnol',        promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-011', enseignantNom: 'Mme Diabaté Rosa' },
  { publicId: 'ts-ta1-ven-2', jour: 'VENDREDI', heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },
  { publicId: 'ts-ta1-ven-3', jour: 'VENDREDI', heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-philo',  matiereLibelle: 'Philosophie',     promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-007', enseignantNom: 'M. Bamba Isidore' },
  // SAMEDI
  { publicId: 'ts-ta1-sam-1', jour: 'SAMEDI',   heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-009', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-ta1-sam-2', jour: 'SAMEDI',   heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-terminale-a1', promotionLibelle: 'Terminale A1', sallePublicId: 'sal-009', salleLibelle: 'A102',      enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },

  // ══════════════════ PREMIÈRE D ══════════════════
  // LUNDI
  { publicId: 'ts-pd-lun-1', jour: 'LUNDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-012', enseignantNom: 'M. Touré Kader' },
  { publicId: 'ts-pd-lun-2', jour: 'LUNDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-006', salleLibelle: 'LABO-PHYS', enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata' },
  { publicId: 'ts-pd-lun-3', jour: 'LUNDI',    heureDebut: '10:30', heureFin: '11:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-013', enseignantNom: 'Mme Fofana Aminata' },
  { publicId: 'ts-pd-lun-4', jour: 'LUNDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-svt',    matiereLibelle: 'SVT',             promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-007', salleLibelle: 'LABO-SVT',  enseignantPublicId: 'ens-003', enseignantNom: 'M. Ouédraogo Luc' },
  // MARDI
  { publicId: 'ts-pd-mar-1', jour: 'MARDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-012', enseignantNom: 'M. Touré Kader' },
  { publicId: 'ts-pd-mar-2', jour: 'MARDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-pd-mar-3', jour: 'MARDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },
  // MERCREDI
  { publicId: 'ts-pd-mer-1', jour: 'MERCREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-006', salleLibelle: 'LABO-PHYS', enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata' },
  { publicId: 'ts-pd-mer-2', jour: 'MERCREDI', heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-svt',    matiereLibelle: 'SVT',             promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-007', salleLibelle: 'LABO-SVT',  enseignantPublicId: 'ens-003', enseignantNom: 'M. Ouédraogo Luc' },
  { publicId: 'ts-pd-mer-3', jour: 'MERCREDI', heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-eps',    matiereLibelle: 'EPS',             promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'Terrain',   enseignantPublicId: 'ens-008', enseignantNom: 'M. Koné Jean-Pierre' },
  // JEUDI
  { publicId: 'ts-pd-jeu-1', jour: 'JEUDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-013', enseignantNom: 'Mme Fofana Aminata' },
  { publicId: 'ts-pd-jeu-2', jour: 'JEUDI',    heureDebut: '10:30', heureFin: '11:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-012', enseignantNom: 'M. Touré Kader' },
  { publicId: 'ts-pd-jeu-3', jour: 'JEUDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  // VENDREDI
  { publicId: 'ts-pd-ven-1', jour: 'VENDREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-006', salleLibelle: 'LABO-PHYS', enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata' },
  { publicId: 'ts-pd-ven-2', jour: 'VENDREDI', heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },
  // SAMEDI
  { publicId: 'ts-pd-sam-1', jour: 'SAMEDI',   heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-012', enseignantNom: 'M. Touré Kader' },
  { publicId: 'ts-pd-sam-2', jour: 'SAMEDI',   heureDebut: '09:30', heureFin: '10:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-premiere-d', promotionLibelle: 'Première D', sallePublicId: 'sal-003', salleLibelle: 'C201',      enseignantPublicId: 'ens-013', enseignantNom: 'Mme Fofana Aminata' },

  // ══════════════════ SECONDE A ══════════════════
  // LUNDI
  { publicId: 'ts-sec-lun-1', jour: 'LUNDI',    heureDebut: '09:30', heureFin: '10:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-014', enseignantNom: 'Mme Koné Mariame' },
  { publicId: 'ts-sec-lun-2', jour: 'LUNDI',    heureDebut: '10:30', heureFin: '11:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-013', enseignantNom: 'Mme Fofana Aminata' },
  { publicId: 'ts-sec-lun-3', jour: 'LUNDI',    heureDebut: '15:00', heureFin: '16:00', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  // MARDI
  { publicId: 'ts-sec-mar-1', jour: 'MARDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-006', salleLibelle: 'LABO-PHYS', enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata' },
  { publicId: 'ts-sec-mar-2', jour: 'MARDI',    heureDebut: '09:30', heureFin: '10:30', matierePublicId: 'mat-svt',    matiereLibelle: 'SVT',             promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-003', enseignantNom: 'M. Ouédraogo Luc' },
  { publicId: 'ts-sec-mar-3', jour: 'MARDI',    heureDebut: '15:00', heureFin: '16:00', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },
  // MERCREDI — CONFLIT INTENTIONNEL: Mme Traoré dans LABO-PHYS ET C201 à 07:30 simultanément (autre classe)
  { publicId: 'ts-sec-mer-1', jour: 'MERCREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-014', enseignantNom: 'Mme Koné Mariame' },
  { publicId: 'ts-sec-mer-2', jour: 'MERCREDI', heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-013', enseignantNom: 'Mme Fofana Aminata' },
  { publicId: 'ts-sec-mer-3', jour: 'MERCREDI', heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-eps',    matiereLibelle: 'EPS',             promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'Terrain',   enseignantPublicId: 'ens-008', enseignantNom: 'M. Koné Jean-Pierre' },
  // CONFLIT: Mme Traoré aussi planifiée en Physique pour Seconde MERCREDI 07:30 (conflit intentionnel avec Terminale S1)
  { publicId: 'ts-sec-mer-CONFLIT', jour: 'MERCREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-phys', matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-006', salleLibelle: 'LABO-PHYS', enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata' },
  // JEUDI
  { publicId: 'ts-sec-jeu-1', jour: 'JEUDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-sec-jeu-2', jour: 'JEUDI',    heureDebut: '09:30', heureFin: '10:30', matierePublicId: 'mat-svt',    matiereLibelle: 'SVT',             promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-007', salleLibelle: 'LABO-SVT',  enseignantPublicId: 'ens-003', enseignantNom: 'M. Ouédraogo Luc' },
  { publicId: 'ts-sec-jeu-3', jour: 'JEUDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-014', enseignantNom: 'Mme Koné Mariame' },
  // VENDREDI
  { publicId: 'ts-sec-ven-1', jour: 'VENDREDI', heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-006', salleLibelle: 'LABO-PHYS', enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata' },
  { publicId: 'ts-sec-ven-2', jour: 'VENDREDI', heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-013', enseignantNom: 'Mme Fofana Aminata' },
  // SAMEDI
  { publicId: 'ts-sec-sam-1', jour: 'SAMEDI',   heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-014', enseignantNom: 'Mme Koné Mariame' },
  { publicId: 'ts-sec-sam-2', jour: 'SAMEDI',   heureDebut: '10:30', heureFin: '11:30', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-seconde', promotionLibelle: 'Seconde A', sallePublicId: 'sal-001', salleLibelle: 'A101',      enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },

  // ══════════════════ 3ÈME B ══════════════════
  // LUNDI
  { publicId: 'ts-3b-lun-1', jour: 'LUNDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-015', enseignantNom: 'M. Bah Ibrahim' },
  { publicId: 'ts-3b-lun-2', jour: 'LUNDI',    heureDebut: '09:30', heureFin: '10:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-016', enseignantNom: 'Mme Sylla Ndeye' },
  { publicId: 'ts-3b-lun-3', jour: 'LUNDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-010', salleLibelle: 'E10',       enseignantPublicId: 'ens-017', enseignantNom: 'M. Camara Lamine' },
  // MARDI
  { publicId: 'ts-3b-mar-1', jour: 'MARDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },
  { publicId: 'ts-3b-mar-2', jour: 'MARDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-3b-mar-3', jour: 'MARDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-svt',    matiereLibelle: 'SVT',             promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-007', salleLibelle: 'LABO-SVT',  enseignantPublicId: 'ens-003', enseignantNom: 'M. Ouédraogo Luc' },
  // MERCREDI
  { publicId: 'ts-3b-mer-1', jour: 'MERCREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-015', enseignantNom: 'M. Bah Ibrahim' },
  { publicId: 'ts-3b-mer-2', jour: 'MERCREDI', heureDebut: '10:30', heureFin: '11:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-016', enseignantNom: 'Mme Sylla Ndeye' },
  // CONFLIT salle: D05 occupée deux fois le MERCREDI 07:30 (conflit intentionnel)
  { publicId: 'ts-3b-mer-CONFLIT', jour: 'MERCREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-art', matiereLibelle: 'Arts Plastiques', promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05', enseignantPublicId: 'ens-018', enseignantNom: 'Mme Diallo Coumba' },
  // JEUDI
  { publicId: 'ts-3b-jeu-1', jour: 'JEUDI',    heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
  { publicId: 'ts-3b-jeu-2', jour: 'JEUDI',    heureDebut: '08:30', heureFin: '09:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-015', enseignantNom: 'M. Bah Ibrahim' },
  { publicId: 'ts-3b-jeu-3', jour: 'JEUDI',    heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-phys',   matiereLibelle: 'Physique-Chimie', promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-010', salleLibelle: 'E10',       enseignantPublicId: 'ens-017', enseignantNom: 'M. Camara Lamine' },
  // VENDREDI
  { publicId: 'ts-3b-ven-1', jour: 'VENDREDI', heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-fr',     matiereLibelle: 'Français',        promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-016', enseignantNom: 'Mme Sylla Ndeye' },
  { publicId: 'ts-3b-ven-2', jour: 'VENDREDI', heureDebut: '09:30', heureFin: '10:30', matierePublicId: 'mat-hist',   matiereLibelle: 'Histoire-Géo',    promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam' },
  { publicId: 'ts-3b-ven-3', jour: 'VENDREDI', heureDebut: '14:00', heureFin: '15:00', matierePublicId: 'mat-eps',    matiereLibelle: 'EPS',             promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'Terrain',   enseignantPublicId: 'ens-008', enseignantNom: 'M. Koné Jean-Pierre' },
  // SAMEDI
  { publicId: 'ts-3b-sam-1', jour: 'SAMEDI',   heureDebut: '07:30', heureFin: '08:30', matierePublicId: 'mat-maths',  matiereLibelle: 'Mathématiques',   promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-015', enseignantNom: 'M. Bah Ibrahim' },
  { publicId: 'ts-3b-sam-2', jour: 'SAMEDI',   heureDebut: '09:30', heureFin: '10:30', matierePublicId: 'mat-ang',    matiereLibelle: 'Anglais',         promotionPublicId: 'cls-troisieme', promotionLibelle: '3ème B', sallePublicId: 'sal-004', salleLibelle: 'D05',       enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou' },
];

// ─── Séances ─────────────────────────────────────────────────────────────────
export const MOCK_SEANCES: ISeance[] = [
  { publicId: 'sea-001', timeSlotPublicId: 'ts-ts1-lun-1', date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-002', timeSlotPublicId: 'ts-ts1-lun-2', date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-003', timeSlotPublicId: 'ts-ts1-lun-3', date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-004', timeSlotPublicId: 'ts-ts1-lun-4', date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-005', timeSlotPublicId: 'ts-ts1-lun-5', date: '2026-06-02', statut: 'PLANIFIEE' },
  { publicId: 'sea-006', timeSlotPublicId: 'ts-ts1-mar-1', date: '2026-06-03', statut: 'EFFECTUEE' },
  { publicId: 'sea-007', timeSlotPublicId: 'ts-ts1-mar-2', date: '2026-06-03', statut: 'EFFECTUEE' },
  { publicId: 'sea-008', timeSlotPublicId: 'ts-ts1-mar-3', date: '2026-06-03', statut: 'PLANIFIEE' },
  { publicId: 'sea-009', timeSlotPublicId: 'ts-ts1-mer-1', date: '2026-06-04', statut: 'EFFECTUEE' },
  { publicId: 'sea-010', timeSlotPublicId: 'ts-ts1-mer-2', date: '2026-06-04', statut: 'ANNULEE', motifAnnulation: 'Enseignant absent' },
  { publicId: 'sea-011', timeSlotPublicId: 'ts-ts1-jeu-1', date: '2026-06-05', statut: 'PLANIFIEE' },
  { publicId: 'sea-012', timeSlotPublicId: 'ts-ts1-jeu-3', date: '2026-06-05', statut: 'PLANIFIEE' },
  { publicId: 'sea-013', timeSlotPublicId: 'ts-ts1-ven-1', date: '2026-06-06', statut: 'EFFECTUEE' },
  { publicId: 'sea-014', timeSlotPublicId: 'ts-ts1-ven-2', date: '2026-06-06', statut: 'EFFECTUEE' },
  { publicId: 'sea-015', timeSlotPublicId: 'ts-ts1-ven-3', date: '2026-06-06', statut: 'REPORTEE', motifAnnulation: 'Salle indisponible — reportée au 13/06' },
  { publicId: 'sea-016', timeSlotPublicId: 'ts-ts1-sam-1', date: '2026-06-07', statut: 'EFFECTUEE' },
  { publicId: 'sea-017', timeSlotPublicId: 'ts-ta1-lun-1', date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-018', timeSlotPublicId: 'ts-ta1-mar-1', date: '2026-06-03', statut: 'EFFECTUEE' },
  { publicId: 'sea-019', timeSlotPublicId: 'ts-pd-lun-1',  date: '2026-06-02', statut: 'EFFECTUEE' },
  { publicId: 'sea-020', timeSlotPublicId: 'ts-sec-lun-1', date: '2026-06-02', statut: 'PLANIFIEE' },
  { publicId: 'sea-021', timeSlotPublicId: 'ts-3b-lun-1',  date: '2026-06-02', statut: 'EFFECTUEE' },
];
