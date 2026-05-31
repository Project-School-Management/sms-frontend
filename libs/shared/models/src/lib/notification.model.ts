/**
 * Notification temps-réel (WebSocket STOMP → communication-service)
 */
export interface INotification {
  publicId:    string;  // UUID
  type:        NotificationType;
  title:       string;
  body:        string;
  read:        boolean;
  createdAt:   string;  // ISO-8601
  targetUrl?:  string;
}

export type NotificationType =
  | 'GRADE_PUBLISHED'
  | 'BULLETIN_READY'
  | 'INVOICE_DUE'
  | 'PAYMENT_RECEIVED'
  | 'MESSAGE_RECEIVED'
  | 'EXAM_SCHEDULED'
  | 'SYSTEM';
