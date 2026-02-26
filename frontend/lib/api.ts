/**
 * API Service Layer for Grievance Portal
 * Connects Next.js frontend to FastAPI backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to make authenticated requests
async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    const errorMessage = typeof error.detail === 'string' 
      ? error.detail 
      : JSON.stringify(error.detail || error);
    console.error('API Error:', {
      status: response.status,
      url: `${API_URL}${endpoint}`,
      error: error
    });
    throw new Error(errorMessage);
  }

  return response.json();
}

// ============================================
// AUTH API
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
  role: string;
  department?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: 'citizen' | 'admin' | 'superadmin';
  departments?: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    return fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// GRIEVANCE API
// ============================================

export interface GrievanceCreate {
  message: string;
}

export interface GrievanceResponse {
  id: string;
  user_id: string;
  message: string;
  predicted_department: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  explanation: string;
  status: 'submitted' | 'in_progress' | 'resolved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const grievanceAPI = {
  create: async (data: GrievanceCreate): Promise<GrievanceResponse> => {
    return fetchAPI('/api/grievances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyGrievances: async (skip = 0, limit = 10): Promise<GrievanceResponse[]> => {
    return fetchAPI(`/api/grievances/my-grievances?skip=${skip}&limit=${limit}`);
  },

  getById: async (id: string): Promise<GrievanceResponse> => {
    return fetchAPI(`/api/grievances/${id}`);
  },
};

// ============================================
// ADMIN API
// ============================================

export interface GrievanceStatusUpdate {
  status: 'in_progress' | 'resolved' | 'rejected';
}

export const adminAPI = {
  getGrievances: async (
    dept?: string,
    status?: string,
    skip = 0,
    limit = 10
  ): Promise<GrievanceResponse[]> => {
    const params = new URLSearchParams();
    if (dept) params.append('dept', dept);
    if (status) params.append('status', status);
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());

    return fetchAPI(`/api/admin/grievances?${params.toString()}`);
  },

  updateStatus: async (
    id: string,
    data: GrievanceStatusUpdate
  ): Promise<GrievanceResponse> => {
    return fetchAPI(`/api/admin/grievances/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Save auth token to localStorage
export const saveAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// Decode JWT token to get user info
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};
