(() => {
  const key = () => {
    const employee = window.KBAuth?.employee;
    return employee?.id ? 'kb-last-opened:' + employee.id : null;
  };
  function read() {
    try {
      const storageKey = key();
      const entries = storageKey ? JSON.parse(localStorage.getItem(storageKey) || '[]') : [];
      return Array.isArray(entries) ? entries : [];
    } catch { return []; }
  }
  function record(entry) {
    const storageKey = key();
    if (!storageKey) return;
    try {
      const entries = read().filter(item => item.kind !== entry.kind || item.id !== entry.id);
      localStorage.setItem(storageKey, JSON.stringify([entry, ...entries].slice(0, 3)));
      window.dispatchEvent(new Event('kb-last-opened-change'));
    } catch {}
  }
  window.KBLastOpened = Object.freeze({ read, record });
})();
