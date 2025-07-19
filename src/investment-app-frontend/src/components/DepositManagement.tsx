import React, { useEffect, useState } from 'react';
import { useSelectUser } from '../redux/hooks/selectHooks/useSelectUser';
import { useCkBTC } from '../hooks/useCkBTC';
import { useVault } from '../hooks/useVault';
import ApproveTransfer from './ApproveTransfer';
import RecurringConfig from './RecurringConfig';
import Input from './ui/Input';
import Button from './ui/Button';

const DepositManagement: React.FC = () => {
  const user = useSelectUser();
  const { balance: ckbtcBalance, fetchBalance } = useCkBTC();
  const { withdraw } = useVault();

  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleWithdraw = async () => {
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Enter a valid withdrawal amount');
      return;
    }
    const amountBigInt = BigInt(Math.floor(amountNum * 1e8));
    await withdraw(amountBigInt);
    setWithdrawAmount('');
  };

  return (
    <div className='deposit-container'>
      <h1>Hello, {user?.username}!</h1>

      <h2>
        Your Wallet Balance: {ckbtcBalance ? Number(ckbtcBalance) / 1e8 : 0} BTC
      </h2>

      <ApproveTransfer />

      <div className='withdraw-section'>
        <h3 className='section-title'>Withdraw from Vault</h3>

        <Input
          className='input'
          type='number'
          step='0.00000001'
          placeholder='Amount BTC'
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />

        <Button
          onClick={handleWithdraw}
          className='btn'
          text='Withdraw'
          disabled={!withdrawAmount}
        />
      </div>

      <RecurringConfig />
    </div>
  );
};

export default DepositManagement;
