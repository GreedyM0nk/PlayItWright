import { test, expect } from '../utils/fixtures';

/**
 * ENGINEERED: UI Basics Test Suite
 * Tests browser controls, form inputs, multi-window handling
 */
test('@Web Browser controls - login validation', async ({ page }) => {
  const userName = page.locator('#username');
  const signIn = page.locator("#signInBtn");
  const cardTitles = page.locator(".card-body a");
  
  // Request/Response logging
  page.on('request', (request) => console.log('Request: ' + request.url()));
  page.on('response', (response) => console.log('Response: ' + response.url() + ' ' + response.status()));
  
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
  console.log("Page title: " + await page.title());
  
  // Invalid login attempt
  await userName.fill("rahulshetty");
  await page.locator("[type='password']").fill("learning");
  await signIn.click();
  
  const errorMsg = await page.locator("[style*='block']").textContent();
  console.log("Error message: " + errorMsg);
  await expect(page.locator("[style*='block']")).toContainText('Incorrect');
  
  // Valid login
  await userName.fill("");
  await userName.fill("rahulshettyacademy");
  await signIn.click();
  
  // Verify product cards loaded
  const allTitles = await cardTitles.allTextContents();
  console.log("Product titles: " + allTitles.join(', '));
  expect(allTitles.length).toBeGreaterThan(0);
});

test('@Web UI controls - checkboxes and dropdowns', async ({ page }) => {
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
  
  const documentLink = page.locator("[href*='documents-request']");
  const dropdown = page.locator("select.form-control");
  
  // Select dropdown option
  await dropdown.selectOption("consult");
  
  // Select radio button
  await page.locator(".radiotextsty").last().click();
  await page.locator("#okayBtn").click();
  
  // Verify radio is checked
  await expect(page.locator(".radiotextsty").last()).toBeChecked();
  
  // Test checkbox
  await page.locator("#terms").click();
  await expect(page.locator("#terms")).toBeChecked();
  
  // Uncheck and verify
  await page.locator("#terms").uncheck();
  expect(await page.locator("#terms").isChecked()).toBeFalsy();
  
  // Verify document link has correct class
  await expect(documentLink).toHaveAttribute("class", "blinkingText");
});

test('@Web child windows handling', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const userName = page.locator('#username');
  
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
  const documentLink = page.locator("[href*='documents-request']");

  // Handle new window/tab
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    documentLink.click(),
  ]);

  // Extract email from new page
  const text = await newPage.locator(".red").textContent();
  const arrayText = text?.split("@") || [];
  const domain = arrayText[1]?.split(" ")[0];
  
  console.log("Extracted domain: " + domain);
  expect(domain).toBeTruthy();
  
  await context.close();
});
