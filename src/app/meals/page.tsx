"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Search, X } from "lucide-react";
import { Food, Meal, calcMealMacros, formatAmount } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface MealFoodEntry {
  foodId: number;
  servings: number;
  food?: Food;
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mealName, setMealName] = useState("");
  const [mealFoods, setMealFoods] = useState<MealFoodEntry[]>([]);
  const [foodSearch, setFoodSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Meal | null>(null);

  const fetchData = () => {
    fetch("/api/meals").then((r) => r.json()).then(setMeals);
    fetch("/api/foods").then((r) => r.json()).then(setFoods);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredMeals = meals.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const availableFoods = foods.filter(
    (f) =>
      (f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
        f.brand?.toLowerCase().includes(foodSearch.toLowerCase())) &&
      !mealFoods.some((mf) => mf.foodId === f.id)
  );

  const openNew = () => {
    setEditingId(null);
    setMealName("");
    setMealFoods([]);
    setFoodSearch("");
    setDialogOpen(true);
  };

  const openEdit = (meal: Meal) => {
    setEditingId(meal.id);
    setMealName(meal.name);
    setMealFoods(
      meal.foods.map((mf) => ({
        foodId: mf.foodId,
        servings: mf.servings,
        food: mf.food,
      }))
    );
    setFoodSearch("");
    setDialogOpen(true);
  };

  const addFoodToMeal = (food: Food) => {
    setMealFoods((prev) => [...prev, { foodId: food.id, servings: 1, food }]);
    setFoodSearch("");
  };

  const updateAmount = (foodId: number, amount: number, food: Food) => {
    const servings = amount / food.servingSize;
    setMealFoods((prev) =>
      prev.map((mf) => (mf.foodId === foodId ? { ...mf, servings } : mf))
    );
  };

  const removeFoodFromMeal = (foodId: number) => {
    setMealFoods((prev) => prev.filter((mf) => mf.foodId !== foodId));
  };

  const save = async () => {
    const data = {
      name: mealName,
      foods: mealFoods.map((mf) => ({
        foodId: mf.foodId,
        servings: mf.servings,
      })),
    };

    if (editingId) {
      await fetch(`/api/meals/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setDialogOpen(false);
    fetchData();
  };

  const remove = async (id: number) => {
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    fetchData();
    setDeleteTarget(null);
  };

  const mealFoodItems = mealFoods
    .map((mf) => ({ ...mf, food: mf.food || foods.find((f) => f.id === mf.foodId)! }))
    .filter((mf) => mf.food);

  const builderMacros = calcMealMacros(
    mealFoodItems.map((mf) => ({ food: mf.food!, servings: mf.servings }))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Saved Meals</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> New Meal
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search meals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredMeals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {meals.length === 0
              ? "No meals yet. Create your first saved meal."
              : "No meals match your search."}
          </p>
        )}
        {filteredMeals.map((meal) => {
          const macros = calcMealMacros(meal.foods);
          return (
            <Card key={meal.id}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{meal.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {Math.round(macros.calories)} kcal / P
                      {Math.round(macros.protein)}g C{Math.round(macros.carbs)}g F
                      {Math.round(macros.fat)}g
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {meal.foods.map((mf) => (
                        <Badge key={mf.id} variant="secondary" className="text-[10px] py-0">
                          {mf.food.name} {formatAmount(mf.food, mf.servings)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(meal)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteTarget(meal)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Meal Builder Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Meal" : "Create Meal"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto">
            <div>
              <Label>Meal Name *</Label>
              <Input
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder='e.g. "Morning Oats"'
              />
            </div>

            {/* Current foods in meal */}
            {mealFoodItems.length > 0 && (
              <div className="space-y-1">
                <Label>Foods in this meal</Label>
                {mealFoodItems.map((mf) => {
                  const amount = mf.food!.servingSize * mf.servings;
                  return (
                    <div
                      key={mf.foodId}
                      className="flex items-center gap-2 rounded-md bg-muted/50 p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{mf.food!.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {Math.round(mf.food!.calories * mf.servings)} kcal
                        </p>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={Math.round(amount * 10) / 10}
                        onChange={(e) =>
                          updateAmount(mf.foodId, parseFloat(e.target.value) || 0, mf.food!)
                        }
                        className="w-16 h-7 text-center text-sm"
                      />
                      <span className="text-xs text-muted-foreground w-5">{mf.food!.servingUnit}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeFoodFromMeal(mf.foodId)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
                <div className="text-xs text-muted-foreground pt-1">
                  Total: {Math.round(builderMacros.calories)} kcal / P
                  {Math.round(builderMacros.protein)}g C
                  {Math.round(builderMacros.carbs)}g F
                  {Math.round(builderMacros.fat)}g
                </div>
              </div>
            )}

            {/* Add food search */}
            <div>
              <Label>Add food</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search foods to add..."
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {foodSearch && (
                <div className="mt-1 max-h-32 overflow-y-auto space-y-0.5">
                  {availableFoods.slice(0, 10).map((food) => (
                    <button
                      key={food.id}
                      className="flex w-full items-center justify-between rounded-md p-1.5 text-left hover:bg-muted/50"
                      onClick={() => addFoodToMeal(food)}
                    >
                      <span className="text-sm truncate">{food.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {Math.round(food.calories)} kcal
                      </span>
                    </button>
                  ))}
                  {availableFoods.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2 text-center">
                      No foods found
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={save}
            disabled={!mealName || mealFoods.length === 0}
          >
            {editingId ? "Save Changes" : "Create Meal"}
          </Button>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Meal"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={() => deleteTarget && remove(deleteTarget.id)}
      />
    </div>
  );
}
