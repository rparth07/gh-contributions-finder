# Github Contributions Finder

**Github Contributions Finder** is a tool that extracts repository links from a GitHub user's contribution activity. It can be used as a programmatic API. The package fetches commit links (excluding forked repository events) from a user's GitHub activity timeline. You can choose to have the output returned as a list of repository links, written to a file, or copied to the clipboard.

## Features

- **Extract Repository Links:** Finds all contributions from a GitHub user's activity timeline.
- **Flexible Output Options:** Return results as a list of repository links, write them to a file, or copy them to the clipboard.

## Installation

Install the package globally or locally using npm:

```bash
npm i gh-contributions-finder
```

## Usage

You can import and use the module in your project:

```javascript
import findContributions from "gh-contributions-finder";

(async () => {
  try {
    const result = await findContributions("yourGitHubUsername", {
      shouldCreateFile: true, // Writes output to a file
      shouldCopyToClipboard: false, // Copies output to clipboard
      outputFile: "repo_links.txt", // Name of the file to save links
    });
    console.log("Repository links:\n", result);
  } catch (error) {
    console.error("Error:", error);
  }
})();
```

## Options

When calling the `findContributions` function, you can pass an options object with the following properties:

- **shouldCreateFile**: `boolean`  
  If set to `true`, the extracted links will be written to a file. _(Default: `false`)_

- **shouldCopyToClipboard**: `boolean`  
  If set to `true`, the extracted links will be copied to the clipboard. _(Default: `false`)_

- **outputFile**: `string`  
  Specifies the file name to which the repository links will be written if `shouldCreateFile` is `true`. _(Default: `'repo_links.txt'`)_

## How It Works

1. **Navigation:** The tool navigates to the specified GitHub user’s profile.
2. **Activity Loading:** It continuously clicks the "Show more activity" button until all contributions are loaded.
3. **Filtering:** The tool extracts all repository links from the loaded activity, filtering out links from fork events.
4. **Output:** Depending on your options, the links are returned, saved to a file, and/or copied to the clipboard.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests on [GitHub](https://github.com/rparth07/gh-contributions-finder).
