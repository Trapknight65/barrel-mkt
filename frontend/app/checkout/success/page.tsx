'use client';

import Link from 'next/link';

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-center items-center justify-center p-6 text-center">
            <div className="max-w-md">
                <div className="w-24 h-24 bg-[#D4FF00] rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-12">
                    <span className="text-4xl">🖤</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-4">ORDER SECURED</h1>
                <p className="text-white/50 text-xl font-medium mb-12">
                    We've received your request. Your gear is being prepped for the journey.
                </p>
                <div className="space-y-4">
                    <Link
                        href="/account"
                        className="block w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black tracking-widest text-xs hover:bg-white/10 transition"
                    >
                        TRACK ORDER
                    </Link>
                    <Link
                        href="/shop"
                        className="block w-full py-4 bg-[#D4FF00] text-black rounded-2xl font-black tracking-widest text-xs hover:scale-[1.02] transition"
                    >
                        CONTINUE SHOPPING
                    </Link>
                </div>
            </div>
        </div>
    );
}
