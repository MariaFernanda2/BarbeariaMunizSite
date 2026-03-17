import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export function authenticate(request: NextRequest) {
  
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  return verifyToken(token);
}
