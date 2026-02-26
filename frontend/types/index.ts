export type UserRole = 'citizen' | 'admin' | 'superadmin';

// Backend department IDs
export type DepartmentId = 
  | 'water'
  | 'sanitation'
  | 'roads'
  | 'electricity'
  | 'health'
  | 'police'
  | 'housing'
  | 'general'
  | 'miscellaneous';

// Frontend display names for departments
export type Department = 
  | 'Water Supply'
  | 'Sanitation & Waste'
  | 'Roads & Infrastructure'
  | 'Electricity'
  | 'Public Health'
  | 'Police & Safety'
  | 'Housing & Building'
  | 'General Services'
  | 'Miscellaneous';

export type GrievanceStatus = 'submitted' | 'in_progress' | 'resolved' | 'rejected';

export type Priority = 'low' | 'medium' | 'high';

// Department mapping between backend IDs and frontend display names
export const DEPARTMENT_MAP: Record<DepartmentId, Department> = {
  water: 'Water Supply',
  sanitation: 'Sanitation & Waste',
  roads: 'Roads & Infrastructure',
  electricity: 'Electricity',
  health: 'Public Health',
  police: 'Police & Safety',
  housing: 'Housing & Building',
  general: 'General Services',
  miscellaneous: 'Miscellaneous',
};

export const DEPARTMENT_ID_MAP: Record<Department, DepartmentId> = {
  'Water Supply': 'water',
  'Sanitation & Waste': 'sanitation',
  'Roads & Infrastructure': 'roads',
  'Electricity': 'electricity',
  'Public Health': 'health',
  'Police & Safety': 'police',
  'Housing & Building': 'housing',
  'General Services': 'general',
  'Miscellaneous': 'miscellaneous',
};

// Status display names
export const STATUS_DISPLAY: Record<GrievanceStatus, string> = {
  submitted: 'Submitted',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

// Priority display names
export const PRIORITY_DISPLAY: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export interface User {
  id: string;
  email: string;
  role: UserRole;
  departments?: DepartmentId[];  // For admin users
}

export interface Grievance {
  id: string;
  user_id: string;
  message: string;
  predicted_department: DepartmentId;
  priority: Priority;
  confidence: number;
  explanation: string;
  status: GrievanceStatus;
  created_at: string;
  updated_at: string;
}

export interface GrievanceResponse {
  id: string;
  grievanceId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  createdAt: string;
}

export interface TimelineEntry {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  department: Department;
  isActive: boolean;
  createdAt: string;
}

export interface DepartmentStats {
  department: Department;
  totalComplaints: number;
  solved: number;
  pending: number;
  inProgress: number;
  avgResolutionTime: string;
}
