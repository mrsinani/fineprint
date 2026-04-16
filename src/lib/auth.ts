import { auth } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";

interface AuthResult {
  userId: string | null;
}

/**
 * Authenticate a request via Clerk session (web app) or Bearer token (extension / iOS).
 * Returns the Clerk user ID or null.
 */
export async function getAuthenticatedUser(
  request: Request,
): Promise<AuthResult> {
  const { userId } = await auth();
  if (userId) return { userId };

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return { userId: null };

  const token = authHeader.slice(7);
  if (!token) return { userId: null };

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    const iss = "iss" in payload ? payload.iss : undefined;
    const expectedIssuer = process.env.CLERK_ISSUER_URL;
    if (expectedIssuer && iss !== expectedIssuer) {
      return { userId: null };
    }

    if ("sub" in payload && typeof payload.sub === "string") {
      return { userId: payload.sub };
    }
    return { userId: null };
  } catch {
    return { userId: null };
  }
}
