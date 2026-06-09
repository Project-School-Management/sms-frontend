// ══════════════════════════════════════════════════════════════════════════════
// @sms/learning — Mock Data LMS étendu
// Données mock pour : Catégories, Devoirs, Ressources, Discussions, Annonces,
//                     Participants, Sessions virtuelles, Calendrier, Certificats,
//                     Banque de questions, Résultats examens
// ══════════════════════════════════════════════════════════════════════════════

import {
  ICategorie, IDevoir, IRessourcePedago, IDiscussion, IAnnonce,
  IParticipant, ISessionVirtuelle, IEvenementPedago, ICertificat,
  IQuestionBanque, IResultatExamen,
} from '@sms/shared/models';

// ── Catégories ────────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES: ICategorie[] = [
  { publicId:'cat-001', libelle:'Informatique',  icon:'computer',         couleur:'#6366f1', nbCours:4, description:'Algorithmique, BDD, Réseaux, Sécurité' },
  { publicId:'cat-002', libelle:'Mathématiques', icon:'calculate',        couleur:'#f59e0b', nbCours:2, description:'Maths discrètes, Analyse' },
  { publicId:'cat-003', libelle:'Sciences',      icon:'science',          couleur:'#10b981', nbCours:1, description:'Physique, Chimie, SVT' },
  { publicId:'cat-004', libelle:'Langues',        icon:'translate',        couleur:'#ec4899', nbCours:1, description:'Français, Anglais, Espagnol' },
  { publicId:'cat-005', libelle:'Management',    icon:'business_center',  couleur:'#8b5cf6', nbCours:2, description:'Gestion de projet, Management' },
  { publicId:'cat-006', libelle:'Cloud & DevOps',icon:'cloud',            couleur:'#06b6d4', nbCours:1, description:'AWS, Docker, CI/CD' },
  { publicId:'cat-007', libelle:'Intelligence A.',icon:'smart_toy',       couleur:'#d97706', nbCours:1, description:'Machine Learning, Deep Learning' },
];

// ── Devoirs ───────────────────────────────────────────────────────────────────
export const MOCK_DEVOIRS: IDevoir[] = [
  {
    publicId:'dev-001', titre:'TP Algorithmique — Tri et Recherche',
    coursPublicId:'cours-001', coursLibelle:'Algorithmique avancée',
    description:'Implémenter les algorithmes de tri rapide, fusion et recherche binaire en Python. Analyser la complexité.',
    dateDebut:'2026-06-01', dateLimite:'2026-06-15', bareme:20,
    statut:'OUVERT', nbSoumissions:18, nbEtudiants:32, pieceJointe:'sujet_tp_algo.pdf',
  },
  {
    publicId:'dev-002', titre:'Mini-projet BDD — Conception d\'un SI scolaire',
    coursPublicId:'cours-002', coursLibelle:'Base de données relationnelles',
    description:'Concevoir le MCD, MLD et les scripts SQL d\'une base de données pour un système scolaire simplifié.',
    dateDebut:'2026-06-05', dateLimite:'2026-06-20', bareme:30,
    statut:'OUVERT', nbSoumissions:12, nbEtudiants:28, pieceJointe:'sujet_bdd.pdf',
  },
  {
    publicId:'dev-003', titre:'Rapport réseau — Analyse de protocoles',
    coursPublicId:'cours-003', coursLibelle:'Réseaux informatiques',
    description:'Analyser les captures Wireshark fournies. Identifier les protocoles, les échanges et les anomalies.',
    dateDebut:'2026-05-20', dateLimite:'2026-06-05', bareme:15,
    statut:'CORRIGE', nbSoumissions:24, nbEtudiants:24,
  },
  {
    publicId:'dev-004', titre:'QCM Mathématiques discrètes',
    coursPublicId:'cours-004', coursLibelle:'Mathématiques discrètes',
    description:'Quiz en ligne sur les graphes, la logique propositionnelle et la théorie des ensembles.',
    dateDebut:'2026-06-08', dateLimite:'2026-06-10', bareme:10,
    statut:'FERME', nbSoumissions:30, nbEtudiants:30,
  },
  {
    publicId:'dev-005', titre:'Projet Sécurité — Audit d\'une application web',
    coursPublicId:'cours-006', coursLibelle:'Sécurité informatique',
    description:'Réaliser un audit de sécurité de l\'application fournie. Identifier les vulnérabilités OWASP Top 10.',
    dateDebut:'2026-06-10', dateLimite:'2026-07-01', bareme:40,
    statut:'OUVERT', nbSoumissions:5, nbEtudiants:18,
  },
  {
    publicId:'dev-006', titre:'Exercices Cloud Computing — Docker & Kubernetes',
    coursPublicId:'cours-010', coursLibelle:'Cloud Computing',
    description:'Déployer une application multi-conteneurs avec Docker Compose, puis migrer vers Kubernetes.',
    dateDebut:'2026-05-01', dateLimite:'2026-05-20', bareme:25,
    statut:'CORRIGE', nbSoumissions:12, nbEtudiants:12,
  },
  {
    publicId:'dev-007', titre:'Projet IA — Modèle de classification',
    coursPublicId:'cours-009', coursLibelle:'Intelligence artificielle',
    description:'Entraîner un modèle de classification sur le dataset MNIST. Atteindre au moins 95% de précision.',
    dateDebut:'2026-06-12', dateLimite:'2026-06-30', bareme:35,
    statut:'OUVERT', nbSoumissions:3, nbEtudiants:20,
  },
  {
    publicId:'dev-008', titre:'Devoir Gestion de projet — Planning MS Project',
    coursPublicId:'cours-008', coursLibelle:'Gestion de projet IT',
    description:'Créer le planning complet d\'un projet fictif avec MS Project : WBS, diagramme Gantt, affectation des ressources.',
    dateDebut:'2026-06-03', dateLimite:'2026-06-17', bareme:20,
    statut:'OUVERT', nbSoumissions:8, nbEtudiants:22,
  },
];

// ── Ressources bibliothèque ───────────────────────────────────────────────────
export const MOCK_RESSOURCES_BIBLIO: IRessourcePedago[] = [
  { publicId:'res-001', titre:'Introduction à l\'Algorithmique', type:'PDF', taille:'2.4 MB', url:'/docs/algo_intro.pdf', coursPublicId:'cours-001', coursLibelle:'Algorithmique avancée', uploadDate:'2026-01-15', nbTelechargements:147, tags:['algo','python','complexité'] },
  { publicId:'res-002', titre:'Cours vidéo — Tri rapide', type:'VIDEO', taille:'420 MB', url:'/videos/tri_rapide.mp4', coursPublicId:'cours-001', coursLibelle:'Algorithmique avancée', uploadDate:'2026-01-20', nbTelechargements:89, tags:['algo','tri','vidéo'] },
  { publicId:'res-003', titre:'Support BDD — Modélisation UML', type:'PRESENTATION', taille:'5.1 MB', url:'/slides/bdd_uml.pptx', coursPublicId:'cours-002', coursLibelle:'Base de données', uploadDate:'2026-02-01', nbTelechargements:203, tags:['bdd','uml','merise'] },
  { publicId:'res-004', titre:'Scripts SQL exercices complets', type:'DOCUMENT', taille:'1.2 MB', url:'/docs/scripts_sql.zip', coursPublicId:'cours-002', coursLibelle:'Base de données', uploadDate:'2026-02-10', nbTelechargements:312, tags:['sql','exercices','oracle'] },
  { publicId:'res-005', titre:'RFC 793 — TCP/IP Protocol', type:'PDF', taille:'1.8 MB', url:'/docs/rfc793.pdf', coursPublicId:'cours-003', coursLibelle:'Réseaux informatiques', uploadDate:'2026-02-15', nbTelechargements:56, tags:['tcp','réseau','rfc'] },
  { publicId:'res-006', titre:'Captures Wireshark annotées', type:'ZIP', taille:'8.3 MB', url:'/tp/wireshark.zip', coursPublicId:'cours-003', coursLibelle:'Réseaux informatiques', uploadDate:'2026-03-01', nbTelechargements:78, tags:['wireshark','protocole','analyse'] },
  { publicId:'res-007', titre:'Mathématiques discrètes — Exercices corrigés', type:'PDF', taille:'3.6 MB', url:'/docs/maths_disc_exos.pdf', coursPublicId:'cours-004', coursLibelle:'Mathématiques discrètes', uploadDate:'2026-01-25', nbTelechargements:189, tags:['maths','graphes','logique'] },
  { publicId:'res-008', titre:'Machine Learning — Scikit-learn Tutorial', type:'LIEN', url:'https://scikit-learn.org/stable/tutorial', coursPublicId:'cours-009', coursLibelle:'Intelligence artificielle', uploadDate:'2026-03-10', nbTelechargements:234, tags:['ML','python','scikit'] },
  { publicId:'res-009', titre:'Présentation Sécurité Web OWASP', type:'PRESENTATION', taille:'4.2 MB', url:'/slides/owasp.pptx', coursPublicId:'cours-006', coursLibelle:'Sécurité informatique', uploadDate:'2026-03-15', nbTelechargements:167, tags:['sécurité','owasp','web'] },
  { publicId:'res-010', titre:'Docker Compose — Guide complet', type:'PDF', taille:'1.9 MB', url:'/docs/docker_guide.pdf', coursPublicId:'cours-010', coursLibelle:'Cloud Computing', uploadDate:'2026-04-01', nbTelechargements:298, tags:['docker','cloud','devops'] },
  { publicId:'res-011', titre:'Enregistrement cours — Systèmes OS', type:'AUDIO', taille:'68 MB', url:'/audio/os_cours.mp3', coursPublicId:'cours-005', coursLibelle:'Systèmes d\'exploitation', uploadDate:'2026-04-05', nbTelechargements:43, tags:['os','système','audio'] },
  { publicId:'res-012', titre:'Fiche de révision — Tous les cours', type:'PDF', taille:'0.8 MB', url:'/docs/fiche_revision.pdf', uploadDate:'2026-05-01', nbTelechargements:421, tags:['révision','synthèse','fiches'] },
];

// ── Discussions / Forum ───────────────────────────────────────────────────────
export const MOCK_DISCUSSIONS: IDiscussion[] = [
  { publicId:'dis-001', titre:'Différence entre O(n log n) et O(n²) en pratique ?', auteur:'Kofi Mensah', initiales:'KM', couleurAvatar:'#6366f1', date:'2026-06-08 16:42', nbReponses:7, resolu:true, coursLibelle:'Algorithmique avancée', preview:'Je comprends la définition théorique mais dans mes benchmarks je ne vois pas toujours la différence…' },
  { publicId:'dis-002', titre:'Erreur SQL : Violation de contrainte FK', auteur:'Awa Diallo', initiales:'AD', couleurAvatar:'#ec4899', date:'2026-06-08 11:20', nbReponses:3, resolu:false, coursLibelle:'Base de données', preview:'Quand j\'exécute mon INSERT, j\'obtiens ORA-02291. J\'ai bien créé ma table parent avant…' },
  { publicId:'dis-003', titre:'Comment implémenter la pagination en SQL ?', auteur:'Moussa Coulibaly', initiales:'MC', couleurAvatar:'#f59e0b', date:'2026-06-07 14:15', nbReponses:12, resolu:true, coursLibelle:'Base de données', preview:'J\'essaie d\'implémenter une pagination efficace pour 50 000 lignes. LIMIT/OFFSET est trop lent…' },
  { publicId:'dis-004', titre:'Ressource recommandée pour TensorFlow ?', auteur:'Fatou Traoré', initiales:'FT', couleurAvatar:'#10b981', date:'2026-06-06 09:30', nbReponses:5, resolu:true, coursLibelle:'Intelligence artificielle', preview:'Le prof a mentionné TensorFlow mais le cours utilise PyTorch. Est-ce qu\'il y a des ressources pour comparer…' },
  { publicId:'dis-005', titre:'Quel outil utiliser pour les captures réseau en TP ?', auteur:'Ibrahima Bah', initiales:'IB', couleurAvatar:'#8b5cf6', date:'2026-06-05 17:00', nbReponses:2, resolu:false, coursLibelle:'Réseaux informatiques', preview:'Wireshark ne fonctionne pas sur ma machine. Est-ce que tcpdump peut suffire pour le TP ?' },
  { publicId:'dis-006', titre:'Clarification sur la date limite du projet sécurité', auteur:'Aminata Koné', initiales:'AK', couleurAvatar:'#d97706', date:'2026-06-04 10:50', nbReponses:1, resolu:true, coursLibelle:'Sécurité informatique', preview:'La plateforme affiche le 1er juillet mais le cours dit le 28 juin. Quelle est la bonne date ?' },
];

// ── Annonces ──────────────────────────────────────────────────────────────────
export const MOCK_ANNONCES: IAnnonce[] = [
  { publicId:'ann-001', titre:'Report du TP Algorithmique — Salle B12', contenu:'Le TP prévu ce vendredi 13 juin est reporté au lundi 16 juin à 14h00 en salle B12. Le prof sera absent vendredi pour raisons médicales.', auteur:'M. Kaboré Aristide', date:'2026-06-09 08:00', priorite:'HAUTE', lu:false, coursLibelle:'Algorithmique avancée' },
  { publicId:'ann-002', titre:'Mise en ligne des corrigés BDD — Examen blanc', contenu:'Les corrigés de l\'examen blanc BDD du 5 juin sont disponibles dans la section Ressources. Merci de les consulter avant la session de révision du 12 juin.', auteur:'Mme Fofana Aminata', date:'2026-06-08 14:30', priorite:'NORMALE', lu:true, coursLibelle:'Base de données' },
  { publicId:'ann-003', titre:'Nouveau document — Guide Docker Compose v3', contenu:'J\'ai mis en ligne un guide complet Docker Compose v3 dans les ressources du cours Cloud Computing. Indispensable pour le projet final.', auteur:'M. Touré Kader', date:'2026-06-07 10:00', priorite:'NORMALE', lu:false, coursLibelle:'Cloud Computing' },
  { publicId:'ann-004', titre:'Rappel : Soumission projet IA dans 18 jours', contenu:'Rappel important : la date limite de soumission du projet IA (modèle de classification) est le 30 juin. Aucune prolongation ne sera accordée.', auteur:'Dr Bamba Isidore', date:'2026-06-06 09:00', priorite:'HAUTE', lu:true, coursLibelle:'Intelligence artificielle' },
  { publicId:'ann-005', titre:'Session de révision générale — Semaine 26', contenu:'Une session de révision ouverte à tous les étudiants est organisée le samedi 21 juin de 09h à 12h. Tous les enseignants seront présents pour répondre à vos questions.', auteur:'Admin Koné Aïcha', date:'2026-06-05 16:00', priorite:'NORMALE', lu:true },
];

// ── Participants ──────────────────────────────────────────────────────────────
export const MOCK_PARTICIPANTS: IParticipant[] = [
  { publicId:'par-001', nom:'Awa Diallo',       email:'awa.diallo@email.com',       classe:'L3 GL 2025', progression:72, derniereActivite:'Il y a 2h',  statut:'ACTIF',    nbLeconTerminees:18, nbLeconTotal:25, initiales:'AD' },
  { publicId:'par-002', nom:'Kofi Mensah',       email:'kofi.mensah@email.com',       classe:'L3 GL 2025', progression:85, derniereActivite:'Hier',       statut:'ACTIF',    nbLeconTerminees:21, nbLeconTotal:25, initiales:'KM' },
  { publicId:'par-003', nom:'Fatou Traoré',      email:'fatou.traore@email.com',      classe:'L3 GL 2025', progression:100, derniereActivite:'Il y a 3j', statut:'COMPLETE', nbLeconTerminees:25, nbLeconTotal:25, initiales:'FT' },
  { publicId:'par-004', nom:'Moussa Coulibaly',  email:'moussa.coulibaly@email.com',  classe:'L3 GL 2025', progression:45, derniereActivite:'Il y a 5j',  statut:'ACTIF',    nbLeconTerminees:11, nbLeconTotal:25, initiales:'MC' },
  { publicId:'par-005', nom:'Aminata Koné',      email:'aminata.kone@email.com',      classe:'L3 GL 2025', progression:60, derniereActivite:'Il y a 1j',  statut:'ACTIF',    nbLeconTerminees:15, nbLeconTotal:25, initiales:'AK' },
  { publicId:'par-006', nom:'Ibrahima Bah',      email:'ibrahima.bah@email.com',      classe:'L3 GL 2025', progression:20, derniereActivite:'Il y a 12j', statut:'INACTIF',  nbLeconTerminees:5,  nbLeconTotal:25, initiales:'IB' },
  { publicId:'par-007', nom:'Mariam Sanogo',     email:'mariam.sanogo@email.com',     classe:'L3 GL 2025', progression:90, derniereActivite:'Il y a 4h',  statut:'ACTIF',    nbLeconTerminees:22, nbLeconTotal:25, initiales:'MS' },
  { publicId:'par-008', nom:'Seydou Ouedraogo',  email:'seydou.ouedraogo@email.com',  classe:'L3 GL 2025', progression:55, derniereActivite:'Il y a 3j',  statut:'ACTIF',    nbLeconTerminees:14, nbLeconTotal:25, initiales:'SO' },
  { publicId:'par-009', nom:'Kadiatou Camara',   email:'kadiatou.camara@email.com',   classe:'L3 GL 2025', progression:78, derniereActivite:'Il y a 1j',  statut:'ACTIF',    nbLeconTerminees:19, nbLeconTotal:25, initiales:'KC' },
  { publicId:'par-010', nom:'Ousmane Diakité',   email:'ousmane.diakite@email.com',   classe:'L3 GL 2025', progression:33, derniereActivite:'Il y a 8j',  statut:'INACTIF',  nbLeconTerminees:8,  nbLeconTotal:25, initiales:'OD' },
  { publicId:'par-011', nom:'Rokhaya Ndiaye',    email:'rokhaya.ndiaye@email.com',    classe:'L3 GL 2025', progression:95, derniereActivite:'Il y a 5h',  statut:'ACTIF',    nbLeconTerminees:24, nbLeconTotal:25, initiales:'RN' },
  { publicId:'par-012', nom:'Bakary Kouyaté',    email:'bakary.kouyate@email.com',    classe:'L3 GL 2025', progression:68, derniereActivite:'Hier',       statut:'ACTIF',    nbLeconTerminees:17, nbLeconTotal:25, initiales:'BK' },
];

// ── Sessions virtuelles ───────────────────────────────────────────────────────
export const MOCK_SESSIONS_VIRTUELLES: ISessionVirtuelle[] = [
  { publicId:'ses-001', titre:'Révision Algorithmique — Questions/Réponses', coursLibelle:'Algorithmique avancée', enseignant:'M. Kaboré Aristide', date:'2026-06-12', heure:'10:00', dureeMinutes:90, statut:'PLANIFIEE', nbInscrits:28, lienJoin:'https://meet.example.com/algo-rev-001' },
  { publicId:'ses-002', titre:'TP BDD en direct — Correction exercices', coursLibelle:'Base de données', enseignant:'Mme Fofana Aminata', date:'2026-06-14', heure:'14:00', dureeMinutes:120, statut:'PLANIFIEE', nbInscrits:22, lienJoin:'https://meet.example.com/bdd-tp-002' },
  { publicId:'ses-003', titre:'Cours IA — Introduction au Deep Learning', coursLibelle:'Intelligence artificielle', enseignant:'Dr Bamba Isidore', date:'2026-06-09', heure:'08:00', dureeMinutes:60, statut:'EN_COURS', nbInscrits:19, lienJoin:'https://meet.example.com/ia-dl-003' },
  { publicId:'ses-004', titre:'Webinaire Cloud — Kubernetes en production', coursLibelle:'Cloud Computing', enseignant:'M. Touré Kader', date:'2026-06-05', heure:'15:00', dureeMinutes:90, statut:'TERMINEE', nbInscrits:12 },
  { publicId:'ses-005', titre:'Session réseau — Simulation Cisco Packet Tracer', coursLibelle:'Réseaux informatiques', enseignant:'M. Diallo Seydou', date:'2026-06-18', heure:'09:00', dureeMinutes:120, statut:'PLANIFIEE', nbInscrits:24, lienJoin:'https://meet.example.com/net-pkt-005' },
  { publicId:'ses-006', titre:'Sécurité web — Pentest live démonstration', coursLibelle:'Sécurité informatique', enseignant:'Mme Koné Mariame', date:'2026-06-03', heure:'14:30', dureeMinutes:90, statut:'ANNULEE', nbInscrits:0 },
];

// ── Calendrier pédagogique ────────────────────────────────────────────────────
export const MOCK_EVENEMENTS: IEvenementPedago[] = [
  { publicId:'ev-001', titre:'TP Algorithmique', type:'COURS', date:'2026-06-09', heure:'08:00', couleur:'#6366f1', coursLibelle:'Algorithmique avancée' },
  { publicId:'ev-002', titre:'Rendu TP Algorithmique', type:'DEVOIR', date:'2026-06-15', couleur:'#f59e0b', coursLibelle:'Algorithmique avancée', urgent:true },
  { publicId:'ev-003', titre:'Examen BDD — Session S1', type:'EXAMEN', date:'2026-06-20', heure:'09:00', couleur:'#ef4444', coursLibelle:'Base de données', urgent:true },
  { publicId:'ev-004', titre:'Session virtuelle IA', type:'SESSION', date:'2026-06-09', heure:'08:00', couleur:'#d97706', coursLibelle:'Intelligence artificielle' },
  { publicId:'ev-005', titre:'Rendu projet BDD', type:'DEVOIR', date:'2026-06-20', couleur:'#f59e0b', coursLibelle:'Base de données', urgent:true },
  { publicId:'ev-006', titre:'Cours Réseaux', type:'COURS', date:'2026-06-10', heure:'14:00', couleur:'#6366f1', coursLibelle:'Réseaux informatiques' },
  { publicId:'ev-007', titre:'Session révision Algo', type:'SESSION', date:'2026-06-12', heure:'10:00', couleur:'#d97706', coursLibelle:'Algorithmique avancée' },
  { publicId:'ev-008', titre:'Examen Algorithmique S1', type:'EXAMEN', date:'2026-06-25', heure:'08:00', couleur:'#ef4444', coursLibelle:'Algorithmique avancée', urgent:false },
  { publicId:'ev-009', titre:'Rendu projet Sécurité', type:'DEVOIR', date:'2026-07-01', couleur:'#f59e0b', coursLibelle:'Sécurité informatique' },
  { publicId:'ev-010', titre:'Cours Cloud Computing', type:'COURS', date:'2026-06-11', heure:'10:30', couleur:'#06b6d4', coursLibelle:'Cloud Computing' },
];

// ── Certificats ───────────────────────────────────────────────────────────────
export const MOCK_CERTIFICATS: ICertificat[] = [
  { publicId:'cert-001', coursPublicId:'cours-010', coursLibelle:'Cloud Computing', etudiantNom:'Fatou Traoré', dateEmission:'2026-05-20', score:92, mention:'Très Bien' },
  { publicId:'cert-002', coursPublicId:'cours-010', coursLibelle:'Cloud Computing', etudiantNom:'Kofi Mensah', dateEmission:'2026-05-20', score:78, mention:'Bien' },
  { publicId:'cert-003', coursPublicId:'cours-010', coursLibelle:'Cloud Computing', etudiantNom:'Rokhaya Ndiaye', dateEmission:'2026-05-20', score:88, mention:'Très Bien' },
  { publicId:'cert-004', coursPublicId:'cours-005', coursLibelle:'Systèmes d\'exploitation', etudiantNom:'Mariam Sanogo', dateEmission:'2026-04-15', score:95, mention:'Excellent' },
  { publicId:'cert-005', coursPublicId:'cours-005', coursLibelle:'Systèmes d\'exploitation', etudiantNom:'Awa Diallo', dateEmission:'2026-04-15', score:72, mention:'Assez Bien' },
];

// ── Banque de questions ───────────────────────────────────────────────────────
export const MOCK_QUESTIONS_BANQUE: IQuestionBanque[] = [
  { publicId:'qb-001', enonce:'Quelle est la complexité temporelle du tri rapide (QuickSort) dans le cas moyen ?', type:'QCM', options:['O(n)','O(n log n)','O(n²)','O(log n)'], bonnesReponses:['O(n log n)'], points:2, matiere:'Algorithmique', difficulte:'MOYEN', tags:['tri','complexité','quicksort'], utiliseesDans:3 },
  { publicId:'qb-002', enonce:'Un algorithme récursif peut toujours être réécrit de façon itérative.', type:'VRAI_FAUX', options:['Vrai','Faux'], bonnesReponses:['Vrai'], points:1, matiere:'Algorithmique', difficulte:'FACILE', tags:['récursion','itération'], utiliseesDans:2 },
  { publicId:'qb-003', enonce:'Qu\'est-ce qu\'une clé étrangère dans une base de données relationnelle ?', type:'REPONSE_COURTE', bonnesReponses:['Colonne référençant la clé primaire d\'une autre table'], points:3, matiere:'Base de données', difficulte:'FACILE', tags:['clé','contrainte','intégrité'], utiliseesDans:4 },
  { publicId:'qb-004', enonce:'Quels sont les niveaux d\'isolation des transactions SQL ? (plusieurs réponses correctes)', type:'QCM', options:['READ UNCOMMITTED','READ COMMITTED','REPEATABLE READ','SERIALIZABLE','PHANTOM READ'], bonnesReponses:['READ UNCOMMITTED','READ COMMITTED','REPEATABLE READ','SERIALIZABLE'], points:4, matiere:'Base de données', difficulte:'DIFFICILE', tags:['transaction','isolation','ACID'], utiliseesDans:2 },
  { publicId:'qb-005', enonce:'La couche Transport du modèle OSI est responsable de l\'adressage logique.', type:'VRAI_FAUX', options:['Vrai','Faux'], bonnesReponses:['Faux'], points:1, matiere:'Réseaux', difficulte:'MOYEN', tags:['OSI','couches','transport'], utiliseesDans:3 },
  { publicId:'qb-006', enonce:'Quel protocole est utilisé pour la résolution des noms de domaine ?', type:'QCM', options:['HTTP','FTP','DNS','SMTP'], bonnesReponses:['DNS'], points:2, matiere:'Réseaux', difficulte:'FACILE', tags:['DNS','réseau','protocole'], utiliseesDans:5 },
  { publicId:'qb-007', enonce:'Quelle est la différence entre l\'apprentissage supervisé et non supervisé en IA ?', type:'REPONSE_LONGUE', bonnesReponses:['Supervisé : données étiquetées, objectif prédéfini. Non supervisé : données non étiquetées, découverte de structures.'], points:5, matiere:'Intelligence Artificielle', difficulte:'MOYEN', tags:['ML','supervisé','non-supervisé'], utiliseesDans:2 },
  { publicId:'qb-008', enonce:'Le Deep Learning est un sous-ensemble du Machine Learning.', type:'VRAI_FAUX', options:['Vrai','Faux'], bonnesReponses:['Vrai'], points:1, matiere:'Intelligence Artificielle', difficulte:'FACILE', tags:['deep learning','ML','IA'], utiliseesDans:3 },
  { publicId:'qb-009', enonce:'Quelle commande Docker permet de lister les conteneurs en cours d\'exécution ?', type:'QCM', options:['docker list','docker ps','docker containers','docker run --list'], bonnesReponses:['docker ps'], points:2, matiere:'Cloud & DevOps', difficulte:'FACILE', tags:['docker','commande','conteneur'], utiliseesDans:2 },
  { publicId:'qb-010', enonce:'Qu\'est-ce que l\'injection SQL et comment la prévenir ?', type:'REPONSE_LONGUE', bonnesReponses:['Attaque consistant à injecter du SQL malveillant. Prévention : requêtes préparées, ORM, validation des entrées.'], points:6, matiere:'Sécurité', difficulte:'MOYEN', tags:['SQL injection','sécurité','OWASP'], utiliseesDans:3 },
  { publicId:'qb-011', enonce:'Quelle propriété ACID garantit qu\'une transaction est entièrement exécutée ou annulée ?', type:'QCM', options:['Atomicité','Cohérence','Isolation','Durabilité'], bonnesReponses:['Atomicité'], points:2, matiere:'Base de données', difficulte:'MOYEN', tags:['ACID','transaction','atomicité'], utiliseesDans:4 },
  { publicId:'qb-012', enonce:'Le protocole TCP garantit la livraison des paquets dans l\'ordre.', type:'VRAI_FAUX', options:['Vrai','Faux'], bonnesReponses:['Vrai'], points:1, matiere:'Réseaux', difficulte:'FACILE', tags:['TCP','fiable','ordre'], utiliseesDans:3 },
];

// ── Résultats examens ────────────────────────────────────────────────────────
export const MOCK_RESULTATS: IResultatExamen[] = [
  { publicId:'res-001', examenPublicId:'exam-004', examenLibelle:'Contrôle Mathématiques', etudiantNom:'Fatou Traoré',     etudiantClasse:'L3 GL', score:18, scoreMax:20, rang:1,  dureeMinutes:95,  date:'2026-05-15', mention:'Excellent'  },
  { publicId:'res-002', examenPublicId:'exam-004', examenLibelle:'Contrôle Mathématiques', etudiantNom:'Rokhaya Ndiaye',   etudiantClasse:'L3 GL', score:16, scoreMax:20, rang:2,  dureeMinutes:112, date:'2026-05-15', mention:'Très Bien'  },
  { publicId:'res-003', examenPublicId:'exam-004', examenLibelle:'Contrôle Mathématiques', etudiantNom:'Mariam Sanogo',    etudiantClasse:'L3 GL', score:15, scoreMax:20, rang:3,  dureeMinutes:118, date:'2026-05-15', mention:'Très Bien'  },
  { publicId:'res-004', examenPublicId:'exam-004', examenLibelle:'Contrôle Mathématiques', etudiantNom:'Kofi Mensah',      etudiantClasse:'L3 GL', score:14, scoreMax:20, rang:4,  dureeMinutes:110, date:'2026-05-15', mention:'Bien'       },
  { publicId:'res-005', examenPublicId:'exam-004', examenLibelle:'Contrôle Mathématiques', etudiantNom:'Awa Diallo',        etudiantClasse:'L3 GL', score:13, scoreMax:20, rang:5,  dureeMinutes:120, date:'2026-05-15', mention:'Bien'       },
  { publicId:'res-006', examenPublicId:'exam-004', examenLibelle:'Contrôle Mathématiques', etudiantNom:'Aminata Koné',     etudiantClasse:'L3 GL', score:12, scoreMax:20, rang:6,  dureeMinutes:108, date:'2026-05-15', mention:'Assez Bien' },
  { publicId:'res-007', examenPublicId:'exam-004', examenLibelle:'Contrôle Mathématiques', etudiantNom:'Moussa Coulibaly', etudiantClasse:'L3 GL', score:10, scoreMax:20, rang:7,  dureeMinutes:115, date:'2026-05-15', mention:'Passable'   },
  { publicId:'res-008', examenPublicId:'exam-004', examenLibelle:'Contrôle Mathématiques', etudiantNom:'Bakary Kouyaté',   etudiantClasse:'L3 GL', score:9,  scoreMax:20, rang:8,  dureeMinutes:120, date:'2026-05-15', mention:'Insuffisant'},
  { publicId:'res-009', examenPublicId:'exam-004', examenLibelle:'Contrôle Mathématiques', etudiantNom:'Ibrahima Bah',     etudiantClasse:'L3 GL', score:7,  scoreMax:20, rang:9,  dureeMinutes:120, date:'2026-05-15', mention:'Insuffisant'},
  { publicId:'res-010', examenPublicId:'exam-004', examenLibelle:'Contrôle Mathématiques', etudiantNom:'Ousmane Diakité',  etudiantClasse:'L3 GL', score:5,  scoreMax:20, rang:10, dureeMinutes:120, date:'2026-05-15', mention:'Insuffisant'},
];

// ── Favoris (IDs de cours mis en favoris par l'étudiant) ─────────────────────
export const MOCK_FAVORIS: string[] = ['cours-001', 'cours-003', 'cours-009'];

// ── Historique de navigation ──────────────────────────────────────────────────
export const MOCK_HISTORIQUE_COURS = [
  { coursPublicId:'cours-001', coursLibelle:'Algorithmique avancée', dernierAcces:'Il y a 2h',   progression:65 },
  { coursPublicId:'cours-002', coursLibelle:'Base de données',       dernierAcces:'Hier',         progression:30 },
  { coursPublicId:'cours-009', coursLibelle:'Intelligence artificielle', dernierAcces:'Il y a 3j', progression:35 },
  { coursPublicId:'cours-003', coursLibelle:'Réseaux informatiques', dernierAcces:'Il y a 4j',   progression:50 },
];
