try {
  if (localStorage.getItem('bs-bike-store-theme') === 'dark') {
    document.documentElement.classList.add('dark')
  }
} catch (error) {
  console.warn('No fue posible restaurar el tema guardado.', error)
}
