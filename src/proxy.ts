// middleware.ts  ← must be this filename, at src/ or project root
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  // Read from cookies — localStorage doesn't exist in edge runtime
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [ "/profile/:path*",],
};

// import { NextResponse } from "next/server";
// import { getCurrentUser } from "./service/authService";

// export async function proxy(request: Request) {
//   // Fetch current user (authentication token)
//   const token = await getCurrentUser();

//   // If there's no token, redirect to login page
//   if (!token) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // If user is authenticated, proceed with the request
//   return NextResponse.next();
// }

// // Define which paths the middleware applies to
// export const config = {
//   matcher: [
//     "dashboard/:path*",
//     "dashboard/client",
//     "profile/:path*",
//     "profile",
//     "ai-chat/:path*",
//     "ai-chat",
//   ],
// };
