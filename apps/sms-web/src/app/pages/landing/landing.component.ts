import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  async login(): Promise<void> {
    await this.authService.login(window.location.origin + '/dashboard');
  }
}
