# Testing Guide - PlayIt Wright

Complete guide for writing, organizing, and executing tests using Playwright and the Page Object Model pattern.

## Table of Contents

- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Page Object Model](#page-object-model)
- [Test Selectors](#test-selectors)
- [Synchronization & Waits](#synchronization--waits)
- [Test Annotations](#test-annotations)
- [Debugging Tests](#debugging-tests)
- [Performance Tips](#performance-tips)
- [Common Patterns](#common-patterns)

---

## Test Structure

### Basic Test Layout

```javascript
const { test, expect } = require('@playwright/test');

test('should perform user action', async ({ page }) => {
  // Arrange - Set up test data and navigate
  await page.goto('https://example.com');

  // Act - Perform the action being tested
  await page.click('button.login');

  // Assert - Verify expected outcome
  await expect(page).toHaveURL('https://example.com/dashboard');
});
```

### Test Groups with `test.describe()`

```javascript
test.describe('Login Module', () => {
  test.beforeEach(async ({ page }) => {
    // Runs before each test in this group
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Test code
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Test code
  });

  test.describe('Password Reset', () => {
    // Nested describe blocks
    test('should send reset link', async ({ page }) => {
      // Test code
    });
  });
});
```

---

## Writing Tests

### 1. Navigation

```javascript
// Go to URL
await page.goto('https://example.com');

// Go to a relative path (requires baseURL in config)
await page.goto('/dashboard');

// Wait for specific page state
await page.goto('/login', { waitUntil: 'networkidle' });
```

Options:
- `'load'` - Wait for load event (default)
- `'domcontentloaded'` - Wait for DOMContentLoaded
- `'networkidle'` - Wait for network to be idle

### 2. Interactions

```javascript
// Click element
await page.click('button.submit');
await page.click('text=Login'); // Click by text

// Type text
await page.fill('input[name="email"]', 'user@example.com');
await page.type('input[name="password"]', 'password123');

// Select dropdown
await page.selectOption('select#country', 'US');

// Check/uncheck checkbox
await page.check('input[type="checkbox"]');
await page.uncheck('input[type="checkbox"]');

// Submit form
await page.click('button[type="submit"]');
```

### 3. Assertions

```javascript
// URL assertions
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/dashboard/);

// Text assertions
await expect(page.locator('h1')).toContainText('Welcome');
await expect(page.locator('.message')).toHaveText('Exact text');

// Element visibility
await expect(page.locator('.loader')).toBeVisible();
await expect(page.locator('.error')).toBeHidden();

// Element state
await expect(page.locator('button.submit')).toBeEnabled();
await expect(page.locator('input[name="email"]')).toHaveValue('user@example.com');

// Element count
await expect(page.locator('.item')).toHaveCount(5);

// Attribute assertions
await expect(page.locator('.badge')).toHaveAttribute('class', /badge/);

// CSS assertions
await expect(page.locator('button')).toHaveCSS('color', 'rgb(255, 0, 0)');
```

### 4. Multiple Elements

```javascript
// Get all matching elements
const items = page.locator('.list-item');

// Count elements
const count = await items.count();
console.log(`Found ${count} items`);

// Iterate through elements
for (let i = 0; i < count; i++) {
  const text = await items.nth(i).textContent();
  console.log(text);
}

// Get specific element by index
await items.first().click();
await items.last().click();
await items.nth(2).click();
```

### 5. Keyboard & Mouse

```javascript
// Press keys
await page.press('input', 'Enter');
await page.keyboard.press('Escape');
await page.keyboard.type('Hello World');

// Multiple keys
await page.keyboard.down('Control');
await page.keyboard.press('KeyA');
await page.keyboard.up('Control');

// Mouse hover
await page.hover('button.tooltip-trigger');

// Drag & drop
await page.locator('.source').dragTo(page.locator('.target'));
```

---

## Page Object Model

Pattern for organizing test code and reusing selectors.

### Basic Page Object

```javascript
// pageobjects/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    
    // Define selectors
    this.emailInput = 'input[name="email"]';
    this.passwordInput = 'input[name="password"]';
    this.submitButton = 'button[type="submit"]';
    this.errorMessage = '.error-message';
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitButton);
  }

  async getErrorMessage() {
    return await this.page.textContent(this.errorMessage);
  }

  async isErrorVisible() {
    return await this.page.isVisible(this.errorMessage);
  }
}

module.exports = LoginPage;
```

### Using Page Objects in Tests

```javascript
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pageobjects/LoginPage');

test.describe('Authentication', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('should login successfully', async ({ page }) => {
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async () => {
    await loginPage.login('user@example.com', 'wrongpassword');
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Invalid credentials');
  });
});
```

### Advanced Page Object with Locators

```javascript
const { expect } = require('@playwright/test');

class DashboardPage {
  constructor(page) {
    this.page = page;
    
    // Using Locator API (recommended)
    this.greeting = page.locator('h1.greeting');
    this.sidebar = page.locator('[role="navigation"]');
    this.logoutButton = page.locator('button:has-text("Logout")');
  }

  async getGreetingText() {
    return await this.greeting.textContent();
  }

  async isSidebarVisible() {
    return await this.sidebar.isVisible();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async navigateToSection(sectionName) {
    await this.sidebar.locator(`text=${sectionName}`).click();
  }
}

module.exports = DashboardPage;
```

---

## Test Selectors

### Selector Strategies

```javascript
// CSS selectors
'button.primary'
'input[type="password"]'
'.sidebar > .menu-item'

// Text selectors
'text=Login'
'text="Click Me"' // Exact match
'//button[contains(text(), "Submit")]' // XPath

// Attribute selectors
'[data-testid="submit-button"]'
'[role="button"]'
'[aria-label="Close"]'

// Combination selectors
'button.primary:has-text("Login")'
'.modal >> .close-button'

// Frames
'iframe[name="settings"] >> button'
```

### Best Practices for Selectors

✅ **Do:**
```javascript
// Use data-testid attributes (explicit, stable)
'[data-testid="login-button"]'

// Use semantic HTML attributes
'[role="button"]'
'[aria-label="Close"]'

// Use text for visible elements
'text=Submit'

// Use classes for styled components
'.btn-primary'
```

❌ **Avoid:**
```javascript
// Brittle XPath
'//*[@id="root"]/div[1]/div[2]/button[3]'

// Implementation details
'.jsx-234'
'#auto-generated-id'

// Absolute positioning
'div > div > div > button'
```

### Locator Tips

```javascript
// Get locator (does not execute)
const button = page.locator('button.submit');

// Convert locator to element
const element = await button.elementHandle();

// Access multiple elements
const items = page.locator('.item');
const count = await items.count();

// Filter locators
const enabledButtons = page.locator('button').filter({ hasText: 'Submit' });
```

---

## Synchronization & Waits

### Auto-waiting (Default)

Playwright automatically waits for elements to be:
- ✅ Attached to the DOM
- ✅ Visible on the page
- ✅ Stable (not animating)
- ✅ Enabled (not disabled)

```javascript
// Playwright waits automatically
await page.click('button'); // Waits up to 30s by default
```

### Custom Waits

```javascript
// Wait for condition
await page.waitForFunction(() => document.title.includes('Dashboard'));

// Wait for URL
await page.waitForURL('**/dashboard');

// Wait for element
await page.waitForSelector('.notification');

// Wait for response
const response = await page.waitForResponse(resp => resp.url().includes('/api/data'));
```

### Navigation Waits

```javascript
// Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('a.login-link')
]);

// Wait for reload
await Promise.all([
  page.waitForNavigation(),
  page.click('button.refresh')
]);
```

### Timeouts

```javascript
// Set global timeout in config
{
  timeout: 30 * 1000 // 30 seconds
}

// Override for specific action
await page.click('button', { timeout: 5000 });

// Expect with timeout
await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
```

---

## Test Annotations

### Tags

```javascript
test('@smoke verify login', async ({ page }) => {
  // Run with: npx playwright test --grep @smoke
});

test('@slow @critical long running test', async ({ page }) => {
  // Run with: npx playwright test --grep @critical
});
```

### Conditional Execution

```javascript
test.skip('skip this test', async ({ page }) => {
  // Test won't run
});

test.only('run only this test', async ({ page }) => {
  // Only this test in the file will run
});

test('conditional skip', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Not available on WebKit');
  // Test will skip on Safari
});

test('expected to fail', async ({ page }) => {
  test.fail();
  // Failures won't affect test run
});
```

### Fixtures

```javascript
const { test } = require('@playwright/test');
const LoginPage = require('../pageobjects/LoginPage');

const test2 = test.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
    // Cleanup after test
  }
});

test2('use custom fixture', async ({ loginPage }) => {
  await loginPage.login('user@example.com', 'password');
});
```

---

## Debugging Tests

### Debug Mode

```bash
# Run tests with debugger
npx playwright test --debug

# Or use PWDEBUG environment variable
PWDEBUG=1 npx playwright test
```

### UI Mode (Interactive)

```bash
# Run in interactive UI mode
npx playwright test --ui

# Inspect specific test
npx playwright test tests/login.spec.js --ui
```

### Logging & Inspection

```javascript
// Log to console
console.log('Current URL:', page.url());

// Get page content
const html = await page.content();

// Get text content
const text = await page.textContent('body');

// Inspect network requests
page.on('request', request => console.log('→', request.method(), request.url()));
page.on('response', response => console.log('←', response.status(), response.url()));
```

### Screenshots & Videos

```javascript
// Manual screenshot
await page.screenshot({ path: 'screenshot.png' });
await page.screenshot({ path: 'element.png', fullPage: false });

// Element screenshot
await page.locator('button').screenshot({ path: 'button.png' });

// HAR (network recording)
await page.context().routeFromHAR('data.har');

// Trace recording (via config)
{
  use: {
    trace: 'on' // Records all interactions
  }
}

// View trace
npx playwright show-trace trace.zip
```

---

## Performance Tips

### 1. Parallelize Tests

```javascript
// Configure in playwright.config.js
{
  workers: 4, // Run 4 tests in parallel
  timeout: 30000
}
```

### 2. Avoid Unnecessary Waits

```javascript
// ❌ Don't do this
await page.waitForTimeout(5000); // Hard wait - BAD

// ✅ Do this instead
await expect(page.locator('.notification')).toBeVisible();
```

### 3. Reuse Browser Context

```javascript
// Share authentication across tests
test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  await context.addCookies([...]);
});
```

### 4. Use Efficient Selectors

```javascript
// ✅ Fast - direct attribute match
'[data-testid="submit"]'

// ❌ Slow - complex XPath
'//*[contains(parent::*/text(), "Submit")]'
```

### 5. Filter Results Early

```javascript
// ✅ Filter in selector
page.locator('button:has-text("Submit")')

// ❌ Filter in code
const buttons = await page.locator('button').all();
const submit = buttons.find(b => b.includes('Submit'));
```

---

## Common Patterns

### Login Helper

```javascript
async function loginAs(page, email, password) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
}

// Usage
test('verify profile page', async ({ page }) => {
  await loginAs(page, 'user@example.com', 'password123');
  await page.goto('/profile');
  // Test profile page
});
```

### API Response Validation

```javascript
test('verify API response', async ({ page }) => {
  let apiData;

  page.on('response', async response => {
    if (response.url().includes('/api/data')) {
      apiData = await response.json();
    }
  });

  await page.click('button.load-data');
  await expect(page.locator('.data')).toBeVisible();

  expect(apiData.status).toBe('success');
  expect(apiData.items).toHaveLength(10);
});
```

### Test Data Factory

```javascript
// utils/testData.js
function createUser(overrides = {}) {
  return {
    email: 'user@example.com',
    password: 'password123',
    name: 'Test User',
    ...overrides
  };
}

// Usage in test
test('verify profile update', async ({ page }) => {
  const user = createUser({ name: 'John Doe' });
  await fillUserForm(page, user);
  await expect(page.locator('.success')).toContainText('Profile updated');
});
```

### Modal Handling

```javascript
test('handle modal dialog', async ({ page }) => {
  let confirmation;

  page.on('dialog', dialog => {
    console.log(`Dialog: ${dialog.message()}`);
    confirmation = dialog;
    dialog.accept();
  });

  await page.click('button.delete');
  await expect(page.locator('.success')).toContainText('Deleted');
});
```

### File Upload

```javascript
test('upload file', async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles('path/to/file.pdf');
  await page.click('button.upload');
  await expect(page.locator('.success')).toBeVisible();
});
```

### Multiple Tabs/Windows

```javascript
test('handle new window', async ({ page, context }) => {
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.click('a[target="_blank"]')
  ]);

  await newPage.waitForLoadState();
  await expect(newPage).toHaveURL(/external-site/);
  
  await newPage.close();
});
```

---

## Resources

- [Playwright Testing Docs](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)
- [Test Report](https://playwright.dev/docs/test-reports)

---

**Happy Testing! 🎭**
