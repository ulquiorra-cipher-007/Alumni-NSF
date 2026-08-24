export function getDeviceId() {
    let id = localStorage.getItem('device_id');
    if (!id) {
        // Generate a random ID if one doesn't exist
        id = crypto.randomUUID ? crypto.randomUUID() : 'device-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('device_id', id);
    }
    return id;
}

export function getDeviceDetails() {
    return navigator.userAgent;
}