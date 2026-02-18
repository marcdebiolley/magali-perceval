(function () {
  const STORAGE_KEY = 'mp_access_role';

  const YOUNG_ROLE = 'young';
  const GUEST_ROLE = 'guest';

  const YOUNG_CODE = 'JEUNES2026';
  const GUEST_CODE = 'INVITES2026';

  function getRole() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setRole(role) {
    try {
      window.localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // ignore
    }
  }

  function clearRole() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  function normalizeCode(value) {
    return String(value || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '');
  }

  function verifyAndSet(codeRaw) {
    const code = normalizeCode(codeRaw);
    if (code === normalizeCode(YOUNG_CODE)) {
      setRole(YOUNG_ROLE);
      return YOUNG_ROLE;
    }
    if (code === normalizeCode(GUEST_CODE)) {
      setRole(GUEST_ROLE);
      return GUEST_ROLE;
    }
    return null;
  }

  function isLoggedIn() {
    return !!getRole();
  }

  function applyAudience() {
    const role = getRole();

    const nodes = document.querySelectorAll('[data-audience]');
    nodes.forEach(function (el) {
      const audience = (el.getAttribute('data-audience') || '').toLowerCase();
      const visible =
        audience === 'all' ||
        (audience === 'member' && !!role) ||
        (audience === 'guest' && role === GUEST_ROLE) ||
        (audience === 'young' && role === YOUNG_ROLE) ||
        (audience === 'locked' && !role);

      el.hidden = !visible;
    });

    const roleBadges = document.querySelectorAll('[data-role-badge]');
    roleBadges.forEach(function (el) {
      if (role === YOUNG_ROLE) el.textContent = 'Accès : jeunes & fratrie';
      else if (role === GUEST_ROLE) el.textContent = 'Accès : invités';
      else el.textContent = 'Accès : non défini';
    });

    const headers = document.querySelectorAll('[data-site-header]');
    headers.forEach(function (el) {
      el.hidden = !role;
    });
  }

  function mountGate() {
    const form = document.querySelector('[data-gate-form]');
    const input = document.querySelector('[data-gate-input]');
    const error = document.querySelector('[data-gate-error]');
    const reset = document.querySelector('[data-gate-reset]');

    if (!form || !input) return;

    if (reset) {
      reset.addEventListener('click', function (e) {
        e.preventDefault();
        clearRole();
        input.value = '';
        input.focus();
        if (error) error.textContent = '';
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (error) error.textContent = '';

      const role = verifyAndSet(input.value);
      if (!role) {
        if (error) error.textContent = 'Code incorrect.';
        return;
      }

      applyAudience();

      const target = document.querySelector('[data-after-gate]');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function mountSwitchLinks() {
    const nodes = document.querySelectorAll('[data-clear-access]');
    if (!nodes.length) return;
    nodes.forEach(function (n) {
      n.addEventListener('click', function (e) {
        e.preventDefault();
        clearRole();
        applyAudience();

        const gate = document.querySelector('[data-gate]');
        if (gate) {
          gate.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  window.MPAccess = {
    isLoggedIn,
    applyAudience,
    mountGate,
    mountSwitchLinks,
    codes: {
      YOUNG_CODE,
      GUEST_CODE,
    },
  };
})();
