'use client';

import { useFreighter } from '../hooks/useFreighter';

export function WalletButton() {
  const { publicKey, error, connect } = useFreighter();

  return (
    <div className="flex items-center gap-3">
      {publicKey ? (
        <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-mono">
          {publicKey.slice(0, 6)}…{publicKey.slice(-4)}
        </span>
      ) : (
        <button
          onClick={connect}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
        >
          Connect Freighter
        </button>
      )}
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}
