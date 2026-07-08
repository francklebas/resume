<script setup lang="ts">
import type { CvContent } from '~/types/cv'

defineProps<{ content: CvContent }>()
</script>

<template>
  <div class="cv">
    <!-- Header -->
    <header class="cv-header">
      <div class="cv-header-main">
        <h1 class="cv-name">{{ content.header.name }}</h1>
        <p class="cv-title">{{ content.header.title }}</p>
        <p class="cv-meta">{{ content.header.tagline }}</p>
      </div>
      <div class="cv-header-contact">
        <p v-if="content.header.availableImmediately" class="cv-meta cv-available">Available immediately</p>
        <p class="cv-meta">📍 {{ content.header.location }}</p>
        <p class="cv-meta">{{ content.header.phone }}</p>
        <p class="cv-meta">{{ content.header.email }}</p>
        <p class="cv-meta">{{ content.header.linkedin }}</p>
      </div>
    </header>

    <!-- Profile -->
    <section v-if="content.profile" class="cv-section">
      <h2 class="cv-section-title">Profile</h2>
      <p class="cv-body">{{ content.profile }}</p>
    </section>

    <!-- Skills -->
    <section v-if="content.skills.length" class="cv-section">
      <h2 class="cv-section-title">Core Technical Skills</h2>
      <div class="cv-skills-grid">
        <div v-for="group in content.skills" :key="group.category" class="cv-skill-group">
          <span class="cv-skill-label">{{ group.category }}</span>
          <span class="cv-skill-items">{{ group.items.join(' · ') }}</span>
        </div>
      </div>
    </section>

    <!-- Experience -->
    <section v-if="content.experiences.length" class="cv-section">
      <h2 class="cv-section-title">Professional Experience</h2>
      <article v-for="(exp, i) in content.experiences" :key="i" class="cv-exp">
        <h3 class="cv-exp-title">{{ exp.title }}</h3>
        <p class="cv-exp-line">
          <span class="cv-exp-company">{{ exp.company }}</span>
          <span v-if="exp.location" class="cv-exp-loc"> · {{ exp.location }}</span>
          <span class="cv-exp-period"> · <em>{{ exp.period }}</em></span>
        </p>
        <p v-if="exp.context" class="cv-exp-context">{{ exp.context }}</p>
        <ul class="cv-bullets">
          <li v-for="(bullet, j) in exp.bullets" :key="j" v-html="richText(bullet)" />
        </ul>
        <p v-if="exp.stack" class="cv-exp-stack"><strong>Stack:</strong> {{ exp.stack }}</p>
      </article>
    </section>

    <!-- Key metrics -->
    <section v-if="content.metrics.length" class="cv-section">
      <h2 class="cv-section-title">Key Metrics</h2>
      <table class="cv-table cv-table-metrics">
        <tbody>
          <tr v-for="metric in content.metrics" :key="metric.label">
            <th class="cv-metric-value">{{ metric.value }}</th>
            <td class="cv-table-value">{{ metric.label }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Education & Languages -->
    <section v-if="content.education.length || content.languages.length" class="cv-section">
      <h2 class="cv-section-title">Education & Languages</h2>
      <p v-for="edu in content.education" :key="edu.degree" class="cv-edu">
        <strong>{{ edu.degree }}</strong>
        <span class="cv-edu-school"> · {{ edu.school }}</span>
      </p>
      <p v-if="content.languages.length" class="cv-edu cv-languages">
        <span class="cv-lang-label">Languages</span>
        {{ content.languages.map(l => `${l.language} (${l.level})`).join(' · ') }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.cv {
  --accent: #2f5fc4;
  --ink: #222;
  --muted: #6b6b6b;
  --rule: #d8d8d8;

  box-sizing: border-box;
  width: 210mm;
  min-height: 297mm;
  padding: 15mm 18mm;
  background: white;
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10pt;
  line-height: 1.45;
}

.cv :deep(strong) {
  font-weight: 700;
}

/* Header */
.cv-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6mm;
}

.cv-header-contact {
  flex-shrink: 0;
  text-align: right;
}

.cv-name {
  font-size: 23pt;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 0 2mm;
}

.cv-title {
  color: var(--accent);
  font-size: 12pt;
  margin: 0 0 1.5mm;
}

.cv-meta {
  color: var(--muted);
  font-size: 9.5pt;
  margin: 0 0 0.8mm;
}

.cv-available {
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 1.5mm;
}

/* Sections */
.cv-section {
  border-top: 0.3pt solid var(--rule);
  margin-top: 6mm;
  padding-top: 5mm;
}

.cv-section-title {
  color: var(--accent);
  font-size: 11pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0 0 3.5mm;
  break-after: avoid;
}

.cv-body {
  margin: 0;
  text-align: justify;
}

/* Skills grid */
.cv-skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2mm 6mm;
}

.cv-skill-group {
  display: flex;
  gap: 2mm;
  font-size: 9.5pt;
}

.cv-skill-label {
  flex: 0 0 34%;
  background: #f2f2f2;
  color: var(--muted);
  font-weight: 700;
  padding: 1.6mm 3mm;
}

.cv-skill-items {
  flex: 1;
  padding: 1.6mm 3mm;
}

/* Tables (metrics) */
.cv-table {
  width: 100%;
  border-collapse: collapse;
}

.cv-table th,
.cv-table td {
  padding: 1.6mm 3mm;
  text-align: left;
  vertical-align: top;
  font-size: 9.5pt;
}

.cv-table-metrics tr {
  background: #eef3fb;
  border-bottom: 1.2pt solid white;
}

.cv-metric-value {
  width: 20%;
  color: var(--accent);
  font-weight: 700;
}

/* Experience */
.cv-exp {
  margin-bottom: 5mm;
  break-inside: avoid;
}

.cv-exp-title {
  font-size: 11pt;
  font-weight: 700;
  margin: 0 0 0.8mm;
}

.cv-exp-line {
  margin: 0 0 0.8mm;
  font-size: 9.5pt;
}

.cv-exp-company {
  color: var(--accent);
  font-weight: 700;
}

.cv-exp-loc,
.cv-exp-period {
  color: var(--muted);
}

.cv-exp-context {
  color: var(--muted);
  font-style: italic;
  font-size: 9.5pt;
  margin: 0 0 1mm;
}

.cv-bullets {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cv-bullets li {
  padding-left: 6mm;
  text-indent: -3.5mm;
  margin-bottom: 0.8mm;
}

.cv-bullets li::before {
  content: '–';
  margin-right: 2mm;
}

.cv-exp-stack {
  color: var(--muted);
  font-size: 9.5pt;
  margin: 1mm 0 0;
}

/* Education & languages */
.cv-edu {
  margin: 0 0 1.2mm;
}

.cv-edu-school,
.cv-lang-label {
  color: var(--muted);
}

.cv-lang-label {
  font-weight: 700;
  margin-right: 2mm;
}

/* Impression */
@media print {
  .cv {
    min-height: auto;
  }
}
</style>
