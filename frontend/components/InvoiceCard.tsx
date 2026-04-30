import { Invoice } from '../lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  FINANCED: 'bg-blue-100 text-blue-800',
  REPAID: 'bg-green-100 text-green-800',
  DEFAULTED: 'bg-red-100 text-red-800',
  YIELD_VERIFIED: 'bg-purple-100 text-purple-800',
};

export function InvoiceCard({ invoice, action }: { invoice: Invoice; action?: React.ReactNode }) {
  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-lg">{invoice.cropType}</p>
          <p className="text-xs text-gray-500 font-mono">{invoice.farmer.slice(0, 8)}…</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[invoice.status] ?? 'bg-gray-100'}`}>
          {invoice.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-sm text-gray-700">
        <span>Yield: {invoice.expectedYield} kg</span>
        <span>Amount: {invoice.amountRequested} XLM</span>
        <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
        {invoice.actualYield != null && <span>Actual: {invoice.actualYield} kg</span>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
