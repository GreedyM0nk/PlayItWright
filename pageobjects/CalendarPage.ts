import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CALENDAR PAGE OBJECT
 * ====================
 * 
 * Manages calendar interactions:
 * - Select dates from calendar widget
 * - Get selected date
 * - Validate date selections
 * - Handle month/year navigation
 * 
 * Purpose: Encapsulate calendar interaction patterns
 */
export class CalendarPage extends BasePage {
  readonly calendarInput: Locator;
  readonly calendarWidget: Locator;
  readonly monthYearLabel: Locator;
  readonly dayButtons: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Selectors for react-date-picker (common calendar library)
    this.calendarInput = page.locator('.react-date-picker__inputGroup');
    this.calendarWidget = page.locator('.react-calendar');
    this.monthYearLabel = page.locator('.react-calendar__navigation__label');
    this.dayButtons = page.locator('.react-calendar__month-view__days__day');
    this.nextButton = page.locator('.react-calendar__navigation__next-button');
    this.prevButton = page.locator('.react-calendar__navigation__prev-button');
  }

  /**
   * Navigate to the calendar offers page
   * baseURL is configured in playwright.config.ts
   */
  async goTo(): Promise<void> {
    await this.page.goto('/seleniumPractise/#/offers');
  }

  /**
   * Select date from calendar
   * Usage: await calendarPage.selectDate('2027', '6', '15')
   * 
   * Steps:
   * 1. Click calendar input to open picker
   * 2. Double-click label to reach decade/year view
   * 3. Click the target year
   * 4. Click the target month
   * 5. Click the target day
   */
  async selectDate(year: string, month: string, day: string): Promise<void> {
    console.log(`📅 Selecting date: ${month}/${day}/${year}`);

    // Step 1: Click to open calendar
    await this.calendarInput.click();
    console.log(`✅ Calendar opened`);

    // Step 2: Two clicks on label — first gets to month view, second to decade/year view
    await this.monthYearLabel.click();
    await this.monthYearLabel.click();
    console.log(`✅ Decade/year view opened`);

    // Step 3: Click on target year
    await this.page.getByText(year).click();
    console.log(`✅ Year selected: ${year}`);

    // Step 4: Click month (in month view)
    const monthIndex = parseInt(month) - 1; // 0-indexed
    const monthButton = this.page.locator('.react-calendar__year-view__months__month').nth(monthIndex);
    await expect(monthButton).toBeVisible({ timeout: 5000 });
    await monthButton.click();
    console.log(`✅ Month selected: ${month}`);

    // Step 5: Click day using XPath text-content match (CSS [text=] does not match text nodes)
    await this.page.locator(`//abbr[text()='${day}']`).click();
    console.log(`✅ Day selected: ${day}`);
  }

  /**
   * Get currently selected date from input fields
   * Returns object with month, date, year as strings
   * Usage: const selected = await calendarPage.getSelectedDate()
   */
  async getSelectedDate(): Promise<{ month: string; date: string; year: string }> {
    const inputs = this.page.locator('.react-date-picker__inputGroup input');
    const count = await inputs.count();

    if (count !== 3) {
      throw new Error(
        `Expected 3 date inputs (month/date/year), but found ${count}`
      );
    }

    const month = await inputs.nth(0).getAttribute('value');
    const date = await inputs.nth(1).getAttribute('value');
    const year = await inputs.nth(2).getAttribute('value');

    const selected = { month: month || '', date: date || '', year: year || '' };
    console.log(`✅ Selected date: ${selected.month}/${selected.date}/${selected.year}`);

    return selected;
  }

  /**
   * Verify selected date matches expected values
   * Usage: await calendarPage.verifySelectedDate('2027', '6', '15')
   */
  async verifySelectedDate(
    expectedYear: string,
    expectedMonth: string,
    expectedDay: string
  ): Promise<void> {
    const selected = await this.getSelectedDate();

    expect(selected.year).toBe(expectedYear);
    expect(selected.month).toBe(expectedMonth);
    expect(selected.date).toBe(expectedDay);

    console.log(`✅ Date verification passed: ${expectedMonth}/${expectedDay}/${expectedYear}`);
  }

  /**
   * Get all available dates in current month view
   * Useful for validation or debugging
   */
  async getAvailableDates(): Promise<string[]> {
    const dayElements = this.page.locator('.react-calendar__month-view__days__day');
    const count = await dayElements.count();
    const dates: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await dayElements.nth(i).textContent();
      if (text && text.trim() && !isNaN(Number(text.trim()))) {
        dates.push(text.trim());
      }
    }

    console.log(`📅 Available dates: ${dates.join(', ')}`);
    return dates;
  }

  /**
   * Get current month/year displayed in calendar
   */
  async getCurrentDisplayMonth(): Promise<string> {
    const label = await this.monthYearLabel.textContent();
    return label || '';
  }

  /**
   * Navigate to next month
   */
  async nextMonth(): Promise<void> {
    await this.nextButton.click();
    console.log(`➡️ Navigated to next month`);
  }

  /**
   * Navigate to previous month
   */
  async previousMonth(): Promise<void> {
    await this.prevButton.click();
    console.log(`⬅️ Navigated to previous month`);
  }

  /**
   * Select date using direct input (alternative method)
   * Some calendars support typing the date directly
   * Usage: await calendarPage.selectDateByTyping('06/15/2027')
   */
  async selectDateByTyping(dateString: string): Promise<void> {
    const dateInput = this.page.locator('.react-date-picker__inputGroup input').first();
    await dateInput.clear();
    await dateInput.fill(dateString);
    console.log(`✅ Date typed: ${dateString}`);
  }

  /**
   * Check if calendar is open
   */
  async isCalendarOpen(): Promise<boolean> {
    try {
      await expect(this.calendarWidget).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close calendar by pressing Escape
   */
  async closeCalendar(): Promise<void> {
    await this.page.keyboard.press('Escape');
    console.log(`✅ Calendar closed`);
  }

  /**
   * Select range of dates (if calendar supports range selection)
   * Usage: await calendarPage.selectDateRange('2027', '6', '15', '2027', '6', '20')
   */
  async selectDateRange(
    startYear: string,
    startMonth: string,
    startDay: string,
    endYear: string,
    endMonth: string,
    endDay: string
  ): Promise<void> {
    // First select start date
    await this.selectDate(startYear, startMonth, startDay);
    console.log(`✅ Range start selected: ${startMonth}/${startDay}/${startYear}`);

    // Then select end date
    await this.selectDate(endYear, endMonth, endDay);
    console.log(
      `✅ Range end selected: ${endMonth}/${endDay}/${endYear}`
    );
  }

  /**
   * Get all dates in a specific month
   * Useful for test data selection
   */
  async getMonthDates(year: string, month: string, count: number = 5): Promise<string[]> {
    await this.selectDate(year, month, '1'); // Click any date to open for that month
    const available = await this.getAvailableDates();
    return available.slice(0, count);
  }
}
