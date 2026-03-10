"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Food } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";

const empty = {
  name: "",
  brand: "",
  servingSize: "",
  servingUnit: "g",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteTarget, setDeleteTarget] = useState<Food | null>(null);

  const fetchFoods = () =>
    fetch("/api/foods").then((r) => r.json()).then(setFoods);

  useEffect(() => { fetchFoods(); }, []);

  const filtered = foods.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditingId(null);
    setForm(empty);
    setDialogOpen(true);
  };

  const openEdit = (food: Food) => {
    setEditingId(food.id);
    setForm({
      name: food.name,
      brand: food.brand || "",
      servingSize: String(food.servingSize),
      servingUnit: food.servingUnit,
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    });
    setDialogOpen(true);
  };

  const save = async () => {
    const data = {
      name: form.name,
      brand: form.brand || null,
      servingSize: parseFloat(form.servingSize) || 0,
      servingUnit: form.servingUnit,
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
    };

    if (editingId) {
      await fetch(`/api/foods/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setDialogOpen(false);
    fetchFoods();
  };

  const remove = async (id: number) => {
    await fetch(`/api/foods/${id}`, { method: "DELETE" });
    fetchFoods();
    setDeleteTarget(null);
  };

  const setField = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Foods</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> Add Food
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {foods.length === 0
              ? "No foods yet. Add your first food above."
              : "No foods match your search."}
          </p>
        )}
        {filtered.map((food) => (
          <Card key={food.id}>
            <CardContent className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {food.name}
                  {food.brand && (
                    <span className="text-muted-foreground font-normal">
                      {" "}({food.brand})
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {food.servingSize}{food.servingUnit} /{" "}
                  {Math.round(food.calories)} kcal / P{Math.round(food.protein)}g
                  {" "}C{Math.round(food.carbs)}g F{Math.round(food.fat)}g
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => openEdit(food)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setDeleteTarget(food)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Food" : "Add Food"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Rolled Oats"
              />
            </div>
            <div>
              <Label>Brand (optional)</Label>
              <Input
                value={form.brand}
                onChange={(e) => setField("brand", e.target.value)}
                placeholder="e.g. Quaker"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Serving Size</Label>
                <Input
                  type="number"
                  value={form.servingSize}
                  onChange={(e) => setField("servingSize", e.target.value)}
                  placeholder="100"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={form.servingUnit}
                  onChange={(e) => setField("servingUnit", e.target.value)}
                  placeholder="g"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Calories (kcal)</Label>
                <Input
                  type="number"
                  value={form.calories}
                  onChange={(e) => setField("calories", e.target.value)}
                />
              </div>
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  value={form.protein}
                  onChange={(e) => setField("protein", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Carbs (g)</Label>
                <Input
                  type="number"
                  value={form.carbs}
                  onChange={(e) => setField("carbs", e.target.value)}
                />
              </div>
              <div>
                <Label>Fat (g)</Label>
                <Input
                  type="number"
                  value={form.fat}
                  onChange={(e) => setField("fat", e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full" onClick={save} disabled={!form.name}>
              {editingId ? "Save Changes" : "Add Food"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Food"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={() => deleteTarget && remove(deleteTarget.id)}
      />
    </div>
  );
}
