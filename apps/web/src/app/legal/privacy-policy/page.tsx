import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Bull & Bear",
  description: "Comment Bull & Bear collecte, utilise et protège vos données personnelles conformément au RGPD.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Politique de confidentialité"
      subtitle="Légal · RGPD"
      lastUpdated="26 avril 2026"
    >
      {/* ─── 1. Qui sommes-nous ────────────────────────────────── */}
      <h2>1. Responsable du traitement</h2>
      <p>
        Bull &amp; Bear est un journal de trading en ligne édité par <strong>[VOTRE NOM / SOCIÉTÉ]</strong>,
        dont le siège social est situé à <strong>[ADRESSE]</strong>, enregistré sous le numéro <strong>[SIREN / RCS]</strong>.
      </p>
      <p>
        Pour toute question relative à la protection de vos données, vous pouvez nous contacter à l&apos;adresse :{" "}
        <a href="mailto:privacy@yourdomain.com">privacy@yourdomain.com</a>.
      </p>

      {/* ─── 2. Données collectées ─────────────────────────────── */}
      <h2>2. Données personnelles collectées</h2>
      <p>Nous collectons uniquement les données strictement nécessaires au fonctionnement du service :</p>

      <h3>2.1 Données d&apos;identité et de contact</h3>
      <ul>
        <li><strong>Adresse e-mail</strong> — utilisée pour la création de compte et l&apos;authentification.</li>
        <li><strong>Nom d&apos;affichage</strong> — optionnel, personnalise votre interface.</li>
        <li><strong>Fuseau horaire</strong> — optionnel, permet l&apos;affichage correct des horaires de trading.</li>
      </ul>

      <h3>2.2 Données de trading (contenu utilisateur)</h3>
      <ul>
        <li>Informations sur vos comptes de trading (nom, courtier, devise, solde initial).</li>
        <li>Historique de trades (symbole, prix, quantité, résultat, dates d&apos;entrée/sortie).</li>
        <li>Journaux quotidiens (conditions de marché, état émotionnel, notes, captures d&apos;écran).</li>
      </ul>
      <p>
        Ces données sont exclusivement des contenus que vous saisissez volontairement. Elles ne sont
        ni revendues, ni partagées avec des tiers à des fins publicitaires.
      </p>

      <h3>2.3 Données de navigation</h3>
      <ul>
        <li><strong>Adresse IP</strong> — collectée temporairement pour la limitation du débit des requêtes API (protection anti-abus). Non conservée au-delà de 60 secondes.</li>
        <li><strong>Cookies de session</strong> — nécessaires à l&apos;authentification (cookies strictement fonctionnels, exemptés du consentement au titre de la directive ePrivacy).</li>
      </ul>
      <p>
        Nous n&apos;utilisons <strong>aucun cookie analytique, traceur publicitaire ou pixel tiers</strong>.
      </p>

      {/* ─── 3. Finalités et bases légales ────────────────────── */}
      <h2>3. Finalités du traitement et bases légales</h2>
      <table>
        <thead>
          <tr>
            <th>Finalité</th>
            <th>Base légale (RGPD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Création et gestion de votre compte</td>
            <td>Exécution du contrat (Art. 6.1.b)</td>
          </tr>
          <tr>
            <td>Authentification sécurisée</td>
            <td>Exécution du contrat (Art. 6.1.b)</td>
          </tr>
          <tr>
            <td>Stockage et affichage de vos trades et journaux</td>
            <td>Exécution du contrat (Art. 6.1.b)</td>
          </tr>
          <tr>
            <td>Limitation du débit des requêtes (sécurité)</td>
            <td>Intérêt légitime (Art. 6.1.f)</td>
          </tr>
          <tr>
            <td>Envoi d&apos;e-mails transactionnels (confirmation, réinitialisation de mot de passe)</td>
            <td>Exécution du contrat (Art. 6.1.b)</td>
          </tr>
        </tbody>
      </table>
      <p>
        Nous ne procédons à <strong>aucun profilage automatisé</strong> ni prise de décision automatique
        produisant des effets juridiques sur votre personne.
      </p>

      {/* ─── 4. Données sensibles ─────────────────────────────── */}
      <h2>4. Données relatives à l&apos;état émotionnel</h2>
      <p>
        Notre journal de trading vous permet de documenter votre état émotionnel lors de vos sessions
        (ex. : calme, anxieux, confiant). Ces données psychologiques peuvent constituer des <strong>données
        sensibles</strong> au sens de l&apos;article 9 du RGPD.
      </p>
      <p>
        En saisissant ces informations, vous consentez explicitement à leur traitement dans le seul
        but d&apos;améliorer votre analyse personnelle de trading. Ces données ne sont accessibles qu&apos;à
        vous-même et ne font l&apos;objet d&apos;aucune communication à des tiers.
      </p>

      {/* ─── 5. Sous-traitants ────────────────────────────────── */}
      <h2>5. Sous-traitants et transferts de données</h2>
      <p>Nous faisons appel aux sous-traitants suivants, qui traitent des données en notre nom :</p>
      <ul>
        <li>
          <strong>Supabase Inc.</strong> (États-Unis) — hébergement de la base de données et authentification.
          Les données sont stockées dans la région <strong>EU West (Irlande)</strong>.
          Supabase est certifié SOC 2 Type II et conforme au RGPD via des clauses contractuelles types (CCT).
        </li>
        <li>
          <strong>Upstash Inc.</strong> (États-Unis) — cache Redis utilisé pour la limitation du débit.
          Seules les adresses IP anonymisées sont traitées, durant 60 secondes maximum.
          Upstash propose des instances dans l&apos;UE et est conforme au RGPD via CCT.
        </li>
        <li>
          <strong>Vercel Inc.</strong> (États-Unis) — hébergement de l&apos;application web.
          Vercel est conforme au RGPD via CCT. Les logs de déploiement ne contiennent pas de données personnelles.
        </li>
      </ul>
      <p>
        Aucune donnée n&apos;est transférée en dehors de l&apos;Espace Économique Européen sans garanties adéquates.
      </p>

      {/* ─── 6. Durée de conservation ─────────────────────────── */}
      <h2>6. Durée de conservation</h2>
      <ul>
        <li>
          <strong>Compte actif</strong> — vos données sont conservées aussi longtemps que votre compte est actif
          et le service utilisé.
        </li>
        <li>
          <strong>Comptes archivés</strong> — les comptes de trading que vous archivez sont conservés
          <strong> 12 mois</strong> afin de vous permettre de les restaurer, puis supprimés définitivement.
        </li>
        <li>
          <strong>Après suppression de compte</strong> — l&apos;intégralité de vos données est supprimée
          immédiatement et de manière irréversible dès l&apos;exercice de votre droit à l&apos;effacement
          (voir section 8).
        </li>
        <li>
          <strong>Adresses IP (rate limiting)</strong> — conservées en mémoire pendant 60 secondes maximum, non persistées.
        </li>
        <li>
          <strong>Logs applicatifs</strong> — conservés <strong>30 jours</strong> à des fins de débogage,
          puis supprimés automatiquement.
        </li>
      </ul>

      {/* ─── 7. Sécurité ──────────────────────────────────────── */}
      <h2>7. Sécurité des données</h2>
      <p>Nous mettons en œuvre les mesures techniques et organisationnelles suivantes :</p>
      <ul>
        <li>Chiffrement des communications via TLS 1.2+ (HTTPS obligatoire).</li>
        <li>Chiffrement des données au repos par Supabase (AES-256).</li>
        <li>Authentification gérée par Supabase Auth (mots de passe hachés, jamais stockés en clair).</li>
        <li>Vérification d&apos;origine CSRF sur toutes les requêtes mutantes (POST, PATCH, DELETE).</li>
        <li>Limitation du débit des requêtes API pour prévenir les abus.</li>
        <li>Accès à la base de données restreint aux seuls services autorisés via clés d&apos;API sécurisées.</li>
        <li>Row Level Security (RLS) activé sur Supabase — chaque utilisateur ne peut accéder qu&apos;à ses propres données.</li>
      </ul>

      {/* ─── 8. Vos droits ────────────────────────────────────── */}
      <h2>8. Vos droits</h2>
      <p>
        Conformément au RGPD (Règlement UE 2016/679), vous disposez des droits suivants sur vos données personnelles :
      </p>
      <ul>
        <li><strong>Droit d&apos;accès</strong> (Art. 15) — vous pouvez consulter vos données depuis votre profil.</li>
        <li>
          <strong>Droit à la portabilité</strong> (Art. 20) — vous pouvez télécharger l&apos;intégralité de vos
          données au format JSON depuis <strong>Profil → Exporter mes données</strong>.
        </li>
        <li>
          <strong>Droit de rectification</strong> (Art. 16) — vous pouvez modifier votre nom d&apos;affichage
          et votre fuseau horaire depuis votre profil.
        </li>
        <li>
          <strong>Droit à l&apos;effacement</strong> (Art. 17) — vous pouvez supprimer définitivement votre compte
          et toutes vos données depuis <strong>Profil → Supprimer mon compte</strong>.
        </li>
        <li>
          <strong>Droit à la limitation du traitement</strong> (Art. 18) — vous pouvez nous contacter pour
          demander une suspension temporaire du traitement.
        </li>
        <li>
          <strong>Droit d&apos;opposition</strong> (Art. 21) — vous pouvez vous opposer au traitement fondé sur
          notre intérêt légitime.
        </li>
      </ul>
      <p>
        Pour exercer l&apos;un de ces droits, contactez-nous à{" "}
        <a href="mailto:privacy@yourdomain.com">privacy@yourdomain.com</a>. Nous répondrons dans un
        délai maximum de <strong>30 jours</strong>.
      </p>
      <p>
        Vous avez également le droit d&apos;introduire une réclamation auprès de l&apos;autorité de contrôle compétente,
        notamment la <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique et des Libertés) en France :{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
      </p>

      {/* ─── 9. Mineurs ───────────────────────────────────────── */}
      <h2>9. Mineurs</h2>
      <p>
        Bull &amp; Bear est un service destiné aux personnes âgées d&apos;au moins <strong>18 ans</strong>.
        Nous ne collectons pas sciemment de données personnelles concernant des mineurs. Si vous êtes
        parent ou tuteur légal et avez connaissance qu&apos;un mineur nous a fourni des données, contactez-nous
        afin que nous puissions les supprimer.
      </p>

      {/* ─── 10. Modifications ────────────────────────────────── */}
      <h2>10. Modifications de cette politique</h2>
      <p>
        Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. En cas
        de modification substantielle, vous serez informé par e-mail ou via une notification dans l&apos;application
        au moins <strong>14 jours</strong> avant l&apos;entrée en vigueur des changements.
      </p>
      <p>
        La date de dernière mise à jour figure en haut de cette page. Votre utilisation continue du service
        après cette date vaut acceptation des modifications.
      </p>

      {/* ─── 11. Contact ──────────────────────────────────────── */}
      <h2>11. Contact</h2>
      <p>
        Pour toute question relative à cette politique ou à la protection de vos données :{" "}
        <a href="mailto:privacy@yourdomain.com">privacy@yourdomain.com</a>
      </p>
    </LegalShell>
  );
}
