import React, { useState } from 'react';
import { useCkBTC } from '../hooks/useCkBTC';
import Input from './ui/Input';
import Button from './ui/Button';

const ApproveTransfer: React.FC = () => {
  const { approveTransfer, isReady } = useCkBTC();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = React.useState(false);

  const handleApprove = async () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Enter a valid positive amount');
      return;
    }

    setLoading(true);

    try {
      const satAmount = BigInt(Math.floor(numAmount * 1e8));
      const success = await approveTransfer(satAmount);
      if (success) setAmount('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='approve-container'>
      <h3>Approve Vault Canister to transfer ckBTC</h3>

      <Input
        className='input'
        type='number'
        min='0'
        step='0.00000001'
        placeholder='Amount BTC'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={loading || !isReady}
      />

      <Button
        type='button'
        onClick={handleApprove}
        disabled={loading || !isReady}
        text={loading ? 'Approving...' : 'Approve'}
      />
    </div>
  );
};

export default ApproveTransfer;
