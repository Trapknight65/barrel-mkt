import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#121212]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4FF00]/5 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">
            <span className="text-[#D4FF00]">BARREL</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-2xl mx-auto">
            Curated gear for motion-hungry humans. <br />
            Bike. Skate. Capture. Repeat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="px-8 py-4 bg-[#D4FF00] text-black font-bold rounded-full hover:scale-105 transition-transform"
            >
              SHOP NOW
            </Link>
            <Link
              href="/shop?category=camera"
              className="px-8 py-4 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition"
            >
              Camera Gear
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Built for <span className="text-[#D4FF00]">Movement</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Bike', emoji: '🚴', category: 'bike' },
              { name: 'Skate', emoji: '🛹', category: 'skate' },
              { name: 'Camera', emoji: '📸', category: 'camera' },
              { name: 'Moto', emoji: '🏍️', category: 'moto' },
            ].map((cat) => (
              <Link
                key={cat.category}
                href={`/shop?category=${cat.category}`}
                className="aspect-square bg-white/5 rounded-3xl flex flex-col items-center justify-center hover:bg-white/10 hover:scale-[1.02] transition-all group"
              >
                <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <span className="font-medium text-white/70 group-hover:text-[#D4FF00] transition">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-bold text-lg mb-2">Curated Selection</h3>
            <p className="text-white/50 text-sm">Hand-picked gear that meets our quality standards.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-bold text-lg mb-2">Fast Shipping</h3>
            <p className="text-white/50 text-sm">EU warehouse priority. Track every step.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-bold text-lg mb-2">Secure Payment</h3>
            <p className="text-white/50 text-sm">Stripe-powered checkout. Your data is safe.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-bold">BARREL</div>
          <div className="flex gap-6 text-sm text-white/50">
            <Link href="/shop" className="hover:text-white transition">Shop</Link>
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
          <div className="text-sm text-white/30">© 2025 Barrel</div>
        </div>
      </footer>
    </div>
  );
}
