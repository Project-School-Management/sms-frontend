export type NotifType = 'PAIEMENT' | 'INSCRIPTION' | 'NOTE' | 'ALERTE' | 'MESSAGE' | 'PLANNING' | 'SYSTEME';
export type NotifPriority = 'high' | 'medium' | 'low';

export interface INotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  route?: string;
  read: boolean;
  archived: boolean;
  priority: NotifPriority;
  createdAt: Date;
  icon: string;
  color: string;
  colorBg: string;
  metadata?: Record<string, unknown>;
}

export const NOTIF_TYPE_CONFIG: Record<NotifType, { icon: string; color: string; colorBg: string }> = {
  PAIEMENT:    { icon: 'payments',       color: '#16a34a', colorBg: 'rgba(22,163,74,0.12)'   },
  INSCRIPTION: { icon: 'how_to_reg',     color: '#0891b2', colorBg: 'rgba(8,145,178,0.12)'   },
  NOTE:        { icon: 'grade',          color: '#6366f1', colorBg: 'rgba(99,102,241,0.12)'  },
  ALERTE:      { icon: 'warning_amber',  color: '#dc2626', colorBg: 'rgba(239,68,68,0.12)'   },
  MESSAGE:     { icon: 'chat_bubble',    color: '#7c3aed', colorBg: 'rgba(124,58,237,0.12)'  },
  PLANNING:    { icon: 'event',          color: '#d97706', colorBg: 'rgba(245,158,11,0.12)'  },
  SYSTEME:     { icon: 'settings',       color: '#6b7280', colorBg: 'rgba(107,114,128,0.12)' },
};
