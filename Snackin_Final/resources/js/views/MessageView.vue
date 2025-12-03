<template>
  <div class="card">
    <div class="card-body">
      <h2 class="card-title">{{ title }}</h2>
      <p class="card-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Message' },
  message: { type: String, default: '' },
});
</script>
