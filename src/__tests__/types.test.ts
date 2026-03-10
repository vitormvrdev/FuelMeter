import { describe, it, expect } from "vitest";
import {
  calcItemMacros,
  calcMealMacros,
  formatAmount,
  Food,
} from "@/lib/types";

const oats: Food = {
  id: 1,
  name: "Rolled Oats",
  brand: "Quaker",
  servingSize: 40,
  servingUnit: "g",
  calories: 150,
  protein: 5,
  carbs: 27,
  fat: 3,
  createdAt: "2026-01-01T00:00:00Z",
};

const milk: Food = {
  id: 2,
  name: "Whole Milk",
  brand: null,
  servingSize: 100,
  servingUnit: "ml",
  calories: 60,
  protein: 3.2,
  carbs: 4.7,
  fat: 3.5,
  createdAt: "2026-01-01T00:00:00Z",
};

const peanutButter: Food = {
  id: 3,
  name: "Peanut Butter",
  brand: "Continente",
  servingSize: 1,
  servingUnit: "g",
  calories: 6,
  protein: 0.25,
  carbs: 0.2,
  fat: 0.5,
  createdAt: "2026-01-01T00:00:00Z",
};

describe("calcItemMacros", () => {
  it("calculates macros for 1 serving", () => {
    const result = calcItemMacros({ food: oats, servings: 1 });
    expect(result.calories).toBe(150);
    expect(result.protein).toBe(5);
    expect(result.carbs).toBe(27);
    expect(result.fat).toBe(3);
  });

  it("calculates macros for partial servings (50ml of 100ml milk)", () => {
    const result = calcItemMacros({ food: milk, servings: 0.5 });
    expect(result.calories).toBe(30);
    expect(result.protein).toBeCloseTo(1.6);
    expect(result.carbs).toBeCloseTo(2.35);
    expect(result.fat).toBeCloseTo(1.75);
  });

  it("calculates macros for multiple servings (20g PB stored per 1g)", () => {
    const result = calcItemMacros({ food: peanutButter, servings: 20 });
    expect(result.calories).toBe(120);
    expect(result.protein).toBe(5);
    expect(result.carbs).toBe(4);
    expect(result.fat).toBe(10);
  });

  it("returns zeros for 0 servings", () => {
    const result = calcItemMacros({ food: oats, servings: 0 });
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(0);
  });
});

describe("calcMealMacros", () => {
  it("sums macros across multiple foods", () => {
    const result = calcMealMacros([
      { food: oats, servings: 1 },
      { food: milk, servings: 0.5 },
      { food: peanutButter, servings: 20 },
    ]);
    // oats: 150 + milk50ml: 30 + pb20g: 120 = 300
    expect(result.calories).toBe(300);
    expect(result.protein).toBeCloseTo(11.6);
    expect(result.carbs).toBeCloseTo(33.35);
    expect(result.fat).toBeCloseTo(14.75);
  });

  it("returns zeros for empty meal", () => {
    const result = calcMealMacros([]);
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(0);
  });

  it("handles single food meal", () => {
    const result = calcMealMacros([{ food: oats, servings: 2 }]);
    expect(result.calories).toBe(300);
    expect(result.protein).toBe(10);
    expect(result.carbs).toBe(54);
    expect(result.fat).toBe(6);
  });
});

describe("formatAmount", () => {
  it("formats grams correctly", () => {
    expect(formatAmount(oats, 1)).toBe("40g");
  });

  it("formats partial servings as real amount", () => {
    expect(formatAmount(milk, 0.5)).toBe("50ml");
  });

  it("formats per-gram foods with multiplied amount", () => {
    expect(formatAmount(peanutButter, 20)).toBe("20g");
  });

  it("rounds to 1 decimal place", () => {
    // 100ml * 0.333 = 33.3ml
    expect(formatAmount(milk, 0.333)).toBe("33.3ml");
  });

  it("drops unnecessary decimals", () => {
    expect(formatAmount(oats, 2)).toBe("80g");
  });

  it("handles 0 servings", () => {
    expect(formatAmount(oats, 0)).toBe("0g");
  });
});
