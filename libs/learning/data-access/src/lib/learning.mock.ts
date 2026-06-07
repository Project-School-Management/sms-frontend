import { ICours, IExamen } from '@sms/shared/models';

export const MOCK_COURS: ICours[] = [
  {
    publicId: 'crs-001', titre: 'Algorithmique avancée',
    description: 'Structures de données complexes, algorithmes de tri et de recherche, complexité.',
    matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique',
    promotionPublicId: 'promo-001',
    enseignantPublicId: 'usr-ens-001', enseignantNom: 'Coulibaly Oumar',
    statut: 'PUBLIE', progression: 65,
    createdDate: '2026-01-10',
    chapitres: [
      {
        publicId: 'chap-001', titre: 'Structures de données', ordre: 1,
        ressources: [
          { publicId: 'res-001', titre: 'Cours PDF', type: 'PDF', url: '/mock/algo-chap1.pdf', vue: true },
          { publicId: 'res-002', titre: 'Vidéo intro', type: 'VIDEO', url: '/mock/algo-chap1.mp4', vue: false },
        ],
      },
      {
        publicId: 'chap-002', titre: 'Algorithmes de tri', ordre: 2,
        ressources: [
          { publicId: 'res-003', titre: 'Cours PDF', type: 'PDF', url: '/mock/algo-chap2.pdf', vue: false },
        ],
      },
    ],
  },
  {
    publicId: 'crs-002', titre: 'Base de données relationnelles',
    description: 'SQL avancé, modélisation E/R, normalisation, transactions.',
    matierePublicId: 'mat-002', matiereLibelle: 'Base de données',
    promotionPublicId: 'promo-001',
    enseignantPublicId: 'usr-ens-002', enseignantNom: 'Diallo Seydou',
    statut: 'PUBLIE', progression: 30,
    createdDate: '2026-01-12',
    chapitres: [
      {
        publicId: 'chap-003', titre: 'Modélisation E/R', ordre: 1,
        ressources: [
          { publicId: 'res-004', titre: 'Cours PDF', type: 'PDF', url: '/mock/bdd-chap1.pdf', vue: true },
        ],
      },
    ],
  },
  {
    publicId: 'crs-003', titre: 'Réseaux informatiques',
    description: 'Modèle OSI, TCP/IP, routage, sécurité réseau.',
    matierePublicId: 'mat-003', matiereLibelle: 'Réseaux',
    promotionPublicId: 'promo-001',
    enseignantPublicId: 'usr-ens-003', enseignantNom: 'Touré Kader',
    statut: 'BROUILLON', progression: 0,
    createdDate: '2026-01-15',
    chapitres: [],
  },
];

export const MOCK_EXAMENS: IExamen[] = [
  {
    publicId: 'exam-001', titre: 'Examen Algorithmique S1',
    matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique',
    dureeMinutes: 90,
    dateDebut: '2026-06-10T08:00:00', dateFin: '2026-06-10T09:30:00',
    questions: [
      {
        publicId: 'q-001', enonce: 'Quelle est la complexité du tri rapide en cas moyen ?',
        type: 'QCM', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        bonnesReponses: ['O(n log n)'], points: 2,
      },
      {
        publicId: 'q-002', enonce: 'La liste chaînée permet-elle l\'accès aléatoire en O(1) ?',
        type: 'VRAI_FAUX', options: ['Vrai', 'Faux'],
        bonnesReponses: ['Faux'], points: 1,
      },
    ],
  },
];
