const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('catalog_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred while processing your request.');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth
  login(credentials) {
    return this.request('/auth/login', { method: 'POST', body: credentials });
  }

  register(userData) {
    return this.request('/auth/register', { method: 'POST', body: userData });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Components
  getComponents(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/components${qs}`);
  }

  getComponent(id) {
    return this.request(`/components/${id}`);
  }

  createComponent(data) {
    return this.request('/components', { method: 'POST', body: data });
  }

  deleteComponent(id) {
    return this.request(`/components/${id}`, { method: 'DELETE' });
  }

  addVersion(componentId, versionData) {
    return this.request(`/components/${componentId}/versions`, { method: 'POST', body: versionData });
  }

  updateVersionStatus(componentId, versionId, status) {
    return this.request(`/components/${componentId}/versions/${versionId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  downloadComponent(id, versionId) {
    return this.request(`/components/${id}/download`, {
      method: 'POST',
      body: { versionId },
    });
  }

  getMyComponents() {
    return this.request('/components/my');
  }

  // Reviews
  submitReview(componentId, reviewData) {
    return this.request(`/components/${componentId}/reviews`, { method: 'POST', body: reviewData });
  }

  getReviews(componentId) {
    return this.request(`/components/${componentId}/reviews`);
  }

  // Metadata
  getCategories() {
    return this.request('/categories');
  }

  getTags() {
    return this.request('/tags');
  }

  getFrameworks() {
    return this.request('/frameworks');
  }

  // Admin
  getPendingComponents() {
    return this.request('/admin/pending');
  }

  setComponentStatus(id, status) {
    return this.request(`/admin/components/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  getAdminStats() {
    return this.request('/admin/stats');
  }

  getUsers() {
    return this.request('/admin/users');
  }

  updateUserRole(id, role) {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: { role },
    });
  }
}

export const api = new ApiClient();
