import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@sms/shared/auth';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';

interface Feature {
  icon:  string;
  color: string;
  bg:    string;
  title: string;
  text:  string;
}

interface Step {
  n:     string;
  title: string;
  text:  string;
}

interface MaliStat {
  icon:  string;
  label: string;
  value: string;
}

interface PricingTier {
  name:        string;
  description: string;
  highlight:   boolean;
  features:    string[];
}

interface Faq {
  q: string;
  a: string;
}

interface PersonaFeature {
  icon: string;
  title: string;
  text:  string;
}

interface MobilePoint {
  icon: string;
  text: string;
}

/**
 * Landing page marketing/commercialisation (visiteurs non authentifiés).
 * Route publique en racine (`app.routes.ts`), en dehors du shell protégé —
 * ne doit jamais dépendre de guards ni de données d'établissement mockées.
 */
@Component({
  selector: 'sms-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly keycloak = inject(KeycloakService, { optional: true });

  readonly currentYear = new Date().getFullYear();
  readonly mobileMenuOpen = signal(false);

  readonly features: Feature[] = [
    { icon: 'groups',          color: '#0a2540', bg: 'rgba(10,37,64,0.08)',   title: 'Élèves & inscriptions',      text: 'Dossiers complets, réinscriptions, documents et matricule généré automatiquement.' },
    { icon: 'calendar_month',  color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  title: 'Emploi du temps & absences',  text: "Planning hebdomadaire par classe et par enseignant, suivi des absences en temps réel." },
    { icon: 'edit_note',       color: '#16a34a', bg: 'rgba(22,163,74,0.08)', title: 'Notes & bulletins',            text: 'Saisie des notes, moyennes, classements et bulletins conformes au système malien.' },
    { icon: 'payments',        color: '#d97706', bg: 'rgba(217,119,6,0.08)', title: 'Finances & Mobile Money',      text: 'Frais, échéanciers, bourses et paiements Mobile Money suivis en un seul endroit.' },
    { icon: 'menu_book',       color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', title: 'Bibliothèque numérique',      text: 'Catalogue, emprunts et réservations pour chaque établissement.' },
    { icon: 'forum',           color: '#0891b2', bg: 'rgba(8,145,178,0.08)', title: 'Messagerie & annonces',        text: 'Communication instantanée entre direction, enseignants, parents et élèves.' },
    { icon: 'domain',          color: '#be185d', bg: 'rgba(190,24,93,0.08)', title: 'Multi-établissement',          text: 'Un seul compte pour piloter plusieurs établissements et plusieurs espaces pédagogiques.' },
    { icon: 'verified_user',   color: '#0a2540', bg: 'rgba(10,37,64,0.08)',  title: 'Sécurité & rôles',             text: 'Connexion unique sécurisée (SSO) et permissions adaptées à chaque profil.' },
  ];

  readonly steps: Step[] = [
    { n: '1', title: 'Créez votre établissement',     text: 'Renseignez son identité (nom, logo, coordonnées) en quelques minutes.' },
    { n: '2', title: 'Configurez vos espaces',         text: 'Déclarez vos cycles — Fondamental, Lycée, Université — selon votre réalité.' },
    { n: '3', title: 'Vos équipes travaillent au quotidien', text: 'Direction, enseignants, comptabilité et familles accèdent à leur espace, chacun selon son rôle.' },
  ];

  readonly maliStats: MaliStat[] = [
    { icon: 'child_care',     label: 'École Fondamentale', value: '9 années · DEF' },
    { icon: 'auto_stories',   label: 'Lycée',              value: 'SE · LL · SH · SBio' },
    { icon: 'account_balance',label: 'Université',          value: 'Système LMD' },
  ];

  readonly pricingTiers: PricingTier[] = [
    {
      name: 'Essentiel',
      description: 'Un établissement, un espace pédagogique.',
      highlight: false,
      features: [
        'Élèves & inscriptions',
        'Emploi du temps & absences',
        'Notes & bulletins',
        'Messagerie & annonces',
      ],
    },
    {
      name: 'Croissance',
      description: 'Plusieurs cycles au sein du même établissement.',
      highlight: true,
      features: [
        'Tout Essentiel',
        'Multi-espaces (Fondamental, Lycée, Université…)',
        'Finances & Mobile Money',
        'Bibliothèque numérique',
      ],
    },
    {
      name: 'Entreprise',
      description: 'Groupe scolaire multi-établissements.',
      highlight: false,
      features: [
        'Tout Croissance',
        'Multi-établissements',
        'Accompagnement à la mise en route',
        'Support dédié',
      ],
    },
  ];

  readonly parentFeatures: PersonaFeature[] = [
    { icon: 'insights',                title: 'Suivi des résultats',            text: 'Notes, moyennes et bulletins consultables dès leur publication.' },
    { icon: 'event_available',         title: 'Absences & emploi du temps',     text: 'Alerte en cas d\'absence, planning toujours à jour.' },
    { icon: 'forum',                   title: 'Contact direct',                 text: 'Messagerie avec les enseignants et la direction de l\'établissement.' },
    { icon: 'account_balance_wallet',  title: 'Suivi des paiements',            text: 'Échéances de scolarité, historique et reçus de paiement.' },
  ];

  readonly studentFeatures: PersonaFeature[] = [
    { icon: 'menu_book',   title: 'Cours & devoirs',  text: 'Supports de cours, devoirs et examens réunis au même endroit.' },
    { icon: 'edit_note',   title: 'Mes résultats',     text: 'Notes et bulletins personnels consultables à tout moment.' },
    { icon: 'local_library', title: 'Bibliothèque',    text: 'Emprunts et réservations directement depuis son espace.' },
    { icon: 'campaign',    title: 'Annonces',          text: 'Informations officielles de l\'établissement, sans rien manquer.' },
  ];

  readonly mobilePoints: MobilePoint[] = [
    { icon: 'add_to_home_screen',   text: "Installation en un geste sur l'écran d'accueil, sans passer par un store" },
    { icon: 'wifi_off',             text: 'Conçu pour rester utilisable même avec une connexion limitée' },
    { icon: 'notifications_active', text: 'Notifications pour les absences, les notes et les nouveaux messages' },
    { icon: 'devices',              text: 'Une seule application, adaptée aux téléphones, tablettes et ordinateurs' },
  ];

  readonly faqs: Faq[] = [
    {
      q: 'Où sont hébergées nos données ?',
      a: "Vos données sont hébergées sur une infrastructure dédiée, isolée par établissement, avec authentification unique sécurisée (SSO) pour chaque utilisateur.",
    },
    {
      q: 'Peut-on gérer plusieurs cycles (Fondamental, Lycée, Université) avec un seul compte ?',
      a: "Oui — chaque établissement peut déclarer plusieurs « espaces » pédagogiques indépendants, et les utilisateurs affectés à plusieurs espaces basculent de l'un à l'autre sans se reconnecter.",
    },
    {
      q: 'La plateforme gère-t-elle les paiements Mobile Money ?',
      a: 'Oui, le module Finances suit les frais de scolarité, les échéanciers, les bourses et les paiements Mobile Money.',
    },
    {
      q: "Comment démarrer avec notre établissement existant ?",
      a: "Notre équipe vous accompagne pour créer votre établissement, configurer vos espaces et importer vos données existantes (élèves, classes, enseignants).",
    },
    {
      q: 'Les parents et les élèves ont-ils aussi accès à la plateforme ?',
      a: "Oui — chaque parent, élève ou étudiant dispose de son propre espace (notes, absences, messagerie, paiements), accessible sur ordinateur comme sur mobile.",
    },
  ];

  async ngOnInit(): Promise<void> {
    if (!this.keycloak) return;
    try {
      const loggedIn = await this.keycloak.isLoggedIn();
      if (loggedIn) {
        this.router.navigateByUrl('/dashboard');
      }
    } catch {
      // Pas de session — on reste sur la landing page.
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  scrollTo(id: string): void {
    this.mobileMenuOpen.set(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  async login(): Promise<void> {
    await this.authService.login(window.location.origin + '/dashboard');
  }
}
