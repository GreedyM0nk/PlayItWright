# PlayIt Wright - Playwright Test Automation Framework

<div align="center">

![Playwright](https://img.shields.io/badge/Playwright-2.0%2B-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Allure](https://img.shields.io/badge/Allure-2.27%2B-blue)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-orange)
![License](https://img.shields.io/badge/License-ISC-yellow)

A comprehensive, production-ready **Playwright** test automation framework with integrated **Allure Reporting**, **GitHub Actions CI/CD**, and best practices for end-to-end testing.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [CI/CD](#-cicd-pipeline) • [Contributing](#-contributing)

</div>

---

## 🎯 About This Project

**PlayIt Wright** is an enterprise-grade testing framework built on Playwright, designed for scalable, maintainable, and automated test execution with detailed reporting and analytics. It combines:

- 🎭 **Playwright** - Modern, fast, and reliable browser automation
- 📊 **Allure Report** - Beautiful, interactive test reports with trends
- 🔄 **GitHub Actions** - Automated CI/CD pipeline
- 📐 **Page Object Model** - Maintainable test architecture
- 🏷️ **BDD Support** - Cucumber integration for behavior-driven tests

Perfect for teams looking to implement robust test automation with professional reporting capabilities.

---

## ✨ Features

### Testing Capabilities
✅ **Cross-browser Testing** - Chromium, Firefox, WebKit, Safari  
✅ **Parallel Execution** - Run tests concurrently for faster feedback  
✅ **Mobile Testing** - Emulate mobile devices and tablets  
✅ **Network Control** - Simulate network conditions  
✅ **Recording & Debugging** - Videos, traces, HAR files, screenshots  

### Reporting & Analytics
✅ **Allure Reports** - Rich, interactive HTML reports  
✅ **Trend Analysis** - Historical data and performance metrics  
✅ **Screenshot/Video Capture** - Automatic on failure  
✅ **Execution Timeline** - Detailed test execution flow  
✅ **Failure Analysis** - Categorized failure reasons  

### Infrastructure & DevOps
✅ **GitHub Actions CI/CD** - Automated testing on every push  
✅ **GitHub Pages Deployment** - Auto-deploy reports  
✅ **Multi-environment Support** - Dev, staging, production  
✅ **Customizable Configurations** - Multiple browser/device setups  
✅ **Version Control Integration** - Git workflow support  

### Code Organization
✅ **Page Object Model** - Reusable page abstractions  
✅ **Utility Functions** - Common helper methods  
✅ **TypeScript Support** - Type-safe test automation  
✅ **Cucumber/BDD** - Behavior-driven test scenarios  
✅ **Best Practices** - Industry-standard patterns  

---

## 📋 Project Structure

```
PlayItWright/
├── .github/
│   └── workflows/
│       ├── playwright-allure.yml        # ⭐ Main Allure reporting pipeline
│       └── playwright_test_report.yml   # Alternative workflow
├── docs/
│   ├── ALLURE_SETUP.md                  # Comprehensive Allure guide
│   ├── TESTING_GUIDE.md                 # Testing documentation
│   ├── SETUP_SUMMARY.md                 # Setup instructions
│   └── TROUBLESHOOTING.md               # Common issues & solutions
├── tests/                               # 📝 Test specifications
│   ├── *.spec.js                        # Playwright test files
│   ├── *.spec.ts                        # TypeScript test files
│   └── MoreValidations.spec.js          # Example test
├── pageobjects/                         # 📦 Page Object Model (JavaScript)
│   ├── LoginPage.js
│   ├── CartPage.js
│   ├── DashboardPage.js
│   └── POManager.js
├── pageobjects_ts/                      # 📦 Page Object Model (TypeScript)
│   ├── LoginPage.ts
│   ├── CartPage.ts
│   ├── DashboardPage.ts
│   └── POManager.ts
├── features/                            # 🏷️ BDD Feature files (Cucumber)
│   ├── greeting.feature
│   ├── ErrorValidation.feature
│   └── step_definitions/
│       ├── steps.js
│       └── steps.ts
├── utils/                               # 🔧 Utility functions (JavaScript)
│   ├── APiUtils.js
│   ├── test-base.js
│   └── placeorderTestData.json
├── utils_ts/                            # 🔧 Utility functions (TypeScript)
│   ├── APiUtils.ts
│   ├── test-base.ts
│   └── placeorderTestData.json
├── .github/                             # GitHub configuration
├── .gitignore                           # Git ignore rules
├── cucumber.js                          # Cucumber configuration
├── playwright.config.js                 # 🔧 Main Playwright configuration
├── playwright.config1.js                # Alternative config (Safari/Safari-specific)
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Dependencies & npm scripts
├── package-lock.json                    # Dependency lock file
└── README.md                            # 👈 You are here

**Generated directories (not in git):**
- `allure-results/` - Allure test data
- `allure-report/` - Allure HTML reports
- `test-results/` - Playwright test results
- `playwright-report/` - Playwright HTML reports
- `node_modules/` - Project dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** 6+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com))

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd PlayItWright

# Install dependencies
npm install

# Install Playwright browsers & system dependencies
npx playwright install --with-deps
```

### 2️⃣ Run Tests

```bash
# Run all tests (basic output)
npm run regression

# Run all tests with Allure reporting
npm run test:allure

# Run specific test suites by tag
npm run webTests    # Tests tagged with @Web
npm run APITests    # Tests tagged with @API

# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Debug mode (interactive debugging)
npx playwright test --debug

# UI mode (visual test runner)
npx playwright test --ui

# Run specific test file
npx playwright test tests/ClientApp.spec.js

# Run tests matching pattern
npx playwright test -g "login"

# Headed mode (see browser)
npx playwright test --headed
```

### 3️⃣ View Allure Reportswith default reporters |
| `webTests` | `npx playwright test --grep @Web` | Tests tagged with @Web |
| `APITests` | `npx playwright test --grep @API` | Tests tagged with @API |
| `test:allure` | `npx playwright test --reporter=line,allure-playwright` | Run with Allure + console reporting |
| `SafariNewConfig` | `npx playwright test --config playwright.config1.js --project=safari` | Run with Safari configuration

# Generate and open Allure report
allure generate allure-results --clean -o allure-report
allure open allure-report
```

**Alternative: View Allure Report in Browser**
```bash
# Generate report
allure generate allure-results --clean -o allure-report

# Serve locally (if allure is installed globally)
allure serve allure-results

# Or open the HTML directly
open allure-report/index.html
```

### 4️⃣ View Playwright Reports

```bash
# After running tests
npx playwright show-report
```

---

## 📊 Available NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `regression` | `npx playwright test` | Run all tests |
| `webTests` | `--grep @Web` | Tests tagged with @Web |
| `APITests` | `--grep @API` | Tests tagged with @API |
| `test:allure` | `--reporter=line,allure-playwright` | Run with Allure reporting |
| `SafariNewConfig` | Alternative config | Run with Safari browser |

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The **Allure Reporting Pipeline** (`playwright-allure.yml`) automates:

1. ✅ **Code Checkout** - Fetch latest repository code
2. ✅ **Environment Setup** - Install Node.js, dependencies, browsers
3. ✅ **Test Execution** - Run all Playwright tests
4. ✅ **Report Generation** - Create Allure reports
5. ✅ **History Tracking** - Maintain trend data
6. ✅ **GitHub Pages Deployment** - Auto-deploy reports

### Trigger Events
- 📌 Push to `main` branch
- 📌 Pull requests on `main`
- 📌 Manual trigger via `workflow_dispatch`

### View Reports
After workflow execution, reports are available at:
```
https://<username>.github.io/<repo-name>/
```

**Setup GitHub Pages:**
1. Go to **Settings** → **Pages**
2. Select "Deploy from a branch"
3. Choose `gh-pages` branch
4. Save

---

## 📖 Documentation

For detailed information, see:

- **[Allure Setup Guide](docs/ALLURE_SETUP.md)** - Complete Allure Report configuration & usage
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Writing tests, best practices, patterns
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues & solutions

---

## 🛠️ Configuration

### Playwright Config (`playwright.config.js`)

Key settings:
```javascript
{
  testDir: './tests',          // Test files location
  timeout: 30 * 1000,          // Test timeout (ms)
  retries: 0,                  // Retry failed tests
  reporter: [                  // Report formats
    'line',                    // Console output
    'html',                    // HTML report
    'allure-playwright'        // Allure report
  ],
  outputDir: 'allure-results', // Allure output
  use: {
    browserName: 'chromium',   // Browser type
    headless: true,            // Run in headless mode
    screenshot: 'on',          // Screenshot strategy
    trace: 'on'                // Record trace
  }
}
```

### Package Dependencies

**Test Framework:**
```json
{
  "@playwright/test": "^1.40",
  "@cucumber/cucumber": "*"
}
```

**Reporting:**
```json
{
  "allure-playwright": "^2.0.0-beta.15",
  "allure-commandline": "^2.27.0"
}
```

**Language Support:**
```json
{
  "typescript": "^5.4.5"
}
```

---

## 📝 Writing Tests

### Basic Test Example

```javascript
const { test, expect } = require('@playwright/test');

test('verify login with valid credentials', async ({ page }) => {
  // Navigate
  await page.goto('https://example.com/login');

  // Interact
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Assert
  await expect(page).toHaveURL('https://example.com/dashboard');
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

### Using Page Object Model

```javascript
// pageobjects/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = 'input[name="email"]';
    this.passwordInput = 'input[name="password"]';
    this.submitButton = 'button[type="submit"]';
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitButton);
  }
}

module.exports = LoginPage;
```

### Using Test Tags

```javascript
// Run with: npm run webTests
test('@web verify homepage', async ({ page }) => {
  // Test code
});

// Run with: npm run APITests
test('@api verify endpoint', async ({ request }) => {
  // Test code
});
```

---

## ✅ Best Practices

### Test Organization
- ✅ Use descriptive test names
- ✅ Organize tests in logical groups with `test.describe()`
- ✅ Keep tests independent and isolated
- ✅ Use Page Object Model for UI elements

### Assertions
- ✅ Use specific assertions
- ✅ Wait for expected conditions
- ✅ Avoid hard-coded waits (`await page.waitForTimeout()`)

### Code Quality
- ✅ Use reusable utility functions
- ✅ Keep test code DRY
- ✅ Comment complex logic
- ✅ Follow naming conventions

### Reporting
- ✅ Use `test.step()` for detailed steps
- ✅ Attach screenshots for visual validation
- ✅ Log important information
- ✅ Use meaningful test descriptions

### CI/CD
- ✅ Run tests on every push
- ✅ Monitor report trends
- ✅ Keep Allure history clean
- ✅ Set up notifications for failures

---

## 🐛 Troubleshooting

### Common Issues

**Browser not installed:**
```bash
npx playwright install --with-deps
```

**Tests fail in CI but pass locally:**
```bash
# Run in headless mode (matches CI environment)
npx playwright test --headed=false
```

**Allure report not showing:**
1. Verify tests generated `allure-results/` directory
2. Check `playwright.config.js` includes `'allure-playwright'`
3. Run: `npm run test:allure`

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more solutions.

---

## 🔗 Resources

**Official Documentation:**
- [Playwright Docs](https://playwright.dev)
- [Allure Report Docs](https://docs.qameta.io/allure/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

**Community:**
- [Playwright GitHub](https://github.com/microsoft/playwright)
- [Allure GitHub](https://github.com/allure-framework)

---

## 📝 Contributing

We welcome contributions! Please:

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write tests for new features
   - Follow existing code style
   - Update documentation

3. **Commit with clear messages:**
   ```bash
   git commit -m "feat: add your feature description"
   ```

4. **Push and submit PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 📄 License

This project is licensed under the **ISC License** - see [LICENSE](LICENSE) file for details.

---

## 🤝 Support

Encountering issues? Follow these steps:

1. **Check Docs** - Review [docs/](docs/) folder for guides
2. **Search Issues** - Look for existing GitHub issues
3. **Create Issue** - Report with detailed information:
   - Operating system
   - Node.js version
   - Error message & stack trace
   - Steps to reproduce

---

<div align="center">

**Made with ❤️ for QA Engineers**

⭐ If you find this helpful, please give it a star!

[⬆ back to top](#playit-wright---playwright-test-automation-framework)

</div>
