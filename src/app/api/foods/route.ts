import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("q") || "";
  const foods = await prisma.food.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { brand: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const food = await prisma.food.create({ data: body });
  return NextResponse.json(food, { status: 201 });
}
