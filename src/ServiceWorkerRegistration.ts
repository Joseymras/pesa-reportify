
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  }
}

export function checkAndPromptForInstall() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 76+ from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install button
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.classList.remove('hidden');
      
      installButton.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, discard it
        deferredPrompt = null;
        
        // Hide the install button
        installButton.classList.add('hidden');
      });
    }
  });
}
