// Central list of modules.
// To add a new feature: add an entry here, create modules/<id>/ and wire its
// scripts in manifest.json (content scripts, background) and, if it has UI,
// in popup/popup.html and options/options.html.
globalThis.Toolkit = globalThis.Toolkit || {};

Toolkit.modules = [
  {
    id: "reddit",
    name: "Reddit",
    description: "Limpa o feed do Reddit automaticamente.",
    defaultEnabled: true,
    // Simple on/off settings, rendered automatically on the options page
    settings: [
      { key: "unblurNsfw", label: "Revelar posts NSFW automaticamente", default: true },
      { key: "removeGamePosts", label: "Remover posts de jogos do feed", default: true }
    ]
  },
  {
    id: "sidebar",
    name: "Sidebar personalizada",
    description: "Abre sites na sidebar do Firefox, pelo popup ou pelo menu de contexto.",
    defaultEnabled: true,
    settings: []
  }
];
