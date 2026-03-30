import { test, expect } from '../utils/fixtures';

/**
 * ENGINEERED: More Validations Test Suite
 * Tests popup handling, hover effects, iframes, screenshots
 * Using new PopupPage and IframePage POMs
 */
test("@Web Popup validations", async ({
  page,
  pages: { popupPage, iframePage }
}) => {
  await page.goto("https://rahulshettyacademy.com/AutomationPractice/");

  // Verify textbox is visible
  await expect(page.locator("#displayed-text")).toBeVisible();
  
  // Hide textbox
  await page.locator("#hide-textbox").click();
  await expect(page.locator("#displayed-text")).toBeHidden();
  
  // Handle dialog using PopupPage
  await page.locator("#confirmbtn").click();
  
  // Hover effect
  await page.locator("#mousehover").hover();
  
  // Handle iframe using IframePage
  const linkText = await iframePage.getTextInFrame("#courses-iframe", "li a[href*='lifetime-access']:visible");
  expect(linkText).toBeTruthy();
});

test("Screenshot & Visual comparison", async ({ page, pages: { basePage } }) => {
  await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
  
  // Verify element visible
  await expect(page.locator("#displayed-text")).toBeVisible();
  
  // Take partial screenshot
  await page.locator('#displayed-text').screenshot({ path: 'partialScreenshot.png' });
  
  // Hide and verify
  await page.locator("#hide-textbox").click();
  await page.screenshot({ path: 'screenshot.png' });
  await expect(page.locator("#displayed-text")).toBeHidden();
});

test('visual regression', async ({ page }) => {
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
  expect(await page.screenshot()).toMatchSnapshot('landing.png');
});
