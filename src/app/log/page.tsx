"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { LogItem, calcItemMacros, formatAmount } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export default function LogPage() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [logItems, setLogItems] = useState<LogItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<LogItem | null>(null);

  const fetchLog = () =>
    fetch(`/api/log?date=${date}`)
      .then((r) => r.json())
      .then(setLogItems);

  useEffect(() => { fetchLog(); }, [date]);

  const shiftDate = (days: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);
    setDate(format(d, "yyyy-MM-dd"));
  };

  const removeItem = async (id: number) => {
    await fetch(`/api/log/${id}`, { method: "DELETE" });
    fetchLog();
    setDeleteTarget(null);
  };

  const isToday = date === format(new Date(), "yyyy-MM-dd");
  const displayDate = isToday
    ? "Today"
    : format(new Date(date + "T12:00:00"), "EEE, MMM d");

  const dayTotals = logItems.reduce(
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => shiftDate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-lg font-semibold">{displayDate}</h1>
          <div className="flex items-center gap-1 justify-center">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-6 w-auto border-none bg-transparent p-0 text-xs text-muted-foreground text-center"
            />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => shiftDate(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day totals */}
      <Card>
        <CardContent className="py-3">
          <div className="grid grid-cols-4 text-center text-sm">
            <div>
              <p className="font-semibold">{Math.round(dayTotals.calories)}</p>
              <p className="text-[10px] text-muted-foreground">kcal</p>
            </div>
            <div>
              <p className="font-semibold">{Math.round(dayTotals.protein)}g</p>
              <p className="text-[10px] text-muted-foreground">protein</p>
            </div>
            <div>
              <p className="font-semibold">{Math.round(dayTotals.carbs)}g</p>
              <p className="text-[10px] text-muted-foreground">carbs</p>
            </div>
            <div>
              <p className="font-semibold">{Math.round(dayTotals.fat)}g</p>
              <p className="text-[10px] text-muted-foreground">fat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {MEAL_TYPES.map((type) => {
        const items = logItems.filter((i) => i.mealType === type);
        if (items.length === 0) return null;

        const sectionTotals = items.reduce(
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

        return (
          <Card key={type}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize text-base">{type}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {Math.round(sectionTotals.calories)} kcal
                </span>
              </div>
            </CardHeader>
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
                        {item.meal && (
                          <span className="text-muted-foreground text-[10px] ml-1">
                            ({item.meal.name})
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {Math.round(macros.calories)} kcal / P
                        {Math.round(macros.protein)}g C{Math.round(macros.carbs)}g F
                        {Math.round(macros.fat)}g
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
          </Card>
        );
      })}

      {logItems.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No entries for this day. Add food from the Dashboard.
        </p>
      )}

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
