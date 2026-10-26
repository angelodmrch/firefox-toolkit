// Options page: one card per module with its on/off switch, the simple
// settings declared in core/registry.js, and the module's own section.
(() => {
  const { modules, settings, ui } = Toolkit;
  const { el } = ui;
  const modulesContainer = document.getElementById("modules");

  function checkbox(checked, onChange) {
    const input = el("input", { type: "checkbox" });
    input.checked = checked;
    input.addEventListener("change", () => onChange(input.checked));
    return input;
  }

  async function renderModule(mod) {
    const config = await settings.get(mod.id);

    const card = el("section", { className: "module-card" });
    card.classList.toggle("disabled", !config.enabled);

    const enabledToggle = el("label", { className: "switch" }, [
      checkbox(config.enabled, async (enabled) => {
        await settings.set(mod.id, { enabled });
        card.classList.toggle("disabled", !enabled);
      }),
      "Ativo"
    ]);

    const content = el("div", { className: "module-content" });

    // Simple on/off settings saved as soon as they change
    (mod.settings || []).forEach((setting) => {
      content.append(el("label", { className: "switch setting" }, [
        checkbox(config[setting.key], (value) => settings.set(mod.id, { [setting.key]: value })),
        setting.label
      ]));
    });

    card.append(
      el("div", { className: "module-header" }, [el("h2", { text: mod.name }), enabledToggle]),
      el("p", { className: "description", text: mod.description || "" }),
      content
    );

    const render = ui.optionsSections[mod.id];
    if (render) {
      await render(content);
    }
    return card;
  }

  Promise.all(modules.map(renderModule))
    .then((cards) => modulesContainer.replaceChildren(...cards))
    .catch((error) => console.error("[Toolkit] Error loading options:", error));
})();
