export type NotificationType =
  | 'BULLETIN' | 'PAIEMENT' | 'SEANCE' | 'NOTE'
  | 'INSCRIPTION' | 'SYSTEME'
  | 'GRADE_PUBLISHED' | 'BULLETIN_READY' | 'INVOICE_DUE'
  | 'PAYMENT_RECEIVED' | 'MESSAGE_RECEIVED' | 'EXAM_SCHEDULED';

export interface INotification {
  publicId:   string;
  type:       NotificationType;
  titre:      string;
  contenu:    string;
  lue:        boolean;
  createdAt:  string;
  actionUrl?: string;
}
