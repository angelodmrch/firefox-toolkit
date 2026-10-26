// Sidebar module: shared helpers used by the background, popup, options and sidebar pages.
(() => {
  const KEYS = {
    sites: "sidebar:sites",
    defaultSite: "sidebar:defaultSite",
    lastSite: "sidebar:lastSite",
    lastSiteLabel: "sidebar:lastSiteLabel"
  };

  const PANEL_PATH = "modules/sidebar/sidebar.html";

  // Saved sites, or the bundled sites.json when none were saved yet
  async function getSites() {
    const { [KEYS.sites]: sites } = await browser.storage.local.get(KEYS.sites);
    if (sites && sites.length > 0) {
      return sites;
    }
    const res = await fetch(browser.runtime.getURL("modules/sidebar/sites.json"));
    return res.json();
  }

  async function getState() {
    const stored = await browser.storage.local.get([KEYS.defaultSite, KEYS.lastSite, KEYS.lastSiteLabel]);
    return {
      sites: await getSites(),
      defaultSite: stored[KEYS.defaultSite] || "",
      lastSite: stored[KEYS.lastSite] || "",
      lastSiteLabel: stored[KEYS.lastSiteLabel] || ""
    };
  }

  async function saveSites(sites, defaultSite) {
    await browser.storage.local.set({
      [KEYS.sites]: sites,
      [KEYS.defaultSite]: defaultSite
    });
  }

  async function setDefaultSite(url) {
    await browser.storage.local.set({ [KEYS.defaultSite]: url });
  }

  async function setLastSite(site) {
    await browser.storage.local.set({
      [KEYS.lastSite]: site.url,
      [KEYS.lastSiteLabel]: site.label
    });
  }

  // Reloads the sidebar panel so it navigates to the current default/last site.
  // A new query string forces Firefox to load the panel again even if the
  // sidebar is currently showing an external site.
  function reloadPanel() {
    return browser.sidebarAction.setPanel({
      panel: `${browser.runtime.getURL(PANEL_PATH)}?t=${Date.now()}`
    });
  }

  // Shows a site in the sidebar and makes it the default.
  // The caller must call browser.sidebarAction.open() first, directly inside
  // the user-input handler, or Firefox refuses to open the sidebar.
  async function showSite(site) {
    await setLastSite(site);
    await setDefaultSite(site.url);
    await reloadPanel();
  }

  Toolkit.sidebar = {
    KEYS,
    getSites,
    getState,
    saveSites,
    setDefaultSite,
    setLastSite,
    reloadPanel,
    showSite
  };
})();
