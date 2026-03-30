import { test, expect } from '../utils/fixtures';

/**
 * MODERNIZED: Calendar Test
 * Updated to use new fixtures system and Web-First assertions
 */
test("@Calendar Calendar validations", async ({ page }) => {
  const monthNumber = "6";
  const date = "15";
  const year = "2027";
  const expectedList = [monthNumber, date, year];
  await page.goto("https://rahulshettyacademy.com/seleniumPractise/#/offers");
  await page.locator(".react-date-picker__inputGroup").click();
  await page.locator(".react-calendar__navigation__label").click();
  await page.locator(".react-calendar__navigation__label").click();
  await page.getByText(year).click();
  await page.locator(".react-calendar__year-view__months__month").nth(Number(monthNumber) - 1).click();
  await page.locator("//abbr[text()='" + date + "']").click();
  
  // ENGINEERED: Use evaluate() instead of loop to get all values at once
  const inputs = page.locator(".react-date-picker__inputGroup input");
  const values = await inputs.evaluate((elements: any) => 
    Array.from(elements).map((el: any) => el.getAttribute("value"))
  );
  
  expect(values).toEqual(expectedList);
});
