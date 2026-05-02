/**
 * Emb.Church Nexus - Domain Types
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  PASTOR = 'PASTOR',
  SECRETARY = 'SECRETARY',
  DEPT_LEADER = 'DEPT_LEADER',
  MEMBER = 'MEMBER'
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  DECEASED = 'DECEASED'
}

export interface Member {
  id: string;
  churchId: string;
  fullName: string;
  birthDate: string;
  gender: 'M' | 'F' | 'O';
  photoUrl?: string;
  phone: string;
  email: string;
  address: string;
  baptismDate?: string;
  membershipDate?: string;
  status: MemberStatus;
  departmentId?: string;
  isTither: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum FinancialType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum FinancialCategory {
  TITHE = 'TITHE',
  OFFERING = 'OFFERING',
  SPECIAL_OFFERING = 'SPECIAL_OFFERING',
  DONATION = 'DONATION',
  OPERATIONAL = 'OPERATIONAL',
  EVENT = 'EVENT',
  SALARY = 'SALARY',
  EXTRAORDINARY = 'EXTRAORDINARY'
}

export interface FinancialTransaction {
  id: string;
  churchId: string;
  date: string;
  type: FinancialType;
  category: FinancialCategory;
  amount: number;
  memberId?: string;
  paymentMethod: string;
  description: string;
  receiptUrl?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
}

export interface WorshipService {
  id: string;
  churchId: string;
  date: string;
  type: string;
  preacher: string;
  theme: string;
  bibleText: string;
  attendanceMembers: number;
  attendanceVisitors: number;
  decisions: number;
  offerings: number;
  notes: string;
  createdAt: string;
}

export interface Department {
  id: string;
  churchId: string;
  name: string;
  description: string;
  leaderId: string;
  active: boolean;
  createdAt: string;
}
