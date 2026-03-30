# PlayWright Automation with Allure Reporting

A comprehensive Playwright end-to-end testing framework integrated with Allure Report for detailed test analysis, trend tracking, and CI/CD automation using GitHub Actions.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running Tests](#running-tests)
- [Allure Reporting](#allure-reporting)
- [GitHub Actions Pipeline](#github-actions-pipeline)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This project is a Playwright-based test automation framework with integrated Allure Reporting. It provides:
- **Automated end-to-end testing** using Playwright
- **Comprehensive test reporting** with Allure (Behavior-Driven Results Report)
- **CI/CD Integration** via GitHub Actions
- **Trend analysis & historical data** for test metrics
- **Multi-browser support** (Chromium, Firefox, Safari)
- **Parallel test execution** capabilities

---

## ✨ Features

### Playwright Features
✅ Cross-browser testing (Chromium, Firefox, WebKit/Safari)  
✅ Modern API for web interactions  
✅ Built-in debugging and trace recording  
✅ Screenshot & video capture on test failures  
✅ Parallel test execution for faster results  

### Allure Reporting Features
✅ Detailed test results with rich formatting  
✅ Historical trend analysis  
✅ Test execution timeline  
✅ Failure analytics  
✅ Environment & configuration details  
✅ Custom test categories & labels  

### CI/CD Automation
✅ Automated test execution on every push to `main`  
✅ Automated Allure report generation  
✅ GitHub Pages deployment for reports  
✅ Workflow dispatch for manual trigger  
✅ Email notifications (optional)  

---

## 📁 Project Structure

```
PlayItWright/
├── .github/
│   └── workflows/
│       ├── playwright-allure.yml          # Main Allure reporting pipeline
│       └── playwright_test_report.yml     # Legacy workflow (optional keep)
├── PlayWrightAutomation/
│   ├── allure-results/                    # Allure test results (generated)
│   ├── allure-report/                     # Allure HTML report (generated)
│   ├── test-results/                      # Playwright test results (generated)
│   ├── playwright-report/                 # Playwright HTML report (generated)
│   ├── tests/                             # Test files
│   │   └── *.spec.js                      # Test specifications
│   ├── pageobjects/                       # Page Object Model
│   ├── pageobjects_ts/                    # TypeScript Page Objects
│   ├── utils/                             # Utility functions
│   ├── utils_ts/                          # TypeScript utilities
│   ├── features/                          # BDD feature files (if using Cucumber)
│   ├── cucumber.js                        # Cucumber configuration
│   ├── playwright.config.js               # ⭐ Playwright configuration
│   ├── playwright.config1.js              # Alternative config (Safari)
│   ├── package.json                       # ⭐ Dependencies & scripts
│   ├── tsconfig.json                      # TypeScript configuration
│   └── .gitignore                         # Git ignore rules
├── README.md                              # This file
├── .gitignore                             # Root-level git ignore
└── package.json                           # Root package.json

```

**Key Updated Files:**
- `.github/workflows/playwright-allure.yml` – GitHub Actions workflow for Allure reporting
- `PlayWrightAutomation/playwright.config.js` – Playwright config with Allure reporter
- `PlayWrightAutomation/package.json` – Dependencies include `allure-playwright` & `allure-commandline`

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js 16+** (18+ recommended)
- **npm 6+** or **yarn**
- **Git** (for repository management)
- **GitHub account** (for CI/CD with Actions)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd PlayItWright/PlayWrightAutomation
```

### Step 2: Install Dependencies

```bash
# Install all dependencies including Playwright browsers
npm install

# Install Playwright browsers and system dependencies
npx playwright install --with-deps
```

### Step 3: Verify Installation

```bash
# Check Playwright is installed
npx playwright --version

# List installed browsers
npx playwright install --list
```

---

## ▶️ Running Tests

### Run All Tests

```bash
npm run regression
# or
npx playwright test
```

### Run Specific Test Tags

```bash
# Run only Web tests (tagged with @Web)
npm run webTests

# Run only API tests (tagged with @API)
npm run APITests
```

### Run with Allure Reporting

```bash
# Run tests with Allure reporter enabled
npm run test:allure
```

### Run in Headed mode (with Browser UI)

```bash
npx playwright test --headed
```

### Run Single Test File

```bash
npx playwright test tests/MoreValidations.spec.js
```

### Run with Debug Mode

```bash
npx playwright test --debug
```

### Run in UI Mode (Interactive)

```bash
npx playwright test --ui
```

---

## 📊 Allure Reporting

### What is Allure Report?

Allure is a framework designed to create detailed, interactive, and historically tracked reports of test execution. It provides:
- **Rich HTML reports** with dashboards
- **Historical trend analysis** (pass rate over time)
- **Timeline view** of test execution
- **Detailed failure analysis** with logs, screenshots, and videos
- **Test categorization** (Features, Stories, Defects)

### Generate Allure Report Locally

After running tests, generate the report:

```bash
# Generate report (requires Allure CLI installed)
allure generate allure-results --clean -o allure-report

# Open report in browser
allure open allure-report
```

**Note:** If Allure CLI is not installed, install it globally:

**macOS:**
```bash
brew install allure
```

**Linux:**
```bash
sudo apt-add-repository ppa:qameta/allure
sudo apt-get update
sudo apt-get install allure
```

**Windows:**
```bash
choco install allure
```

### Allure Report Features

**Dashboard View:**
- Total tests executed
- Pass/fail statistics
- Test duration
- Failure reasons

**Timeline:**
- Sequential test execution order
- Duration of each test
- Failure points

**Trend Chart:**
- Historical pass rate tracking
- Test execution trends
- Build-over-build comparison

**Categories:**
- Failed tests grouped by category
- Defects summary
- Product defects identification

---

## 🔧 GitHub Actions Pipeline

### Workflow Details

The workflow file: `.github/workflows/playwright-allure.yml`

**Triggers:**
- `push` to `main` branch
- `pull_request` on `main` branch
- Manual trigger via `workflow_dispatch`

**Jobs:**
1. **Checkout Code** – Fetch latest repository code
2. **Setup Node.js** – Install Node.js 18
3. **Install Dependencies** – Run `npm ci`
4. **Install Playwright Browsers** – Execute `npx playwright install --with-deps`
5. **Run Tests** – Execute `npx playwright test --reporter=line,allure-playwright`
6. **Check Results** – Verify Allure results were generated
7. **Restore History** – Fetch previous data for trend charts
8. **Generate Report** – Use `simple-elf/allure-report-action`
9. **Deploy to Pages** – Push report to GitHub Pages via `peaceiris/actions-gh-pages`
10. **Generate Summary** – Output report URL

### Permissions

```yaml
permissions:
  contents: write      # Required to push to gh-pages branch
  pages: write         # Required for GitHub Pages deployment
  id-token: write      # Required for OIDC token
```

### View Reports

After workflow execution:

1. Go to GitHub repository **Actions** tab
2. Click on the latest workflow run
3. Report will be generated and deployed to: `https://<username>.github.io/<repo-name>/`

### Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Select **Deploy from a branch**
3. Choose **gh-pages** branch
4. Save

---

## ⚙️ Configuration

### Playwright Configuration (`playwright.config.js`)

```javascript
{
  testDir: './tests',
  retries: 0,
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  reporter: [
    ['line'],           // Console output
    ['html'],           // HTML report
    ['allure-playwright']  // Allure integration
  ],
  outputDir: 'allure-results',  // Allure results directory
  use: {
    browserName: 'chromium',
    headless: true,
    screenshot: 'on',
    trace: 'on'
  }
}
```

### Key Configurations

| Setting | Purpose |
|---------|---------|
| `testDir` | Location of test files |
| `retries` | Number of retry attempts on failure |
| `timeout` | Test timeout in milliseconds |
| `reporter` | Test reporting format |
| `outputDir` | Allure results output directory |
| `screenshot` | Screenshot strategy (on, off, only-on-failure) |
| `trace` | Trace recording (on, off, on-first-retry) |

---

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "regression": "npx playwright test",
    "webTests": "npx playwright test --grep @Web",
    "APITests": "npx playwright test --grep @API",
    "test:allure": "npx playwright test --reporter=line,allure-playwright"
  }
}
```

### Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40",
    "allure-playwright": "^2.0.0-beta.15",
    "allure-commandline": "^2.27.0",
    "typescript": "^5.4.5"
  }
}
```

---

## ✅ Best Practices

### Test Organization

1. **Use descriptive test names** – Clear indication of what is tested
   ```javascript
   test('should validate login with valid credentials', async ({ page }) => {
   ```

2. **Implement Page Object Model** – Maintain page elements in separate files
   ```javascript
   // pageobjects/LoginPage.js
   class LoginPage {
     async login(username, password) { ... }
   }
   ```

3. **Use test annotations** – Add metadata to tests
   ```javascript
   test('verify payment flow', {
     tag: '@payment',
     annotation: {
       type: 'issue',
       description: 'https://github.com/issue/123'
     }
   }, async ({ page }) => {
   ```

4. **Tagging tests** – Use tags for selective execution
   ```javascript
   test('@critical verify checkout', async ({ page }) => {
   ```

### Allure Best Practices

1. **Add detailed descriptions** – Use `test.describe()` for organization
   ```javascript
   test.describe('Authentication Module', () => {
     test('user login', async ({ page }) => { ... });
   });
   ```

2. **Attach evidence** – Include screenshots, logs, in failure scenarios
   ```javascript
   await test.step('capture screenshot', async () => {
     await page.screenshot({ path: 'screenshot.png' });
   });
   ```

3. **Use steps** – Break tests into logical steps
   ```javascript
   await test.step('Navigate to login', async () => {
     await page.goto('/login');
   });
   ```

---

## 🐛 Troubleshooting

### Issue: Browser Dependencies Not Installed

**Error:** `Error: Playwright is not installed`

**Solution:**
```bash
npx playwright install --with-deps
```

### Issue: Allure Results Not Generated

**Problem:** Tests run but no Allure report appears

**Check:**
1. Verify `playwright.config.js` includes `'allure-playwright'` in reporters
2. Confirm `allure-results/` directory exists after test run
3. Check test output for errors

**Solution:**
```bash
# Reinstall dependencies
npm ci
npm run test:allure
```

### Issue: GitHub Pages Not Displaying Report

**Solution:**
1. Verify `gh-pages` branch exists in repository
2. Check **Settings** → **Pages** is configured
3. Ensure workflow has `contents: write` permission
4. Check workflow run logs for deployment errors

### Issue: Trend Chart Not Showing

**Cause:** First run doesn't have historical data

**Solution:** Historical data builds over time. After 2-3 runs, trends will appear.

### Issue: Tests Failing in CI but Passing Locally

**Common Causes:**
1. Missing `--with-deps` flag for Playwright browsers
2. Different environment variables between local and CI
3. Timing/synchronization issues in headless mode

**Solutions:**
```bash
# Force full dependency install
npx playwright install --with-deps

# Run in headless mode locally to match CI
npx playwright test --headed=false
```

---

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Allure Report Documentation](https://docs.qameta.io/allure/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Allure Playwright Integration](https://github.com/allure-framework/allure-js)

---

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 🤝 Support

For issues or questions, please:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

**Last Updated:** 2026-03-30  
**Allure Version:** 2.27.0  
**Playwright Version:** 1.40+  
**Node.js:** 18+
