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

  async function waitForSendButton() {
    let sendButton;
    while (true) {
      sendButton = document.querySelector("button[data-testid='send-button']");
      if (sendButton && !sendButton.disabled) return sendButton;
      await new Promise((resolve) => setTimeout(resolve, 200)); // Short wait to check again
    }
  }

  try {
    const textarea = await waitForElement('#prompt-textarea');
    if (!textarea) return; // Stop execution if the element is not found

    const text = await navigator.clipboard.readText();
    if (!text) return;

    const maxChunkSize = 22000; // Safe chunk size to prevent exceeding the limit
    let startIndex = 0;

    const totalChunks = Math.ceil(text.length / maxChunkSize);

    if (totalChunks === 1) {
      textarea.textContent =
        `Summarize this YouTube transcript based on its content and title. First, provide a short paragraph that directly answers or spoils the video's reveal. Then, list 5-10 bullet points summarizing key points from the video with timestamps.` +
        text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      let sendButton = await waitForElement("button[data-testid='send-button']");
      if (!sendButton) return;
      sendButton.click();
      return;
    }

    // First message: Tell ChatGPT to wait
    let initialMessage = `My Transcript has multiple parts. Just read it, do not respond.`;
    textarea.textContent = initialMessage;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 2000));

    let sendButton = await waitForElement("button[data-testid='send-button']");
    if (!sendButton) return;
    sendButton.click();

    // Wait for textarea to be empty before proceeding
    while (textarea.textContent.trim() !== '') {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Send text in chunks
    let iteration = 0;
    while (startIndex < text.length) {
      iteration++;
      let chunk = text.substring(startIndex, startIndex + maxChunkSize);
      startIndex += maxChunkSize;

      // Wait for 5 seconds before sending the next chunk
      await new Promise((resolve) => setTimeout(resolve, 3000));

      textarea.textContent = `Part ${iteration} of the Transcript (Don't summarize yet): ` + chunk;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      // Wait for send button to be available and click it
      const sendButton = await waitForSendButton();
      sendButton.click();

      // Wait for textarea to be cleared before sending next chunk
      while (textarea.textContent.trim() !== '') {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // Final message: Allow ChatGPT to respond
    let finalMessage = `Final transcript message has been sent. Summarize this YouTube transcript based on its content and title. First, provide a short paragraph that directly answers or spoils the video's reveal. Then, list 5-10 bullet points summarizing key points from the video with timestamps.`;
    textarea.textContent = finalMessage;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 2000));

    sendButton = await waitForElement("button[data-testid='send-button']");
    if (!sendButton) return;
    sendButton.click();
  } catch (error) {
    console.error('Error pasting clipboard text:', error);
  }
}
