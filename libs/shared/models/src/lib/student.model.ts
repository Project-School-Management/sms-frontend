// ── Statuts du cycle de vie complet ──────────────────────────────────────────
export type StudentStatut =
  | 'PRE_INSCRIT'          // Dossier déposé, en attente de validation
  | 'INSCRIT'              // Inscription enregistrée
  | 'INSCRIPTION_VALIDEE'  // Inscription validée par l'administration
  | 'ACTIF'                // Scolarisé, année en cours
  | 'INACTIF'              // Non scolarisé temporairement
  | 'INSCRIPTION_ANNULEE'  // Inscription annulée (avant début)
  | 'SUSPENDU'             // Suspension temporaire
  | 'ABANDONNE'            // A abandonné en cours d'année
  | 'TRANSFERE'            // Transféré vers un autre établissement
  | 'DIPLOME'              // A obtenu son diplôme
  | 'EXCLUS';              // Exclu disciplinairement

export type RelationParent = 'PERE' | 'MERE' | 'TUTEUR' | 'GRAND_PARENT' | 'AUTRE';

export type ActionAudit =
  | 'CREATION'
  | 'MODIFICATION'
  | 'CHANGEMENT_CLASSE'
  | 'ANNULATION_INSCRIPTION'
  | 'REACTIVATION'
  | 'SUSPENSION'
  | 'TRANSFERT'
  | 'VALIDATION'
  | 'DIPLOME'
  | 'EXCLUSION';

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface IParent {
  nom:       string;
  relation:  RelationParent;
  telephone: string;
  email?:    string;
  profession?: string;
}

export interface IInscription {
  id:               string;
  dateInscription:  string;
  classePublicId:   string;
  classeLibelle:    string;
  anneeAcademique:  string;
  statut:           StudentStatut;
  typeInscription:  'NOUVELLE' | 'RENOUVELLEMENT' | 'TRANSFERT';
  responsable:      string;
  dateModification: string;
  motif?:           string;
}

export interface IAuditEntry {
  id:              string;
  action:          ActionAudit;
  responsable:     string;
  date:            string;
  ancienneValeur?: string;
  nouvelleValeur?: string;
  details?:        string;
}

export interface IDocument {
  id:          string;
  label:       string;
  type:        'ACTE_NAISSANCE' | 'PHOTO' | 'CERTIFICAT_SCOLARITE' | 'CARNET' | 'ATTESTATION' | 'AUTRE';
  required:    boolean;
  provided:    boolean;
  dateDepot?:  string;
  fileUrl?:    string;
}

export interface IStudent {
  publicId:          string;
  matricule:         string;
  firstName:         string;
  lastName:          string;
  dateNaissance:     string;
  genre:             'M' | 'F';
  email?:            string;
  phone?:            string;
  photoUrl?:         string;
  etablissementId:   number;
  anneeAcademiqueId: number;
  classePublicId?:   string;
  classeLibelle?:    string;
  statut:            StudentStatut;
  // Informations enrichies
  nationalite?:      string;
  lieuNaissance?:    string;
  adresse?:          string;
  ville?:            string;
  parents?:          IParent[];
  observations?:     string;
  dateInscription?:  string;
  motifStatut?:      string;
  niveauLibelle?:    string;
  filiereLibelle?:   string;
}
