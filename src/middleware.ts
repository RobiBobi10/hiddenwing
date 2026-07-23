import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Everything is public EXCEPT the routes listed here.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/search(.*)", "/profile(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // redirects to sign-in if not authenticated
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
