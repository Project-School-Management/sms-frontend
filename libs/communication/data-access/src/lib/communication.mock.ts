import { IConversation, IMessage, INotification } from '@sms/shared/models';

export const MOCK_MESSAGES: IMessage[] = [
  // conv-001 messages
  { publicId: 'msg-001', expediteurPublicId: 'stu-001', expediteurNom: 'Awa Diallo', contenu: 'Bonjour professeur, j\'ai une question sur le devoir de BDD.', lu: true, createdAt: '2026-06-01T09:00:00' },
  { publicId: 'msg-002', expediteurPublicId: 'usr-ens-001', expediteurNom: 'Coulibaly Oumar', contenu: 'Bien sûr, quelle est votre question ?', lu: true, createdAt: '2026-06-01T09:05:00' },
  { publicId: 'msg-003', expediteurPublicId: 'stu-001', expediteurNom: 'Awa Diallo', contenu: 'Je ne comprends pas la différence entre une jointure interne et externe.', lu: true, createdAt: '2026-06-01T09:08:00' },
  { publicId: 'msg-004', expediteurPublicId: 'usr-ens-001', expediteurNom: 'Coulibaly Oumar', contenu: 'Une jointure interne ne retourne que les lignes correspondantes des deux tables. La jointure externe inclut également les lignes sans correspondance.', lu: true, createdAt: '2026-06-01T09:12:00' },
  { publicId: 'msg-005', expediteurPublicId: 'stu-001', expediteurNom: 'Awa Diallo', contenu: 'Merci beaucoup, c\'est beaucoup plus clair maintenant !', lu: false, createdAt: '2026-06-01T09:15:00' },
  // conv-002 messages
  { publicId: 'msg-006', expediteurPublicId: 'usr-ens-001', expediteurNom: 'Coulibaly Oumar', contenu: 'Bonjour à tous ! Le cours de demain est annulé pour cause de réunion pédagogique.', lu: false, createdAt: '2026-06-02T08:00:00' },
  { publicId: 'msg-007', expediteurPublicId: 'stu-002', expediteurNom: 'Kofi Mensah', contenu: 'Merci pour l\'information professeur.', lu: false, createdAt: '2026-06-02T08:10:00' },
  { publicId: 'msg-008', expediteurPublicId: 'stu-003', expediteurNom: 'Fatou Traoré', contenu: 'D\'accord, nous serons présents le cours suivant.', lu: false, createdAt: '2026-06-02T08:15:00' },
  // conv-003 messages
  { publicId: 'msg-009', expediteurPublicId: 'usr-sec-001', expediteurNom: 'Aissatou Bah', contenu: 'Kofi, veuillez passer au secrétariat pour régulariser votre situation académique.', lu: true, createdAt: '2026-06-03T10:00:00' },
  { publicId: 'msg-010', expediteurPublicId: 'stu-002', expediteurNom: 'Kofi Mensah', contenu: 'Bonjour madame, je passerai cet après-midi.', lu: true, createdAt: '2026-06-03T10:30:00' },
  // conv-004 messages
  { publicId: 'msg-011', expediteurPublicId: 'stu-005', expediteurNom: 'Aminata Koné', contenu: 'Professeur, puis-je avoir un rendez-vous pour discuter de ma note de réseau ?', lu: true, createdAt: '2026-06-04T14:00:00' },
  { publicId: 'msg-012', expediteurPublicId: 'usr-ens-003', expediteurNom: 'Touré Kader', contenu: 'Bien sûr, vendredi à 14h dans mon bureau.', lu: true, createdAt: '2026-06-04T14:20:00' },
  { publicId: 'msg-013', expediteurPublicId: 'stu-005', expediteurNom: 'Aminata Koné', contenu: 'Parfait, je serai là. Merci professeur.', lu: false, createdAt: '2026-06-04T14:25:00' },
  // conv-005 messages
  { publicId: 'msg-014', expediteurPublicId: 'usr-ens-002', expediteurNom: 'Diallo Seydou', contenu: 'Annonce importante : l\'examen de BDD est reporté au 15 juin.', lu: false, createdAt: '2026-06-05T09:00:00' },
  { publicId: 'msg-015', expediteurPublicId: 'stu-001', expediteurNom: 'Awa Diallo', contenu: 'Merci pour l\'info !', lu: false, createdAt: '2026-06-05T09:30:00' },
];

export const MOCK_CONVERSATIONS: IConversation[] = [
  {
    publicId: 'conv-001', type: 'PRIVE',
    participants: ['stu-001', 'usr-ens-001'],
    dernierMessage: MOCK_MESSAGES[4],
    nbNonLus: 1, createdAt: '2026-06-01T09:00:00',
  },
  {
    publicId: 'conv-002', type: 'GROUPE', titre: 'L3 GL 2025 — Annonces',
    participants: ['usr-ens-001', 'stu-001', 'stu-002', 'stu-003', 'stu-007', 'stu-010', 'stu-022', 'stu-027'],
    dernierMessage: MOCK_MESSAGES[7],
    nbNonLus: 3, createdAt: '2026-01-10T10:00:00',
  },
  {
    publicId: 'conv-003', type: 'PRIVE',
    participants: ['usr-sec-001', 'stu-002'],
    dernierMessage: MOCK_MESSAGES[9],
    nbNonLus: 0, createdAt: '2026-06-03T10:00:00',
  },
  {
    publicId: 'conv-004', type: 'PRIVE',
    participants: ['stu-005', 'usr-ens-003'],
    dernierMessage: MOCK_MESSAGES[12],
    nbNonLus: 1, createdAt: '2026-06-04T14:00:00',
  },
  {
    publicId: 'conv-005', type: 'GROUPE', titre: 'Réseau & Sécurité — M1 RI',
    participants: ['usr-ens-002', 'stu-001', 'stu-003', 'stu-005', 'stu-006', 'stu-011', 'stu-017'],
    dernierMessage: MOCK_MESSAGES[14],
    nbNonLus: 2, createdAt: '2026-01-12T08:00:00',
  },
];

export const MOCK_NOTIFICATIONS: INotification[] = [
  { publicId: 'notif-001', type: 'BULLETIN', titre: 'Bulletin S1 disponible', contenu: 'Le bulletin Semestre 1 2026 de Awa DIALLO est disponible.', actionUrl: '/academic/bulletins/bul-001', lue: false, createdAt: '2026-06-07T08:00:00' },
  { publicId: 'notif-002', type: 'PAIEMENT', titre: 'Paiement confirmé', contenu: 'Le paiement de 250 000 XOF a été confirmé via Wave pour la facture FAC-2025-0001.', actionUrl: '/finance', lue: false, createdAt: '2026-06-07T07:30:00' },
  { publicId: 'notif-003', type: 'SEANCE', titre: 'Séance annulée', contenu: 'Le cours d\'Algorithmique du Lundi 09/06 est annulé. Motif : enseignant absent.', lue: false, createdAt: '2026-06-06T18:00:00' },
  { publicId: 'notif-004', type: 'NOTE', titre: 'Nouvelles notes saisies', contenu: '25 notes ont été saisies pour la matière Base de données — L3 GL 2025.', actionUrl: '/academic', lue: false, createdAt: '2026-06-06T17:00:00' },
  { publicId: 'notif-005', type: 'INSCRIPTION', titre: 'Nouvel étudiant inscrit', contenu: 'Fatoumata Kourouma vient d\'être inscrite en Licence 3 GL 2025.', actionUrl: '/students', lue: false, createdAt: '2026-06-06T14:00:00' },
  { publicId: 'notif-006', type: 'PAIEMENT', titre: 'Facture en retard', contenu: 'La facture FAC-2025-0002 de Kofi Mensah est en retard depuis 37 jours.', actionUrl: '/finance/invoices/fac-0002', lue: false, createdAt: '2026-06-05T09:00:00' },
  { publicId: 'notif-007', type: 'SYSTEME', titre: 'Mise à jour système', contenu: 'Une maintenance est prévue le 10 juin de 23h à 01h. Le système sera indisponible.', lue: false, createdAt: '2026-06-04T12:00:00' },
  { publicId: 'notif-008', type: 'BULLETIN', titre: 'Bulletins publiés', contenu: '28 bulletins S1 2026 de la Licence 2 GL 2025 ont été publiés.', actionUrl: '/academic/bulletins', lue: true, createdAt: '2026-06-03T16:00:00' },
];
