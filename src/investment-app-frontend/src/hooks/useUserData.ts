import { useEffect, useState } from 'react';
import { useSelectUser } from '../redux/hooks/selectHooks/useSelectUser';
import { useDfinityAgent } from './useDfinityAgent';
import { toast } from 'react-toastify';
import { IUser } from '../utils/types';
import useUserDispatch from '../redux/hooks/dispatchHooks/useUserDispatch';

type UseUserData = () => {
  isLoading: boolean;
  username?: string;
  saveUserData?: (newUsername: string) => Promise<void>;
};

export const useUserData: UseUserData = () => {
  const user = useSelectUser();

  const setUserData = useUserDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const principalId = user?.principalId;

  const actor = useDfinityAgent();

  const getUserDataAndSet = async () => {
    try {
      setIsLoading(true);

      if (principalId && actor) {
        const userDataArray = (await actor.get_user()) as IUser[];
        if (userDataArray.length > 0) {
          const userData = userDataArray[0];

          const dataToSet = {
            username: userData!.username,
            principalId: principalId,
          };
          setUserData(dataToSet);
        }
      }
    } catch (error) {
      toast.error('An error occured during the user data retreiving');
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async (newUsername: string) => {
    try {
      setIsLoading(true);

      if (principalId && actor) {
        await actor.register_user(newUsername);

        setUserData({
          username: newUsername,
          principalId,
        });
      }
    } catch (error) {
      console.log('REGISTRATION ERROR ', error);
      toast.error('An error occured during the registration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.username && actor) {
      getUserDataAndSet();
    }
  }, [actor]);

  return { isLoading, saveUserData };
};
