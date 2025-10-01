export function getInitialSidebarColorScript() {
  return `
    try {
      const role = localStorage.getItem("user-role")
      if (role) {
        const saved = localStorage.getItem("sidebar-color-" + role)
        if (saved) {
          let rgb = saved
          if (saved.startsWith("#")) {
            const bigint = parseInt(saved.slice(1), 16)
            const r = (bigint >> 16) & 255
            const g = (bigint >> 8) & 255
            const b = bigint & 255
            rgb = r + " " + g + " " + b
          }
          // aplicar color principal
          document.documentElement.style.setProperty("--primary", rgb)

          // calcular contraste (texto blanco o negro)
          const parts = rgb.split(" ").map(Number)
          const yiq = (parts[0]*299 + parts[1]*587 + parts[2]*114) / 1000
          const contrast = yiq >= 128 ? "0 0 0" : "255 255 255"
          document.documentElement.style.setProperty("--primary-foreground", contrast)
        }
      }
    } catch(e) {
      console.warn("⚠️ No se pudo aplicar color inicial:", e)
    }
  `
}
