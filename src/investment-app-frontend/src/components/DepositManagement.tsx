import { useCkBTC } from '../hooks/useCkBTC';
import { useSelectUser } from '../redux/hooks/selectHooks/useSelectUser';

const DepositManagement: React.FC = () => {
  const user = useSelectUser();
  const { balance } = useCkBTC();

  return (
    <div>
      <h1>Hello, {user?.username}!</h1>
      <h2>You have {balance ? Number(balance) : 0}BTC</h2>
      {/* <h1>Hello, User!</h1> */}
      {/* <h2>You have 0 BTC</h2> */}
    </div>
  );
};

export default DepositManagement;
