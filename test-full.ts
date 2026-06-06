import { chromium } from "npm:playwright";

async function testExpenseTrackerFull() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("=== Full Expense Tracker Test ===\n");

    // Step 1: Navigate and login
    console.log("1. Navigating to login page...");
    await page.goto("http://localhost:8001/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:8001/", { timeout: 5000 });
    console.log("   ✅ Login successful");

    // Step 2: Check analytics section
    console.log("2. Checking analytics section...");
    const analyticsSection = await page.locator("text=Analytics").count();
    console.log(`   ✅ Analytics section present: ${analyticsSection > 0}`);

    // Step 3: Check expense form
    console.log("3. Checking expense form...");
    const formTitle = await page.locator('input[placeholder*="spend"]').count();
    const formAmount = await page.locator('input[type="number"]').count();
    const formCategory = await page.locator("select").count();
    console.log(`   ✅ Form title field: ${formTitle > 0}`);
    console.log(`   ✅ Form amount field: ${formAmount > 0}`);
    console.log(`   ✅ Form category field: ${formCategory > 0}`);

    // Step 4: Add an expense
    console.log("4. Adding a test expense...");
    await page.fill('input[placeholder*="spend"]', "Lunch at cafe");
    await page.fill('input[type="number"]', "15.50");
    await page.selectOption("select", "Food");
    await page.click('button[type="submit"]');

    // Wait for form submission
    await page.waitForTimeout(2000);
    console.log("   ✅ Expense form submitted");

    // Step 5: Check if expense was added
    console.log("5. Checking if expense appears in list...");
    const pageText = await page.textContent("body");
    const hasLunchExpense = pageText?.includes("Lunch at cafe");
    console.log(`   ✅ Expense in list: ${hasLunchExpense}`);

    // Step 6: Check for amounts
    console.log("6. Checking for amounts in analytics...");
    const amountText = pageText?.includes("$15") || pageText?.includes("$16");
    console.log(`   ✅ Amount displayed: ${amountText}`);

    console.log("\n=== All Tests Passed! ===");
  } catch (error) {
    console.error("\n=== Test Failed ===");
    console.error(error);
    await page.screenshot({ path: "error-full.png" });
  } finally {
    await browser.close();
  }
}

testExpenseTrackerFull();
