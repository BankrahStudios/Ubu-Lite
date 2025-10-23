const API_BASE = '/api';

type Token = string | undefined;

async function request(path: string, init: RequestInit = {}, token?: Token) {
  const headers: Record<string, string> = (init.headers as any) || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch(API_BASE + path, { ...init, headers });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `Request failed: ${resp.status}`);
  }
  const ct = resp.headers.get('content-type') || '';
  return ct.includes('application/json') ? resp.json() : resp.text();
}

export async function postJSON(path: string, body: any, token?: Token) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }, token);
}

export async function getJSON(path: string, token?: Token) {
  return request(path, { method: 'GET' }, token);
}

export async function patchJSON(path: string, body: any, token?: Token) {
  return request(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }, token);
}

// Domain helpers
export type LoginResp = { access: string; refresh?: string; user?: any };
export type UserRole = 'creative' | 'client' | 'admin';

export const api = {
  // Auth
  register: (payload: { username: string; email?: string; password: string; role: UserRole }) =>
    postJSON('/auth/register/', payload),
  login: (payload: { username: string; password: string }) =>
    postJSON('/auth/login/', payload) as Promise<LoginResp>,

  // Creatives & Services
  listCreatives: () => getJSON('/creatives/'),
  getCreative: (id: number | string) => getJSON(`/creatives/${id}/`),
  listServices: () => getJSON('/services/'),
  getService: (id: number | string) => getJSON(`/services/${id}/`),

  // Bookings
  createBooking: (payload: any, token: string) => postJSON('/bookings/', payload, token),
  getBooking: (id: number | string, token: string) => getJSON(`/bookings/${id}/`, token),
  updateBooking: (id: number | string, payload: any, token: string) => patchJSON(`/bookings/${id}/`, payload, token),
  listBookings: (token: string) => getJSON('/bookings/', token),
  approveBooking: (id: number | string, token: string) => postJSON(`/bookings/${id}/approve/`, {}, token),
  declineBooking: (id: number | string, token: string) => postJSON(`/bookings/${id}/decline/`, {}, token),
  scheduleBooking: (id: number | string, payload: any, token: string) => postJSON(`/bookings/${id}/schedule/`, payload, token),

  // Messages
  listMessages: (bookingId: number | string, token: string) => getJSON(`/messages/${bookingId}/`, token),
  sendMessage: (bookingId: number | string, payload: any, token: string) => postJSON(`/messages/${bookingId}/`, payload, token),

  // Portfolio
  listPortfolio: (token: string) => getJSON('/portfolio/', token),
  createPortfolioItem: (form: FormData, token: string) => {
    return request('/portfolio/', { method: 'POST', body: form }, token);
  },
  deletePortfolioItem: (id: number | string, token: string) => request(`/portfolio/${id}/`, { method: 'DELETE' }, token),

  // Services (creative-owned)
  listOwnServices: (token: string) => getJSON('/services/', token),
  createService: (payload: any, token: string) => postJSON('/services/', payload, token),
  updateService: (id: number | string, payload: any, token: string) => patchJSON(`/services/${id}/`, payload, token),
  deleteService: (id: number | string, token: string) => request(`/services/${id}/`, { method: 'DELETE' }, token),

  // Categories
  listCategories: () => getJSON('/categories/'),

  // Current creative profile
  getMyProfile: (token: string) => getJSON('/creatives/me/', token),
  updateMyProfile: (payload: any, token: string) => patchJSON('/creatives/me/', payload, token),
  updateMyProfileMultipart: (form: FormData, token: string) => request('/creatives/me/', { method: 'PATCH', body: form }, token),

  // Wallet & Escrow
  getWallet: (token: string) => getJSON('/wallet/', token),
  listEscrows: (token: string) => getJSON('/escrows/', token),
  clientFulfill: (escrowId: number | string, token: string) => postJSON(`/escrows/${escrowId}/client_fulfill/`, {}, token),
  creativeFulfill: (escrowId: number | string, token: string) => postJSON(`/escrows/${escrowId}/creative_fulfill/`, {}, token),
  createDemoFundedOrder: (token: string) => postJSON('/demo/create-funded-order/', {}, token),
  demoWithdraw: (amount: number | null, token: string) => postJSON('/demo/withdraw/', amount ? { amount } : {}, token),
};
