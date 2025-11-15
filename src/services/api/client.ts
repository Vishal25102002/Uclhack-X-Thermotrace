// API client configuration
// This file will be implemented later

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async get(endpoint: string, options?: RequestInit): Promise<unknown> {
    // Stub implementation
    const url = `${this.baseURL}${endpoint}`;
    console.log('GET request to:', url);
    return { data: null };
  }

  async post(endpoint: string, data?: unknown, options?: RequestInit): Promise<unknown> {
    // Stub implementation
    const url = `${this.baseURL}${endpoint}`;
    console.log('POST request to:', url, 'with data:', data);
    return { data: null };
  }

  async put(endpoint: string, data?: unknown, options?: RequestInit): Promise<unknown> {
    // Stub implementation
    const url = `${this.baseURL}${endpoint}`;
    console.log('PUT request to:', url, 'with data:', data);
    return { data: null };
  }

  async delete(endpoint: string, options?: RequestInit): Promise<unknown> {
    // Stub implementation
    const url = `${this.baseURL}${endpoint}`;
    console.log('DELETE request to:', url);
    return { success: true };
  }
}

export const apiClient = new APIClient();
