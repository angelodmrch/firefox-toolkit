// Sidebar module: the page shown in Firefox's sidebar panel.
// It redirects to the default site (or the last one used), or shows a picker.
(() => {
  const { settings, sidebar } = globalThis.Toolkit;

  const select = document.getElementById("pageSelect");
  const header = document.getElementById("header");
  const message = document.getElementById("message");

  function setTitle(label) {
    document.title = label || "Sidebar";
  }

  async function load() {
    const config = await settings.get("sidebar");
    if (!config.enabled) {
      header.hidden = true;
      message.textContent = "O módulo Sidebar está desativado nas opções do Firefox Toolkit.";
      setTitle();
      return;
    }

    const { sites, defaultSite, lastSite, lastSiteLabel } = await sidebar.getState();

    select.replaceChildren(new Option("Escolha um site...", ""));
    sites.forEach((site) => select.append(new Option(site.label, site.url)));

    const defaultEntry = sites.find((site) => site.url === defaultSite);
    if (defaultEntry) {
      setTitle(defaultEntry.label);
      location.href = defaultEntry.url;
      return;
    }

    if (lastSite) {
      setTitle(lastSiteLabel);
      location.href = lastSite;
      return;
    }

    setTitle();
  }

  select.addEventListener("change", async () => {
    const url = select.value;
    if (!url) {
      return;
    }
    const label = select.options[select.selectedIndex].textContent;

    // Save as last site (but don't override the default)
    await sidebar.setLastSite({ url, label });
    setTitle(label);
    location.href = url;
  });

  // Enabling the module from the popup/options updates this page right away
  settings.onChange("sidebar", () => location.reload());

  load().catch((error) => console.error("[Toolkit/Sidebar] Error loading sites:", error));
})();
