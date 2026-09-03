<script setup lang="ts">
definePageMeta({
  layout: false,
});

useSeoMeta({
  title: "OG Image Export // CH_SANTANA_OS_V3",
  robots: "noindex, nofollow",
});
</script>

<template>
  <div class="min-h-screen bg-canvas text-body">
    <ClientOnly>
      <OgImageExporter />
    </ClientOnly>
  </div>
</template>
