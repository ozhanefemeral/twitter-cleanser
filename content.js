let blockedAccounts = {};

async function loadBlockedAccounts() {
  try {
    const response = await fetch(chrome.runtime.getURL("blockedAccounts.json"));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    blockedAccounts = data;
    console.log("Blocked accounts loaded", blockedAccounts);
    return filterTweets();
  } catch (error) {
    console.error("Error loading blocked accounts:", error);
    return Promise.reject(error);
  }
}

function hideTweet(tweetElement) {
  tweetElement.style.display = "none";
}

function filterTweets() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["enabled", "languages"], (result) => {
      if (!result.enabled) {
        resolve();
        return;
      }

      const accountsToBlock = result.languages.flatMap(
        (lang) => blockedAccounts[lang] || []
      );

      const tweets = document.querySelectorAll('[data-testid="tweet"]');

      tweets.forEach((tweet) => {
        const usernameElement = tweet.querySelector(
          '[data-testid="User-Name"]'
        );
        if (usernameElement) {
          const username =
            usernameElement.lastElementChild.firstElementChild.firstElementChild.firstElementChild
              .getAttribute("href")
              .substring(1);

          if (accountsToBlock.includes(username)) {
            hideTweet(tweet);
          }
        }
      });

      resolve();
    });
  });
}

// Initial load and filter
loadBlockedAccounts();

// Listen for filter updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateFilter") {
    filterTweets().then(() => {
      console.log("Filtering updated");
    });
  }
});

// Set up a MutationObserver to handle dynamically loaded tweets
const observer = new MutationObserver(() => {
  filterTweets();
});
observer.observe(document.body, { childList: true, subtree: true });
