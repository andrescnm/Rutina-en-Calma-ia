export async function auditLog(event: string, target?: string, payload?: any) {
  try {
    await fetch('/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        target,
        payload,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}
