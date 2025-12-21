const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('barrel_token');
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

// Auth helpers
export async function login(email: string, password: string) {
    const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
        localStorage.setItem('barrel_token', data.access_token);
    }
    return data;
}

export async function register(email: string, password: string, name?: string) {
    return fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });
}

export function logout() {
    localStorage.removeItem('barrel_token');
}

// Product helpers
export async function getProducts(category?: string) {
    const query = category ? `?category=${category}` : '';
    return fetchAPI(`/products${query}`);
}

export async function getProduct(id: string) {
    return fetchAPI(`/products/${id}`);
}

// Order helpers
export async function createOrder(items: { productId: string; quantity: number }[]) {
    return fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify({ items }),
    });
}

export async function getUserOrders() {
    return fetchAPI('/orders');
}
