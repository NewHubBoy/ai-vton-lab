import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路由 - 无需登录即可访问
const publicRoutes = [
    '/',           // 营销首页
    '/login',      // 登录页
    '/register',   // 注册页
];

// 静态资源路径前缀
const staticPrefixes = [
    '/_next',
    '/api',
    '/favicon.ico',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 跳过静态资源
    if (staticPrefixes.some(prefix => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    // 跳过公开路由
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // 检查 token（从 cookie 读取，因为 middleware 运行在服务端）
    const token = request.cookies.get('token')?.value;

    // 未登录则重定向到登录页
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * 匹配所有路径，除了:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
