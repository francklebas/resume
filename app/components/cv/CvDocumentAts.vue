<script setup lang="ts">
import type { CvContent } from '~/types/cv'

defineProps<{ content: CvContent }>()
</script>

<template>
  <div class="cv-ats">
    <!-- Header -->
    <header class="ats-header">
      <h1 class="ats-name">{{ content.header.name }}</h1>
      <p class="ats-meta">{{ content.header.title }}</p>
      <p v-if="content.header.tagline" class="ats-meta">{{ content.header.tagline }}</p>
      <p v-if="content.header.availableImmediately" class="ats-meta"><strong>Available immediately</strong></p>
      <p class="ats-meta">{{ content.header.location }}</p>
      <p class="ats-meta">{{ content.header.phone }}</p>
      <p class="ats-meta">{{ content.header.email }}</p>
      <p class="ats-meta">{{ content.header.linkedin }}</p>
    </header>

    <!-- Profile -->
    <section v-if="content.profile" class="ats-section">
      <h2 class="ats-section-title">Profile</h2>
      <p class="ats-body">{{ content.profile }}</p>
    </section>

    <!-- Skills -->
    <section v-if="content.skills.length" class="ats-section">
      <h2 class="ats-section-title">Core Technical Skills</h2>
      <p v-for="group in content.skills" :key="group.category" class="ats-skill-line">
        <strong>{{ group.category }}:</strong> {{ group.items.join(', ') }}
      </p>
    </section>

    <!-- Experience -->
    <section v-if="content.experiences.length" class="ats-section">
      <h2 class="ats-section-title">Professional Experience</h2>
      <article v-for="(exp, i) in content.experiences" :key="i" class="ats-exp">
        <h3 class="ats-exp-title">{{ exp.title }}</h3>
        <p class="ats-exp-line">
          {{ exp.company }}<span v-if="exp.location"> · {{ exp.location }}</span> · <em>{{ exp.period }}</em>
        </p>
        <p v-if="exp.context" class="ats-exp-context">{{ exp.context }}</p>
        <ul class="ats-bullets">
          <li v-for="(bullet, j) in exp.bullets" :key="j" v-html="richText(bullet)" />
        </ul>
        <p v-if="exp.stack" class="ats-exp-stack"><strong>Stack:</strong> {{ exp.stack }}</p>
      </article>
    </section>

    <!-- Key metrics -->
    <section v-if="content.metrics.length" class="ats-section">
      <h2 class="ats-section-title">Key Metrics</h2>
      <ul class="ats-metrics">
        <li v-for="metric in content.metrics" :key="metric.label">
          <strong>{{ metric.value }}</strong> — {{ metric.label }}
        </li>
      </ul>
    </section>

    <!-- Education -->
    <section v-if="content.education.length" class="ats-section">
      <h2 class="ats-section-title">Education</h2>
      <p v-for="edu in content.education" :key="edu.degree" class="ats-edu">
        <strong>{{ edu.degree }}</strong> · {{ edu.school }}
      </p>
    </section>

    <!-- Languages -->
    <section v-if="content.languages.length" class="ats-section">
      <h2 class="ats-section-title">Languages</h2>
      <p class="ats-body">
        {{ content.languages.map(l => `${l.language} (${l.level})`).join(', ') }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.cv-ats {
  --ink: #111;
  --muted: #555;
  --rule: #ccc;

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

.cv-ats :deep(strong) {
  font-weight: 700;
}

/* Header */
.ats-name {
  font-size: 20pt;
  font-weight: 700;
  margin: 0 0 2mm;
}

.ats-meta {
  color: var(--muted);
  font-size: 9.5pt;
  margin: 0 0 0.8mm;
}

/* Sections */
.ats-section {
  border-top: 0.3pt solid var(--rule);
  margin-top: 6mm;
  padding-top: 5mm;
}

.ats-section-title {
  font-size: 11pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0 0 3.5mm;
  break-after: avoid;
}

.ats-body {
  margin: 0;
}

/* Skills */
.ats-skill-line {
  font-size: 9.5pt;
  margin: 0 0 1.2mm;
}

/* Experience */
.ats-exp {
  margin-bottom: 5mm;
  break-inside: avoid;
}

.ats-exp-title {
  font-size: 11pt;
  font-weight: 700;
  margin: 0 0 0.8mm;
}

.ats-exp-line {
  color: var(--muted);
  margin: 0 0 0.8mm;
  font-size: 9.5pt;
}

.ats-exp-context {
  color: var(--muted);
  font-style: italic;
  font-size: 9.5pt;
  margin: 0 0 1mm;
}

.ats-bullets {
  list-style: disc;
  margin: 0;
  padding-left: 5mm;
}

.ats-bullets li {
  margin-bottom: 0.8mm;
}

.ats-exp-stack {
  color: var(--muted);
  font-size: 9.5pt;
  margin: 1mm 0 0;
}

/* Metrics */
.ats-metrics {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 9.5pt;
}

.ats-metrics li {
  margin-bottom: 1mm;
}

/* Education */
.ats-edu {
  margin: 0 0 1.2mm;
}

/* Impression */
@media print {
  .cv-ats {
    min-height: auto;
  }
}
</style>
