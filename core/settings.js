// Per-module settings stored in browser.storage.local under "module:<id>".
// Values not saved yet fall back to the defaults declared in core/registry.js.
(() => {
  const keyFor = (moduleId) => `module:${moduleId}`;

  function defaultsFor(moduleId) {
    const mod = Toolkit.modules.find((m) => m.id === moduleId);
    if (!mod) {
      throw new Error(`Unknown module: ${moduleId}`);
    }

    const defaults = { enabled: mod.defaultEnabled !== false };
    (mod.settings || []).forEach((setting) => {
      defaults[setting.key] = setting.default;
    });
    return defaults;
  }

  async function get(moduleId) {
    const key = keyFor(moduleId);
    const { [key]: stored } = await browser.storage.local.get(key);
    return { ...defaultsFor(moduleId), ...stored };
  }

  async function set(moduleId, values) {
    const current = await get(moduleId);
    await browser.storage.local.set({ [keyFor(moduleId)]: { ...current, ...values } });
  }

  // Calls callback(newSettings) whenever the module's settings change
  function onChange(moduleId, callback) {
    const key = keyFor(moduleId);
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes[key]) {
        callback({ ...defaultsFor(moduleId), ...changes[key].newValue });
      }
    });
  }

  Toolkit.settings = { get, set, onChange, defaultsFor, keyFor };
})();
