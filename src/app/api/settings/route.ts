import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getOrCreateSettings() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({ data: {} });
  }
  return settings;
}

export async function GET() {
  const settings = await getOrCreateSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const existing = await getOrCreateSettings();
  const settings = await prisma.settings.update({
    where: { id: existing.id },
    data: body,
  });
  return NextResponse.json(settings);
}
