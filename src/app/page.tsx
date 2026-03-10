"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MacroRing } from "@/components/macro-ring";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { LogItem, Meal, Food, Settings, calcItemMacros, formatAmount } from "@/lib/types";
import { AddToLogDialog } from "@/components/add-to-log-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export default function Dashboard() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [logItems, setLogItems] = useState<LogItem[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMealType, setDialogMealType] = useState<string>("breakfast");
  const [deleteTarget, setDeleteTarget] = useState<LogItem | null>(null);

  const fetchData = useCallback(() => {
    fetch(`/api/log?date=${date}`).then((r) => r.json()).then(setLogItems);
    fetch("/api/meals").then((r) => r.json()).then(setMeals);
    fetch("/api/foods").then((r) => r.json()).then(setFoods);
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, [date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = logItems.reduce(
    (acc, item) => {
      const m = calcItemMacros(item);
      return {
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const shiftDate = (days: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);
    setDate(format(d, "yyyy-MM-dd"));
  };

  const removeItem = async (id: number) => {
    await fetch(`/api/log/${id}`, { method: "DELETE" });
    fetchData();
    setDeleteTarget(null);
  };

  const openAddDialog = (mealType: string) => {
    setDialogMealType(mealType);
    setDialogOpen(true);
  };

  const isToday = date === format(new Date(), "yyyy-MM-dd");
  const displayDate = isToday
    ? "Today"
    : format(new Date(date + "T12:00:00"), "EEE, MMM d");

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => shiftDate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{displayDate}</h1>
        <Button variant="ghost" size="icon" onClick={() => shiftDate(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Macro Rings */}
      {settings && (
        <Card>
          <CardContent className="flex justify-around py-4">
            <MacroRing
              label="Calories"
              current={totals.calories}
              goal={settings.calorieGoal}
              unit="kcal"
              color="oklch(0.65 0.18 250)"
            />
            <MacroRing
              label="Protein"
              current={totals.protein}
              goal={settings.proteinGoal}
              color="oklch(0.65 0.2 25)"
            />
            <MacroRing
              label="Carbs"
              current={totals.carbs}
              goal={settings.carbsGoal}
              color="oklch(0.7 0.15 85)"
            />
            <MacroRing
              label="Fat"
              current={totals.fat}
              goal={settings.fatGoal}
              color="oklch(0.6 0.2 300)"
            />
          </CardContent>
        </Card>
      )}

      {/* Meal Sections */}
      {MEAL_TYPES.map((type) => {
        const items = logItems.filter((i) => i.mealType === type);
        const sectionCals = items.reduce(
          (s, i) => s + i.food.calories * i.servings,
          0
        );

        return (
          <Card key={type}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize text-base">{type}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {Math.round(sectionCals)} kcal
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openAddDialog(type)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {items.length > 0 && (
              <CardContent className="space-y-1 pt-0">
                {items.map((item) => {
                  const macros = calcItemMacros(item);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {item.food.name}
                          <span className="text-muted-foreground">
                            {" "}{formatAmount(item.food, item.servings)}
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {Math.round(macros.calories)} kcal
                          {" / "}P {Math.round(macros.protein)}g
                          {" / "}C {Math.round(macros.carbs)}g
                          {" / "}F {Math.round(macros.fat)}g
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}

      <AddToLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mealType={dialogMealType}
        date={date}
        foods={foods}
        meals={meals}
        onAdded={fetchData}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Entry"
        description={`Remove "${deleteTarget?.food.name}" from your log?`}
        confirmLabel="Remove"
        onConfirm={() => deleteTarget && removeItem(deleteTarget.id)}
      />
    </div>
  );
}
