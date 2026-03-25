const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),
  getRecentActivity: () => request('/dashboard/activity'),

  // Properties
  getProperties: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/properties?${query}`);
  },
  getProperty: (id) => request(`/properties/${id}`),
  createProperty: (data) => request('/properties', { method: 'POST', body: data }),
  updateProperty: (id, data) => request(`/properties/${id}`, { method: 'PUT', body: data }),
  deleteProperty: (id) => request(`/properties/${id}`, { method: 'DELETE' }),

  // Owners
  getOwners: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/owners?${query}`);
  },
  getOwner: (id) => request(`/owners/${id}`),
  createOwner: (data) => request('/owners', { method: 'POST', body: data }),
  updateOwner: (id, data) => request(`/owners/${id}`, { method: 'PUT', body: data }),
  deleteOwner: (id) => request(`/owners/${id}`, { method: 'DELETE' }),

  // Permissions
  generatePermission: (data) => request('/permissions/generate', { method: 'POST', body: data }),

  // Images
  submitImageProcessing: (data) => request('/images/process', { method: 'POST', body: data }),
  getImageStatus: (jobId) => request(`/images/status/${jobId}`),

  // History
  getHistory: (propertyId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/history/${propertyId}?${query}`);
  },
};
