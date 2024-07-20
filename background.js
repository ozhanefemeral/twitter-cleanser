chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with filter enabled and all available languages selected
  fetch(chrome.runtime.getURL("blockedAccounts.json"))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const allLanguages = Object.keys(data);
      chrome.storage.sync.set(
        { enabled: true, languages: allLanguages },
        () => {
          console.log("Filter enabled and all languages selected by default");
        }
      );
    })
    .catch((error) => {
      console.error("Error loading blocked accounts:", error);
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    (tab.url?.includes("twitter.com") || tab.url?.includes("x.com"))
  ) {
    chrome.tabs.sendMessage(tabId, { action: "updateFilter" });
  }
});
