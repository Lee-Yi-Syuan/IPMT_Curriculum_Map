import { NextResponse } from 'next/server';

export function middleware(request) {
  // 測試：直接在這裡強制將維護模式設為 true
  const isMaintenanceMode = true;

  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 避免維護頁面本身或靜態資源被攔截造成無限迴圈
  if (
    pathname.startsWith('/maintenance.html') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 如果開啟維護模式，重新導向到維護頁，並回傳 503 狀態碼
  if (isMaintenanceMode) {
    url.pathname = '/maintenance.html';
    return NextResponse.rewrite(url, { status: 503 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};