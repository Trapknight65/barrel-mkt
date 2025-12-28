'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, createOrder } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

// Replace with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ clientSecret, total }: { clientSecret: string, total: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const { cart, clearCart } = useCart();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL where the customer should be redirected after the PaymentIntent is confirmed.
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message || 'An unexpected error occurred.');
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Create order in backend
            try {
                const items = cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                }));

                await createOrder({
                    items,
                    // Pass paymentIntent ID if needed for verification
                });

                clearCart();
                router.push('/checkout/success');
            } catch (err) {
                console.error('Order creation failed:', err);
                setMessage('Payment successful but order creation failed. Please contact support.');
                setIsLoading(false);
            }
        } else {
            setMessage('Payment failed.');
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-black mb-6">Payment Details</h2>
            <div className="mb-6">
                <PaymentElement />
            </div>

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full py-4 bg-[#D4FF00] text-black font-black text-lg rounded-xl hover:scale-[1.02] transition disabled:opacity-50"
            >
                <span id="button-text">
                    {isLoading ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </span>
            </button>
            {message && <div id="payment-message" className="mt-4 text-red-500 font-bold">{message}</div>}
        </form>
    );
}

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState('');
    const { cartTotal } = useCart();

    useEffect(() => {
        if (cartTotal > 0) {
            // Create PaymentIntent as soon as the page loads
            createPaymentIntent(cartTotal)
                .then((data) => setClientSecret(data.clientSecret))
                .catch((err) => console.error('Failed to init payment:', err));
        }
    }, [cartTotal]);

    const options = {
        clientSecret,
        appearance: {
            theme: 'night' as const,
            variables: {
                colorPrimary: '#D4FF00',
                colorBackground: '#1a1a1a',
                colorText: '#ffffff',
            },
        },
    };

    if (cartTotal === 0) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Your cart is empty</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white py-20 px-6">
            <div className="max-w-xl mx-auto">
                <h1 className="text-4xl font-black mb-8 text-center">Checkout</h1>

                {clientSecret ? (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm clientSecret={clientSecret} total={cartTotal} />
                    </Elements>
                ) : (
                    <div className="text-center text-white/50">Loading payment secure connection...</div>
                )}
            </div>
        </div>
    );
}
