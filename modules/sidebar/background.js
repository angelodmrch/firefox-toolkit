// Sidebar module: right-click menu "Abrir na sidebar" with one entry per site.
(() => {
  const { settings, sidebar } = globalThis.Toolkit;

  // Not available on Firefox for Android
  if (!browser.menus || !browser.sidebarAction) {
    return;
  }

  const PARENT_ID = "sidebar";
  const ITEM_PREFIX = "sidebar-site-";

  // Rebuilds run one after another so menu ids never collide
  let pending = Promise.resolve();

  function rebuildMenu() {
    pending = pending.then(buildMenu).catch((error) => {
      console.error("[Toolkit/Sidebar] Error creating context menu items:", error);
    });
    return pending;
  }

  async function buildMenu() {
    // Removing the parent also removes its children, without touching other modules' menus
    await browser.menus.remove(PARENT_ID).catch(() => {});

    const config = await settings.get("sidebar");
    if (!config.enabled) {
      return;
    }

    const sites = await sidebar.getSites();
    browser.menus.create({
      id: PARENT_ID,
      title: "Abrir na sidebar",
      contexts: ["all"]
    });
    sites.forEach((site, index) => {
      browser.menus.create({
        id: `${ITEM_PREFIX}${index}`,
        parentId: PARENT_ID,
        title: site.label,
        contexts: ["all"]
      });
    });
  }

  browser.menus.onClicked.addListener((info) => {
    const id = String(info.menuItemId);
    if (!id.startsWith(ITEM_PREFIX)) {
      return;
    }

    // Open sidebar FIRST (must be in direct user input handler)
    browser.sidebarAction.open();

    // Sites are read again because the background page may have been unloaded
    const index = Number(id.slice(ITEM_PREFIX.length));
    sidebar.getSites().then((sites) => {
      if (sites[index]) {
        return sidebar.showSite(sites[index]);
      }
    });
  });

  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && (changes[sidebar.KEYS.sites] || changes[settings.keyFor("sidebar")])) {
      rebuildMenu();
    }
  });

  rebuildMenu();
})();
