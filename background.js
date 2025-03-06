let canPaste = false;

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "enablePaste") {
    canPaste = true;
  }
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const targetUrl = "https://chatgpt.com/";

  if (tab.url?.startsWith(targetUrl) && changeInfo.status === "complete" && canPaste) {
    canPaste = false; // Reset flag after executing

    try {
      await browser.tabs.executeScript(tabId, {
        code: `(${pasteClipboardText.toString()})();`,
      });
    } catch (error) {
      console.error("Error executing script:", error);
    }
  }
});

// Function to be injected into ChatGPT's page
async function pasteClipboardText() {
  async function waitForElement(selector, maxAttempts = 20, interval = 500) {
    for (let i = 0; i < maxAttempts; i++) {
      let element = document.querySelector(selector);
      if (element) return element;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    console.warn(`Element '${selector}' not found.`);
    return null;
  }

  try {
    const textarea = await waitForElement("#prompt-textarea");

    if (!textarea) return; // Stop execution if the element is not found

    const text = await navigator.clipboard.readText();
    if (text) {
      textarea.textContent = text;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      await new Promise ((resolve) => setTimeout(resolve, 2000));

      // Wait for the send button to be available and click it
      let sendButton = await waitForElement("button[data-testid='send-button']");
      // let sendButton = document.querySelector("button[data-testid='send-button']"); 
      if (sendButton) {
        sendButton.click();
      }
    }
  } catch (error) {
    console.error("Error pasting clipboard text:", error);
  }
}
