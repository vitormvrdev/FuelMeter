export interface Food {
  id: number;
  name: string;
  brand: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

export interface MealFood {
  id: number;
  mealId: number;
  foodId: number;
  servings: number;
  food: Food;
}

export interface Meal {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  foods: MealFood[];
}

export interface LogItem {
  id: number;
  date: string;
  mealType: string;
  foodId: number;
  servings: number;
  mealId: number | null;
  loggedAt: string;
  food: Food;
  meal: Meal | null;
}

export interface Settings {
  id: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export function calcItemMacros(item: { food: Food; servings: number }) {
  const mult = item.servings;
  return {
    calories: item.food.calories * mult,
    protein: item.food.protein * mult,
    carbs: item.food.carbs * mult,
    fat: item.food.fat * mult,
  };
}

export function formatAmount(food: Food, servings: number): string {
  const amount = food.servingSize * servings;
  const rounded = Math.round(amount * 10) / 10;
  return `${rounded}${food.servingUnit}`;
}

export function calcMealMacros(foods: { food: Food; servings: number }[]) {
  return foods.reduce(
    (acc, mf) => {
      const m = calcItemMacros(mf);
      return {
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
