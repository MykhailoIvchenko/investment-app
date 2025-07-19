import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

type RecurringConfig = {
  interval: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  amount: bigint;
};

export function useRecurring() {
  const [config, setConfig] = useState<RecurringConfig | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchConfig() {
    setLoading(true);
    try {
      // TODO: call vault.getRecurringConfig()
      const fakeConfig = { interval: 'weekly', amount: BigInt(100_000_000) };
      await new Promise((res) => setTimeout(res, 800));
      setConfig(fakeConfig);
    } catch {
      toast.error('Failed to fetch recurring config');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }

  async function setRecurringConfig(newConfig: RecurringConfig) {
    setLoading(true);
    try {
      // TODO: call vault.setRecurringConfig(newConfig)
      await new Promise((res) => setTimeout(res, 800));
      setConfig(newConfig);
      toast.success('Recurring config updated');
    } catch {
      toast.error('Failed to update recurring config');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    setRecurringConfig,
  };
}
