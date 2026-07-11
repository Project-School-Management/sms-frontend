import { Injectable } from '@angular/core';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DocStudent {
  publicId:     string;
  firstName:    string;
  lastName:     string;
  matricule:    string;
  dateNaissance:string;
  genre:        'M' | 'F';
  classeLibelle?:string;
  niveauLibelle?:string;
  filiereLibelle?:string;
  statut:       string;
  email?:       string;
  phone?:       string;
  nationalite?: string;
  adresse?:     string;
  ville?:       string;
  dateInscription?: string;
}

export interface DocNote {
  matiere:        string;
  coeff:          number;
  valeur:         number;
  moyenneClasse?: number;
  appreciation?:  string;
}

export interface DocBulletin {
  student:   DocStudent;
  periode:   string;
  annee:     string;
  moyenne:   number;
  rang:      number;
  effectif:  number;
  mention:   string;
  notes:     DocNote[];
  decision?: string;
  observations?: string;
}

export interface DocInvoice {
  numero:     string;
  student:    DocStudent;
  montant:    number;
  paye:       number;
  solde:      number;
  statut:     string;
  dateEmission: string;
  dateEcheance: string;
  typeFrais:  string;
  operateur?: string;
  reference?: string;
}

export interface DocSchool {
  name:    string;
  address: string;
  phone:   string;
  email:   string;
  bp?:     string;
  logo?:   string;
}

// ── Default school config ──────────────────────────────────────────────────────

const DEFAULT_SCHOOL: DocSchool = {
  name:    'Complexe Scolaire Horizon',
  address: 'Hamdallaye ACI 2000, Bamako, Mali',
  phone:   '+223 20 22 XX XX',
  email:   'contact@complexe-horizon.edu.ml',
  bp:      'BP 1234 Bamako',
};

// ── Shared CSS ─────────────────────────────────────────────────────────────────

const DOC_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', 'Arial', sans-serif; background: #fff; color: #0f172a; font-size: 13px; padding: 24px; }
  .page { max-width: 760px; margin: 0 auto; }

  /* Header */
  .doc-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; color: #fff; margin-bottom: 20px; }
  .doc-header-left h1 { font-size: 18px; font-weight: 800; }
  .doc-header-left .sub { font-size: 11px; opacity: .80; margin-top: 2px; }
  .doc-header-right { text-align: right; font-size: 11px; opacity: .85; line-height: 1.6; }
  .doc-title-band { text-align: center; margin-bottom: 20px; }
  .doc-title-band h2 { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
    color: #6366f1; border-bottom: 2px solid #6366f1; display: inline-block; padding-bottom: 4px; }
  .doc-title-band .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }

  /* Sections */
  .section { margin-bottom: 16px; }
  .section h3 { font-size: 13px; font-weight: 700; color: #6366f1; border-left: 3px solid #6366f1;
    padding-left: 8px; margin-bottom: 10px; }

  /* Info grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .info-row { display: contents; }
  .info-label { padding: 7px 12px; background: #f8fafc; font-weight: 600; color: #475569; font-size: 12px;
    border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
  .info-value { padding: 7px 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-size: 12px; }

  /* Table */
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
  th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 700; color: #475569;
    border-bottom: 2px solid #e2e8f0; }
  td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
  tr:last-child td { border-bottom: none; }
  .good  { color: #16a34a; font-weight: 700; }
  .bad   { color: #dc2626; font-weight: 700; }
  .avg   { color: #d97706; font-weight: 700; }
  tfoot td { background: #f1f5f9; font-weight: 700; border-top: 2px solid #e2e8f0; }

  /* Badges */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-green  { background: #dcfce7; color: #16a34a; }
  .badge-orange { background: #fef3c7; color: #d97706; }
  .badge-red    { background: #fee2e2; color: #dc2626; }
  .badge-blue   { background: #dbeafe; color: #2563eb; }

  /* Summary box */
  .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px;
    display: flex; gap: 24px; flex-wrap: wrap; align-items: center; margin: 12px 0; }
  .summary-item { text-align: center; }
  .summary-item .val { font-size: 20px; font-weight: 800; color: #6366f1; }
  .summary-item .lbl { font-size: 11px; color: #64748b; margin-top: 2px; }

  /* Signature block */
  .signature-block { display: flex; justify-content: space-between; margin-top: 28px; }
  .signature-line { width: 180px; }
  .signature-line .title { font-size: 12px; font-weight: 600; color: #475569; text-align: center; }
  .signature-line .line  { border-top: 1px solid #94a3b8; margin: 24px 0 6px; }

  /* Footer */
  .doc-footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0;
    text-align: center; font-size: 10px; color: #94a3b8; }

  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
`;

// ── DocumentService ───────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DocumentService {

  private school: DocSchool = DEFAULT_SCHOOL;

  /** Override with real school info (call once on app init) */
  setSchool(school: Partial<DocSchool>): void {
    this.school = { ...DEFAULT_SCHOOL, ...school };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CARTE ÉTUDIANT
  // ─────────────────────────────────────────────────────────────────────────────
  printStudentCard(s: DocStudent): void {
    const html = this.wrap('Carte Étudiant', `
      <div style="max-width:320px;margin:0 auto;background:#fff;border-radius:12px;
        box-shadow:0 2px 16px rgba(0,0,0,.12);overflow:hidden">
        <!-- Top gradient band -->
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:20px;color:#fff;display:flex;align-items:center;gap:14px">
          <div style="width:56px;height:56px;border-radius:10px;background:rgba(255,255,255,.2);
            display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800">
            ${s.firstName[0]}${s.lastName[0]}
          </div>
          <div>
            <div style="font-size:16px;font-weight:800">${s.firstName} ${s.lastName}</div>
            <div style="font-size:12px;opacity:.85;margin-top:2px">${s.classeLibelle ?? '—'}</div>
            <span class="badge badge-green" style="margin-top:4px">${s.statut}</span>
          </div>
        </div>
        <!-- Info grid -->
        <div style="padding:16px">
          <div class="info-grid">
            <div class="info-label">Matricule</div><div class="info-value">${s.matricule}</div>
            <div class="info-label">Né(e) le</div><div class="info-value">${this.fmt(s.dateNaissance)}</div>
            <div class="info-label">Genre</div><div class="info-value">${s.genre === 'M' ? 'Masculin' : 'Féminin'}</div>
            <div class="info-label">Niveau</div><div class="info-value">${s.niveauLibelle ?? '—'}</div>
            <div class="info-label">Filière</div><div class="info-value">${s.filiereLibelle ?? '—'}</div>
            <div class="info-label">Nationalité</div><div class="info-value">${s.nationalite ?? '—'}</div>
          </div>
        </div>
        <div class="doc-footer">Année 2025-2026 • ${this.school.name}</div>
      </div>
    `);
    this.print(html);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FICHE COMPLÈTE ÉTUDIANT
  // ─────────────────────────────────────────────────────────────────────────────
  printStudentProfile(s: DocStudent): void {
    const html = this.wrap('Fiche Élève', `
      <div class="page">
        ${this.docHeader('FICHE ÉLÈVE', 'Dossier scolaire complet')}
        <div class="section"><h3>Identité</h3>
          <div class="info-grid">
            <div class="info-label">Prénom</div><div class="info-value">${s.firstName}</div>
            <div class="info-label">Nom</div><div class="info-value">${s.lastName}</div>
            <div class="info-label">Matricule</div><div class="info-value">${s.matricule}</div>
            <div class="info-label">Date de naissance</div><div class="info-value">${this.fmt(s.dateNaissance)}</div>
            <div class="info-label">Genre</div><div class="info-value">${s.genre === 'M' ? 'Masculin' : 'Féminin'}</div>
            <div class="info-label">Nationalité</div><div class="info-value">${s.nationalite ?? '—'}</div>
            <div class="info-label">Email</div><div class="info-value">${s.email ?? '—'}</div>
            <div class="info-label">Téléphone</div><div class="info-value">${s.phone ?? '—'}</div>
            <div class="info-label">Adresse</div><div class="info-value">${s.adresse ? s.adresse + ', ' + (s.ville ?? '') : '—'}</div>
          </div>
        </div>
        <div class="section"><h3>Scolarité</h3>
          <div class="info-grid">
            <div class="info-label">Classe</div><div class="info-value">${s.classeLibelle ?? '—'}</div>
            <div class="info-label">Niveau</div><div class="info-value">${s.niveauLibelle ?? '—'}</div>
            <div class="info-label">Filière</div><div class="info-value">${s.filiereLibelle ?? '—'}</div>
            <div class="info-label">Statut</div>
            <div class="info-value"><span class="badge badge-green">${s.statut}</span></div>
            <div class="info-label">Date d'inscription</div>
            <div class="info-value">${s.dateInscription ? this.fmt(s.dateInscription) : '—'}</div>
            <div class="info-label">Année académique</div><div class="info-value">2025–2026</div>
          </div>
        </div>
        ${this.signatureBlock(['Le Directeur', 'Le Secrétaire'])}
        ${this.footer()}
      </div>
    `);
    this.print(html);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BULLETIN SCOLAIRE
  // ─────────────────────────────────────────────────────────────────────────────
  printBulletin(b: DocBulletin): void {
    const noteColor = (v: number) => v >= 14 ? 'good' : v >= 10 ? '' : 'bad';
    const rows = b.notes.map(n => `
      <tr>
        <td>${n.matiere}</td>
        <td style="text-align:center">${n.coeff}</td>
        <td style="text-align:center" class="${noteColor(n.valeur)}">${n.valeur.toFixed(2)}/20</td>
        <td style="text-align:center;color:#94a3b8">${n.moyenneClasse?.toFixed(2) ?? '—'}/20</td>
        <td>${n.appreciation ?? '—'}</td>
      </tr>`).join('');

    const html = this.wrap('Bulletin Scolaire', `
      <div class="page">
        ${this.docHeader('BULLETIN SCOLAIRE', b.periode + ' — ' + b.annee)}
        <!-- Student info -->
        <div class="section"><h3>Informations de l'élève</h3>
          <div class="info-grid">
            <div class="info-label">Nom complet</div>
            <div class="info-value"><strong>${b.student.firstName} ${b.student.lastName}</strong></div>
            <div class="info-label">Matricule</div><div class="info-value">${b.student.matricule}</div>
            <div class="info-label">Classe</div><div class="info-value">${b.student.classeLibelle ?? '—'}</div>
            <div class="info-label">Niveau</div><div class="info-value">${b.student.niveauLibelle ?? '—'}</div>
          </div>
        </div>
        <!-- Summary -->
        <div class="summary-box">
          <div class="summary-item"><div class="val ${noteColor(b.moyenne)}">${b.moyenne.toFixed(2)}/20</div><div class="lbl">Moyenne générale</div></div>
          <div class="summary-item"><div class="val">${b.rang}${b.rang === 1 ? 'er' : 'ème'}/${b.effectif}</div><div class="lbl">Classement</div></div>
          <div class="summary-item"><div class="val"><span class="badge ${b.mention === 'Très Bien' ? 'badge-green' : b.mention === 'Bien' ? 'badge-blue' : 'badge-orange'}">${b.mention}</span></div><div class="lbl">Mention</div></div>
        </div>
        <!-- Notes table -->
        <div class="section"><h3>Résultats par matière</h3>
          <table>
            <thead><tr><th>Matière</th><th>Coeff</th><th>Note /20</th><th>Moy. classe</th><th>Appréciation</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr><td colspan="2"><strong>Moyenne pondérée</strong></td>
              <td class="${noteColor(b.moyenne)}">${b.moyenne.toFixed(2)}/20</td>
              <td></td><td>${b.mention}</td></tr></tfoot>
          </table>
        </div>
        ${b.observations ? `<div class="section"><h3>Observations du conseil de classe</h3>
          <p style="padding:10px;background:#f8fafc;border-radius:6px;font-style:italic">${b.observations}</p></div>` : ''}
        ${b.decision ? `<div style="margin:12px 0;padding:10px 14px;border-radius:8px;background:#dcfce7;border:1px solid #86efac">
          <strong style="color:#16a34a">Décision :</strong> <span style="color:#16a34a">${b.decision}</span></div>` : ''}
        ${this.signatureBlock(['Le Directeur Pédagogique', 'Le Conseil de Classe'])}
        ${this.footer()}
      </div>
    `);
    this.print(html);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REÇU DE PAIEMENT
  // ─────────────────────────────────────────────────────────────────────────────
  printPaymentReceipt(inv: DocInvoice): void {
    const xof = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' XOF';
    const statusBadge = inv.statut === 'PAYEE' ? 'badge-green' : inv.solde > 0 ? 'badge-orange' : 'badge-red';
    const html = this.wrap('Reçu de Paiement', `
      <div class="page">
        ${this.docHeader('REÇU DE PAIEMENT', `N° ${inv.numero}`)}
        <div class="section"><h3>Informations de l'élève</h3>
          <div class="info-grid">
            <div class="info-label">Nom complet</div>
            <div class="info-value">${inv.student.firstName} ${inv.student.lastName}</div>
            <div class="info-label">Matricule</div><div class="info-value">${inv.student.matricule}</div>
            <div class="info-label">Classe</div><div class="info-value">${inv.student.classeLibelle ?? '—'}</div>
            <div class="info-label">Année académique</div><div class="info-value">2025–2026</div>
          </div>
        </div>
        <div class="section"><h3>Détails de la facture</h3>
          <div class="info-grid">
            <div class="info-label">N° Facture</div><div class="info-value"><strong>${inv.numero}</strong></div>
            <div class="info-label">Type de frais</div><div class="info-value">${inv.typeFrais}</div>
            <div class="info-label">Date d'émission</div><div class="info-value">${this.fmt(inv.dateEmission)}</div>
            <div class="info-label">Date d'échéance</div><div class="info-value">${this.fmt(inv.dateEcheance)}</div>
            ${inv.operateur ? `<div class="info-label">Opérateur</div><div class="info-value">${inv.operateur}</div>` : ''}
            ${inv.reference ? `<div class="info-label">Référence</div><div class="info-value font-mono">${inv.reference}</div>` : ''}
          </div>
        </div>
        <div class="summary-box" style="justify-content:space-between">
          <div class="summary-item"><div class="val" style="color:#0f172a">${xof(inv.montant)}</div><div class="lbl">Montant total</div></div>
          <div class="summary-item"><div class="val good">${xof(inv.paye)}</div><div class="lbl">Montant payé</div></div>
          <div class="summary-item"><div class="val ${inv.solde > 0 ? 'bad' : 'good'}">${xof(inv.solde)}</div><div class="lbl">Solde restant</div></div>
          <div class="summary-item"><span class="badge ${statusBadge}">${inv.statut}</span><div class="lbl" style="margin-top:4px">Statut</div></div>
        </div>
        ${this.signatureBlock(['Le Comptable', 'Le Directeur'])}
        ${this.footer()}
      </div>
    `);
    this.print(html);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CERTIFICAT DE SCOLARITÉ
  // ─────────────────────────────────────────────────────────────────────────────
  printCertificatScolarite(s: DocStudent): void {
    const html = this.wrap('Certificat de Scolarité', `
      <div class="page">
        ${this.docHeader('CERTIFICAT DE SCOLARITÉ', 'Année académique 2025–2026')}
        <div style="margin:28px 0;text-align:center;font-size:14px;line-height:2.2;color:#0f172a;
          padding:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
          <p>Je soussigné(e), <strong>Directeur de l'Établissement ${this.school.name}</strong>,</p>
          <p>certifie que l'élève :</p>
          <p style="font-size:18px;font-weight:800;color:#6366f1;margin:10px 0">
            ${s.firstName.toUpperCase()} ${s.lastName.toUpperCase()}
          </p>
          <p>né(e) le <strong>${this.fmt(s.dateNaissance)}</strong>,
             de nationalité <strong>${s.nationalite ?? '—'}</strong>,</p>
          <p>portant le matricule <strong>${s.matricule}</strong>,</p>
          <p>est régulièrement inscrit(e) en :</p>
          <p style="font-size:15px;font-weight:700;color:#0f172a;margin:6px 0">
            ${s.classeLibelle ?? '—'} — ${s.niveauLibelle ?? ''} — ${s.filiereLibelle ?? ''}
          </p>
          <p>au titre de l'année académique <strong>2025–2026</strong>.</p>
          <p style="margin-top:10px;font-size:12px;color:#64748b">
            Le présent certificat est délivré pour servir et valoir ce que de droit.
          </p>
        </div>
        <div style="margin:16px 0;text-align:right;font-style:italic;font-size:12px;color:#64748b">
          Bamako, le ${new Date().toLocaleDateString('fr-FR')}
        </div>
        ${this.signatureBlock(['Le Directeur de l\'Établissement'])}
        ${this.footer()}
      </div>
    `);
    this.print(html);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ATTESTATION DE PRÉSENCE / INSCRIPTION
  // ─────────────────────────────────────────────────────────────────────────────
  printAttestation(s: DocStudent, type: 'presence' | 'inscription' = 'inscription'): void {
    const typeLabel = type === 'presence' ? 'PRÉSENCE SCOLAIRE' : 'INSCRIPTION';
    const body = type === 'inscription'
      ? `est officiellement inscrit(e) dans notre établissement au titre de l'année scolaire <strong>2025-2026</strong>.`
      : `est présent(e) et assidu(e) à l'ensemble des cours dispensés dans notre établissement.`;
    const html = this.wrap(`Attestation de ${typeLabel}`, `
      <div class="page">
        ${this.docHeader(`ATTESTATION DE ${typeLabel}`, this.school.name)}
        <div style="margin:24px 0;line-height:2.0;font-size:14px;padding:20px;
          background:#f8fafc;border-left:4px solid #6366f1;border-radius:0 8px 8px 0">
          <p>Nous certifions que l'élève :</p>
          <p style="font-size:18px;font-weight:800;color:#6366f1;margin:8px 0">
            ${s.firstName.toUpperCase()} ${s.lastName.toUpperCase()}
          </p>
          <p>Matricule : <strong>${s.matricule}</strong></p>
          <p>Classe : <strong>${s.classeLibelle ?? '—'}</strong></p>
          <p>${body}</p>
        </div>
        <p style="text-align:right;font-style:italic;font-size:12px;color:#64748b;margin:8px 0">
          Fait à Bamako, le ${new Date().toLocaleDateString('fr-FR')}
        </p>
        ${this.signatureBlock(['Le Directeur'])}
        ${this.footer()}
      </div>
    `);
    this.print(html);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RELEVÉ DE NOTES
  // ─────────────────────────────────────────────────────────────────────────────
  printReleveNotes(s: DocStudent, notes: DocNote[], periode: string): void {
    const noteColor = (v: number) => v >= 14 ? 'good' : v >= 10 ? '' : 'bad';
    const moyPond = notes.reduce((acc, n) => acc + n.valeur * n.coeff, 0)
      / Math.max(notes.reduce((acc, n) => acc + n.coeff, 0), 1);
    const rows = notes.map(n => `
      <tr>
        <td>${n.matiere}</td>
        <td style="text-align:center">${n.coeff}</td>
        <td style="text-align:center" class="${noteColor(n.valeur)}">${n.valeur.toFixed(2)}</td>
        <td style="text-align:center" class="${noteColor(n.valeur * n.coeff / n.coeff)}">${(n.valeur * n.coeff).toFixed(2)}</td>
        <td>${n.appreciation ?? '—'}</td>
      </tr>`).join('');
    const html = this.wrap('Relevé de Notes', `
      <div class="page">
        ${this.docHeader('RELEVÉ DE NOTES', `${s.classeLibelle ?? ''} — ${periode}`)}
        <div class="section"><h3>Élève</h3>
          <div class="info-grid">
            <div class="info-label">Nom</div><div class="info-value">${s.firstName} ${s.lastName}</div>
            <div class="info-label">Matricule</div><div class="info-value">${s.matricule}</div>
            <div class="info-label">Classe</div><div class="info-value">${s.classeLibelle ?? '—'}</div>
            <div class="info-label">Période</div><div class="info-value">${periode}</div>
          </div>
        </div>
        <div class="section"><h3>Résultats</h3>
          <table>
            <thead><tr><th>Matière</th><th>Coeff.</th><th>Note /20</th><th>Note pondérée</th><th>Appréciation</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr><td colspan="2"><strong>Moyenne pondérée</strong></td>
              <td class="${noteColor(moyPond)}" colspan="2">${moyPond.toFixed(2)}/20</td>
              <td></td></tr></tfoot>
          </table>
        </div>
        ${this.signatureBlock(['L\'Enseignant', 'Le Directeur Pédagogique'])}
        ${this.footer()}
      </div>
    `);
    this.print(html);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONVOCATION EXAMEN
  // ─────────────────────────────────────────────────────────────────────────────
  printConvocation(s: DocStudent, exam: { titre: string; date: string; heure: string; salle: string; duree: string }): void {
    const html = this.wrap('Convocation Examen', `
      <div class="page">
        ${this.docHeader('CONVOCATION À UN EXAMEN', this.school.name)}
        <div style="margin:20px 0;padding:14px;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;
          display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">⚠️</span>
          <p style="font-size:13px;color:#92400e">
            <strong>Cette convocation est obligatoire.</strong> Présentez-la le jour de l'examen accompagnée d'une pièce d'identité.
          </p>
        </div>
        <div class="section"><h3>Identité du candidat</h3>
          <div class="info-grid">
            <div class="info-label">Nom & Prénom</div><div class="info-value">${s.firstName} ${s.lastName}</div>
            <div class="info-label">Matricule</div><div class="info-value">${s.matricule}</div>
            <div class="info-label">Classe</div><div class="info-value">${s.classeLibelle ?? '—'}</div>
          </div>
        </div>
        <div class="section"><h3>Informations sur l'examen</h3>
          <div class="info-grid">
            <div class="info-label">Intitulé</div><div class="info-value"><strong>${exam.titre}</strong></div>
            <div class="info-label">Date</div><div class="info-value">${exam.date}</div>
            <div class="info-label">Heure</div><div class="info-value">${exam.heure}</div>
            <div class="info-label">Salle</div><div class="info-value">${exam.salle}</div>
            <div class="info-label">Durée</div><div class="info-value">${exam.duree}</div>
          </div>
        </div>
        <div style="margin:16px 0;text-align:right;font-style:italic;font-size:12px;color:#64748b">
          Bamako, le ${new Date().toLocaleDateString('fr-FR')}
        </div>
        ${this.signatureBlock(['Le Directeur Pédagogique'])}
        ${this.footer()}
      </div>
    `);
    this.print(html);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private wrap(title: string, content: string): string {
    return `<!DOCTYPE html><html lang="fr"><head>
      <meta charset="UTF-8"><title>${title} — ${this.school.name}</title>
      <style>${DOC_CSS}</style>
    </head><body>${content}
    <script>window.onload=()=>{window.print();window.close();}<\/script>
    </body></html>`;
  }

  private docHeader(title: string, subtitle: string): string {
    return `
      <div class="doc-header">
        <div class="doc-header-left">
          <h1>${this.school.name}</h1>
          <div class="sub">${this.school.address} &nbsp;·&nbsp; ${this.school.phone}</div>
          <div class="sub">${this.school.email}${this.school.bp ? ' &nbsp;·&nbsp; ' + this.school.bp : ''}</div>
        </div>
        <div class="doc-header-right">
          <div style="font-size:18px;font-weight:800">${title}</div>
          <div>${subtitle}</div>
          <div>Imprimé le ${new Date().toLocaleDateString('fr-FR')}</div>
        </div>
      </div>`;
  }

  private signatureBlock(signers: string[]): string {
    const items = signers.map(s => `
      <div class="signature-line">
        <div class="title">${s}</div>
        <div class="line"></div>
        <div style="font-size:11px;color:#94a3b8;text-align:center">Cachet et signature</div>
      </div>`).join('');
    return `<div class="signature-block">${items}</div>`;
  }

  private footer(): string {
    return `<div class="doc-footer">${this.school.name} &nbsp;·&nbsp; ${this.school.address} &nbsp;·&nbsp; ${this.school.phone} &nbsp;·&nbsp; ${this.school.email}</div>`;
  }

  private fmt(dateStr?: string): string {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('fr-FR'); }
    catch { return dateStr; }
  }

  private print(html: string): void {
    const win = window.open('', '_blank', 'width=860,height=1000');
    if (!win) {
      console.warn('[DocumentService] Popup bloqué. Autorisez les popups pour imprimer.');
      return;
    }
    win.document.write(html);
    win.document.close();
  }
}
