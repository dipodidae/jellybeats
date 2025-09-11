<script setup lang="ts">
// No logic needed for static about page
</script>

<template>
  <div class="about-page">
    <header class="about-header">
      <img src="/nuxt.svg" alt="Jellybeats Logo" class="logo">
      <h1>About Jellybeats</h1>
    </header>
    <main>
      <section class="about-content">
        <p>
          <strong>Jellybeats</strong> is a modern, open-source music streaming app powered by Nuxt and Jellyfin. It lets you browse playlists, stream tracks, and enjoy your music collection with a beautiful, fast, and privacy-friendly interface.
        </p>
        <ul>
          <li>🎵 Powered by <a href="https://jellyfin.org/" target="_blank" rel="noopener">Jellyfin</a></li>
          <li>⚡ Built with <a href="https://nuxt.com/" target="_blank" rel="noopener">Nuxt 4</a></li>
          <li>🖥️ Responsive, PWA-ready UI</li>
          <li>🔒 No key leakage – all API requests are securely proxied</li>
        </ul>
        <p>
          <em>Made with ❤️ by the Jellybeats community.</em>
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  color: #222;
}
.about-header {
  text-align: center;
  margin-bottom: 2rem;
}
.logo {
  width: 64px;
  margin-bottom: 1rem;
}
.about-content ul {
  margin: 1.5rem 0;
  padding-left: 1.2rem;
}
.about-content li {
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
}
.about-content a {
  color: #06b6d4;
  text-decoration: underline;
}
</style>
