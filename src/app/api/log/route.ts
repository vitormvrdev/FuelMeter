import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const date =
    req.nextUrl.searchParams.get("date") ||
    new Date().toISOString().split("T")[0];

  const items = await prisma.logItem.findMany({
    where: { date },
    include: { food: true, meal: true },
    orderBy: { loggedAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // If logging a meal, expand it into individual food entries
  if (body.mealId && !body.foodId) {
    const meal = await prisma.meal.findUnique({
      where: { id: body.mealId },
      include: { foods: true },
    });
    if (!meal)
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });

    const items = await prisma.$transaction(
      meal.foods.map((mf) =>
        prisma.logItem.create({
          data: {
            date: body.date,
            mealType: body.mealType,
            foodId: mf.foodId,
            servings: mf.servings,
            mealId: meal.id,
          },
          include: { food: true, meal: true },
        })
      )
    );
    return NextResponse.json(items, { status: 201 });
  }

  // Single food entry
  const item = await prisma.logItem.create({
    data: {
      date: body.date,
      mealType: body.mealType,
      foodId: body.foodId,
      servings: body.servings || 1,
    },
    include: { food: true, meal: true },
  });
  return NextResponse.json(item, { status: 201 });
}
