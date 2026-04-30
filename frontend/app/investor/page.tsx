'use client';

import { useState, useEffect } from 'react';
import { WalletButton } from '../../components/WalletButton';
import { InvoiceCard } from '../../components/InvoiceCard';
import { invoicesApi, financingApi, Invoice } from '../../lib/api';
import { useFreighter } from '../../hooks/useFreighter';

export default function InvestorPage() {
  const { publicKey } = useFreighter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [funding, setFunding] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    invoicesApi.list().then(setInvoices);
  }, []);

  async function handleFund(invoice: Invoice) {
    if (!publicKey) return setMsg('Connect wallet first');
    setFunding(f => ({ ...f, [invoice.id]: true }));
    try {
      await financingApi.create({
        invoiceId: invoice.id,
        lender: publicKey,
        amount: invoice.amountRequested,
      });
      setMsg(`Funded invoice for ${invoice.cropType}!`);
      const updated = await invoicesApi.list();
      setInvoices(updated);
    } catch {
      setMsg('Error funding invoice');
    } finally {
      setFunding(f => ({ ...f, [invoice.id]: false }));
    }
  }

  const pending = invoices.filter(i => i.status === 'PENDING');
  const myFinanced = invoices.filter(
    i => i.status !== 'PENDING' && i.financings?.some(f => f.lender === publicKey),
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">💼 Investor Portal</h1>
        <WalletButton />
      </div>

      {msg && <p className="mb-4 text-sm text-center text-gray-600 bg-blue-50 rounded-lg p-2">{msg}</p>}

      <h2 className="font-semibold text-lg mb-3">Available Invoices</h2>
      {pending.length === 0 ? (
        <p className="text-gray-500 text-sm mb-6">No pending invoices available.</p>
      ) : (
        <div className="grid gap-4 mb-8">
          {pending.map(inv => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              action={
                <button
                  onClick={() => handleFund(inv)}
                  disabled={funding[inv.id]}
                  className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {funding[inv.id] ? 'Funding…' : `Fund ${inv.amountRequested} XLM`}
                </button>
              }
            />
          ))}
        </div>
      )}

      {publicKey && myFinanced.length > 0 && (
        <>
          <h2 className="font-semibold text-lg mb-3">My Portfolio</h2>
          <div className="grid gap-4">
            {myFinanced.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)}
          </div>
        </>
      )}
    </div>
  );
}
