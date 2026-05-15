import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import type { TocSection } from "@/components/legal-toc";

export const metadata: Metadata = {
  title: "Privacy Policy — Data Protection & GDPR · Bull & Bear",
  description:
    "How Bull & Bear collects, uses, and protects your personal data in compliance with GDPR. No advertising cookies, no data selling. Hosted in the EU. You can delete your account at any time.",
  alternates: { canonical: "https://bullandbear.pro/legal/privacy-policy" },
  openGraph: {
    title: "Privacy Policy — Data Protection & GDPR · Bull & Bear",
    description:
      "How Bull & Bear collects, uses, and protects your personal data. GDPR compliant, no advertising cookies, no data selling.",
    url: "https://bullandbear.pro/legal/privacy-policy",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Bull & Bear - Privacy Policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — Bull & Bear",
    description:
      "How Bull & Bear protects your personal data. GDPR compliant, no advertising cookies, no data selling.",
    images: ["/og-image.png"],
  },
};

const SECTIONS: TocSection[] = [
  { id: "controller",    labelFr: "1. Responsable du traitement",           labelEn: "1. Data Controller" },
  { id: "data",          labelFr: "2. Données collectées",                  labelEn: "2. Data We Collect" },
  { id: "purposes",      labelFr: "3. Finalités & bases légales",           labelEn: "3. Purposes & Legal Bases" },
  { id: "emotional",     labelFr: "4. Données émotionnelles",               labelEn: "4. Emotional State Data" },
  { id: "processors",    labelFr: "5. Sous-traitants & transferts",         labelEn: "5. Sub-processors & Transfers" },
  { id: "retention",     labelFr: "6. Durée de conservation",               labelEn: "6. Data Retention" },
  { id: "security",      labelFr: "7. Sécurité",                            labelEn: "7. Security" },
  { id: "rights",        labelFr: "8. Vos droits",                          labelEn: "8. Your Rights" },
  { id: "minors",        labelFr: "9. Mineurs",                             labelEn: "9. Minors" },
  { id: "changes",       labelFr: "10. Modifications",                      labelEn: "10. Policy Changes" },
  { id: "contact-legal", labelFr: "11. Contact",                            labelEn: "11. Contact" },
];

const FR = (
  <>
    <h2 id="controller">1. Responsable du traitement</h2>
    <p>
      Bull &amp; Bear est un journal de trading en ligne édité par <strong>Bull &amp; Bear</strong>,
      situé à <strong>Strasbourg, France</strong>.
    </p>
    <p>
      Pour toute question relative à la protection de vos données :{" "}
      <a href="mailto:bullandbear.journal@gmail.com">bullandbear.journal@gmail.com</a>.
    </p>

    <h2 id="data">2. Données personnelles collectées</h2>
    <p>Nous collectons uniquement les données strictement nécessaires au fonctionnement du service :</p>

    <h3>2.1 Données d&apos;identité et de contact</h3>
    <ul>
      <li><strong>Adresse e-mail</strong> — création de compte et authentification.</li>
      <li><strong>Nom d&apos;affichage</strong> — optionnel, personnalise votre interface.</li>
      <li><strong>Fuseau horaire</strong> — optionnel, affichage correct des horaires de trading.</li>
    </ul>

    <h3>2.2 Données de trading (contenu utilisateur)</h3>
    <ul>
      <li>Informations sur vos comptes de trading (nom, courtier, devise, solde initial).</li>
      <li>Historique de trades (symbole, prix, quantité, résultat, dates).</li>
      <li>Journaux quotidiens (conditions de marché, état émotionnel, notes, captures d&apos;écran).</li>
    </ul>
    <p>Ces données sont exclusivement des contenus que vous saisissez volontairement. Elles ne sont ni revendues, ni partagées à des fins publicitaires.</p>

    <h3>2.3 Données de navigation</h3>
    <ul>
      <li><strong>Adresse IP</strong> — collectée temporairement pour la limitation du débit (anti-abus). Non conservée au-delà de 60 secondes.</li>
      <li><strong>Cookies de session</strong> — nécessaires à l&apos;authentification (exemptés du consentement au titre de la directive ePrivacy).</li>
    </ul>
    <p>Nous n&apos;utilisons <strong>aucun cookie analytique, traceur publicitaire ou pixel tiers</strong>.</p>

    <h2 id="purposes">3. Finalités du traitement et bases légales</h2>
    <table>
      <thead>
        <tr><th>Finalité</th><th>Base légale (RGPD)</th></tr>
      </thead>
      <tbody>
        <tr><td>Création et gestion de votre compte</td><td>Exécution du contrat (Art. 6.1.b)</td></tr>
        <tr><td>Authentification sécurisée</td><td>Exécution du contrat (Art. 6.1.b)</td></tr>
        <tr><td>Stockage et affichage de vos trades et journaux</td><td>Exécution du contrat (Art. 6.1.b)</td></tr>
        <tr><td>Limitation du débit des requêtes (sécurité)</td><td>Intérêt légitime (Art. 6.1.f)</td></tr>
        <tr><td>E-mails transactionnels (confirmation, réinitialisation)</td><td>Exécution du contrat (Art. 6.1.b)</td></tr>
      </tbody>
    </table>
    <p>Nous ne procédons à <strong>aucun profilage automatisé</strong> ni prise de décision automatique produisant des effets juridiques.</p>

    <h2 id="emotional">4. Données relatives à l&apos;état émotionnel</h2>
    <p>
      Notre journal vous permet de documenter votre état émotionnel (calme, anxieux, confiant…). Ces données
      peuvent constituer des <strong>données sensibles</strong> au sens de l&apos;article 9 du RGPD.
    </p>
    <p>
      En les saisissant, vous consentez explicitement à leur traitement dans le seul but d&apos;améliorer votre
      analyse personnelle de trading. Elles ne sont accessibles qu&apos;à vous et ne sont jamais communiquées à des tiers.
    </p>

    <h2 id="processors">5. Sous-traitants et transferts de données</h2>
    <ul>
      <li>
        <strong>Supabase Inc.</strong> (États-Unis) — base de données et authentification.
        Données stockées en <strong>EU West (Irlande)</strong>. Certifié SOC 2 Type II, conforme au RGPD via CCT.
      </li>
      <li>
        <strong>Upstash Inc.</strong> (États-Unis) — cache Redis pour la limitation du débit.
        Seules les IP anonymisées sont traitées, 60 secondes maximum. Conforme au RGPD via CCT.
      </li>
      <li>
        <strong>Vercel Inc.</strong> (États-Unis) — hébergement de l&apos;application web.
        Conforme au RGPD via CCT. Les logs ne contiennent pas de données personnelles.
      </li>
    </ul>
    <p>Aucune donnée n&apos;est transférée hors de l&apos;EEE sans garanties adéquates.</p>

    <h2 id="retention">6. Durée de conservation</h2>
    <ul>
      <li><strong>Compte actif</strong> — données conservées tant que votre compte est actif.</li>
      <li><strong>Comptes archivés</strong> — conservés <strong>12 mois</strong> pour restauration possible, puis supprimés définitivement.</li>
      <li><strong>Après suppression de compte</strong> — suppression immédiate et irréversible.</li>
      <li><strong>Adresses IP (rate limiting)</strong> — 60 secondes maximum, non persistées.</li>
      <li><strong>Logs applicatifs</strong> — <strong>30 jours</strong> à des fins de débogage, puis supprimés automatiquement.</li>
    </ul>

    <h2 id="security">7. Sécurité des données</h2>
    <ul>
      <li>Chiffrement des communications via TLS 1.2+ (HTTPS obligatoire).</li>
      <li>Chiffrement des données au repos par Supabase (AES-256).</li>
      <li>Mots de passe hachés, jamais stockés en clair.</li>
      <li>Vérification CSRF sur toutes les requêtes mutantes.</li>
      <li>Limitation du débit des requêtes API.</li>
      <li>Row Level Security (RLS) activé — chaque utilisateur n&apos;accède qu&apos;à ses propres données.</li>
    </ul>

    <h2 id="rights">8. Vos droits</h2>
    <p>Conformément au RGPD (Règlement UE 2016/679), vous disposez des droits suivants :</p>
    <ul>
      <li><strong>Droit d&apos;accès</strong> (Art. 15) — consultez vos données depuis votre profil.</li>
      <li><strong>Droit à la portabilité</strong> (Art. 20) — téléchargez vos données au format JSON via <strong>Profil → Exporter mes données</strong>.</li>
      <li><strong>Droit de rectification</strong> (Art. 16) — modifiez votre nom et fuseau horaire depuis votre profil.</li>
      <li><strong>Droit à l&apos;effacement</strong> (Art. 17) — supprimez votre compte via <strong>Profil → Supprimer mon compte</strong>.</li>
      <li><strong>Droit à la limitation du traitement</strong> (Art. 18) — contactez-nous pour une suspension temporaire.</li>
      <li><strong>Droit d&apos;opposition</strong> (Art. 21) — opposez-vous au traitement fondé sur notre intérêt légitime.</li>
    </ul>
    <p>
      Pour exercer ces droits :{" "}
      <a href="mailto:bullandbear.journal@gmail.com">bullandbear.journal@gmail.com</a>. Réponse dans un délai maximum de <strong>30 jours</strong>.
    </p>
    <p>
      Vous pouvez également déposer une réclamation auprès de la <strong>CNIL</strong> :{" "}
      <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
    </p>

    <h2 id="minors">9. Mineurs</h2>
    <p>
      Bull &amp; Bear est destiné aux personnes d&apos;au moins <strong>18 ans</strong>. Nous ne collectons pas sciemment
      de données concernant des mineurs. Contactez-nous si vous pensez qu&apos;un mineur nous a fourni des données.
    </p>

    <h2 id="changes">10. Modifications de cette politique</h2>
    <p>
      Nous nous réservons le droit de modifier cette politique à tout moment. En cas de modification substantielle,
      vous serez informé par e-mail ou notification dans l&apos;application au moins <strong>14 jours</strong> avant l&apos;entrée
      en vigueur des changements. Votre utilisation continue du service vaut acceptation.
    </p>

    <h2 id="contact-legal">11. Contact</h2>
    <p>
      Pour toute question relative à cette politique :{" "}
      <a href="mailto:bullandbear.journal@gmail.com">bullandbear.journal@gmail.com</a>
    </p>
  </>
);

const EN = (
  <>
    <h2 id="controller">1. Data Controller</h2>
    <p>
      Bull &amp; Bear is an online trading journal published by <strong>Bull &amp; Bear</strong>,
      based in <strong>Strasbourg, France</strong>.
    </p>
    <p>
      For any questions regarding the protection of your personal data:{" "}
      <a href="mailto:bullandbear.journal@gmail.com">bullandbear.journal@gmail.com</a>.
    </p>

    <h2 id="data">2. Data We Collect</h2>
    <p>We only collect data strictly necessary to operate the service:</p>

    <h3>2.1 Identity & Contact Data</h3>
    <ul>
      <li><strong>Email address</strong> — used for account creation and authentication.</li>
      <li><strong>Display name</strong> — optional, personalises your interface.</li>
      <li><strong>Timezone</strong> — optional, ensures correct display of trading times.</li>
    </ul>

    <h3>2.2 Trading Data (User Content)</h3>
    <ul>
      <li>Trading account details (name, broker, currency, initial balance).</li>
      <li>Trade history (symbol, price, quantity, result, entry/exit dates).</li>
      <li>Daily journals (market conditions, emotional state, notes, screenshots).</li>
    </ul>
    <p>This data is exclusively content you voluntarily enter. It is never sold or shared for advertising purposes.</p>

    <h3>2.3 Browsing Data</h3>
    <ul>
      <li><strong>IP address</strong> — temporarily collected for API rate limiting (anti-abuse). Not retained beyond 60 seconds.</li>
      <li><strong>Session cookies</strong> — required for authentication (strictly functional, exempt from consent under the ePrivacy Directive).</li>
    </ul>
    <p>We use <strong>no analytics cookies, advertising trackers, or third-party pixels</strong>.</p>

    <h2 id="purposes">3. Purposes & Legal Bases</h2>
    <table>
      <thead>
        <tr><th>Purpose</th><th>Legal Basis (GDPR)</th></tr>
      </thead>
      <tbody>
        <tr><td>Account creation and management</td><td>Performance of contract (Art. 6.1.b)</td></tr>
        <tr><td>Secure authentication</td><td>Performance of contract (Art. 6.1.b)</td></tr>
        <tr><td>Storage and display of your trades and journals</td><td>Performance of contract (Art. 6.1.b)</td></tr>
        <tr><td>API rate limiting (security)</td><td>Legitimate interest (Art. 6.1.f)</td></tr>
        <tr><td>Transactional emails (confirmation, password reset)</td><td>Performance of contract (Art. 6.1.b)</td></tr>
      </tbody>
    </table>
    <p>We do <strong>not engage in automated profiling</strong> or automated decision-making that produces legal effects.</p>

    <h2 id="emotional">4. Emotional State Data</h2>
    <p>
      Our trading journal lets you document your emotional state during sessions (e.g. calm, anxious, confident).
      This psychological data may constitute <strong>sensitive data</strong> under Article 9 of the GDPR.
    </p>
    <p>
      By entering this information, you explicitly consent to its processing solely to improve your personal trading
      analysis. This data is accessible only to you and is never shared with third parties.
    </p>

    <h2 id="processors">5. Sub-processors & Data Transfers</h2>
    <ul>
      <li>
        <strong>Supabase Inc.</strong> (USA) — database hosting and authentication.
        Data stored in <strong>EU West (Ireland)</strong>. SOC 2 Type II certified, GDPR-compliant via SCCs.
      </li>
      <li>
        <strong>Upstash Inc.</strong> (USA) — Redis cache for rate limiting.
        Only anonymised IPs are processed, for a maximum of 60 seconds. GDPR-compliant via SCCs.
      </li>
      <li>
        <strong>Vercel Inc.</strong> (USA) — web application hosting.
        GDPR-compliant via SCCs. Deployment logs contain no personal data.
      </li>
    </ul>
    <p>No data is transferred outside the European Economic Area without adequate safeguards.</p>

    <h2 id="retention">6. Data Retention</h2>
    <ul>
      <li><strong>Active account</strong> — data retained as long as your account is active.</li>
      <li><strong>Archived accounts</strong> — retained for <strong>12 months</strong> to allow restoration, then permanently deleted.</li>
      <li><strong>After account deletion</strong> — all data is immediately and irreversibly deleted.</li>
      <li><strong>IP addresses (rate limiting)</strong> — held in memory for a maximum of 60 seconds, not persisted.</li>
      <li><strong>Application logs</strong> — retained for <strong>30 days</strong> for debugging, then automatically deleted.</li>
    </ul>

    <h2 id="security">7. Security</h2>
    <p>We implement the following technical and organisational measures:</p>
    <ul>
      <li>All communications encrypted via TLS 1.2+ (HTTPS enforced).</li>
      <li>Data at rest encrypted by Supabase (AES-256).</li>
      <li>Passwords hashed, never stored in plain text.</li>
      <li>CSRF verification on all mutating requests (POST, PATCH, DELETE).</li>
      <li>API rate limiting to prevent abuse.</li>
      <li>Row Level Security (RLS) enabled on Supabase — each user can only access their own data.</li>
    </ul>

    <h2 id="rights">8. Your Rights</h2>
    <p>Under the GDPR (EU Regulation 2016/679), you have the following rights over your personal data:</p>
    <ul>
      <li><strong>Right of access</strong> (Art. 15) — view your data from your profile.</li>
      <li><strong>Right to data portability</strong> (Art. 20) — download all your data as JSON via <strong>Profile → Export my data</strong>.</li>
      <li><strong>Right to rectification</strong> (Art. 16) — edit your display name and timezone from your profile.</li>
      <li><strong>Right to erasure</strong> (Art. 17) — permanently delete your account via <strong>Profile → Delete my account</strong>.</li>
      <li><strong>Right to restriction of processing</strong> (Art. 18) — contact us to request a temporary suspension of processing.</li>
      <li><strong>Right to object</strong> (Art. 21) — object to processing based on our legitimate interest.</li>
    </ul>
    <p>
      To exercise any of these rights:{" "}
      <a href="mailto:bullandbear.journal@gmail.com">bullandbear.journal@gmail.com</a>. We will respond within <strong>30 days</strong>.
    </p>
    <p>
      You also have the right to lodge a complaint with a supervisory authority — in France, the <strong>CNIL</strong>:{" "}
      <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
    </p>

    <h2 id="minors">9. Minors</h2>
    <p>
      Bull &amp; Bear is intended for users aged at least <strong>18 years old</strong>. We do not knowingly collect
      personal data from minors. If you are a parent or guardian and believe a minor has provided us with data,
      please contact us so we can delete it.
    </p>

    <h2 id="changes">10. Policy Changes</h2>
    <p>
      We reserve the right to modify this privacy policy at any time. In the event of a material change,
      you will be notified by email or in-app notification at least <strong>14 days</strong> before the changes
      take effect. Continued use of the service after that date constitutes acceptance of the changes.
    </p>

    <h2 id="contact-legal">11. Contact</h2>
    <p>
      For any questions relating to this policy:{" "}
      <a href="mailto:bullandbear.journal@gmail.com">bullandbear.journal@gmail.com</a>
    </p>
  </>
);

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title={{ fr: "Politique de confidentialité", en: "Privacy Policy" }}
      subtitle={{ fr: "Légal · RGPD", en: "Legal · GDPR" }}
      lastUpdated="26 April 2026"
      sections={SECTIONS}
      contentFr={FR}
      contentEn={EN}
    />
  );
}
