import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const meals = await prisma.meal.findMany({
    include: { foods: { include: { food: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(meals);
}

export async function POST(req: NextRequest) {
  const { name, foods } = await req.json();
  const meal = await prisma.meal.create({
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
  return NextResponse.json(meal, { status: 201 });
}
