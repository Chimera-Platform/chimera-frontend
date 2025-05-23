import { NextResponse } from "next/server";
import { auth } from "@/firebase/firebase";

// Token refresh function to be called client-side
export const refreshToken = async () => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken(true); // Force token refresh
      localStorage.setItem("token", token);
      return token;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
  return null;
};

export async function middleware(request) {
  const session = await auth.currentUser;

  // List of protected routes that require authentication
  const protectedPaths = [
    "/dashboard",
    "/chat",
    "/create-avatar",
    "/canvas",
    "/profile",
  ];

  // List of public routes that should always be accessible
  const publicPaths = [
    "/",
    "/about",
    "/login",
    "/signup",
    "/marketplace", // Making marketplace public
  ];

  const path = request.nextUrl.pathname;

  // Allow access to public paths without authentication
  if (publicPaths.some((publicPath) => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath)
  );

  // Redirect to login if trying to access protected route without authentication
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/marketplace/:path*",
    "/create-avatar/:path*",
    "/canvas/:path*",
    "/profile/:path*",
  ],
};
