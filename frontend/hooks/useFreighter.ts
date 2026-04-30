'use client';

import { useState, useCallback } from 'react';
import {
  isConnected,
  getPublicKey,
  signTransaction,
} from '@stellar/freighter-api';

export function useFreighter() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      const connected = await isConnected();
      if (!connected) {
        setError('Freighter wallet not found. Please install it.');
        return;
      }
      const key = await getPublicKey();
      setPublicKey(key);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const sign = useCallback(
    async (xdr: string, network = 'TESTNET') => {
      return signTransaction(xdr, { networkPassphrase: network });
    },
    [],
  );

  return { publicKey, error, connect, sign };
}
