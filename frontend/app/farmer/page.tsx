'use client';

import { useState, useEffect } from 'react';
import { WalletButton } from '../../components/WalletButton';
import { InvoiceCard } from '../../components/InvoiceCard';
import { invoicesApi, Invoice } from '../../lib/api';
import { useFreighter } from '../../hooks/useFreighter';

export default function FarmerPage() {
  const { publicKey } = useFreighter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState({ cropType: '', expectedYield: '', amountRequested: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (publicKey) invoicesApi.list(publicKey).then(setInvoices);
  }, [publicKey]);

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) return setMsg('Connect wallet first');
    setLoading(true);
    try {
      await invoicesApi.create({
        farmer: publicKey,
        cropType: form.cropType,
        expectedYield: Number(form.expectedYield),
        amountRequested: Number(form.amountRequested),
        dueDate: new Date(form.dueDate).toISOString(),
      });
      setMsg('Invoice minted!');
      setForm({ cropType: '', expectedYield: '', amountRequested: '', dueDate: '' });
      const updated = await invoicesApi.list(publicKey);
      setInvoices(updated);
    } catch {
      setMsg('Error minting invoice');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">🌾 Farmer Portal</h1>
        <WalletButton />
      </div>

      <form onSubmit={handleMint} className="bg-white rounded-xl p-5 shadow-sm mb-8 grid grid-cols-2 gap-4">
        <h2 className="col-span-2 font-semibold text-lg">Mint Harvest Invoice</h2>
        <input required placeholder="Crop type (e.g. Wheat)" value={form.cropType}
          onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm" />
        <input required type="number" placeholder="Expected yield (kg)" value={form.expectedYield}
          onChange={e => setForm(f => ({ ...f, expectedYield: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm" />
        <input required type="number" placeholder="Amount requested (XLM)" value={form.amountRequested}
          onChange={e => setForm(f => ({ ...f, amountRequested: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm" />
        <input required type="date" value={form.dueDate}
          onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm" />
        <button type="submit" disabled={loading}
          className="col-span-2 bg-green-600 text-white rounded-lg py-2 font-semibold hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Minting…' : 'Mint Invoice'}
        </button>
        {msg && <p className="col-span-2 text-sm text-center text-gray-600">{msg}</p>}
      </form>

      <h2 className="font-semibold text-lg mb-3">My Invoices</h2>
      {invoices.length === 0 ? (
        <p className="text-gray-500 text-sm">No invoices yet. Connect wallet and mint one.</p>
      ) : (
        <div className="grid gap-4">
          {invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)}
        </div>
      )}
    </div>
  );
}
