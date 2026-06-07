import { ICours, IExamen } from '@sms/shared/models';

export const MOCK_COURS: ICours[] = [
  {
    publicId: 'crs-001', titre: 'Algorithmique avancée',
    description: 'Structures de données complexes, algorithmes de tri et de recherche, complexité algorithmique et optimisation.',
    matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique',
    promotionPublicId: 'promo-001', niveauLibelle: 'Licence 3',
    enseignantPublicId: 'usr-ens-001', enseignantNom: 'Coulibaly Oumar',
    dureeHeures: 45, statut: 'PUBLIE', progression: 65, createdDate: '2026-01-10',
    chapitres: [
      { publicId: 'chap-001', titre: 'Structures de données', ordre: 1, ressources: [
        { publicId: 'res-001', titre: 'Cours PDF Chap.1', type: 'PDF', url: '/mock/algo-chap1.pdf', vue: true },
        { publicId: 'res-002', titre: 'Vidéo introduction', type: 'VIDEO', url: '/mock/algo-chap1.mp4', vue: false },
      ]},
      { publicId: 'chap-002', titre: 'Algorithmes de tri', ordre: 2, ressources: [
        { publicId: 'res-003', titre: 'Cours PDF Chap.2', type: 'PDF', url: '/mock/algo-chap2.pdf', vue: false },
        { publicId: 'res-004', titre: 'Exercices corrigés', type: 'PDF', url: '/mock/algo-exo2.pdf', vue: false },
      ]},
      { publicId: 'chap-003', titre: 'Complexité et optimisation', ordre: 3, ressources: [
        { publicId: 'res-005', titre: 'Cours PDF Chap.3', type: 'PDF', url: '/mock/algo-chap3.pdf', vue: false },
      ]},
    ],
  },
  {
    publicId: 'crs-002', titre: 'Base de données relationnelles',
    description: 'SQL avancé, modélisation Entité/Relation, normalisation des formes normales, transactions ACID.',
    matierePublicId: 'mat-002', matiereLibelle: 'Base de données',
    promotionPublicId: 'promo-001', niveauLibelle: 'Licence 3',
    enseignantPublicId: 'usr-ens-002', enseignantNom: 'Diallo Seydou',
    dureeHeures: 40, statut: 'PUBLIE', progression: 30, createdDate: '2026-01-12',
    chapitres: [
      { publicId: 'chap-004', titre: 'Modélisation E/R', ordre: 1, ressources: [
        { publicId: 'res-006', titre: 'Cours PDF Chap.1', type: 'PDF', url: '/mock/bdd-chap1.pdf', vue: true },
      ]},
      { publicId: 'chap-005', titre: 'SQL avancé', ordre: 2, ressources: [
        { publicId: 'res-007', titre: 'Cours PDF Chap.2', type: 'PDF', url: '/mock/bdd-chap2.pdf', vue: false },
        { publicId: 'res-008', titre: 'TP SQL', type: 'ZIP', url: '/mock/bdd-tp2.zip', vue: false },
      ]},
    ],
  },
  {
    publicId: 'crs-003', titre: 'Réseaux informatiques',
    description: 'Modèle OSI, protocoles TCP/IP, routage dynamique (OSPF, BGP), sécurité réseau et pare-feux.',
    matierePublicId: 'mat-003', matiereLibelle: 'Réseaux',
    promotionPublicId: 'promo-001', niveauLibelle: 'Licence 3',
    enseignantPublicId: 'usr-ens-003', enseignantNom: 'Touré Kader',
    dureeHeures: 35, statut: 'PUBLIE', progression: 50, createdDate: '2026-01-15',
    chapitres: [
      { publicId: 'chap-006', titre: 'Modèle OSI et TCP/IP', ordre: 1, ressources: [
        { publicId: 'res-009', titre: 'Cours PDF Chap.1', type: 'PDF', url: '/mock/reseau-chap1.pdf', vue: true },
      ]},
      { publicId: 'chap-007', titre: 'Routage dynamique', ordre: 2, ressources: [
        { publicId: 'res-010', titre: 'Cours PDF Chap.2', type: 'PDF', url: '/mock/reseau-chap2.pdf', vue: true },
        { publicId: 'res-011', titre: 'Simulation Packet Tracer', type: 'VIDEO', url: '/mock/reseau-sim.mp4', vue: false },
      ]},
    ],
  },
  {
    publicId: 'crs-004', titre: 'Mathématiques discrètes',
    description: 'Logique propositionnelle, théorie des graphes, combinatoire, probabilités discrètes.',
    matierePublicId: 'mat-005', matiereLibelle: 'Mathématiques',
    promotionPublicId: 'promo-002', niveauLibelle: 'Licence 2',
    enseignantPublicId: 'usr-ens-004', enseignantNom: 'Ouedraogo Serge',
    dureeHeures: 50, statut: 'PUBLIE', progression: 40, createdDate: '2026-01-08',
    chapitres: [
      { publicId: 'chap-008', titre: 'Logique et ensembles', ordre: 1, ressources: [
        { publicId: 'res-012', titre: 'Cours PDF Chap.1', type: 'PDF', url: '/mock/math-chap1.pdf', vue: true },
      ]},
    ],
  },
  {
    publicId: 'crs-005', titre: 'Systèmes d\'exploitation',
    description: 'Gestion des processus, mémoire virtuelle, systèmes de fichiers, programmation système POSIX.',
    matierePublicId: 'mat-010', matiereLibelle: 'Systèmes d\'exploitation',
    promotionPublicId: 'promo-003', niveauLibelle: 'Master 1',
    enseignantPublicId: 'usr-ens-003', enseignantNom: 'Touré Kader',
    dureeHeures: 45, statut: 'PUBLIE', progression: 75, createdDate: '2026-01-10',
    chapitres: [
      { publicId: 'chap-009', titre: 'Gestion des processus', ordre: 1, ressources: [
        { publicId: 'res-013', titre: 'Cours PDF Chap.1', type: 'PDF', url: '/mock/so-chap1.pdf', vue: true },
        { publicId: 'res-014', titre: 'TP Unix', type: 'ZIP', url: '/mock/so-tp1.zip', vue: true },
      ]},
      { publicId: 'chap-010', titre: 'Mémoire virtuelle', ordre: 2, ressources: [
        { publicId: 'res-015', titre: 'Cours PDF Chap.2', type: 'PDF', url: '/mock/so-chap2.pdf', vue: true },
      ]},
    ],
  },
  {
    publicId: 'crs-006', titre: 'Sécurité informatique',
    description: 'Cryptographie, PKI, attaques et contre-mesures, conformité RGPD, pentest éthique.',
    matierePublicId: 'mat-011', matiereLibelle: 'Sécurité',
    promotionPublicId: 'promo-005', niveauLibelle: 'Master 2',
    enseignantPublicId: 'usr-ens-003', enseignantNom: 'Touré Kader',
    dureeHeures: 60, statut: 'PUBLIE', progression: 20, createdDate: '2026-02-01',
    chapitres: [
      { publicId: 'chap-011', titre: 'Cryptographie moderne', ordre: 1, ressources: [
        { publicId: 'res-016', titre: 'Cours PDF Chap.1', type: 'PDF', url: '/mock/sec-chap1.pdf', vue: true },
      ]},
    ],
  },
  {
    publicId: 'crs-007', titre: 'Programmation orientée objet',
    description: 'Concepts OOP, héritage, polymorphisme, design patterns, UML.',
    matierePublicId: 'mat-012', matiereLibelle: 'Programmation',
    promotionPublicId: 'promo-004', niveauLibelle: 'Licence 1',
    enseignantPublicId: 'usr-ens-001', enseignantNom: 'Coulibaly Oumar',
    dureeHeures: 40, statut: 'PUBLIE', progression: 55, createdDate: '2026-01-05',
    chapitres: [
      { publicId: 'chap-012', titre: 'Introduction à la POO', ordre: 1, ressources: [
        { publicId: 'res-017', titre: 'Cours PDF Chap.1', type: 'PDF', url: '/mock/poo-chap1.pdf', vue: true },
        { publicId: 'res-018', titre: 'Vidéo Java Basics', type: 'VIDEO', url: '/mock/poo-video1.mp4', vue: true },
      ]},
    ],
  },
  {
    publicId: 'crs-008', titre: 'Gestion de projet IT',
    description: 'Méthodologies agiles (Scrum, Kanban), gestion des risques, outils de pilotage.',
    matierePublicId: 'mat-013', matiereLibelle: 'Gestion de projet',
    promotionPublicId: 'promo-003', niveauLibelle: 'Master 1',
    enseignantPublicId: 'usr-ens-002', enseignantNom: 'Diallo Seydou',
    dureeHeures: 30, statut: 'BROUILLON', progression: 0, createdDate: '2026-02-10',
    chapitres: [],
  },
  {
    publicId: 'crs-009', titre: 'Intelligence artificielle',
    description: 'Machine learning, réseaux de neurones, traitement du langage naturel, éthique de l\'IA.',
    matierePublicId: 'mat-014', matiereLibelle: 'Intelligence artificielle',
    promotionPublicId: 'promo-005', niveauLibelle: 'Master 2',
    enseignantPublicId: 'usr-ens-002', enseignantNom: 'Diallo Seydou',
    dureeHeures: 60, statut: 'PUBLIE', progression: 35, createdDate: '2026-01-20',
    chapitres: [
      { publicId: 'chap-013', titre: 'Introduction au ML', ordre: 1, ressources: [
        { publicId: 'res-019', titre: 'Cours PDF Chap.1', type: 'PDF', url: '/mock/ia-chap1.pdf', vue: true },
        { publicId: 'res-020', titre: 'Notebook Python', type: 'ZIP', url: '/mock/ia-notebook1.zip', vue: false },
      ]},
    ],
  },
  {
    publicId: 'crs-010', titre: 'Cloud Computing',
    description: 'AWS, Azure, GCP — infrastructure as code, conteneurisation Docker/Kubernetes, DevOps.',
    matierePublicId: 'mat-015', matiereLibelle: 'Cloud & DevOps',
    promotionPublicId: 'promo-005', niveauLibelle: 'Master 2',
    enseignantPublicId: 'usr-ens-003', enseignantNom: 'Touré Kader',
    dureeHeures: 45, statut: 'ARCHIVE', progression: 100, createdDate: '2025-10-01',
    chapitres: [
      { publicId: 'chap-014', titre: 'Introduction au Cloud', ordre: 1, ressources: [
        { publicId: 'res-021', titre: 'Cours PDF Chap.1', type: 'PDF', url: '/mock/cloud-chap1.pdf', vue: true },
      ]},
    ],
  },
];

export const MOCK_EXAMENS: IExamen[] = [
  {
    publicId: 'exam-001', titre: 'Examen Algorithmique S1 — L3 GL',
    matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique',
    sallePublicId: 'sal-001', salleLibelle: 'Amphi A101',
    dureeMinutes: 90,
    dateDebut: '2026-06-10T08:00:00', dateFin: '2026-06-10T09:30:00',
    statut: 'A_VENIR',
    questions: [
      { publicId: 'q-001', enonce: 'Quelle est la complexité du tri rapide en cas moyen ?', type: 'QCM', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], bonnesReponses: ['O(n log n)'], points: 2 },
      { publicId: 'q-002', enonce: 'La liste chaînée permet-elle l\'accès aléatoire en O(1) ?', type: 'VRAI_FAUX', options: ['Vrai', 'Faux'], bonnesReponses: ['Faux'], points: 1 },
      { publicId: 'q-003', enonce: 'Quelle structure de données utilise le principe LIFO ?', type: 'QCM', options: ['File', 'Pile', 'Liste', 'Arbre'], bonnesReponses: ['Pile'], points: 2 },
    ],
  },
  {
    publicId: 'exam-002', titre: 'Contrôle BDD — L3 GL',
    matierePublicId: 'mat-002', matiereLibelle: 'Base de données',
    sallePublicId: 'sal-003', salleLibelle: 'Labo Informatique 1',
    dureeMinutes: 120,
    dateDebut: '2026-06-15T10:00:00', dateFin: '2026-06-15T12:00:00',
    statut: 'A_VENIR',
    questions: [
      { publicId: 'q-004', enonce: 'Une clé primaire peut-elle contenir des valeurs NULL ?', type: 'VRAI_FAUX', options: ['Vrai', 'Faux'], bonnesReponses: ['Faux'], points: 1 },
      { publicId: 'q-005', enonce: 'Quelle clause SQL permet de filtrer les résultats d\'un GROUP BY ?', type: 'QCM', options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], bonnesReponses: ['HAVING'], points: 2 },
    ],
  },
  {
    publicId: 'exam-003', titre: 'Examen Réseaux — M1 RI',
    matierePublicId: 'mat-003', matiereLibelle: 'Réseaux',
    sallePublicId: 'sal-002', salleLibelle: 'Salle TD B12',
    dureeMinutes: 90,
    dateDebut: '2026-06-12T14:00:00', dateFin: '2026-06-12T15:30:00',
    statut: 'A_VENIR',
    questions: [
      { publicId: 'q-006', enonce: 'Sur quelle couche OSI fonctionne le protocole IP ?', type: 'QCM', options: ['Couche 2', 'Couche 3', 'Couche 4', 'Couche 7'], bonnesReponses: ['Couche 3'], points: 2 },
    ],
  },
  {
    publicId: 'exam-004', titre: 'Contrôle Mathématiques — L2 GL',
    matierePublicId: 'mat-005', matiereLibelle: 'Mathématiques',
    sallePublicId: 'sal-001', salleLibelle: 'Amphi A101',
    dureeMinutes: 120,
    dateDebut: '2026-06-05T08:00:00', dateFin: '2026-06-05T10:00:00',
    statut: 'TERMINE',
    questions: [
      { publicId: 'q-007', enonce: 'Calculer la dérivée de f(x) = x³ + 2x² - 5x + 1', type: 'REPONSE_LONGUE', options: [], bonnesReponses: ['3x² + 4x - 5'], points: 5 },
    ],
  },
  {
    publicId: 'exam-005', titre: 'Examen Sécurité Informatique — M2 RI',
    matierePublicId: 'mat-011', matiereLibelle: 'Sécurité',
    sallePublicId: 'sal-005', salleLibelle: 'Salle de Cours C201',
    dureeMinutes: 180,
    dateDebut: '2026-06-20T09:00:00', dateFin: '2026-06-20T12:00:00',
    statut: 'A_VENIR',
    questions: [
      { publicId: 'q-008', enonce: 'Qu\'est-ce qu\'une attaque de type Man-in-the-Middle ?', type: 'REPONSE_LONGUE', options: [], bonnesReponses: [], points: 5 },
      { publicId: 'q-009', enonce: 'RSA est un algorithme à clé symétrique.', type: 'VRAI_FAUX', options: ['Vrai', 'Faux'], bonnesReponses: ['Faux'], points: 2 },
    ],
  },
];
