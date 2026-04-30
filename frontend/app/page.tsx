import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-700">🌾 AgroLedger</h1>
        <p className="mt-2 text-gray-600">Harvest invoice financing on Stellar</p>
      </div>
      <div className="flex gap-6">
        <Link
          href="/farmer"
          className="px-8 py-4 bg-green-600 text-white rounded-xl text-lg font-semibold hover:bg-green-700 transition"
        >
          Farmer Portal
        </Link>
        <Link
          href="/investor"
          className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
        >
          Investor Portal
        </Link>
      </div>
    </main>
  );
}
