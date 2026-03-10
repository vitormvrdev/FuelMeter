"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Food, Meal, calcMealMacros } from "@/lib/types";
import { Search } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: string;
  date: string;
  foods: Food[];
  meals: Meal[];
  onAdded: () => void;
}

export function AddToLogDialog({
  open,
  onOpenChange,
  mealType,
  date,
  foods,
  meals,
  onAdded,
}: Props) {
  const [search, setSearch] = useState("");
  const [amountMap, setAmountMap] = useState<Record<number, string>>({});

  const filteredFoods = foods.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMeals = meals.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const getAmount = (food: Food) =>
    parseFloat(amountMap[food.id] ?? String(food.servingSize)) || food.servingSize;

  const getPreviewMacros = (food: Food) => {
    const amount = getAmount(food);
    const mult = amount / food.servingSize;
    return {
      calories: food.calories * mult,
      protein: food.protein * mult,
      carbs: food.carbs * mult,
      fat: food.fat * mult,
    };
  };

  const addFood = async (food: Food) => {
    const amount = getAmount(food);
    const servings = amount / food.servingSize;
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        mealType,
        foodId: food.id,
        servings,
      }),
    });
    onAdded();
    onOpenChange(false);
    setSearch("");
    setAmountMap({});
  };

  const addMeal = async (meal: Meal) => {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        mealType,
        mealId: meal.id,
      }),
    });
    onAdded();
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="capitalize">Add to {mealType}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search foods or meals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="foods" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="foods" className="flex-1">
              Foods ({filteredFoods.length})
            </TabsTrigger>
            <TabsTrigger value="meals" className="flex-1">
              Meals ({filteredMeals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="foods" className="overflow-y-auto flex-1 space-y-1 mt-2">
            {filteredFoods.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No foods found. Add some in the Foods tab.
              </p>
            )}
            {filteredFoods.map((food) => {
              const preview = getPreviewMacros(food);
              return (
                <div
                  key={food.id}
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{food.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {Math.round(preview.calories)} kcal / P{Math.round(preview.protein)}g
                      {" "}C{Math.round(preview.carbs)}g F{Math.round(preview.fat)}g
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={amountMap[food.id] ?? String(food.servingSize)}
                      onChange={(e) =>
                        setAmountMap((m) => ({ ...m, [food.id]: e.target.value }))
                      }
                      className="w-16 h-8 text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground w-5">
                      {food.servingUnit}
                    </span>
                  </div>
                  <Button size="sm" className="h-8" onClick={() => addFood(food)}>
                    Add
                  </Button>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="meals" className="overflow-y-auto flex-1 space-y-1 mt-2">
            {filteredMeals.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No saved meals. Create some in the Meals tab.
              </p>
            )}
            {filteredMeals.map((meal) => {
              const macros = calcMealMacros(meal.foods);
              return (
                <div
                  key={meal.id}
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{meal.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {meal.foods.length} items / {Math.round(macros.calories)} kcal
                      {" / "}P{Math.round(macros.protein)}g C{Math.round(macros.carbs)}g
                      {" "}F{Math.round(macros.fat)}g
                    </p>
                  </div>
                  <Button size="sm" className="h-8" onClick={() => addMeal(meal)}>
                    Add
                  </Button>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
