document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('tabsList')
  const closeAllBtn = document.getElementById('closeAll')

  // Listar pestañas
  chrome.tabs.query({}, (tabs) => {
    list.innerHTML = ''

    tabs.forEach((tab) => {
      const li = document.createElement('li')

      // 🔹 Link a la pestaña
      const link = document.createElement('a')
      link.textContent = tab.title || 'Sin título'
      link.href = tab.url
      link.target = '_blank'

      // 🔹 Botón individual
      const closeBtn = document.createElement('button')
      closeBtn.textContent = '❌'
      closeBtn.style.marginLeft = '8px'
      closeBtn.addEventListener('click', () => {
        chrome.tabs.remove(tab.id, () => {
          li.remove()
        })
      })

      li.appendChild(link)
      li.appendChild(closeBtn)
      list.appendChild(li)
    })
  })

  // 🔹 Botón "Cerrar todas"
  closeAllBtn.addEventListener('click', () => {
    chrome.tabs.query({}, (tabs) => {
      const ids = tabs.map((t) => t.id)
      chrome.tabs.remove(ids, () => {
        list.innerHTML = '' // limpia la lista en el popup
      })
    })
  })
})
