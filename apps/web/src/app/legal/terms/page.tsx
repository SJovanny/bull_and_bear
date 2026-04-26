import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — Bull & Bear",
  description: "Conditions générales d'utilisation du service Bull & Bear.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Conditions générales d'utilisation"
      subtitle="Légal · CGU"
      lastUpdated="26 avril 2026"
    >
      {/* ─── 1. Objet ──────────────────────────────────────────── */}
      <h2>1. Objet et acceptation</h2>
      <p>
        Les présentes conditions générales d&apos;utilisation (ci-après « CGU ») régissent l&apos;accès et
        l&apos;utilisation du service Bull &amp; Bear, journal de trading en ligne accessible à l&apos;adresse{" "}
        <strong>[VOTRE DOMAINE]</strong>, édité par <strong>[VOTRE NOM / SOCIÉTÉ]</strong>
        (ci-après « l&apos;Éditeur »).
      </p>
      <p>
        En créant un compte ou en utilisant le service, vous acceptez sans réserve les présentes CGU.
        Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser le service.
      </p>

      {/* ─── 2. Description du service ────────────────────────── */}
      <h2>2. Description du service</h2>
      <p>
        Bull &amp; Bear est une application web de journalisation et d&apos;analyse de trading. Elle permet à
        ses utilisateurs de :
      </p>
      <ul>
        <li>Enregistrer et suivre leurs trades (entrée, sortie, résultat, notes).</li>
        <li>Tenir un journal de trading quotidien (conditions de marché, psychologie, leçons).</li>
        <li>Analyser leurs performances via des statistiques et graphiques.</li>
        <li>Importer des historiques de trades depuis des courtiers compatibles.</li>
        <li>Gérer plusieurs comptes de trading séparément.</li>
      </ul>
      <p>
        Bull &amp; Bear est un <strong>outil d&apos;analyse personnelle</strong>. Il ne constitue en aucun cas
        un conseil en investissement, une recommandation d&apos;achat ou de vente de valeurs mobilières,
        ni un service de gestion de portefeuille réglementé.
      </p>

      {/* ─── 3. Accès au service ───────────────────────────────── */}
      <h2>3. Accès et création de compte</h2>
      <p>
        L&apos;accès aux fonctionnalités du service nécessite la création d&apos;un compte utilisateur. Vous vous
        engagez à :
      </p>
      <ul>
        <li>Fournir des informations exactes et à les maintenir à jour.</li>
        <li>Choisir un mot de passe robuste et à le garder confidentiel.</li>
        <li>Ne pas partager vos identifiants de connexion avec des tiers.</li>
        <li>Notifier immédiatement l&apos;Éditeur de tout accès non autorisé à votre compte.</li>
      </ul>
      <p>
        Vous devez être âgé d&apos;au moins <strong>18 ans</strong> pour créer un compte. L&apos;Éditeur se réserve
        le droit de suspendre ou supprimer tout compte dont les informations seraient inexactes ou
        dont l&apos;utilisation serait contraire aux présentes CGU.
      </p>

      {/* ─── 4. Utilisation acceptable ─────────────────────────── */}
      <h2>4. Utilisation acceptable</h2>
      <p>Il vous est expressément interdit de :</p>
      <ul>
        <li>Utiliser le service à des fins illicites, frauduleuses ou contraires à l&apos;ordre public.</li>
        <li>Tenter de contourner les mécanismes d&apos;authentification ou de sécurité.</li>
        <li>Soumettre des requêtes automatisées (bots, scrapers) sans autorisation écrite préalable.</li>
        <li>Transmettre des données de trading appartenant à des tiers sans leur consentement.</li>
        <li>Importer du contenu malveillant (scripts, malware) via les fonctionnalités d&apos;import.</li>
        <li>Tenter de déstabiliser l&apos;infrastructure technique du service (attaques DDoS, injection SQL, etc.).</li>
        <li>Revendre, sous-licencier ou exploiter commercialement le service sans autorisation.</li>
      </ul>

      {/* ─── 5. Contenu utilisateur ────────────────────────────── */}
      <h2>5. Contenu utilisateur</h2>
      <p>
        Vous restez <strong>seul propriétaire</strong> de l&apos;ensemble des données et contenus que vous
        saisissez dans le service (trades, notes, journaux, captures d&apos;écran).
      </p>
      <p>
        Vous accordez à l&apos;Éditeur une licence limitée, non exclusive, mondiale et gratuite, aux seules
        fins d&apos;héberger, stocker, afficher et transmettre vos données pour vous fournir le service.
        Cette licence prend fin à la suppression de votre compte.
      </p>
      <p>
        L&apos;Éditeur n&apos;accède à vos données que dans les cas strictement nécessaires à la maintenance
        technique ou à la résolution de problèmes, et uniquement avec votre accord préalable sauf
        obligation légale contraire.
      </p>

      {/* ─── 6. Avertissement financier ────────────────────────── */}
      <h2>6. Avertissement — Pas de conseil financier</h2>
      <p>
        Bull &amp; Bear est un <strong>outil d&apos;auto-analyse</strong>. Les informations, statistiques et
        analyses générées par le service sont fournies à titre informatif uniquement et ne constituent
        pas des conseils en investissement au sens de la directive MiFID II.
      </p>
      <p>
        Le trading de produits financiers (actions, contrats à terme, devises, crypto-actifs, options,
        CFD) implique un risque de perte en capital pouvant dépasser votre investissement initial.
        Les performances passées ne préjugent pas des performances futures. L&apos;Éditeur décline toute
        responsabilité quant aux décisions de trading prises sur la base des analyses générées par le service.
      </p>
      <p>
        Si vous avez besoin de conseils financiers personnalisés, consultez un <strong>conseiller en
        investissement agréé</strong> par l&apos;Autorité des Marchés Financiers (AMF) ou l&apos;autorité
        compétente de votre pays.
      </p>

      {/* ─── 7. Disponibilité ──────────────────────────────────── */}
      <h2>7. Disponibilité du service</h2>
      <p>
        L&apos;Éditeur s&apos;efforce de maintenir le service disponible 24h/24 et 7j/7, mais ne peut garantir
        une disponibilité ininterrompue. Le service peut être temporairement indisponible pour des
        opérations de maintenance, des mises à jour ou des circonstances indépendantes de la volonté
        de l&apos;Éditeur.
      </p>
      <p>
        L&apos;Éditeur ne saurait être tenu responsable des interruptions de service, pertes de données
        liées à des défaillances techniques ou des actes de tiers (pannes d&apos;hébergeur, cyberattaques, etc.),
        dans la limite permise par la loi applicable.
      </p>

      {/* ─── 8. Propriété intellectuelle ───────────────────────── */}
      <h2>8. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments constitutifs du service (code source, design, logo, marque, textes,
        graphiques) est la propriété exclusive de l&apos;Éditeur et est protégé par le droit de la propriété
        intellectuelle. Toute reproduction, distribution ou utilisation non autorisée est strictement
        interdite.
      </p>

      {/* ─── 9. Résiliation ────────────────────────────────────── */}
      <h2>9. Résiliation</h2>
      <p>
        Vous pouvez résilier votre compte à tout moment depuis la page <strong>Profil → Supprimer mon compte</strong>.
        La suppression est immédiate et définitive : toutes vos données sont effacées sans possibilité
        de récupération.
      </p>
      <p>
        L&apos;Éditeur se réserve le droit de suspendre ou supprimer votre compte sans préavis en cas de
        violation des présentes CGU, d&apos;activité frauduleuse ou de mise en danger de la sécurité du service.
        Dans ce cas, vous serez notifié par e-mail dans les meilleurs délais.
      </p>

      {/* ─── 10. Limitation de responsabilité ─────────────────── */}
      <h2>10. Limitation de responsabilité</h2>
      <p>
        Dans les limites autorisées par la loi applicable, la responsabilité de l&apos;Éditeur ne saurait
        être engagée pour :
      </p>
      <ul>
        <li>Les pertes financières résultant de décisions de trading prises en utilisant le service.</li>
        <li>L&apos;inexactitude de données importées depuis des courtiers tiers.</li>
        <li>La perte de données due à des événements hors du contrôle de l&apos;Éditeur.</li>
        <li>Les dommages indirects, consécutifs ou spéciaux de quelque nature que ce soit.</li>
      </ul>

      {/* ─── 11. Modifications des CGU ─────────────────────────── */}
      <h2>11. Modifications des conditions</h2>
      <p>
        L&apos;Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Vous serez informé
        de toute modification substantielle par e-mail ou via une notification dans l&apos;application au
        moins <strong>14 jours</strong> avant l&apos;entrée en vigueur des changements.
      </p>
      <p>
        Votre utilisation continue du service après cette date vaut acceptation des nouvelles conditions.
        Si vous refusez les modifications, vous devez cesser d&apos;utiliser le service et supprimer votre compte.
      </p>

      {/* ─── 12. Droit applicable ──────────────────────────────── */}
      <h2>12. Droit applicable et juridiction</h2>
      <p>
        Les présentes CGU sont régies par le droit français. En cas de litige relatif à l&apos;interprétation
        ou à l&apos;exécution des présentes, les parties s&apos;efforceront de trouver une solution amiable.
        À défaut, le litige sera porté devant les tribunaux compétents de <strong>[VILLE]</strong>,
        sous réserve des règles impératives de protection des consommateurs applicables dans le pays
        de résidence de l&apos;utilisateur.
      </p>

      {/* ─── 13. Contact ───────────────────────────────────────── */}
      <h2>13. Contact</h2>
      <p>
        Pour toute question relative aux présentes CGU :{" "}
        <a href="mailto:legal@yourdomain.com">legal@yourdomain.com</a>
      </p>
    </LegalShell>
  );
}
