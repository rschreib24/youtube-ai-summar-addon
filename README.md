# YouTube AI Summary Extension

This Chrome extension allows users to copy the transcript of a YouTube video and open the ChatGPT website to paste the transcript for summarization. The extension adds buttons to the YouTube interface for easy access to these features.

## Features

- **Copy Transcript**: Copies the transcript of the currently playing YouTube video to the clipboard.
- **Open ChatGPT**: Opens the ChatGPT website in a new tab and pastes the copied transcript into the input field.

## Installation

1. Clone the repository to your local machine:
    ```sh
    git clone https://github.com/yourusername/youtube-ai-summary-extension.git
    ```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable "Developer mode" by toggling the switch in the top right corner.

4. Click on "Load unpacked" and select the directory where you cloned the repository.

## Usage

1. Navigate to a YouTube video.

2. Click the "Show Transcript & Copy" button in the YouTube sidebar to copy the transcript to the clipboard.

3. Click the "Open Website" button to open the ChatGPT website in a new tab. The transcript will be automatically pasted into the input field.

## Permissions

The extension requires the following permissions:

- `scripting`: To execute scripts in the context of the web pages.
- `clipboardWrite` and `clipboardRead`: To copy the transcript to the clipboard.
- `activeTab` and `tabs`: To interact with the currently active tab and open new tabs.
- `storage`: To store and retrieve data in the extension's local storage.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- Icon used in the extension: ![](./document-16.png) [Document Icon](https://www.iconsdb.com/red-icons/document-icon.html)