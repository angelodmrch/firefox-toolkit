// Lets each module plug its own section into the popup and the options page.
// A module script calls Toolkit.ui.registerPopupSection("<id>", render) or
// Toolkit.ui.registerOptionsSection("<id>", render), where render(container)
// fills the given element.
(() => {
  const popupSections = {};
  const optionsSections = {};

  Toolkit.ui = {
    popupSections,
    optionsSections,
    registerPopupSection(moduleId, render) {
      popupSections[moduleId] = render;
    },
    registerOptionsSection(moduleId, render) {
      optionsSections[moduleId] = render;
    },
    // Small helper to build elements without innerHTML
    el(tag, props = {}, children = []) {
      const node = document.createElement(tag);
      Object.entries(props).forEach(([name, value]) => {
        if (name === "className") node.className = value;
        else if (name === "text") node.textContent = value;
        else if (name.startsWith("on")) node.addEventListener(name.slice(2).toLowerCase(), value);
        else node.setAttribute(name, value);
      });
      children.forEach((child) => node.append(child));
      return node;
    }
  };
})();
