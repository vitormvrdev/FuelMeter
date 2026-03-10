"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({
    calorieGoal: "",
    proteinGoal: "",
    carbsGoal: "",
    fatGoal: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s: Settings) => {
        setSettings(s);
        setForm({
          calorieGoal: String(s.calorieGoal),
          proteinGoal: String(s.proteinGoal),
          carbsGoal: String(s.carbsGoal),
          fatGoal: String(s.fatGoal),
        });
      });
  }, []);

  const save = async () => {
    const data = {
      calorieGoal: parseFloat(form.calorieGoal) || 2000,
      proteinGoal: parseFloat(form.proteinGoal) || 150,
      carbsGoal: parseFloat(form.carbsGoal) || 250,
      fatGoal: parseFloat(form.fatGoal) || 65,
    };
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Calorie Goal (kcal)</Label>
            <Input
              type="number"
              value={form.calorieGoal}
              onChange={(e) =>
                setForm((f) => ({ ...f, calorieGoal: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Protein Goal (g)</Label>
            <Input
              type="number"
              value={form.proteinGoal}
              onChange={(e) =>
                setForm((f) => ({ ...f, proteinGoal: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Carbs Goal (g)</Label>
            <Input
              type="number"
              value={form.carbsGoal}
              onChange={(e) =>
                setForm((f) => ({ ...f, carbsGoal: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Fat Goal (g)</Label>
            <Input
              type="number"
              value={form.fatGoal}
              onChange={(e) =>
                setForm((f) => ({ ...f, fatGoal: e.target.value }))
              }
            />
          </div>
          <Button className="w-full" onClick={save}>
            {saved ? "Saved!" : "Save Goals"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            FuelMeter - Self-hosted calorie and macro tracker.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Data is stored locally in SQLite.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
