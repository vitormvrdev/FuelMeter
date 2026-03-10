import { describe, it, expect, beforeEach } from "vitest";

const BASE = "http://localhost:3001";

// These tests run against the dev server - integration tests for the API layer.
// The dev server must be running on port 3001.

describe("Foods API", () => {
  let foodId: number;

  it("POST /api/foods creates a food", async () => {
    const res = await fetch(`${BASE}/api/foods`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Oats",
        brand: "TestBrand",
        servingSize: 40,
        servingUnit: "g",
        calories: 150,
        protein: 5,
        carbs: 27,
        fat: 3,
      }),
    });
    expect(res.status).toBe(201);
    const food = await res.json();
    expect(food.name).toBe("Test Oats");
    expect(food.id).toBeGreaterThan(0);
    foodId = food.id;
  });

  it("GET /api/foods returns the created food", async () => {
    const res = await fetch(`${BASE}/api/foods`);
    const foods = await res.json();
    expect(foods.some((f: { id: number }) => f.id === foodId)).toBe(true);
  });

  it("GET /api/foods?q= filters by name", async () => {
    const res = await fetch(`${BASE}/api/foods?q=Test%20Oats`);
    const foods = await res.json();
    expect(foods.length).toBeGreaterThanOrEqual(1);
    expect(foods[0].name).toBe("Test Oats");
  });

  it("PUT /api/foods/:id updates a food", async () => {
    const res = await fetch(`${BASE}/api/foods/${foodId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Oats", calories: 160 }),
    });
    const food = await res.json();
    expect(food.name).toBe("Updated Oats");
    expect(food.calories).toBe(160);
  });

  it("DELETE /api/foods/:id deletes a food", async () => {
    const res = await fetch(`${BASE}/api/foods/${foodId}`, {
      method: "DELETE",
    });
    expect(res.ok).toBe(true);

    const check = await fetch(`${BASE}/api/foods/${foodId}`);
    expect(check.status).toBe(404);
  });
});

describe("Meals API", () => {
  let foodId1: number;
  let foodId2: number;
  let mealId: number;

  beforeEach(async () => {
    // Ensure we have foods to work with
    if (!foodId1) {
      const r1 = await fetch(`${BASE}/api/foods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Meal Test Food A",
          servingSize: 100,
          servingUnit: "g",
          calories: 200,
          protein: 10,
          carbs: 30,
          fat: 5,
        }),
      });
      foodId1 = (await r1.json()).id;

      const r2 = await fetch(`${BASE}/api/foods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Meal Test Food B",
          servingSize: 50,
          servingUnit: "ml",
          calories: 80,
          protein: 4,
          carbs: 10,
          fat: 2,
        }),
      });
      foodId2 = (await r2.json()).id;
    }
  });

  it("POST /api/meals creates a meal with foods", async () => {
    const res = await fetch(`${BASE}/api/meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Meal",
        foods: [
          { foodId: foodId1, servings: 1 },
          { foodId: foodId2, servings: 2 },
        ],
      }),
    });
    expect(res.status).toBe(201);
    const meal = await res.json();
    expect(meal.name).toBe("Test Meal");
    expect(meal.foods).toHaveLength(2);
    mealId = meal.id;
  });

  it("GET /api/meals returns meals with foods", async () => {
    const res = await fetch(`${BASE}/api/meals`);
    const meals = await res.json();
    const meal = meals.find((m: { id: number }) => m.id === mealId);
    expect(meal).toBeDefined();
    expect(meal.foods.length).toBe(2);
    expect(meal.foods[0].food).toBeDefined();
  });

  it("DELETE /api/meals/:id deletes a meal", async () => {
    const res = await fetch(`${BASE}/api/meals/${mealId}`, {
      method: "DELETE",
    });
    expect(res.ok).toBe(true);
  });

  // Clean up test foods
  it("cleanup test foods", async () => {
    await fetch(`${BASE}/api/foods/${foodId1}`, { method: "DELETE" });
    await fetch(`${BASE}/api/foods/${foodId2}`, { method: "DELETE" });
  });
});

describe("Log API", () => {
  let foodId: number;
  let logItemId: number;
  const testDate = "2099-12-31";

  beforeEach(async () => {
    if (!foodId) {
      const r = await fetch(`${BASE}/api/foods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Log Test Food",
          servingSize: 100,
          servingUnit: "g",
          calories: 200,
          protein: 10,
          carbs: 30,
          fat: 5,
        }),
      });
      foodId = (await r.json()).id;
    }
  });

  it("POST /api/log creates a log entry", async () => {
    const res = await fetch(`${BASE}/api/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: testDate,
        mealType: "breakfast",
        foodId,
        servings: 1.5,
      }),
    });
    expect(res.status).toBe(201);
    const item = await res.json();
    expect(item.date).toBe(testDate);
    expect(item.servings).toBe(1.5);
    logItemId = item.id;
  });

  it("GET /api/log?date= returns entries for that date", async () => {
    const res = await fetch(`${BASE}/api/log?date=${testDate}`);
    const items = await res.json();
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].food).toBeDefined();
  });

  it("DELETE /api/log/:id removes a log entry", async () => {
    const res = await fetch(`${BASE}/api/log/${logItemId}`, {
      method: "DELETE",
    });
    expect(res.ok).toBe(true);

    const check = await fetch(`${BASE}/api/log?date=${testDate}`);
    const items = await check.json();
    expect(items.find((i: { id: number }) => i.id === logItemId)).toBeUndefined();
  });

  it("cleanup test food", async () => {
    await fetch(`${BASE}/api/foods/${foodId}`, { method: "DELETE" });
  });
});

describe("Settings API", () => {
  it("GET /api/settings returns default settings", async () => {
    const res = await fetch(`${BASE}/api/settings`);
    const settings = await res.json();
    expect(settings.calorieGoal).toBeGreaterThan(0);
    expect(settings.proteinGoal).toBeGreaterThan(0);
  });

  it("PUT /api/settings updates goals", async () => {
    const res = await fetch(`${BASE}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calorieGoal: 2500 }),
    });
    const settings = await res.json();
    expect(settings.calorieGoal).toBe(2500);

    // Restore default
    await fetch(`${BASE}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calorieGoal: 2000 }),
    });
  });
});
