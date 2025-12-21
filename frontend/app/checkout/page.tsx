'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '@/lib/api';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ amount }: { amount: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
        });

        if (error.type === 'card_error' || error.type === 'validation_error') {
            setMessage(error.message || 'An unexpected error occurred.');
        } else {
            setMessage('An unexpected error occurred.');
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            {message && <div className="text-red-400 text-sm mt-2">{message}</div>}
            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full py-4 bg-[#D4FF00] text-black font-bold rounded-xl hover:scale-[1.02] transition disabled:opacity-50"
            >
                {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </button>
        </form>
    );
}

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState('');

    // Hardcoded amount for MVP (e.g. from Cart context in real app)
    const amount = 49.99;

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        createPaymentIntent(amount, 'usd')
            .then((data) => setClientSecret(data.clientSecret))
            .catch((err) => console.error('Error creating payment intent:', err));
    }, []);

    const appearance = {
        theme: 'night' as const,
        variables: {
            colorPrimary: '#D4FF00',
            colorBackground: '#1a1a1a',
            colorText: '#ffffff',
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-20 px-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Secure Checkout</h1>

                {clientSecret ? (
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm amount={amount} />
                        </Elements>
                    </div>
                ) : (
                    <div className="text-center text-white/50">Loading checkout...</div>
                )}
            </div>
        </div>
    );
}
