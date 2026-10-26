// Reddit module: auto-unblur NSFW posts and remove game posts from the feed.
(async () => {
  const { settings } = globalThis.Toolkit;

  let config = await settings.get("reddit");

  // Track which posts have already been handled
  const processedPosts = new WeakSet();
  const removedGamePosts = new WeakSet();

  // Click all 18+ content overlays
  function clickNSFWButtons() {
    // Find Reddit's shreddit-blurred-container elements (new Reddit design)
    const blurredContainers = document.querySelectorAll('shreddit-blurred-container[reason="nsfw"]');

    blurredContainers.forEach((container) => {
      if (processedPosts.has(container)) {
        return;
      }

      // Look for the clickable "outer" div
      const outerDiv = container.querySelector("div.outer");
      if (outerDiv) {
        outerDiv.click();
        processedPosts.add(container);
        console.log("[Toolkit/Reddit] Clicked NSFW overlay");
        return;
      }

      // If no outer div, try clicking the first child div inside slot="blurred"
      const blurredSlot = container.querySelector('[slot="blurred"]');
      if (blurredSlot) {
        const firstDiv = blurredSlot.querySelector("div");
        if (firstDiv) {
          firstDiv.click();
          processedPosts.add(container);
          console.log("[Toolkit/Reddit] Clicked blurred slot");
          return;
        }
      }

      // Last resort: click the container itself once
      container.click();
      processedPosts.add(container);
    });
  }

  // Remove posts that are game posts (<shreddit-post game="">)
  function removeGamePosts() {
    const gamePosts = document.querySelectorAll("shreddit-post[game]");

    gamePosts.forEach((post) => {
      if (removedGamePosts.has(post)) {
        return;
      }

      const article = post.closest("article");
      if (article) {
        article.remove();
        removedGamePosts.add(post);
        console.log("[Toolkit/Reddit] Removed game post");
        return;
      }

      post.remove();
      removedGamePosts.add(post);
      console.log("[Toolkit/Reddit] Removed game shreddit-post");
    });
  }

  function runAllFilters() {
    if (!config.enabled) {
      return;
    }
    if (config.unblurNsfw) {
      clickNSFWButtons();
    }
    if (config.removeGamePosts) {
      removeGamePosts();
    }
  }

  // Apply setting changes from the popup/options page without reloading Reddit
  settings.onChange("reddit", (next) => {
    config = next;
    runAllFilters();
  });

  runAllFilters();

  // Watch for new posts being loaded
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
      // Delay slightly to let Reddit finish rendering
      setTimeout(runAllFilters, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also check periodically as a backup (every 2 seconds)
  setInterval(runAllFilters, 2000);

  console.log("[Toolkit/Reddit] Loaded");
})();
