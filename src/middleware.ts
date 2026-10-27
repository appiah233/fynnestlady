import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { isClerkConfigured } from "@/lib/env";

const handleClerk = clerkMiddleware();

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured() || !process.env.CLERK_SECRET_KEY) {
    return NextResponse.next();
  }
  return handleClerk(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
