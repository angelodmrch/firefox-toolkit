// Toolbar popup: one block per module with an on/off switch, plus the
// module's own section (if it registered one) when enabled.
(() => {
  const { modules, settings, ui } = Toolkit;
  const { el } = ui;
  const modulesContainer = document.getElementById("modules");

  async function renderModule(mod) {
    const config = await settings.get(mod.id);

    const toggle = el("input", { type: "checkbox", title: "Ativar/desativar" });
    toggle.checked = config.enabled;

    const body = el("div", { className: "module-body" });
    const block = el("div", { className: "module" }, [
      el("div", { className: "module-title" }, [el("span", { text: mod.name }), toggle]),
      body
    ]);

    async function renderBody(enabled) {
      body.replaceChildren();
      const render = ui.popupSections[mod.id];
      if (enabled && render) {
        await render(body);
      }
    }

    toggle.addEventListener("change", async () => {
      await settings.set(mod.id, { enabled: toggle.checked });
      await renderBody(toggle.checked);
    });

    await renderBody(config.enabled);
    return block;
  }

  async function render() {
    try {
      const blocks = await Promise.all(modules.map(renderModule));
      modulesContainer.replaceChildren(...blocks);
    } catch (error) {
      console.error("[Toolkit] Error loading popup:", error);
      modulesContainer.replaceChildren(el("div", { className: "list-item", text: "Erro ao carregar" }));
    }
  }

  document.getElementById("openOptions").addEventListener("click", () => {
    browser.runtime.openOptionsPage();
    window.close();
  });

  render();
})();
