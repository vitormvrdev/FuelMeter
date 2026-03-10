import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meal = await prisma.meal.findUnique({
    where: { id: Number(id) },
    include: { foods: { include: { food: true } } },
  });
  if (!meal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(meal);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, foods } = await req.json();

  // Delete existing meal foods and recreate
  await prisma.mealFood.deleteMany({ where: { mealId: Number(id) } });

  const meal = await prisma.meal.update({
    where: { id: Number(id) },
    data: {
      name,
      foods: {
        create: foods.map((f: { foodId: number; servings: number }) => ({
          foodId: f.foodId,
          servings: f.servings,
        })),
      },
    },
    include: { foods: { include: { food: true } } },
  });
  return NextResponse.json(meal);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.meal.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
