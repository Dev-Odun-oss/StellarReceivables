import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

export interface Invoice {
  id: string;
  onChainId?: number;
  farmer: string;
  cropType: string;
  expectedYield: number;
  amountRequested: number;
  dueDate: string;
  status: string;
  actualYield?: number;
  financings?: Financing[];
}

export interface Financing {
  id: string;
  invoiceId: string;
  lender: string;
  amount: number;
  fundedAt: string;
}

export const invoicesApi = {
  create: (data: Omit<Invoice, 'id' | 'status'>) =>
    api.post<Invoice>('/invoices', data).then((r) => r.data),
  list: (farmer?: string) =>
    api.get<Invoice[]>('/invoices', { params: { farmer } }).then((r) => r.data),
  get: (id: string) => api.get<Invoice>(`/invoices/${id}`).then((r) => r.data),
};

export const financingApi = {
  create: (data: { invoiceId: string; lender: string; amount: number }) =>
    api.post<Financing>('/financing', data).then((r) => r.data),
  listByLender: (lender: string) =>
    api.get<Financing[]>('/financing', { params: { lender } }).then((r) => r.data),
};
