import { AbilityProvider} from '@casl/react';
import { defineAbilityFor } from './ability';
import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';
export  function AppAbilityProvider({
  ability,
  children,
}) {
  return (
    <AbilityProvider value={ability}>
      {children}
    </AbilityProvider>
  );
}
const AbilityContext = ({children }) => {
    const { user } = useAuth();
  const ability = useMemo(() => defineAbilityFor(user), [user]);
  return (
    <AppAbilityProvider ability={ability}>
      {children}
    </AppAbilityProvider>
  );
};
export default AbilityContext;