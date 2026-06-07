import { IConversation, IMessage, INotification } from '@sms/shared/models';

export const MOCK_MESSAGES: IMessage[] = [
  { publicId: 'msg-001', expediteurPublicId: 'usr-001', expediteurNom: 'Awa Diallo', contenu: 'Bonjour, j\'ai une question sur le devoir.', lu: true, createdAt: '2026-06-01T09:00:00' },
  { publicId: 'msg-002', expediteurPublicId: 'usr-ens-001', expediteurNom: 'Coulibaly Oumar', contenu: 'Bien sûr, quelle est votre question ?', lu: false, createdAt: '2026-06-01T09:05:00' },
];

export const MOCK_CONVERSATIONS: IConversation[] = [
  {
    publicId: 'conv-001', type: 'PRIVE',
    participants: ['usr-001', 'usr-ens-001'],
    dernierMessage: MOCK_MESSAGES[1],
    nbNonLus: 1, createdAt: '2026-06-01T09:00:00',
  },
  {
    publicId: 'conv-002', type: 'GROUPE', titre: 'Classe L3 GL 2025',
    participants: ['usr-ens-001', 'stu-001', 'stu-002', 'stu-003'],
    dernierMessage: {
      publicId: 'msg-003', expediteurPublicId: 'usr-ens-001', expediteurNom: 'Coulibaly Oumar',
      contenu: 'Le cours de demain est annulé.', lu: false, createdAt: '2026-06-02T08:00:00',
    },
    nbNonLus: 3, createdAt: '2026-01-10T10:00:00',
  },
];

export const MOCK_NOTIFICATIONS: INotification[] = [
  {
    publicId: 'notif-001', type: 'BULLETIN', titre: 'Bulletin disponible',
    contenu: 'Le bulletin S1 2026 de Awa DIALLO est disponible.',
    actionUrl: '/academic/bulletins/bul-001', lue: false, createdAt: '2026-06-01T14:00:00',
  },
  {
    publicId: 'notif-002', type: 'PAIEMENT', titre: 'Paiement confirmé',
    contenu: 'Le paiement de 75 000 XOF a été confirmé via Wave.',
    actionUrl: '/finance', lue: true, createdAt: '2026-05-28T10:30:00',
  },
  {
    publicId: 'notif-003', type: 'SEANCE', titre: 'Séance annulée',
    contenu: 'Le cours d\'Algorithmique du Lundi 09/06 est annulé.',
    lue: false, createdAt: '2026-06-03T07:00:00',
  },
  {
    publicId: 'notif-004', type: 'NOTE', titre: 'Nouvelle note saisie',
    contenu: 'Une note a été saisie pour la matière Base de données.',
    actionUrl: '/academic', lue: true, createdAt: '2026-05-25T16:00:00',
  },
];
