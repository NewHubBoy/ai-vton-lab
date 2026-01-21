'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, password, rememberMe });
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log('Google Login Success:', credentialResponse);
    if (credentialResponse.credential) {
      try {
        const response = await fetch('http://localhost:3001/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: credentialResponse.credential }),
        });
        if (!response.ok) throw new Error('Google login API error');
        const data = await response.json();
        console.log('Backend response:', data);
      } catch (error) {
        console.error('Google login API error:', error);
      }
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      {/* 左侧 - 登录表单 */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">AI VTON</span>
            </Link>
          </div>

          <h2 className="text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
            欢迎回来
          </h2>
          <p className="mt-2 text-sm/6 text-gray-500 dark:text-gray-400">
            请登录您的账户以继续
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                邮箱地址
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                密码
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className="flex h-6 shrink-0 items-center">
                  <div className="group grid size-4 grid-cols-1">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:indeterminate:border-indigo-500 dark:indeterminate:bg-indigo-500 dark:focus-visible:outline-indigo-500 forced-colors:appearance-auto"
                    />
                    <svg fill="none" viewBox="0 0 14 14" className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25 dark:group-has-disabled:stroke-white/25">
                      <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-has-checked:opacity-100" />
                      <path d="M3 7H11" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-has-indeterminate:opacity-100" />
                    </svg>
                  </div>
                </div>
                <label htmlFor="remember-me" className="block text-sm/6 text-gray-900 dark:text-white">
                  记住我
                </label>
              </div>
              <a href="#" className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                忘记密码?
              </a>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
              >
                登录
              </button>
            </div>
          </form>

          {/* 第三方登录 */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm/6">
                <span className="bg-gray-50 px-2 text-gray-500 dark:bg-black dark:text-gray-400">或使用以下方式</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                useOneTap={false}
              />
              <a
                href="http://localhost:3001/api/v1/auth/github"
                className="flex h-10 w-full items-center justify-center gap-2 rounded bg-white px-3 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-200 hover:bg-gray-50 focus-visible:inset-ring-transparent dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
              >
                <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" className="size-5 fill-[#24292F] dark:fill-white">
                  <path d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" fillRule="evenodd" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧 - 注册区域 */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-16 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-linear-to-br from-violet-600 via-fuchsia-500 to-indigo-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

        <div className="relative z-10 mx-auto max-w-md text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl/9 font-bold tracking-tight text-white">
            还没有账号?
          </h2>
          <p className="mt-4 text-lg/6 text-white/80">
            加入 AI VTON，体验先进的虚拟试穿技术，让时尚触手可及。
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-center gap-3 text-white/70">
              <div className="h-2 w-2 rounded-full bg-white/50" />
              <span>快速注册</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/70">
              <div className="h-2 w-2 rounded-full bg-white/50" />
              <span>AI 驱动的虚拟试穿</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/70">
              <div className="h-2 w-2 rounded-full bg-white/50" />
              <span>保护您的隐私</span>
            </div>
          </div>

          <Link
            href="/register"
            className="group mt-10 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-600 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl hover:scale-105"
          >
            立即注册
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
