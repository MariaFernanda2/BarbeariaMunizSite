import { NextRequest, NextResponse } from "next/server";
import { BarbershopRepository } from "@/app/lib/repositories/barbershop.repository";
import { BarbershopService } from "@/app/lib/services/barbershop.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || undefined;

  const service = new BarbershopService(
    new BarbershopRepository()
  );

  const result = await service.findAll(page, limit, search);

  return NextResponse.json({
    success: true,
    ...result,
  });
}
