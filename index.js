#!/usr/bin/env node

import puppeteer from "puppeteer";
import clipboardy from "clipboardy";

// Default options for the function
const defaultOptions = {
  shouldCopyToClipboard: false,
};

/**
 * Extracts repository links from a GitHub user's activity page.
 *
 * @param {string} username - The GitHub username (required).
 * @param {object} options - Optional configuration options.
 *   @property {boolean} shouldCopyToClipboard - If true, copies the links to clipboard.
 *
 * @returns {Promise<string[]>} - A promise that resolves to the repository links.
 *
 * @throws {Error} - Throws an error if the username is not provided.
 */

export default async function findContributions(username, options = {}) {
  if (!username) {
    throw new Error("GitHub username is required.");
  }
  const opts = { ...defaultOptions, ...options };

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const profileUrl = `https://github.com/${username}`;
  await page.goto(profileUrl, { waitUntil: "networkidle2" });

  // Continuously click the "Show more activity" button until it's no longer available
  while (true) {
    const showMoreButton = await page.$(
      "button.contribution-activity-show-more"
    );
    if (!showMoreButton) break;
    await showMoreButton.click();
    try {
      await page.waitForFunction(
        () => {
          const btn = document.querySelector(
            "button.contribution-activity-show-more"
          );
          return !btn || btn.innerText.trim().includes("Show more activity");
        },
        { timeout: 10000 }
      );
    } catch (error) {
      console.error("Timeout waiting for activity to load:", error);
      break;
    }
  }

  // Extract repository links, excluding fork events
  const repoLinks = await page.evaluate(() => {
    const allRepoAnchors = Array.from(
      document.querySelectorAll('a[data-hovercard-type="repository"]')
    );
    return [
      ...new Set(
        allRepoAnchors
          .filter((anchor) => {
            // Find the closest TimelineItem-body container (common parent for an activity item)
            const timelineItem = anchor.closest(".TimelineItem-body");
            // If found and it contains a fork icon, then skip this link
            if (
              timelineItem &&
              timelineItem.querySelector("svg.octicon-repo-forked")
            ) {
              return false;
            }
            return true;
          })
          .map((anchor) => anchor.href)
      ),
    ];
  });

  // Copy to clipboard if option is enabled
  if (opts.shouldCopyToClipboard) {
    clipboardy.writeSync(repoLinks.join("\n"));
  }

  await browser.close();

  return repoLinks;
}
