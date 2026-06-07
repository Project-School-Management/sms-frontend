import { Role } from './role.enum';

export interface IUser {
  publicId:          string;
  login:             string;
  email:             string;
  firstName:         string;
  lastName:          string;
  authorities:       Role[];
  etablissementId:   number;
  anneeAcademiqueId?: number;
  langKey:           string;
  twoFaEnabled:      boolean;
  activated:         boolean;
  createdDate:       string;
}

export interface IEtablissement {
  publicId:  string;
  code:      string;
  libelle:   string;
  ville:     string;
  pays:      string;
  logoUrl?:  string;
}

export interface IAnneeAcademique {
  publicId:  string;
  libelle:   string;
  dateDebut: string;
  dateFin:   string;
  active:    boolean;
}
