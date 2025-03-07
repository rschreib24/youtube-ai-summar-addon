async function addTranscriptToClipboard() {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitForTranscriptToLoad(maxAttempts = 10, interval = 1000) {
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      let transcriptLines = document.querySelectorAll("ytd-transcript-segment-renderer");
      if (transcriptLines.length > 0) return transcriptLines;
      await sleep(interval);
    }
    return null; // Return null if transcript never loads
  }

  async function getTranscript() {
    try {
      let transcriptButton = document.querySelector("button[aria-label*='Open transcript']");
      if (transcriptButton && !document.querySelector("ytd-transcript-segment-renderer")) {
        transcriptButton.click(); // Click only if transcript is not already open
      }

      let transcriptLines = await waitForTranscriptToLoad();
      if (!transcriptLines) {
        alert("No transcript found or failed to load.");
        return;
      }

      // Extract video title
      let videoTitle = document.title.replace(" - YouTube", "").trim();

      // let transcriptText = Array.from(transcriptLines)
      //   .map((line) => line.innerText.replace(/\d+:\d+/g, "").trim()) // Remove timestamps
      //   .join("\n");

      let transcriptText = Array.from(transcriptLines)
        .map((line) => line.innerText.trim()) // Keep timestamps
        .join("\n");

      let finalText = `Title: ${videoTitle}.\n Transcript:\n ${transcriptText} `;

      if (transcriptText) {
        await navigator.clipboard.writeText(finalText);
        console.log("Transcript with video title copied to clipboard.");
      } else {
        alert("Failed to copy transcript.");
      }
    } catch (error) {
      console.error("Error copying transcript:", error);
      alert("Error: Cannot access the YouTube page. Ensure the transcript is visible.");
    }
  }

  await getTranscript();
}

// Function to create and add a button to the YouTube sidebar
function addButton(id, text, callback) {
  if (document.getElementById(id)) return;

  let sidebar = document.querySelector("div#columns > div#secondary");
  if (!sidebar) {
    console.log(`Sidebar not found for ${id}. Retrying...`);
    setTimeout(() => addButton(id, text, callback), 2000);
    return;
  }

  let buttonContainer = document.getElementById("custom-button-container");
  if (!buttonContainer) {
    buttonContainer = document.createElement("div");
    buttonContainer.id = "custom-button-container";
    buttonContainer.style.cssText = `
          display: flex;
          width: 100%;
          gap: 10px;
          justify-content: space-between;
      `;
    sidebar.prepend(buttonContainer);
  }

  let btn = document.createElement("button");
  btn.id = id;
  btn.innerText = text;
  btn.style.cssText = `
        flex-grow: 1;
        padding: 10px;
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: bold;
        background-color: #FF0000;
        color: white;
        border: none;
        cursor: pointer;
        text-align: center;
        white-space: nowrap;
        border-radius: 5px;
    `;
  btn.addEventListener("click", callback);

  buttonContainer.appendChild(btn);
  console.log(`${text} button added.`);
}

// Function to trigger transcript opening
async function attemptClickTranscript(retries = 10) {
  for (let attempt = 0; attempt < retries; attempt++) {
    let transcriptButton = [...document.querySelectorAll("button")].find(
      (button) => button.innerText.trim().toLowerCase() === "show transcript"
    );

    if (transcriptButton) {
      transcriptButton.click();
      console.log("Clicked 'Show transcript' button.");
      return true;
    }

    console.log(`Transcript button not found, retrying... (${attempt + 1}/${retries})`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("Failed to find transcript button after multiple attempts.");
  return false;
}

// Adds a button for transcript copying
function addTranscriptButton() {
  addButton("custom-transcript-btn", "Copy Transcript", async function () {
    let button = document.getElementById("custom-transcript-btn");

    // Change UI to show loading
    button.innerText = "Copying Transcript...";
    button.style.backgroundColor = "#28a745"; // green

    let success = await attemptClickTranscript();
    if (success) {
      setTimeout(async () => {
        await addTranscriptToClipboard();

        // Restore button text and color after action
        button.innerText = "Copy Transcript";
        button.style.backgroundColor = "#FF0000"; // Red
      }, 2000);
    } else {
      // Indicate failure
      button.innerText = "Not Found!";
      button.style.backgroundColor = "#28a745"; // green

      // Reset the button text and color after 5 seconds
      setTimeout(() => {
        button.innerText = "Copy Transcript";
        button.style.backgroundColor = "#FF0000";
      }, 5000);
    }
  });
}

// Adds a button to open ChatGPT
function addOpenWebsiteButton() {
  addButton("open-website-btn", "Summarize in ChatGPT", async function () {
    let button = document.getElementById("open-website-btn");

    // Change UI to show processing
    button.innerText = "Getting Transcript...";
    button.style.backgroundColor = "#28a745"; // green

    let success = await attemptClickTranscript();
    if (success) {
      await addTranscriptToClipboard();
      await browser.runtime.sendMessage({ action: "enablePaste" });
      window.open("https://chatgpt.com/", "_blank");

      // Restore button text and color
      button.innerText = "Summarize in ChatGPT";
      button.style.backgroundColor = "#FF0000"; // Red
    } else {
      // Indicate failure
      button.innerText = "Not Found!";
      button.style.backgroundColor = "#28a745"; // green

      // Reset the button text and color after 5 seconds
      setTimeout(() => {
        button.innerText = "Summarize in ChatGPT";
        button.style.backgroundColor = "#FF0000"; // Red
      }, 5000);
    }
  });
}

// Run script when the page loads or changes
setTimeout(addTranscriptButton, 2000);
setTimeout(addOpenWebsiteButton, 2000);