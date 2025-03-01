#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs';
import clipboardy from 'clipboardy';

// Parse command-line arguments
const args = process.argv.slice(2);
const username = args[0];
const shouldCreateFile = args.includes('--create-file');
const shouldCopyToClipboard = args.includes('--copy-to-clipboard');

if (!username) {
  console.error('Error: GitHub username is required.');
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const profileUrl = `https://github.com/${username}`;
  await page.goto(profileUrl, { waitUntil: 'networkidle2' });

  // Continuously click the "Show more activity" button until it's no longer available
  while (true) {
    const showMoreButton = await page.$('button.contribution-activity-show-more');
    if (!showMoreButton) break;
    await showMoreButton.click();
    try {
      await page.waitForFunction(() => {
        const btn = document.querySelector('button.contribution-activity-show-more');
        return !btn || btn.innerText.trim().includes("Show more activity");
      }, { timeout: 10000 });
    } catch (error) {
      console.error('Timeout waiting for activity to load:', error);
      break;
    }
  }

  // Extract repository links, excluding fork events
  const repoLinks = await page.evaluate(() => {
    const allRepoAnchors = Array.from(document.querySelectorAll('a[data-hovercard-type="repository"]'));
    return [...new Set(
      allRepoAnchors.filter(anchor => {
        // Find the closest TimelineItem-body container (common parent for an activity item)
        const timelineItem = anchor.closest('.TimelineItem-body');
        // If found and it contains a fork icon, then skip this link
        if (timelineItem && timelineItem.querySelector('svg.octicon-repo-forked')) {
          return false;
        }
        return true;
      }).map(anchor => anchor.href)
    )];
  });

  // Write to file if option is enabled
  if (shouldCreateFile) {
    fs.writeFileSync('repo_links.txt', repoLinks.join('\n'), 'utf-8');
    console.log(`Extracted ${repoLinks.length} repository links and saved to repo_links.txt`);
  }

  // Copy to clipboard if option is enabled
  if (shouldCopyToClipboard) {
    clipboardy.writeSync(repoLinks.join('\n'));
    console.log('Repository links copied to clipboard.');
  }

  // If no file creation or clipboard option specified, output links to console
  if (!shouldCreateFile && !shouldCopyToClipboard) {
    console.log(repoLinks.join('\n'));
  }

  await browser.close();
})();
