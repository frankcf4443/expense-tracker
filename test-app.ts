import { chromium } from "npm:playwright";

async function testExpenseTracker() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to login page...");
    await page.goto("http://localhost:8001/login");

    console.log("Filling login form...");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");

    console.log("Submitting login...");
    await page.click('button[type="submit"]');

    console.log("Waiting for navigation...");
    await page.waitForURL("http://localhost:8001/", { timeout: 5000 });

    console.log("Checking if logged in successfully...");
    const title = await page.title();
    console.log("Page title:", title);

    const heading = await page.textContent("h1");
    console.log("Main heading:", heading);

    const pageText = await page.textContent("body");
    console.log("Page content preview:", pageText?.substring(0, 500));

    // Check for expense tracker elements
    const hasExpenseForm = await page.locator("form").count() > 0;
    const hasExpenseList = await page.locator("text=Recent Expenses").count() > 0;
    const hasAnalytics = await page.locator("text=Analytics").count() > 0;

    console.log("Has expense form:", hasExpenseForm);
    console.log("Has expense list section:", hasExpenseList);
    console.log("Has analytics:", hasAnalytics);

    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    await page.screenshot({ path: "error-screenshot.png" });
    console.log("Screenshot saved to error-screenshot.png");
  } finally {
    await browser.close();
  }
}

testExpenseTracker();
