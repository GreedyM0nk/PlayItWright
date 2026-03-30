# PlayIt Wright - Playwright Test Automation Framework

<div align="center">

![Playwright](https://img.shields.io/badge/Playwright-1.40%2B-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4%2B-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Allure](https://img.shields.io/badge/Allure-2.27%2B-blue)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-orange)

A comprehensive, production-ready **Playwright** test automation framework built entirely in **TypeScript** with integrated **Allure Reporting**, **GitHub Actions CI/CD**, and best practices for end-to-end testing.

[Features](#-features) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure) • [Running Tests](#-running-tests) • [CI/CD](#-cicd-pipeline)

</div>

---

## 🎯 About This Project

**PlayIt Wright** is an enterprise-grade testing framework built on Playwright, designed for scalable, maintainable, and automated test execution with detailed reporting and analytics. It combines:

- 🎭 **Playwright** - Modern, fast, and reliable browser automation
- 📘 **TypeScript** - Type-safe test automation with full IDE support
- 📊 **Allure Report** - Beautiful, interactive test reports with trends
- 🔄 **GitHub Actions** - Automated CI/CD pipeline with GitHub Pages deployment
- 📐 **Page Object Model** - Maintainable test architecture
- 🏗️ **Modular Design** - Reusable utilities and page abstractions

Perfect for teams looking to implement robust test automation with professional reporting capabilities.

---

## ✨ Features

### Testing Capabilities
✅ **Cross-browser Testing** - Chromium, Firefox, Safari  
✅ **Parallel Execution** - Run tests concurrently for faster feedback  
✅ **Mobile Testing** - Emulate mobile devices and tablets  
✅ **Network Control** - Intercept and mock API requests  
✅ **Recording & Debugging** - Videos, traces, HAR files, screenshots  

### Code Quality
✅ **TypeScript First** - Fully typed test automation  
✅ **Page Object Model** - Reusable page abstractions  
✅ **Utility Functions** - Common helper methods  
✅ **Custom Fixtures** - Extend Playwright with custom properties  
✅ **Best Practices** - Industry-standard patterns  

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
✅ **Customizable Configurations** - Multiple browser setups  
✅ **Docker Ready** - Container-friendly setup  

---

## 📋 Project Structure

```
PlayItWright/
├── .github/
│   └── workflows/
│       ├── playwright-allure.yml        # ⭐ Allure reporting pipeline
│       └── playwright_test_report.yml   # Alternative workflow
│
├── docs/
│   ├── ALLURE_SETUP.md
│   ├── TESTING_GUIDE.md
│   ├── SETUP_SUMMARY.md
│   └── TROUBLESHOOTING.md
│
├── tests/                               # 📝 Test Specifications
│   ├── ClientApp.spec.ts
│   ├── ClientAppPO.spec.ts
│   ├── WebAPIPart1.spec.ts
│   ├── WebAPIPart2.spec.ts
│   ├── NetworkTest.spec.ts
│   ├── UIBasicstest.spec.ts
│   ├── MoreValidations.spec.ts
│   ├── Calendar.spec.ts
│   ├── NetworlTest2.spec.ts
│   ├── upload-download.spec.ts
│   └── llc.spec.ts
│
├── pageobjects/                         # 📦 Page Object Model
│   ├── LoginPage.ts
│   ├── CartPage.ts
│   ├── DashboardPage.ts
│   ├── OrdersHistoryPage.ts
│   ├── OrdersReviewPage.ts
│   └── POManager.ts
│
├── utils/                               # 🔧 Utilities & Fixtures
│   ├── APiUtils.ts                      # API helper class
│   ├── test-base.ts                     # Custom test fixtures
│   └── placeorderTestData.json          # Test data
│
├── allure-results/                      # Generated test data
├── allure-report/                       # Generated Allure report
├── .gitignore                           # Git configuration
├── cucumber.js                          # Cucumber configuration (legacy)
├── playwright.config.js                 # 🔧 Main Playwright configuration
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Dependencies & scripts
└── README.md                            # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** 9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com))

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd PlayItWright

# 2. Install dependencies
npm install

# 3. Install Playwright browsers & system dependencies
npx playwright install --with-deps
```

### Verify Installation

```bash
# Run a quick test to verify everything is working
npm test -- --headed --workers=1

# You should see the Chromium browser open and tests running
```

---

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run specific browser
npm run test:chromium    # Chromium only
npm run test:firefox     # Firefox only
npm run test:safari      # Safari only

# Run tests by tag/grep
npm run test:web         # Run only @Web tagged tests
npm run test:api         # Run only @API tagged tests

# Run tests with Allure reporting
npm run test:allure
```

### Advanced Options

```bash
# Run specific test file
npx playwright test tests/ClientApp.spec.ts

# Run tests matching pattern
npx playwright test --grep "Client App"

# Run with retry on failure
npx playwright test --retries 2

# Run with limited workers (parallel)
npx playwright test --workers 1  # Sequential
npx playwright test --workers 4  # 4 parallel workers

# Generate and view reports
npm run test:allure                    # Run tests + generate Allure data
allure serve allure-results            # Open Allure report in browser
npx playwright show-report             # Show HTML report
```

---

## 📊 Viewing Reports

### Allure Reports

```bash
# Generate and serve Allure report
npx allure serve allure-results

# The report will open in your default browser at http://127.0.0.1:PORT
```

**Allure Report Features:**
- Test overview and statistics
- Detailed test steps and logs
- Screenshots and video attachments
- Performance timeline
- Trend analysis across runs
- Test history

### Playwright HTML Report

```bash
# View the default Playwright HTML report
npx playwright show-report
```

---

## 🏗️ Architecture

### Page Object Model (POM)

All page interactions are abstracted into page objects for maintainability:

**Example: `pageobjects/LoginPage.ts`**

```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  page: Page;
  userEmail: Locator;
  userPassword: Locator;
  loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userEmail = page.locator("#userEmail");
    this.userPassword = page.locator("#userPassword");
    this.loginButton = page.locator("[value='Login']");
  }

  async goTo() {
    await this.page.goto("https://rahulshettyacademy.com/client");
  }

  async validLogin(username: string, password: string) {
    await this.userEmail.fill(username);
    await this.userPassword.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
```

**Usage in Tests:**

```typescript
import { test } from '@playwright/test';
import { POManager } from '../pageobjects/POManager';

test('Login and complete order', async ({ page }) => {
  const poManager = new POManager(page);
  const loginPage = poManager.getLoginPage();
  
  await loginPage.goTo();
  await loginPage.validLogin("user@example.com", "password");
  // ... continue test
});
```

### API Utilities

**`utils/APiUtils.ts`** provides common API operations:

```typescript
import { APIRequestContext } from '@playwright/test';
import { APIUtils } from '../utils/APiUtils';

test('Create order via API', async ({ request }) => {
  const apiUtils = new APIUtils(request, loginPayload);
  const response = await apiUtils.createOrder(orderPayload);
  
  expect(response.orderId).toBeDefined();
});
```

### Custom Test Fixtures

**`utils/test-base.ts`** extends Playwright with custom fixtures:

```typescript
import { test as baseTest } from '@playwright/test';

interface TestDataForOrder {
  username: string;
  password: string;
  productName: string;
}

export const customTest = baseTest.extend<{testDataForOrder: TestDataForOrder}>({
  testDataForOrder: {
    username: "anshika@gmail.com",
    password: "Iamking@000",
    productName: "ADIDAS ORIGINAL"
  }
});

// Usage in tests
import { customTest } from '../utils/test-base';

customTest('Test with fixture', async ({ testDataForOrder }) => {
  console.log(testDataForOrder.username);
  // Use the fixture data in your test
});
```

---

## ⚙️ Configuration

### Playwright Configuration (`playwright.config.js`)

```javascript
const config = {
  testDir: './tests',
  testMatch: '**/*.spec.ts',     // Only run TypeScript tests
  timeout: 30 * 1000,             // 30 second timeout per test
  retries: 0,                      // No retries (set to 2 for CI)
  
  reporter: [
    ['line'],                      // Console output
    ['html'],                      // HTML report
    ['allure-playwright']          // Allure integration
  ],
  
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'safari',
      use: { ...devices['Desktop Safari'] }
    }
  ]
};
```

### TypeScript Configuration (`tsconfig.json`)

The project uses strict TypeScript settings for maximum type safety:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

Two automated workflows are triggered on every push:

#### 1. **playwright-allure.yml** (Recommended)
- Runs Playwright tests
- Generates Allure test data
- Creates interactive Allure report
- Automatically deploys to GitHub Pages
- Maintains historical trend data

#### 2. **playwright_test_report.yml** (Alternative)
- Runs Playwright tests
- Uses Allure CLI for report generation
- Deploys to GitHub Pages
- Alternative approach for specific scenarios

**Workflow Features:**
- ✅ Parallel test execution (multiple workers)
- ✅ Automatic browser installation
- ✅ Report archival and history
- ✅ GitHub Pages deployment
- ✅ Matrix strategy for multiple browsers

**View Reports:**
```
https://<username>.github.io/<repo-name>/
```

---

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { test, expect, Page } from '@playwright/test';

test('Complete purchase flow', async ({ page }: { page: Page }) => {
  // Arrange
  const testData = {
    username: "test@example.com",
    password: "password123",
    product: "Laptop"
  };

  // Act
  await page.goto('https://example.com');
  await page.locator('#email').fill(testData.username);
  await page.locator('#password').fill(testData.password);
  await page.click('button:has-text("Login")');

  // Assert
  await expect(page.locator('.welcome-msg')).toBeVisible();
  console.log('Test passed!');
});
```

### Test Tags & Organization

```typescript
// Tag tests for selective execution
test('@Web @Smoke Verify login page loads', async ({ page }) => {
  // ...
});

test('@API @Regression User creation via API', async ({ request }) => {
  // ...
});

// Run filtered tests
// npm run test:web      # Only @Web tests
// npm run test:api      # Only @API tests
```

### Assertions & Matchers

```typescript
import { expect } from '@playwright/test';

// Common assertions
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeEnabled();
await expect(locator).toHaveText('Expected text');
await expect(locator).toHaveValue('input-value');
await expect(page).toHaveTitle('Page Title');
await expect(response).toBeOK();

// Custom matchers (from Allure integration)
expect(value).toEqual(expected);
expect(array).toContain(element);
```

---

## 🐛 Debugging & Troubleshooting

### Debug Mode

```bash
# Run in debug mode with step-by-step execution
npm run test:debug

# Keyboard shortcuts:
# 'c' - Continue to next step
# 's' - Step over
# 'Enter' - Continue to next step
```

### Inspector Tool

```bash
# Launch Playwright Inspector (visual debugger)
npx playwright test --debug

# Inspect network traffic
page.on('request', request => console.log(request.url()));
page.on('response', response => console.log(response.status()));
```

### Common Issues & Solutions

**Issue: Tests timeout**
```typescript
// Increase timeout for specific test
test.setTimeout(60000); // 60 seconds

// Or globally in playwright.config.js
timeout: 60 * 1000
```

**Issue: Element not found**
```typescript
// Use waitFor for dynamic content
await page.locator('.dynamic-element').waitFor({ state: 'visible' });
await page.waitForLoadState('networkidle');
```

**Issue: Flaky tests**
```typescript
// Use proper waits instead of sleep
await page.waitForSelector('.element');
await page.waitForNavigation();
await page.waitForFunction(() => document.readyState === 'complete');
```

---

## 📚 Documentation

- **[Allure Setup Guide](./docs/ALLURE_SETUP.md)** - Comprehensive Allure integration guide
- **[Testing Guide](./docs/TESTING_GUIDE.md)** - Best practices and testing patterns
- **[Setup Summary](./docs/SETUP_SUMMARY.md)** - Installation and configuration walkthrough
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Playwright Docs](https://playwright.dev/)** - Official Playwright documentation
- **[Allure Docs](https://docs.qameta.io/allure/)** - Allure reporting documentation

---

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. **Create a branch** for your feature
   ```bash
   git checkout -b feature/add-new-tests
   ```

2. **Write tests** following the project structure
   ```bash
   tests/MyNewTest.spec.ts
   pageobjects/NewPage.ts
   ```

3. **Ensure tests pass** locally
   ```bash
   npm test
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new payment flow tests"
   ```

5. **Push and create a Pull Request**

---

## 📦 Dependencies

- **@playwright/test** - Browser automation framework
- **typescript** - Type safety
- **allure-playwright** - Allure reporter
- **allure-commandline** - Allure CLI
- **exceljs** - Excel file handling

---

## 📄 License

ISC License - feel free to use this project for your own purposes.

---

## ❓ FAQ

**Q: Can I use JavaScript instead of TypeScript?**  
A: Yes, Playwright supports both. However, TypeScript is recommended for better IDE support and type safety.

**Q: How often are reports updated?**  
A: Reports are automatically generated and deployed on every CI/CD run. Check GitHub Actions for details.

**Q: Can I run tests locally without CI/CD?**  
A: Absolutely! All tests can be run locally with `npm test`. No CI/CD setup required for local development.

**Q: How do I add new page objects?**  
A: Create a new `.ts` file in `pageobjects/` directory following the existing pattern in `LoginPage.ts`.

**Q: Can I run tests in parallel?**  
A: Yes! Playwright runs tests in parallel by default. Adjust workers with `--workers N` flag.

---

## 📞 Support

For issues, questions, or suggestions:
1. Check the [documentation](./docs/)
2. Review [existing issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information

---

**Happy Testing! 🎭✨**
