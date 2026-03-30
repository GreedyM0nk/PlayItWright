# Troubleshooting Guide - PlayIt Wright

Solutions for common issues and error messages in Playwright test automation and Allure reporting.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Test Execution Problems](#test-execution-problems)
- [Playwright Issues](#playwright-issues)
- [Allure Reporting Issues](#allure-reporting-issues)
- [GitHub Actions CI/CD Issues](#github-actions-cicd-issues)
- [Performance Issues](#performance-issues)
- [Environment Issues](#environment-issues)
- [Getting Help](#getting-help)

---

## Installation Issues

### Issue: `npm ERR! code ERESOLVE`

**Error:** Peer dependency conflicts during installation

**Solution:**

```bash
# Use legacy peer dependencies flag
npm install --legacy-peer-deps

# Or update npm version
npm install -g npm@latest
npm install
```

### Issue: Playwright Browsers Not Installed

**Error:** `Error: Playwright is not installed`

**Solution:**

```bash
# Install all dependencies including browsers
npm install

# Explicitly install Playwright browsers with system dependencies
npx playwright install --with-deps

# For specific browser
npx playwright install chromium
```

**macOS Specific:**
```bash
# Install system dependencies via Homebrew
brew install libdmg-hfsplus
npx playwright install --with-deps
```

### Issue: `Permission Denied` on macOS

**Error:** `Permission denied` when running `npx playwright`

**Solution:**

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Reinstall
npm install -g npm
npm install
npx playwright install --with-deps
```

### Issue: Node.js Version Mismatch

**Error:** `The engine "node" is incompatible with this module`

**Solution:**

```bash
# Check your Node version
node --version

# Install Node 18+ (required)
# Using nvm (recommended)
nvm install 18
nvm use 18

# Verify
node --version  # Should be v18.x.x or higher
npm --version   # Should be 8+
```

---

## Test Execution Problems

### Issue: Tests Fail in CI But Pass Locally

**Causes:**
- Missing `--with-deps` flag in CI
- Different environment variables
- Headless vs headed mode differences
- Network/timing issues

**Solutions:**

1. **Install browser dependencies in CI:**
```yaml
# In GitHub Actions workflow
- name: Install Playwright Browsers with Dependencies
  run: npx playwright install --with-deps
```

2. **Run locally in headless mode (matches CI):**
```bash
npx playwright test --headed=false
```

3. **Check environment variables:**
```bash
# View all env vars
env | grep -i playwright
```

4. **Increase timeout for slow runners:**
```javascript
// playwright.config.js
{
  timeout: 60 * 1000, // 60 seconds instead of 30
  expect: {
    timeout: 10000 // 10 seconds instead of 5
  }
}
```

### Issue: Tests Timeout Randomly

**Error:** `Test timeout of 30000ms exceeded`

**Solutions:**

1. **Increase timeout threshold:**
```javascript
{
  timeout: 60000, // 60 seconds
  expect: { timeout: 10000 }
}
```

2. **Override for specific test:**
```javascript
test('slow test', async ({ page }) => {
  // Test code
}, { timeout: 60000 });
```

3. **Check for missing waits:**
```javascript
// ❌ Bad - no wait
await page.click('button');
await page.fill('input', 'text'); // May fail if not loaded

// ✅ Good - Playwright auto-waits
await page.click('button');
await expect(page.locator('input')).toBeVisible();
await page.fill('input', 'text');
```

4. **Debug network issues:**
```bash
# Run with network debugging
DEBUG=pw:api npx playwright test
```

### Issue: Element Not Found

**Error:** `Timeout 30000ms exceeded while waiting for element`

**Solutions:**

1. **Verify selector is correct:**
```javascript
// Use developer tools to find element
// In browser console:
document.querySelector('button.submit')  // Returns element if found

// Test in Playwright
const element = page.locator('button.submit');
await expect(element).toBeVisible();
```

2. **Check for dynamic content:**
```javascript
// Wait for element to appear
await page.waitForSelector('.dynamic-content');

// Or use explicit wait
await page.waitForFunction(() => {
  return document.querySelector('.content') !== null;
});
```

3. **Handle Shadow DOM:**
```javascript
// Playwright v1.20+ supports Shadow DOM
page.locator('my-element >> button')

// Or pierce Shadow DOM
page.locator('pierce/button')
```

4. **Debug element search:**
```javascript
// List all matching elements
const elements = page.locator('button');
const count = await elements.count();
console.log(`Found ${count} buttons`);

// Get text of each
for (let i = 0; i < count; i++) {
  const text = await elements.nth(i).textContent();
  console.log(`Button ${i}: ${text}`);
}
```

---

## Playwright Issues

### Issue: "Chromium not installed"

**Error:** `Chromium is not installed for channel`

**Solution:**

```bash
# Reinstall Chromium
npx playwright install chromium

# Or all browsers
npx playwright install
```

### Issue: "Browser closed unexpectedly"

**Causes:**
- Insufficient system resources
- Browser crash
- Test cleanup issues

**Solutions:**

1. **Reduce parallel workers:**
```javascript
// playwright.config.js
{
  workers: 2  // Default is CPU count
}
```

2. **Add explicit waits before closing:**
```javascript
test.afterEach(async ({ page }) => {
  // Wait for pending requests
  await page.waitForLoadState('networkidle');
  // Then close
});
```

3. **Check system resources:**
```bash
# macOS - check memory usage
top -l 1 | head -20

# Linux
free -h
```

### Issue: "Navigation timed out"

**Error:** `Target page, context or browser has been closed`

**Solutions:**

1. **Check for early cleanup:**
```javascript
// ❌ Bad
test.afterEach(async ({ page }) => {
  // Closes too early?
  await page.close();
});

test('my test', async ({ page }) => {
  // Test code - page may be closed
});

// ✅ Good - use beforeEach/afterEach properly
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
});
```

2. **Wait for navigation:**
```javascript
// Wait for navigation to complete
await Promise.all([
  page.waitForNavigation(),
  page.click('a.link')
]);
```

### Issue: "Playwright Inspector Crashes"

**Error:** Inspector becomes unresponsive

**Solutions:**

```bash
# Use different debug approach
DEBUG=pw:api npx playwright test tests/file.spec.js

# Or use UI mode instead
npx playwright test --ui
```

---

## Allure Reporting Issues

### Issue: No Allure Results Generated

**Symptoms:** `allure-results/` directory is empty

**Solutions:**

1. **Verify reporter configured:**
```javascript
// playwright.config.js
reporter: [
  ['line'],
  ['html'],
  ['allure-playwright']  // This must be present
],
outputDir: 'allure-results'
```

2. **Reinstall dependencies:**
```bash
npm ci
npm install allure-playwright --save-dev
```

3. **Run tests explicitly with Allure:**
```bash
npm run test:allure
# or
npx playwright test --reporter=line,allure-playwright
```

4. **Check for test failures blocking reporting:**
```bash
# Run with continue-on-error to ensure results are written
npx playwright test --reporter=line,allure-playwright || true
```

### Issue: Allure History Not Showing

**Symptoms:** No trend chart or historical data

**Common Causes:**
- First run (need 2+ builds for trends)
- History not properly merged
- Wrong output directory

**Solutions:**

1. **Manually merge history for first run:**
```bash
cd PlayWrightAutomation
mkdir -p allure-results/history

# On subsequent runs, history should build automatically
npx playwright test --reporter=allure-playwright
```

2. **Verify GitHub Pages branch:**
```bash
# Check if gh-pages branch exists with history
git branch -a | grep gh-pages
```

3. **Check workflow is preserving history:**
```yaml
# In GitHub Actions workflow, ensure:
- name: Restore Allure History
  uses: actions/checkout@v4
  with:
    ref: gh-pages
    path: gh-pages-history

- name: Preserve History
  run: |
    mkdir -p allure-results/history
    cp -r ../gh-pages-history/history/* allure-results/history/
```

### Issue: Allure Report Not Deploying to GitHub Pages

**Symptoms:** Report not appearing at `https://username.github.io/repo/`

**Solutions:**

1. **Enable GitHub Pages:**
   - Go to repository **Settings** → **Pages**
   - Select **Deploy from a branch**
   - Choose `gh-pages` branch
   - Save

2. **Verify workflow permissions:**
```yaml
permissions:
  contents: write  # Required for gh-pages
  pages: write
  id-token: write
```

3. **Check publish directory:**
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v4
  with:
    publish_dir: allure-report  # Must match where report is generated
```

4. **Manual deployment (for testing):**
```bash
# Generate report locally
allure generate allure-results --clean -o allure-report

# Verify it exists
ls -la allure-report/index.html
```

### Issue: "allure: command not found"

**Error:** Allure CLI not installed

**Solutions:**

```bash
# Install Allure globally
npm install -g allure-commandline

# Or use npx to run without installing
npx allure --version

# Or install locally as dev dependency
npm install allure-commandline --save-dev
npx allure --version
```

**Platform-specific installation:**

```bash
# macOS
brew install allure

# Linux (Ubuntu/Debian)
sudo apt-add-repository ppa:qameta/allure
sudo apt-get update
sudo apt-get install allure

# Windows
choco install allure
```

---

## GitHub Actions CI/CD Issues

### Issue: Workflow Not Triggering

**Symptoms:** Workflow doesn't run on push

**Solutions:**

1. **Verify trigger conditions:**
```yaml
on:
  push:
    branches: [ "main" ]  # Must match your branch name
  pull_request:
    branches: [ "main" ]
```

2. **Check branch name:**
```bash
# List all branches
git branch -a

# Make sure you're on 'main' (not 'master')
git branch

# Rename if needed
git branch -m master main
```

3. **View workflow logs:**
   - Go to repository **Actions** tab
   - Check for workflow runs
   - Click to see logs

4. **Re-enable workflow:**
   - Go to **Actions** tab
   - Find workflow
   - Click **Enable workflow**

### Issue: Insufficient Permissions Error

**Error:** `Permission denied` or `failed to push to branch`

**Solution:**

```yaml
# Ensure permissions are set correctly
permissions:
  contents: write      # Write to repository
  pages: write         # Write to GitHub Pages
  id-token: write      # For OIDC
```

### Issue: Node Modules Cache Not Working

**Symptoms:** Dependencies reinstall every build (slow)

**Solution:**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
    cache-dependency-path: 'PlayWrightAutomation/package-lock.json'
```

### Issue: Playwright Browsers Not Installing in CI

**Error:** Browsers fail to install in GitHub Actions

**Solution:**

```yaml
# IMPORTANT: Include --with-deps flag
- name: Install Playwright Browsers
  run: npx playwright install --with-deps
```

**Why:** `--with-deps` installs system dependencies needed for browsers.

### Issue: Test Results Time Out in CI

**Causes:**
- Network connectivity issues
- Resources exhausted
- Tests too slow for CI environment

**Solutions:**

```yaml
jobs:
  test:
    timeout-minutes: 30  # Set reasonable timeout

    steps:
      # ... other steps ...
      
      - name: Run Tests
        timeout-minutes: 25  # Per-step timeout
        run: npx playwright test
```

### Issue: Workflow Logs Not Showing

**Solutions:**

1. **Enable debug logging:**
```yaml
env:
  RUNNER_DEBUG: 1
```

2. **Add debug step:**
```yaml
- name: Debug Info
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Playwright: $(npx playwright --version)"
```

---

## Performance Issues

### Issue: Tests Running Slowly

**Symptoms:** Tests take too long to execute

**Solutions:**

1. **Enable parallel execution:**
```javascript
// playwright.config.js
{
  workers: 4  // Run 4 tests in parallel
}
```

2. **Reduce retries:**
```javascript
{
  retries: 0  // Only retry in CI if needed
}
```

3. **Disable unnecessary features:**
```javascript
{
  use: {
    screenshot: 'only-on-failure',  // Not always
    trace: 'on-first-retry',        // Only when needed
    video: 'retain-on-failure'      // Only on failure
  }
}
```

4. **Use resource-efficient selectors:**
```javascript
// ✅ Fast
page.locator('[data-testid="button"]')

// ❌ Slow
page.locator('//div[@class="container"]//button[contains(text(), "Submit")]')
```

---

## Environment Issues

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solutions:**

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port in config
{
  webServer: {
    command: 'npm run start',
    port: 3001  // Use different port
  }
}
```

### Issue: Network/Proxy Issues

**Error:** Tests fail with network errors

**Solutions:**

```javascript
// Disable proxy
{
  use: {
    proxy: null
  }
}

// Or set proxy explicitly
{
  use: {
    proxy: {
      server: 'http://proxy.example.com:3128'
    }
  }
}
```

### Issue: "ENOSPC: no space left on device"

**Error:** Disk space exhausted

**Solutions:**

```bash
# Check disk space
df -h

# Clean up Playwright cache
rm -rf ~/.cache/ms-playwright
rm -rf node_modules
npm install

# Clean unused test results
rm -rf test-results
rm -rf allure-results
```

---

## Getting Help

### Debug Information to Collect

When reporting issues, include:

```bash
# System information
node --version
npm --version
npx playwright --version

# Dependencies
npm list @playwright/test
npm list allure-playwright

# Environment
echo $PATH
which node
which npm

# Test run with debug
DEBUG=pw:api npx playwright test tests/example.spec.js
```

### Where to Get Help

1. **Check Documentation:**
   - [PlayIt Wright README](../README.md)
   - [Allure Setup Guide](./ALLURE_SETUP.md)
   - [Testing Guide](./TESTING_GUIDE.md)

2. **Official Documentation:**
   - [Playwright Docs](https://playwright.dev)
   - [Allure Report Docs](https://docs.qameta.io/allure/)
   - [GitHub Actions Docs](https://docs.github.com/en/actions)

3. **Community Resources:**
   - [Playwright GitHub Issues](https://github.com/microsoft/playwright/issues)
   - [Allure GitHub Issues](https://github.com/allure-framework/allure-js)
   - Playwright [Discord Community](https://discord.gg/playwright)

4. **Report Issues:**
   - Include error message
   - Provide minimal reproduction steps
   - Share relevant code snippets
   - Mention versions (Node, Playwright, etc.)

---

**Still stuck? Check the [main README](../README.md) or create an issue with detailed information!**
