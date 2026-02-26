export type UserRole = 'user' | 'admin' | 'super-admin';

export type Department = 
  | 'Water Supply'
  | 'Sanitation & Garbage'
  | 'Roads & Drainage'
  | 'Electricity'
  | 'Public Health'
  | 'Police & Law Enforcement'
  | 'Housing & Building Issues'
  | 'General / Miscellaneous';

export type GrievanceStatus = 'Solved' | 'Unsolved' | 'In Progress';

export type Urgency = 'Low' | 'Medium' | 'High';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: Department;
}

export interface Grievance {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  userAddress: string;
  department: Department;
  title: string;
  description: string;
  urgency: Urgency;
  status: GrievanceStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responses: GrievanceResponse[];
  timeline: TimelineEntry[];
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
