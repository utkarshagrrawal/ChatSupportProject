const urlBase64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

self.addEventListener('activate', async (e) => {
    const getPublicKey = await fetch(import.meta.env.API_URL + '/notification/key', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const publicKey = await getPublicKey.json()
    const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey.key)
    });
    const response = await fetch(import.meta.env.API_URL + '/notification/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (response.success) {
        console.log('Subscribed successfully')
    }
})

self.addEventListener('push', (e) => {
    self.registration.showNotification("Chat support", { body: e.data.text().body })
})
