export type TypeConversation = 'PRIVE' | 'GROUPE';

export interface IMessage {
  publicId:          string;
  expediteurPublicId: string;
  expediteurNom:     string;
  contenu:           string;
  lu:                boolean;
  createdAt:         string;
}

export interface IConversation {
  publicId:         string;
  type:             TypeConversation;
  titre?:           string;
  participants:     string[];
  dernierMessage?:  IMessage;
  nbNonLus:         number;
  createdAt:        string;
}
