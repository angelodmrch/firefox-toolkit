// Sidebar module: site list in the toolbar popup.
Toolkit.ui.registerPopupSection("sidebar", async (container) => {
  const { sidebar, ui } = Toolkit;
  const sites = await sidebar.getSites();

  sites.forEach((site) => {
    const item = ui.el("div", {
      className: "list-item",
      text: site.label,
      onClick: async () => {
        // Open sidebar FIRST (must be in direct user input handler)
        try {
          browser.sidebarAction.open();
        } catch (error) {
          console.log("[Toolkit/Sidebar] Sidebar API call failed:", error);
        }

        try {
          await sidebar.showSite(site);
        } catch (error) {
          console.error("[Toolkit/Sidebar] Error handling site selection:", error);
        }
        window.close();
      }
    });
    container.append(item);
  });
});
