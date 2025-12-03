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
  margin: 40px auto;
  padding: 0 20px;
  animation: fadeIn 0.6s ease-out;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
  animation: fadeIn 0.6s ease-out;
}

.section-header h1 {
  font-size: clamp(32px, 5vw, 52px);
  color: #a0162b;
  margin: 6px 0 16px;
  font-weight: 900;
  background: linear-gradient(135deg, #a0162b 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.muted {
  color: rgba(43, 29, 29, 0.7);
  margin: 0;
  font-size: 18px;
}

.about-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.about-content code {
  background: linear-gradient(135deg, rgba(160, 22, 43, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.9em;
  color: #a0162b;
  font-weight: 700;
  border: 1px solid rgba(160, 22, 43, 0.2);
  box-shadow: 0 2px 8px rgba(160, 22, 43, 0.1);
}
</style>
