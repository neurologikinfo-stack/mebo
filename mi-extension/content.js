// Aquí NO puedes usar chrome.tabs directamente
// así que mandamos un mensaje al background
chrome.runtime.sendMessage({ action: 'getTabs' }, (response) => {
  if (response?.tabs) {
    console.log('📌 Tabs desde content.js:', response.tabs)
  } else {
    console.warn('⚠️ No recibí tabs')
  }
})
