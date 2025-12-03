<template>
  <div class="about-page">
    <div class="section-header">
      <h1>À propos de Snackin</h1>
      <p class="muted">Découvrez notre histoire et notre passion pour les biscuits faits maison</p>
    </div>
    
    <div class="about-content">
      <div class="card-sweet">
        <div class="card-body">
          <h2>Notre histoire</h2>
          <p>
            Snackin est né d'une passion pour les biscuits faits maison. Nous créons des biscuits délicieux,
            frais et faits avec amour à Montréal. Chaque biscuit est préparé avec soin en utilisant des ingrédients
            de qualité.
          </p>
        </div>
      </div>
      
      <div class="card-sweet">
        <div class="card-body">
          <h2>Notre mission</h2>
          <p>
            Offrir des biscuits qui rendent tout le monde heureux. Croquants dehors, fondants dedans,
            nos biscuits sont parfaits pour toutes les occasions.
          </p>
        </div>
      </div>
      
      <div class="card-sweet">
    <div class="card-body">
          <h2>Technologie</h2>
          <p>
            Cette interface utilise Vue 3, Vue Router et Vite. Les vues se trouvent dans 
            <code>resources/js/views</code> et la navigation est déclarée dans <code>resources/js/router/index.js</code>.
      </p>
          <p>
            Tout le front monopage est maintenant en Vue pour une expérience utilisateur optimale.
      </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// vue statique
</script>

<style scoped>
.about-page {
  max-width: 1100px;
  margin: 34px auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h1 {
  font-size: clamp(28px, 4vw, 46px);
  color: #a0162b;
  margin: 6px 0 10px;
}

.muted {
  color: rgba(43, 29, 29, 0.7);
  margin: 0;
}

.about-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
}

.about-content code {
  background: rgba(160, 22, 43, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #a0162b;
}
</style>
