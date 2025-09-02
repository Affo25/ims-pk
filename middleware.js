import { NextResponse } from "next/server";

const middleware = async (request) => {
  const pathname = request.nextUrl.pathname;
  
  // Check if it's a protected route
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/sales') || 
                          pathname.startsWith('/marketing') || 
                          pathname.startsWith('/events') || 
                          pathname.startsWith('/development') || 
                          pathname.startsWith('/accounts') || 
                          pathname.startsWith('/users');
  
  // If accessing protected route, check for session token
  if (isProtectedRoute) {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      // Redirect to signin if no session token
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    // TODO: In production, verify session token with database
    // For now, just check if token exists
  }
  
  // Redirect root to signin if no session, dashboard if has session
  if (pathname === '/') {
    const sessionToken = request.cookies.get('session_token')?.value;
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }
  
  return NextResponse.next();
};

export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|js|css|fonts|images|favicon.png|unsubscribe|events-list|proposals|access-denied|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
