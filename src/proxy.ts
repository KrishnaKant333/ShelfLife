import { auth } from "@/auth";

export const proxy = auth((request) => {
  const isLoggedIn = !!request.auth;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/business/dashboard")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/business/login", request.url);

      loginUrl.searchParams.set("callbackUrl", pathname);

      return Response.redirect(loginUrl);
    }

    if (request.auth?.user.accountType !== "business") {
      return Response.redirect(
        new URL("/dashboard", request.url),
      );
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/consumer/login", request.url);

      loginUrl.searchParams.set("callbackUrl", pathname);

      return Response.redirect(loginUrl);
    }

    if (request.auth?.user.accountType !== "consumer") {
      return Response.redirect(
        new URL("/business/dashboard", request.url),
      );
    }
  }

  return;
});

export const config = {
  matcher: ["/dashboard/:path*", "/business/dashboard/:path*"],
};