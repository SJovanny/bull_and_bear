import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import type { TocSection } from "@/components/legal-toc";

export const metadata: Metadata = {
  title: "Terms of Service — Bull & Bear",
  description:
    "Terms of Service governing access to and use of the Bull & Bear trading journal.",
  alternates: { canonical: "https://bullandbear.pro/legal/terms" },
};

const SECTIONS: TocSection[] = [
  { id: "object",      labelFr: "1. Objet et acceptation",             labelEn: "1. Purpose & Acceptance" },
  { id: "service",     labelFr: "2. Description du service",           labelEn: "2. Description of Service" },
  { id: "account",     labelFr: "3. Accès et création de compte",      labelEn: "3. Account & Access" },
  { id: "acceptable",  labelFr: "4. Utilisation acceptable",           labelEn: "4. Acceptable Use" },
  { id: "content",     labelFr: "5. Contenu utilisateur",              labelEn: "5. User Content" },
  { id: "financial",   labelFr: "6. Avertissement financier",          labelEn: "6. Financial Disclaimer" },
  { id: "availability",labelFr: "7. Disponibilité du service",         labelEn: "7. Service Availability" },
  { id: "ip",          labelFr: "8. Propriété intellectuelle",         labelEn: "8. Intellectual Property" },
  { id: "termination", labelFr: "9. Résiliation",                      labelEn: "9. Termination" },
  { id: "liability",   labelFr: "10. Limitation de responsabilité",    labelEn: "10. Limitation of Liability" },
  { id: "amendments",  labelFr: "11. Modifications des conditions",    labelEn: "11. Amendments" },
  { id: "governing",   labelFr: "12. Droit applicable",                labelEn: "12. Governing Law" },
  { id: "contact-tos", labelFr: "13. Contact",                         labelEn: "13. Contact" },
];

const FR = (
  <>
    <h2 id="object">1. Objet et acceptation</h2>
    <p>
      Les présentes conditions générales d&apos;utilisation (ci-après « CGU ») régissent l&apos;accès et l&apos;utilisation
      du service Bull &amp; Bear, journal de trading en ligne accessible à l&apos;adresse{" "}
      <strong>bullandbear.pro</strong>, édité par <strong>Bull &amp; Bear</strong> (ci-après « l&apos;Éditeur »).
    </p>
    <p>
      En créant un compte ou en utilisant le service, vous acceptez sans réserve les présentes CGU.
      Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser le service.
    </p>

    <h2 id="service">2. Description du service</h2>
    <p>Bull &amp; Bear est une application web de journalisation et d&apos;analyse de trading permettant de :</p>
    <ul>
      <li>Enregistrer et suivre ses trades (entrée, sortie, résultat, notes).</li>
      <li>Tenir un journal de trading quotidien (conditions de marché, psychologie, leçons).</li>
      <li>Analyser ses performances via des statistiques et graphiques.</li>
      <li>Importer des historiques de trades depuis des courtiers compatibles.</li>
      <li>Gérer plusieurs comptes de trading séparément.</li>
    </ul>
    <p>
      Bull &amp; Bear est un <strong>outil d&apos;analyse personnelle</strong>. Il ne constitue en aucun cas un conseil
      en investissement, une recommandation d&apos;achat ou de vente, ni un service de gestion de portefeuille réglementé.
    </p>

    <h2 id="account">3. Accès et création de compte</h2>
    <p>L&apos;accès aux fonctionnalités du service nécessite la création d&apos;un compte. Vous vous engagez à :</p>
    <ul>
      <li>Fournir des informations exactes et les maintenir à jour.</li>
      <li>Choisir un mot de passe robuste et le garder confidentiel.</li>
      <li>Ne pas partager vos identifiants avec des tiers.</li>
      <li>Notifier immédiatement l&apos;Éditeur de tout accès non autorisé à votre compte.</li>
    </ul>
    <p>
      Vous devez être âgé d&apos;au moins <strong>18 ans</strong>. L&apos;Éditeur se réserve le droit de suspendre ou
      supprimer tout compte dont l&apos;utilisation serait contraire aux présentes CGU.
    </p>

    <h2 id="acceptable">4. Utilisation acceptable</h2>
    <p>Il vous est expressément interdit de :</p>
    <ul>
      <li>Utiliser le service à des fins illicites, frauduleuses ou contraires à l&apos;ordre public.</li>
      <li>Tenter de contourner les mécanismes d&apos;authentification ou de sécurité.</li>
      <li>Soumettre des requêtes automatisées (bots, scrapers) sans autorisation écrite préalable.</li>
      <li>Transmettre des données de trading appartenant à des tiers sans leur consentement.</li>
      <li>Importer du contenu malveillant via les fonctionnalités d&apos;import.</li>
      <li>Tenter de déstabiliser l&apos;infrastructure technique du service (DDoS, injection SQL, etc.).</li>
      <li>Revendre, sous-licencier ou exploiter commercialement le service sans autorisation.</li>
    </ul>

    <h2 id="content">5. Contenu utilisateur</h2>
    <p>
      Vous restez <strong>seul propriétaire</strong> de l&apos;ensemble des données et contenus que vous saisissez
      (trades, notes, journaux, captures d&apos;écran).
    </p>
    <p>
      Vous accordez à l&apos;Éditeur une licence limitée, non exclusive et gratuite, aux seules fins d&apos;héberger,
      stocker, afficher et transmettre vos données pour vous fournir le service. Cette licence prend fin à
      la suppression de votre compte.
    </p>
    <p>
      L&apos;Éditeur n&apos;accède à vos données que dans les cas strictement nécessaires à la maintenance technique ou
      à la résolution de problèmes, et uniquement avec votre accord préalable sauf obligation légale contraire.
    </p>

    <h2 id="financial">6. Avertissement — Pas de conseil financier</h2>
    <p>
      Bull &amp; Bear est un <strong>outil d&apos;auto-analyse</strong>. Les informations, statistiques et analyses
      générées sont fournies à titre informatif uniquement et ne constituent pas des conseils en investissement
      au sens de la directive MiFID II.
    </p>
    <p>
      Le trading de produits financiers implique un risque de perte en capital pouvant dépasser votre investissement
      initial. Les performances passées ne préjugent pas des performances futures. L&apos;Éditeur décline toute
      responsabilité quant aux décisions de trading prises sur la base des analyses générées par le service.
    </p>
    <p>
      Pour des conseils financiers personnalisés, consultez un <strong>conseiller en investissement agréé</strong> par
      l&apos;AMF ou l&apos;autorité compétente de votre pays.
    </p>

    <h2 id="availability">7. Disponibilité du service</h2>
    <p>
      L&apos;Éditeur s&apos;efforce de maintenir le service disponible 24h/24, 7j/7, mais ne peut garantir une
      disponibilité ininterrompue. Des interruptions peuvent survenir pour maintenance, mises à jour ou
      événements hors du contrôle de l&apos;Éditeur.
    </p>
    <p>
      L&apos;Éditeur ne saurait être tenu responsable des interruptions de service ou pertes de données liées à des
      défaillances techniques ou actes de tiers, dans la limite permise par la loi applicable.
    </p>

    <h2 id="ip">8. Propriété intellectuelle</h2>
    <p>
      L&apos;ensemble des éléments constitutifs du service (code source, design, logo, marque, textes, graphiques)
      est la propriété exclusive de l&apos;Éditeur et est protégé par le droit de la propriété intellectuelle.
      Toute reproduction ou utilisation non autorisée est strictement interdite.
    </p>

    <h2 id="termination">9. Résiliation</h2>
    <p>
      Vous pouvez résilier votre compte à tout moment depuis <strong>Profil → Supprimer mon compte</strong>.
      La suppression est immédiate et définitive : toutes vos données sont effacées sans possibilité de récupération.
    </p>
    <p>
      L&apos;Éditeur se réserve le droit de suspendre ou supprimer votre compte sans préavis en cas de violation des
      présentes CGU ou d&apos;activité frauduleuse. Vous serez notifié par e-mail dans les meilleurs délais.
    </p>

    <h2 id="liability">10. Limitation de responsabilité</h2>
    <p>Dans les limites autorisées par la loi, la responsabilité de l&apos;Éditeur ne saurait être engagée pour :</p>
    <ul>
      <li>Les pertes financières résultant de décisions de trading prises en utilisant le service.</li>
      <li>L&apos;inexactitude de données importées depuis des courtiers tiers.</li>
      <li>La perte de données due à des événements hors du contrôle de l&apos;Éditeur.</li>
      <li>Les dommages indirects, consécutifs ou spéciaux de quelque nature que ce soit.</li>
    </ul>

    <h2 id="amendments">11. Modifications des conditions</h2>
    <p>
      L&apos;Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Vous serez informé de toute
      modification substantielle par e-mail ou notification dans l&apos;application au moins <strong>14 jours</strong> avant
      l&apos;entrée en vigueur des changements. Votre utilisation continue du service vaut acceptation des nouvelles conditions.
    </p>

    <h2 id="governing">12. Droit applicable et juridiction</h2>
    <p>
      Les présentes CGU sont régies par le droit français. En cas de litige, les parties s&apos;efforceront de trouver
      une solution amiable. À défaut, le litige sera porté devant les tribunaux compétents de <strong>Strasbourg</strong>,
      sous réserve des règles impératives de protection des consommateurs applicables dans le pays de résidence de l&apos;utilisateur.
    </p>

    <h2 id="contact-tos">13. Contact</h2>
    <p>
      Pour toute question relative aux présentes CGU :{" "}
      <a href="mailto:bullandbear.journal@gmail.com">bullandbear.journal@gmail.com</a>
    </p>
  </>
);

const EN = (
  <>
    <h2 id="object">1. Purpose & Acceptance</h2>
    <p>
      These Terms of Service (hereinafter "Terms") govern access to and use of the Bull &amp; Bear service,
      an online trading journal available at <strong>bullandbear.pro</strong>, published by{" "}
      <strong>Bull &amp; Bear</strong> (hereinafter "the Publisher").
    </p>
    <p>
      By creating an account or using the service, you unconditionally accept these Terms.
      If you do not accept these Terms, you must not use the service.
    </p>

    <h2 id="service">2. Description of Service</h2>
    <p>Bull &amp; Bear is a web-based trading journal and analytics application that allows users to:</p>
    <ul>
      <li>Record and track trades (entry, exit, result, notes).</li>
      <li>Maintain a daily trading journal (market conditions, psychology, lessons learned).</li>
      <li>Analyse performance through statistics and charts.</li>
      <li>Import trade history from compatible brokers.</li>
      <li>Manage multiple trading accounts independently.</li>
    </ul>
    <p>
      Bull &amp; Bear is a <strong>personal analysis tool</strong>. It does not constitute investment advice,
      a recommendation to buy or sell securities, or a regulated portfolio management service.
    </p>

    <h2 id="account">3. Account & Access</h2>
    <p>Access to service features requires creating a user account. You agree to:</p>
    <ul>
      <li>Provide accurate information and keep it up to date.</li>
      <li>Choose a strong password and keep it confidential.</li>
      <li>Not share your login credentials with third parties.</li>
      <li>Immediately notify the Publisher of any unauthorised access to your account.</li>
    </ul>
    <p>
      You must be at least <strong>18 years old</strong> to create an account. The Publisher reserves the right
      to suspend or delete any account used in violation of these Terms.
    </p>

    <h2 id="acceptable">4. Acceptable Use</h2>
    <p>You are expressly prohibited from:</p>
    <ul>
      <li>Using the service for unlawful, fraudulent, or otherwise illegal purposes.</li>
      <li>Attempting to bypass authentication or security mechanisms.</li>
      <li>Submitting automated requests (bots, scrapers) without prior written authorisation.</li>
      <li>Uploading trading data belonging to third parties without their consent.</li>
      <li>Importing malicious content (scripts, malware) via import features.</li>
      <li>Attempting to destabilise the service infrastructure (DDoS, SQL injection, etc.).</li>
      <li>Reselling, sub-licensing, or commercially exploiting the service without authorisation.</li>
    </ul>

    <h2 id="content">5. User Content</h2>
    <p>
      You remain the <strong>sole owner</strong> of all data and content you enter into the service
      (trades, notes, journals, screenshots).
    </p>
    <p>
      You grant the Publisher a limited, non-exclusive, royalty-free licence solely to host, store, display,
      and transmit your data in order to provide the service. This licence terminates upon deletion of your account.
    </p>
    <p>
      The Publisher will only access your data when strictly necessary for technical maintenance or issue resolution,
      and only with your prior agreement unless required by law.
    </p>

    <h2 id="financial">6. Financial Disclaimer</h2>
    <p>
      Bull &amp; Bear is a <strong>self-analysis tool</strong>. The information, statistics, and analyses generated
      by the service are provided for informational purposes only and do not constitute investment advice within
      the meaning of MiFID II.
    </p>
    <p>
      Trading financial products (equities, futures, currencies, crypto-assets, options, CFDs) involves the risk
      of capital loss that may exceed your initial investment. Past performance is not indicative of future results.
      The Publisher accepts no liability for trading decisions made on the basis of the service&apos;s analyses.
    </p>
    <p>
      If you need personalised financial advice, please consult a <strong>regulated investment adviser</strong> authorised
      by the relevant authority in your country.
    </p>

    <h2 id="availability">7. Service Availability</h2>
    <p>
      The Publisher endeavours to keep the service available 24/7 but cannot guarantee uninterrupted availability.
      The service may be temporarily unavailable for maintenance, updates, or circumstances beyond the Publisher&apos;s control.
    </p>
    <p>
      The Publisher shall not be liable for service interruptions or data loss resulting from technical failures or
      third-party acts, to the extent permitted by applicable law.
    </p>

    <h2 id="ip">8. Intellectual Property</h2>
    <p>
      All elements of the service (source code, design, logo, brand, text, graphics) are the exclusive property
      of the Publisher and are protected by intellectual property law. Any unauthorised reproduction, distribution,
      or use is strictly prohibited.
    </p>

    <h2 id="termination">9. Termination</h2>
    <p>
      You may delete your account at any time via <strong>Profile → Delete my account</strong>.
      Deletion is immediate and permanent: all your data is erased with no possibility of recovery.
    </p>
    <p>
      The Publisher reserves the right to suspend or delete your account without notice in the event of a violation
      of these Terms or fraudulent activity. You will be notified by email as soon as possible.
    </p>

    <h2 id="liability">10. Limitation of Liability</h2>
    <p>To the extent permitted by applicable law, the Publisher shall not be liable for:</p>
    <ul>
      <li>Financial losses resulting from trading decisions made using the service.</li>
      <li>Inaccuracies in data imported from third-party brokers.</li>
      <li>Data loss resulting from events beyond the Publisher&apos;s control.</li>
      <li>Indirect, consequential, or special damages of any kind.</li>
    </ul>

    <h2 id="amendments">11. Amendments</h2>
    <p>
      The Publisher reserves the right to modify these Terms at any time. You will be notified of any material
      change by email or in-app notification at least <strong>14 days</strong> before the changes take effect.
      Continued use of the service after that date constitutes acceptance of the updated Terms. If you do not
      accept the changes, you must stop using the service and delete your account.
    </p>

    <h2 id="governing">12. Governing Law & Jurisdiction</h2>
    <p>
      These Terms are governed by French law. In the event of a dispute, the parties will endeavour to reach an
      amicable resolution. Failing that, the dispute shall be brought before the competent courts of{" "}
      <strong>Strasbourg</strong>, subject to mandatory consumer protection rules applicable in the user&apos;s country
      of residence.
    </p>

    <h2 id="contact-tos">13. Contact</h2>
    <p>
      For any questions relating to these Terms:{" "}
      <a href="mailto:bullandbear.journal@gmail.com">bullandbear.journal@gmail.com</a>
    </p>
  </>
);

export default function TermsPage() {
  return (
    <LegalShell
      title={{ fr: "Conditions générales d'utilisation", en: "Terms of Service" }}
      subtitle={{ fr: "Légal · CGU", en: "Legal · ToS" }}
      lastUpdated="26 April 2026"
      sections={SECTIONS}
      contentFr={FR}
      contentEn={EN}
    />
  );
}
