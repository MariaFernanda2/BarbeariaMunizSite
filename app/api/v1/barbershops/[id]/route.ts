import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/lib/auth/middleware";
import { BarbershopRepository } from "@/app/lib/repositories/barbershop.repository";
import { BarbershopService } from "@/app/lib/services/barbershop.service";
import { AppError } from "@/app/lib/errors/app-error";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    // 🔐 valida token
    authenticate(req);

    const service = new BarbershopService(
      new BarbershopRepository()
    );

    const barbershop = await service.findById(params.id);

    return NextResponse.json({
      success: true,
      data: barbershop,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}
