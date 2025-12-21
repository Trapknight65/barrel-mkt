'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, register } from '@/lib/api';

function LoginForm() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/shop';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await register(email, password, name);
                await login(email, password);
            } else {
                await login(email, password);
            }
            router.push(redirect);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 rounded-3xl p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">
                {isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                    <div>
                        <label className="block text-sm text-white/50 mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF00]"
                            placeholder="Your name"
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm text-white/50 mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF00]"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm text-white/50 mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4FF00]"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#D4FF00] text-black font-bold rounded-full hover:scale-[1.02] transition disabled:opacity-50"
                >
                    {loading ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
                </button>
            </form>

            <p className="text-center text-sm text-white/50 mt-6">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-[#D4FF00] hover:underline"
                >
                    {isRegister ? 'Sign In' : 'Register'}
                </button>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <Link href="/" className="block text-center text-3xl font-bold mb-8">
                    BARREL
                </Link>
                <Suspense fallback={<div className="bg-white/5 rounded-3xl p-8 text-center">Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
