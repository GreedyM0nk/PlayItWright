import { test, expect } from '../utils/fixtures';

/**
 * MODERNIZED: Calendar Test
 * Updated to use new fixtures system and Web-First assertions
 * Uses CalendarPage from PageObjectFactory for navigation and interaction
 */
test("@Calendar Calendar validations", async ({ pages: { calendarPage } }) => {
  const monthNumber = "6";
  const date = "15";
  const year = "2027";
  const expectedList = [monthNumber, date, year];

  // Use CalendarPage from factory — goTo() uses relative path from baseURL
  await calendarPage.goTo();
  await calendarPage.selectDate(year, monthNumber, date);

  const selected = await calendarPage.getSelectedDate();
  expect([selected.month, selected.date, selected.year]).toEqual(expectedList);
});
