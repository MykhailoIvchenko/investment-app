import React, { useState, useEffect } from 'react';
import { useRecurring } from '../hooks/useRecurring';
import Button from './ui/Button';
import Input from './ui/Input';

const intervals = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
];

const RecurringConfig: React.FC = () => {
  const { config, loading, setRecurringConfig } = useRecurring();

  const [interval, setInterval] = useState<
    'daily' | 'weekly' | 'monthly' | 'quarterly'
  >(config?.interval || 'daily');

  const [amount, setAmount] = useState<string>(
    config ? (Number(config.amount) / 1e8).toString() : ''
  );

  useEffect(() => {
    if (config) {
      setInterval(config.interval);
      setAmount((Number(config.amount) / 1e8).toString());
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Enter valid positive amount');
      return;
    }
    await setRecurringConfig({
      interval,
      amount: BigInt(Math.floor(numAmount * 1e8)),
    });
  };

  return (
    <div className='recurring-container'>
      <h3 className='section-title'>Configure Recurring Deposit</h3>

      <form onSubmit={handleSubmit}>
        <div>
          {intervals.map(({ label, value }) => (
            <label key={value} className='radio-label'>
              <input
                type='radio'
                value={value}
                checked={interval === value}
                onChange={() => setInterval(value as any)}
                disabled={loading}
              />
              {label}
            </label>
          ))}
        </div>

        <div className='amount-input-wrapper'>
          <Input
            label='Amount BTC'
            className='input'
            type='number'
            min='0'
            step='0.00000001'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          type='submit'
          disabled={loading}
          className='btn'
          text={loading ? 'Saving...' : 'Save Configuration'}
        />
      </form>
    </div>
  );
};

export default RecurringConfig;
