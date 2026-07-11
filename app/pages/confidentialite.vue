<script setup lang="ts">
definePageMeta({ layout: 'legal' })
</script>

<template>
  <div class="prose prose-slate max-w-none">
    <h1>Politique de confidentialité</h1>
    <p class="text-sm text-slate-500">
      Dernière mise à jour : <!-- 🔶 À COMPLÉTER --> [date].
    </p>

    <h2>1. Qui traite vos données</h2>
    <p>
      Ce service est édité par <strong>🔶 [ton nom ou ta raison sociale, ex. « Franck Lebas, entrepreneur individuel »]</strong>,
      contact : <a href="mailto:🔶-ton-email@exemple.com">🔶 [adresse e-mail de contact]</a>.
    </p>

    <h2>2. Données collectées</h2>
    <ul>
      <li><strong>Compte</strong> : adresse e-mail, mot de passe (géré par Supabase, jamais stocké en clair)</li>
      <li><strong>Contenu de CV</strong> : toutes les informations que tu saisis dans l'éditeur (identité, coordonnées, expériences, formation…)</li>
      <li><strong>Documents importés</strong> : si tu utilises la fonction d'import, le fichier (PDF, Word, OpenDocument) que tu déposes est transmis à Mistral AI pour en extraire le contenu, puis n'est pas conservé au-delà du traitement</li>
      <li><strong>Offres d'emploi collées</strong> : texte ou capture d'écran que tu fournis pour générer une variante de CV adaptée</li>
    </ul>

    <h2>3. Pourquoi ces données sont traitées</h2>
    <ul>
      <li>Fournir le service : création, édition, export de CV</li>
      <li>Génération et adaptation de contenu par intelligence artificielle (à ta demande explicite, action par action)</li>
      <li>Sécurité et prévention des abus (limite du nombre de générations IA par 24h)</li>
    </ul>

    <h2>4. Qui reçoit ces données (sous-traitants)</h2>
    <ul>
      <li><strong>Supabase</strong> (hébergement de la base de données et de l'authentification)</li>
      <li><strong>Mistral AI</strong> (analyse et génération de contenu, uniquement pour les actions IA que tu déclenches toi-même)</li>
      <li><strong>Cloudflare</strong> (hébergement de l'application et génération des PDF)</li>
    </ul>
    <p>Aucune donnée n'est vendue ni partagée à des fins publicitaires.</p>

    <h2>5. Durée de conservation</h2>
    <p>
      Tes CV et leur historique de versions sont conservés tant que ton compte existe.
      Tu peux supprimer un CV, une version de l'historique, ou ton compte entier à tout moment
      depuis l'application.
    </p>

    <h2>6. Tes droits</h2>
    <p>
      Conformément au RGPD, tu disposes d'un droit d'accès, de rectification, d'effacement,
      de portabilité et d'opposition sur tes données. Tu peux exercer ces droits directement
      dans l'application (export, suppression) ou en écrivant à
      <a href="mailto:🔶-ton-email@exemple.com">🔶 [adresse e-mail de contact]</a>.
    </p>

    <h2>7. Sécurité</h2>
    <p>
      L'accès à tes CV est protégé par authentification et des règles d'accès strictes
      (chaque utilisateur ne voit que ses propres données). Les échanges sont chiffrés (HTTPS).
    </p>

    <h2>8. Cookies</h2>
    <p>
      Seul un cookie technique de session, nécessaire à l'authentification, est utilisé.
      Aucun cookie publicitaire ou de mesure d'audience tiers.
    </p>

    <h2>9. Modification de cette politique</h2>
    <p>
      Cette politique peut évoluer ; la date de mise à jour en haut de page reflète la dernière version.
    </p>

    <p class="text-sm text-slate-400">
      Ce document est un modèle de départ, pas un avis juridique — à faire relire avant une mise en ligne publique.
    </p>
  </div>
</template>
