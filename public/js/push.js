// Wires up the "Enable push alerts" button on the admin dashboard.
// Requires the /push/* routes and a registered service worker at /service-worker.js.

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function enablePushAlerts(buttonEl) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Push notifications are not supported in this browser.');
    return;
  }

  try {
    buttonEl.disabled = true;
    buttonEl.textContent = 'Enabling…';

    const { publicKey } = await fetch('/push/vapid-public-key').then((r) => r.json());
    if (!publicKey) {
      alert('Push notifications are not configured on the server yet (missing VAPID keys).');
      return;
    }

    const registration = await navigator.serviceWorker.register('/service-worker.js');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Notification permission was not granted.');
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    await fetch('/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    buttonEl.textContent = 'Push alerts enabled ✓';
  } catch (err) {
    console.error(err);
    alert('Could not enable push notifications: ' + err.message);
    buttonEl.disabled = false;
    buttonEl.textContent = 'Enable push notifications for new signups';
  }
}
