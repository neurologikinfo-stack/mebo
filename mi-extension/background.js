// Aquí sí puedes usar chrome.tabs
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getTabs') {
    chrome.tabs.query({}, (tabs) => {
      console.log('📌 Tabs desde background:', tabs)
      sendResponse({ tabs })
    })
    return true // necesario para respuestas asíncronas
  }
})
