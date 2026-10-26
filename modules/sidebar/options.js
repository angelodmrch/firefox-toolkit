// Sidebar module: site list editor on the options page.
Toolkit.ui.registerOptionsSection("sidebar", async (container) => {
  const { sidebar, ui } = Toolkit;
  const { el } = ui;

  const defaultSelect = el("select", { id: "sidebarDefault" });
  const itemsContainer = el("div", { className: "site-list" });
  const status = el("span", { className: "status" });

  container.append(
    el("div", { className: "default-option" }, [
      el("label", { for: "sidebarDefault", text: "Site padrão (abre sozinho com a sidebar):" }),
      defaultSelect
    ]),
    itemsContainer,
    el("div", { className: "controls" }, [
      el("button", { type: "button", className: "btn-success", text: "Adicionar site", onClick: () => addItem() }),
      el("button", { type: "button", className: "btn-primary", text: "Salvar sites", onClick: save }),
      status
    ])
  );

  function readItems() {
    return [...itemsContainer.querySelectorAll(".item-container")]
      .map((item) => ({
        label: item.querySelector('[data-type="label"]').value.trim(),
        url: item.querySelector('[data-type="url"]').value.trim()
      }))
      // Only keep items that have both label and URL
      .filter((site) => site.label && site.url);
  }

  function updateDefaultSelect() {
    const currentDefault = defaultSelect.value;
    defaultSelect.replaceChildren(new Option("Nenhum (mostra a lista)", ""));
    readItems().forEach((site) => defaultSelect.append(new Option(site.label, site.url)));
    defaultSelect.value = currentDefault;
    // Fall back to "no default" if the previous default was removed
    if (defaultSelect.value !== currentDefault) {
      defaultSelect.value = "";
    }
  }

  function addItem(label = "", url = "") {
    const item = el("div", { className: "item-container" }, [
      el("div", { className: "item-inputs" }, [
        el("input", { type: "text", placeholder: "Nome", "data-type": "label" }),
        el("input", { type: "text", placeholder: "URL", "data-type": "url" })
      ])
    ]);
    item.querySelector('[data-type="label"]').value = label;
    item.querySelector('[data-type="url"]').value = url;
    item.append(el("button", {
      type: "button",
      className: "btn-danger",
      text: "Remover",
      onClick: () => {
        item.remove();
        updateDefaultSelect();
      }
    }));
    itemsContainer.append(item);
    updateDefaultSelect();
  }

  async function save() {
    await sidebar.saveSites(readItems(), defaultSelect.value);
    status.textContent = "Salvo!";
    setTimeout(() => { status.textContent = ""; }, 1500);
  }

  // Keep the default dropdown in sync while typing
  itemsContainer.addEventListener("input", updateDefaultSelect);

  // The default is saved right away and the sidebar reloads to show it
  defaultSelect.addEventListener("change", async () => {
    try {
      await sidebar.setDefaultSite(defaultSelect.value);
      await sidebar.reloadPanel();
      status.textContent = "Site padrão atualizado";
      setTimeout(() => { status.textContent = ""; }, 1500);
    } catch (error) {
      console.error("[Toolkit/Sidebar] Error saving default site:", error);
    }
  });

  const { sites, defaultSite } = await sidebar.getState();
  sites.forEach((site) => addItem(site.label, site.url));
  defaultSelect.value = defaultSite;
});
