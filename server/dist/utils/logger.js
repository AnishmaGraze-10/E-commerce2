export function logActivity(activity, meta) {
    const entry = { ts: new Date().toISOString(), activity, ...(meta || {}) };
    // For demo purposes log to console. Replace with DB collection if needed.
    console.log('[ACTIVITY]', JSON.stringify(entry));
}
