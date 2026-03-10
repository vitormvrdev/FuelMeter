import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const food = await prisma.food.findUnique({ where: { id: Number(id) } });
  if (!food) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(food);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const food = await prisma.food.update({
    where: { id: Number(id) },
    data: body,
  });
  return NextResponse.json(food);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.food.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
