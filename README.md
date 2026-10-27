# My Toolkit

Plugin modular para Firefox que junta o antigo **reddit-plugin** e o **custom-firefox-sidebar** em uma única extensão. Cada funcionalidade é um módulo que pode ser ligado e desligado no popup ou na página de opções.

## Versão e publicação

Este plugin é a continuação do **Reddit Plugin** publicado no addons.mozilla.org (versão 1.1). Ele usa o mesmo ID (`reddit-plugin@example.com`) e está na versão **1.3**, então deve ser enviado como nova versão daquele mesmo listing, e quem já tem o Reddit Plugin instalado recebe a atualização automaticamente.

## Módulos

### Reddit (`modules/reddit/`)
- Remove posts de jogos (`shreddit-post[game]`) do feed
- Funciona em feeds dinâmicos (MutationObserver + checagem a cada 2s)

### Sidebar personalizada (`modules/sidebar/`)
- Carrega qualquer site na sidebar nativa do Firefox
- Lista de sites no popup do ícone da barra
- Menu de contexto "Abrir na sidebar" com um item por site
- Editor de sites e site padrão na página de opções
- Lista padrão em `modules/sidebar/sites.json` (ChatGPT, Grok, Copilot, DeepSeek, Claude)

## Estrutura

```
manifest.json            Configuração da extensão (Manifest V3)
core/
  registry.js            Lista central de módulos (id, nome, configurações)
  settings.js            Configurações por módulo em storage ("module:<id>")
  ui.js                  Registro de seções de popup/opções de cada módulo
  theme.css              Cores compartilhadas (claro/escuro)
popup/                   Popup do ícone: liga/desliga módulos + seção de cada um
options/                 Página de opções: um card por módulo
modules/
  reddit/content.js      Content script do Reddit
  sidebar/
    sidebar-api.js       Funções compartilhadas (sites, site padrão, recarregar painel)
    background.js        Menu de contexto
    sidebar.html/.js     Página do painel lateral
    popup.js             Seção do popup (lista de sites)
    options.js           Seção das opções (editor de sites)
    sites.json           Sites padrão
```

## Como adicionar um módulo novo

1. Adicione uma entrada em `core/registry.js` com `id`, `name`, `description` e, se quiser, `settings` (liga/desliga simples, que aparecem sozinhos nas opções).
2. Crie a pasta `modules/<id>/` com o código do módulo.
3. No `manifest.json`, registre o que o módulo precisar:
   - **Content script** em um site: novo bloco em `content_scripts` com `core/registry.js`, `core/settings.js` e o script do módulo (e o domínio em `host_permissions`).
   - **Background**: adicione o script em `background.scripts`.
4. Dentro do módulo, leia a configuração com `await Toolkit.settings.get("<id>")` e respeite `enabled`. Use `Toolkit.settings.onChange` para reagir sem recarregar a página.
5. Se quiser UI própria, crie `modules/<id>/popup.js` ou `options.js` chamando `Toolkit.ui.registerPopupSection` / `registerOptionsSection`, e inclua o script em `popup/popup.html` ou `options/options.html`.

## Instalação

1. Abra `about:debugging#/runtime/this-firefox`
2. Clique em **Carregar extensão temporária**
3. Selecione o `manifest.json` desta pasta

Para empacotar: `zip -r firefox-toolkit.xpi . -x '.git/*'` (ou `web-ext build`).

## Requisitos

- Firefox 140 ou mais novo (142 no Android; no Android só o módulo Reddit funciona, pois não há sidebar nem menu de contexto)
