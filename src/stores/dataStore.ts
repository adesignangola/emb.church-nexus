import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// =====================================================
// MEMBERS
// =====================================================
interface Member {
  id: string;
  full_name: string;
  birth_date: string | null;
  gender: 'M' | 'F' | 'O' | null;
  photo_url: string | null;
  phone: string;
  email: string;
  address: string;
  baptism_date: string | null;
  membership_date: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DECEASED';
  department_id: string | null;
  is_tither: boolean;
  marital_status: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | null;
  spouse_name: string | null;
  profession: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface MembersState {
  members: Member[];
  loading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  addMember: (member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
}

export const useMembers = create<MembersState>()((set, get) => ({
  members: [],
  loading: false,
  error: null,

  fetchMembers: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw error;
      set({ members: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addMember: async (member) => {
    try {
      const { data, error } = await supabase.from('members').insert(member).select().single();
      if (error) throw error;
      set((state) => ({ members: [...state.members, data] }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  updateMember: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('members').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ members: state.members.map((m) => (m.id === id ? data : m)) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteMember: async (id) => {
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ members: state.members.filter((m) => m.id !== id) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));

// =====================================================
// FINANCIAL TRANSACTIONS
// =====================================================
interface FinancialTransaction {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'TITHE' | 'OFFERING' | 'SPECIAL_OFFERING' | 'DONATION' | 'OPERATIONAL' | 'EVENT' | 'SALARY' | 'EXTRAORDINARY';
  amount: number;
  member_id: string | null;
  payment_method: string;
  description: string;
  receipt_url: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  created_at: string;
}

interface FinancialState {
  transactions: FinancialTransaction[];
  loading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'created_at'>) => Promise<boolean>;
  updateTransaction: (id: string, updates: Partial<FinancialTransaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
}

export const useFinancial = create<FinancialState>()((set) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      set({ transactions: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addTransaction: async (tx) => {
    try {
      const { data, error } = await supabase.from('financial_transactions').insert(tx).select().single();
      if (error) throw error;
      set((state) => ({ transactions: [data, ...state.transactions] }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('financial_transactions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ transactions: state.transactions.map((t) => (t.id === id ? data : t)) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteTransaction: async (id) => {
    try {
      const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));

// =====================================================
// WORSHIP SERVICES
// =====================================================
interface WorshipService {
  id: string;
  date: string;
  type: string;
  preacher: string;
  theme: string | null;
  bible_text: string | null;
  attendance_members: number;
  attendance_visitors: number;
  decisions: number;
  offerings: number;
  notes: string | null;
  created_at: string;
}

interface WorshipState {
  services: WorshipService[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  addService: (service: Omit<WorshipService, 'id' | 'created_at'>) => Promise<boolean>;
  updateService: (id: string, updates: Partial<WorshipService>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
}

export const useWorship = create<WorshipState>()((set) => ({
  services: [],
  loading: false,
  error: null,

  fetchServices: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('worship_services')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      set({ services: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addService: async (service) => {
    try {
      const { data, error } = await supabase.from('worship_services').insert(service).select().single();
      if (error) throw error;
      set((state) => ({ services: [data, ...state.services] }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  updateService: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('worship_services').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ services: state.services.map((s) => (s.id === id ? data : s)) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteService: async (id) => {
    try {
      const { error } = await supabase.from('worship_services').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ services: state.services.filter((s) => s.id !== id) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));

// =====================================================
// DEPARTMENTS
// =====================================================
interface Department {
  id: string;
  name: string;
  description: string;
  leader_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface DepartmentsState {
  departments: Department[];
  loading: boolean;
  error: string | null;
  fetchDepartments: () => Promise<void>;
  addDepartment: (dept: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateDepartment: (id: string, updates: Partial<Department>) => Promise<boolean>;
  deleteDepartment: (id: string) => Promise<boolean>;
}

export const useDepartments = create<DepartmentsState>()((set) => ({
  departments: [],
  loading: false,
  error: null,

  fetchDepartments: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      set({ departments: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addDepartment: async (dept) => {
    try {
      const { data, error } = await supabase.from('departments').insert(dept).select().single();
      if (error) throw error;
      set((state) => ({ departments: [...state.departments, data] }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  updateDepartment: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('departments').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ departments: state.departments.map((d) => (d.id === id ? data : d)) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteDepartment: async (id) => {
    try {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ departments: state.departments.filter((d) => d.id !== id) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));

// =====================================================
// APPOINTMENTS
// =====================================================
interface Appointment {
  id: string;
  date: string;
  time: string;
  member_name: string;
  type: 'COUNSELING' | 'VISIT' | 'PRESENTATION' | 'MARRIAGE' | 'HOSPITAL' | 'OTHER';
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  pastor_id: string | null;
  notes: string | null;
  created_at: string;
}

interface AppointmentsState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  addAppointment: (appt: Omit<Appointment, 'id' | 'created_at'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
}

export const useAppointments = create<AppointmentsState>()((set) => ({
  appointments: [],
  loading: false,
  error: null,

  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      set({ appointments: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addAppointment: async (appt) => {
    try {
      const { data, error } = await supabase.from('appointments').insert(appt).select().single();
      if (error) throw error;
      set((state) => ({ appointments: [data, ...state.appointments] }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  updateAppointment: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ appointments: state.appointments.map((a) => (a.id === id ? data : a)) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteAppointment: async (id) => {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));

// =====================================================
// VISITORS
// =====================================================
interface Visitor {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  visit_date: string;
  service_type: string | null;
  referred_by: string | null;
  follow_up_status: 'PENDING' | 'CONTACTED' | 'FOLLOWING_UP' | 'BECAME_MEMBER' | 'DECLINED';
  notes: string | null;
  created_at: string;
}

interface VisitorsState {
  visitors: Visitor[];
  loading: boolean;
  error: string | null;
  fetchVisitors: () => Promise<void>;
  addVisitor: (visitor: Omit<Visitor, 'id' | 'created_at'>) => Promise<boolean>;
  updateVisitor: (id: string, updates: Partial<Visitor>) => Promise<boolean>;
  deleteVisitor: (id: string) => Promise<boolean>;
}

export const useVisitors = create<VisitorsState>()((set) => ({
  visitors: [],
  loading: false,
  error: null,

  fetchVisitors: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('visit_date', { ascending: false });
      if (error) throw error;
      set({ visitors: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addVisitor: async (visitor) => {
    try {
      const { data, error } = await supabase.from('visitors').insert(visitor).select().single();
      if (error) throw error;
      set((state) => ({ visitors: [data, ...state.visitors] }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  updateVisitor: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('visitors').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ visitors: state.visitors.map((v) => (v.id === id ? data : v)) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteVisitor: async (id) => {
    try {
      const { error } = await supabase.from('visitors').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ visitors: state.visitors.filter((v) => v.id !== id) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));

// =====================================================
// EVENTS
// =====================================================
interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  end_date: string | null;
  location: string | null;
  type: 'CONFERENCE' | 'WORSHIP' | 'YOUTH' | 'WOMEN' | 'MEN' | 'PRAYER' | 'GENERAL';
  image_url: string | null;
  created_at: string;
}

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id' | 'created_at'>) => Promise<boolean>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
}

export const useEvents = create<EventsState>()((set) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      set({ events: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addEvent: async (event) => {
    try {
      const { data, error } = await supabase.from('events').insert(event).select().single();
      if (error) throw error;
      set((state) => ({ events: [...state.events, data] }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  updateEvent: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ events: state.events.map((e) => (e.id === id ? data : e)) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteEvent: async (id) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));

// =====================================================
// SCHEDULES
// =====================================================
interface Schedule {
  id: string;
  date: string;
  service_type: string;
  role: string;
  member_id: string | null;
  member_name: string | null;
  notes: string | null;
  created_at: string;
}

interface SchedulesState {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  fetchSchedules: () => Promise<void>;
  addSchedule: (sched: Omit<Schedule, 'id' | 'created_at'>) => Promise<boolean>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<boolean>;
  deleteSchedule: (id: string) => Promise<boolean>;
}

export const useSchedules = create<SchedulesState>()((set) => ({
  schedules: [],
  loading: false,
  error: null,

  fetchSchedules: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      set({ schedules: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addSchedule: async (sched) => {
    try {
      const { data, error } = await supabase.from('schedules').insert(sched).select().single();
      if (error) throw error;
      set((state) => ({ schedules: [...state.schedules, data] }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  updateSchedule: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('schedules').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ schedules: state.schedules.map((s) => (s.id === id ? data : s)) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteSchedule: async (id) => {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ schedules: state.schedules.filter((s) => s.id !== id) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));

// =====================================================
// SCHOOL CLASSES
// =====================================================
interface SchoolClass {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  start_date: string | null;
  end_date: string | null;
  max_students: number | null;
  enrolled_count: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
  created_at: string;
}

interface SchoolClassesState {
  classes: SchoolClass[];
  loading: boolean;
  error: string | null;
  fetchClasses: () => Promise<void>;
  addClass: (cls: Omit<SchoolClass, 'id' | 'created_at'>) => Promise<void>;
  updateClass: (id: string, updates: Partial<SchoolClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
}

export const useSchoolClasses = create<SchoolClassesState>()((set) => ({
  classes: [],
  loading: false,
  error: null,

  fetchClasses: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('school_classes')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      set({ classes: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addClass: async (cls) => {
    try {
      const { data, error } = await supabase.from('school_classes').insert(cls).select().single();
      if (error) throw error;
      set((state) => ({ classes: [...state.classes, data] }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  updateClass: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('school_classes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ classes: state.classes.map((c) => (c.id === id ? data : c)) }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteClass: async (id) => {
    try {
      const { error } = await supabase.from('school_classes').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ classes: state.classes.filter((c) => c.id !== id) }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));

// =====================================================
// KIDS GROUPS
// =====================================================
interface KidsGroup {
  id: string;
  name: string;
  age_range: string;
  teacher_name: string;
  teacher_id: string | null;
  enrolled_count: number;
  room: string | null;
  created_at: string;
}

interface KidsGroupsState {
  groups: KidsGroup[];
  loading: boolean;
  error: string | null;
  fetchGroups: () => Promise<void>;
  addGroup: (group: Omit<KidsGroup, 'id' | 'created_at'>) => Promise<void>;
  updateGroup: (id: string, updates: Partial<KidsGroup>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
}

export const useKidsGroups = create<KidsGroupsState>()((set) => ({
  groups: [],
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('kids_groups')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      set({ groups: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addGroup: async (group) => {
    try {
      const { data, error } = await supabase.from('kids_groups').insert(group).select().single();
      if (error) throw error;
      set((state) => ({ groups: [...state.groups, data] }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  updateGroup: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('kids_groups').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ groups: state.groups.map((g) => (g.id === id ? data : g)) }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteGroup: async (id) => {
    try {
      const { error } = await supabase.from('kids_groups').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));

// =====================================================
// MESSAGES (Communication)
// =====================================================
interface Message {
  id: string;
  title: string;
  body: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'BOTH';
  target_audience: 'ALL' | 'MEMBERS' | 'VISITORS' | 'DEPARTMENT' | 'CUSTOM';
  status: 'DRAFT' | 'SENT' | 'FAILED' | 'SCHEDULED';
  scheduled_at: string | null;
  sent_count: number;
  delivery_count: number;
  created_at: string;
}

interface MessagesState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  fetchMessages: () => Promise<void>;
  sendMessage: (msg: Omit<Message, 'id' | 'created_at' | 'sent_count' | 'delivery_count'>) => Promise<boolean>;
  updateMessage: (id: string, updates: Partial<Message>) => Promise<boolean>;
  deleteMessage: (id: string) => Promise<boolean>;
}

export const useMessages = create<MessagesState>()((set) => ({
  messages: [],
  loading: false,
  error: null,

  fetchMessages: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ messages: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  sendMessage: async (msg) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(msg)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ messages: [data, ...state.messages] }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  updateMessage: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('messages').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ messages: state.messages.map((m) => (m.id === id ? data : m)) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteMessage: async (id) => {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ messages: state.messages.filter((m) => m.id !== id) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));

// =====================================================
// AUDIT LOGS
// =====================================================
interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

interface AuditLogsState {
  logs: AuditLog[];
  loading: boolean;
  error: string | null;
  fetchLogs: () => Promise<void>;
}

export const useAuditLogs = create<AuditLogsState>()((set) => ({
  logs: [],
  loading: false,
  error: null,

  fetchLogs: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      set({ logs: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));

// =====================================================
// LEADERSHIP POSITIONS
// =====================================================
interface LeadershipPosition {
  id: string;
  title: string;
  department_id: string | null;
  leader_id: string | null;
  leader_name: string | null;
  level: number;
  description: string | null;
  created_at: string;
}

interface LeadershipState {
  positions: LeadershipPosition[];
  loading: boolean;
  error: string | null;
  fetchPositions: () => Promise<void>;
}

export const useLeadership = create<LeadershipState>()((set) => ({
  positions: [],
  loading: false,
  error: null,

  fetchPositions: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('leadership_positions')
        .select('*')
        .order('level', { ascending: true });
      if (error) throw error;
      set({ positions: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));

// =====================================================
// PROFILES (Users)
// =====================================================
interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'PASTOR' | 'SECRETARY' | 'TREASURER' | 'DEPT_LEADER' | 'MEMBER';
  avatar_url: string | null;
  phone: string | null;
  department_id: string | null;
  created_at: string;
}

interface ProfilesState {
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  fetchProfiles: () => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

export const useProfiles = create<ProfilesState>()((set) => ({
  profiles: [],
  loading: false,
  error: null,

  fetchProfiles: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw error;
      set({ profiles: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  updateProfile: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ profiles: state.profiles.map((p) => (p.id === id ? data : p)) }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteProfile: async (id) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ profiles: state.profiles.filter((p) => p.id !== id) }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));

// =====================================================
// NOTIFICATIONS
// =====================================================
export interface Notification {
  id: string;
  user_id: string | null;
  type: 'MEMBER' | 'FINANCIAL' | 'EVENT' | 'SYSTEM' | 'MESSAGE' | 'BIRTHDAY' | 'SERVICE';
  title: string;
  message: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotifications = create<NotificationsState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      set({
        notifications: data || [],
        unreadCount: data?.filter(n => !n.is_read).length || 0,
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  markAllAsRead: async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteNotification: async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: state.notifications.find(n => n.id === id && !n.is_read)
          ? state.unreadCount - 1
          : state.unreadCount,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));

// =====================================================
// SERMONS
// =====================================================
interface Sermon {
  id: string;
  title: string;
  preacher_id: string | null;
  date: string;
  bible_text: string | null;
  theme: string | null;
  notes: string | null;
  file_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface SermonsState {
  sermons: Sermon[];
  loading: boolean;
  error: string | null;
  fetchSermons: () => Promise<void>;
  addSermon: (sermon: Omit<Sermon, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateSermon: (id: string, updates: Partial<Sermon>) => Promise<boolean>;
  deleteSermon: (id: string) => Promise<boolean>;
}

export const useSermons = create<SermonsState>()((set) => ({
  sermons: [],
  loading: false,
  error: null,

  fetchSermons: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      set({ sermons: data || [], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addSermon: async (sermon) => {
    try {
      const { data, error } = await supabase.from('sermons').insert(sermon).select().single();
      if (error) throw error;
      set((state) => ({ sermons: [data, ...state.sermons] }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  updateSermon: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('sermons').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set((state) => ({ sermons: state.sermons.map((s) => (s.id === id ? data : s)) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteSermon: async (id) => {
    try {
      const { error } = await supabase.from('sermons').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ sermons: state.sermons.filter((s) => s.id !== id) }));
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));

// =====================================================
// CHURCH PROFILE
// =====================================================
interface ChurchProfile {
  id: string;
  name: string;
  legal_name: string | null;
  denomination: string | null;
  nif: string | null;
  registration_number: string | null;
  email: string | null;
  phone: string | null;
  secondary_phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  senior_pastor_name: string | null;
  senior_pastor_phone: string | null;
  senior_pastor_email: string | null;
  assistant_pastor_name: string | null;
  church_president_name: string | null;
  founding_date: string | null;
  mission_statement: string | null;
  vision_statement: string | null;
  values_statement: string | null;
  history_notes: string | null;
  doctrine_statement: string | null;
  service_times: any | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  whatsapp_group_url: string | null;
  logo_url: string | null;
  banner_url: string | null;
  membership_goal: number | null;
  current_members_count: number | null;
  fiscal_year_start_month: number | null;
  default_currency: string | null;
  timezone: string | null;
  language: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ChurchProfileState {
  profile: ChurchProfile | null;
  loading: boolean;
  error: string | null;
  fetchChurchProfile: () => Promise<void>;
  updateChurchProfile: (updates: Partial<ChurchProfile>) => Promise<boolean>;
}

export const useChurchProfile = create<ChurchProfileState>()((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchChurchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('church_profile')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      set({ profile: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  updateChurchProfile: async (updates) => {
    try {
      const { data: current } = await supabase
        .from('church_profile')
        .select('id')
        .limit(1)
        .single();
      
      if (!current) throw new Error('Perfil da igreja não encontrado');

      const { data, error } = await supabase
        .from('church_profile')
        .update(updates)
        .eq('id', current.id)
        .select()
        .single();
      
      if (error) throw error;
      set({ profile: data });
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));
