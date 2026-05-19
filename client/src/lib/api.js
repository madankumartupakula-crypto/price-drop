const TOKEN_KEY = 'pricepulse_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(path, { ...options, headers });
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.error || 'Request failed.');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function requestOtp(identifier) {
  return request('/api/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier })
  });
}

export async function verifyOtp(identifier, otp) {
  return request('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier, otp })
  });
}

export async function getMe() {
  return request('/api/auth/me');
}

export async function getProducts() {
  return request('/api/products');
}

export async function createProduct(product) {
  return request('/api/products', {
    method: 'POST',
    body: JSON.stringify(product)
  });
}

export async function scrapeProduct(url) {
  const data = await request('/api/scrape', {
    method: 'POST',
    body: JSON.stringify({ url })
  });

  return data.fallback || data;
}
