import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-middleware";

const middleware = async (request) => {
  const { supabase, response } = createClient(request);
  const { data } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!data.user) {
    if (!pathname.startsWith("/signin")) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    return response;
  }

  const id = data.user.id;
  const result = await supabase.from("users").select("*").eq("id", id);
  const user = result.data[0];

  const isAllowed = user.areas.find((area) => pathname.includes(area)) !== undefined;

  if (!isAllowed && pathname !== "/") {
    if (user.country === "PAK") {
      return NextResponse.redirect(new URL("/development/software-tracker", request.url));
    }

    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  return response;
};

export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|js|css|fonts|images|favicon.png|unsubscribe|events-list|proposals|access-denied|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
