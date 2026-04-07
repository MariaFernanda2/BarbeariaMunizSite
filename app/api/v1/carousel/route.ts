import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // backend only!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("haircut_carousel")
      .select("*");

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("DATA:", data);

    return NextResponse.json({ data });
  } catch (err) {
    console.error("CATCH ERROR:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}