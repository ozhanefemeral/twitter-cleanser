// Function to load languages from blockedAccounts.json
function loadLanguages() {
  return fetch(chrome.runtime.getURL("blockedAccounts.json"))
    .then((response) => response.json())
    .then((data) => Object.keys(data));
}

// Load saved settings and create checkboxes
document.addEventListener("DOMContentLoaded", () => {
  loadLanguages().then((languages) => {
    chrome.storage.sync.get(["enabled", "languages"], (result) => {
      document.getElementById("enableFilter").checked =
        result.enabled !== false; // Default to true if not set
      createLanguageCheckboxes(languages, result.languages || languages); // Select all if not set
    });
  });
});

// Create language checkboxes
function createLanguageCheckboxes(languages, selectedLanguages) {
  const languageList = document.getElementById("languageList");
  languageList.innerHTML = ""; // Clear existing checkboxes
  languages.forEach((lang) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = lang;
    checkbox.checked = selectedLanguages.includes(lang);
    checkbox.addEventListener("change", saveSettings);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(lang));
    languageList.appendChild(label);
  });
}

// Save settings when changed
function saveSettings() {
  const enabled = document.getElementById("enableFilter").checked;
  const selectedLanguages = Array.from(
    document.querySelectorAll("#languageList input:checked")
  ).map((cb) => cb.value);

  chrome.storage.sync.set({ enabled, languages: selectedLanguages }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "updateFilter" });
    });
  });
}

document
  .getElementById("enableFilter")
  .addEventListener("change", saveSettings);
