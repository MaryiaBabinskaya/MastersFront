import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { s } from './CurtainTransition.styles';
import {
  ReactNode,
  useState,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useAuth } from '@/hooks/use-auth';

const VELVET_TEXTURE = {
  background: '#5d0016',
  backgroundImage:
    'repeating-linear-gradient(90deg, #5d0016 0%, #800020 5%, #5d0016 10%)',
  boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
};

const CURTAIN_ENABLED_KEY = 'curtain-enabled';

interface CurtainContextType {
  navigateWithCurtain: (to: string) => void;
  curtainEnabled: boolean;
  toggleCurtain: () => void;
}

const CurtainContext = createContext<CurtainContextType | null>(null);

export const useCurtainNavigation = () => {
  const ctx = useContext(CurtainContext);
  if (!ctx)
    throw new Error(
      'useCurtainNavigation must be used inside CurtainTransition',
    );
  return ctx;
};

export function CurtainTransition({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  const [isClosed, setIsClosed] = useState(false);
  const { user } = useAuth();

  const storageKey = useMemo(
    () =>
      user
        ? `${CURTAIN_ENABLED_KEY}-${user.id}`
        : `${CURTAIN_ENABLED_KEY}-guest`,
    [user],
  );

  const [curtainEnabled, setCurtainEnabled] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored === null ? true : stored === 'true';
  });

  // When user logs in/out, storageKey changes — read the stored preference for the new key
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    setCurtainEnabled(stored === null ? true : stored === 'true');
  }, [storageKey]);

  // Sync to localStorage whenever curtainEnabled changes
  useEffect(() => {
    localStorage.setItem(storageKey, String(curtainEnabled));
  }, [curtainEnabled, storageKey]);

  const toggleCurtain = () => setCurtainEnabled((prev) => !prev);

  const navigateWithCurtain = (to: string) => {
    if (isClosed) return;

    if (!curtainEnabled) {
      setLocation(to);
      return;
    }

    setIsClosed(true);
    setTimeout(() => {
      setLocation(to);
      setTimeout(() => setIsClosed(false), 100);
    }, 1500);
  };

  const contextValue = useMemo(
    () => ({ navigateWithCurtain, curtainEnabled, toggleCurtain }),
    [curtainEnabled],
  );

  return (
    <CurtainContext.Provider value={contextValue}>
      <div className={s.container}>
        {children}

        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: isClosed ? '0%' : '-100%' }}
          transition={{ duration: 1.5, ease: [0.45, 0, 0.55, 1] }}
          style={VELVET_TEXTURE}
          className={s.leftCurtain}
        >
          <div className={s.leftEdge} />
        </motion.div>

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: isClosed ? '0%' : '100%' }}
          transition={{ duration: 1.5, ease: [0.45, 0, 0.55, 1] }}
          style={VELVET_TEXTURE}
          className={s.rightCurtain}
        >
          <div className={s.rightEdge} />
        </motion.div>
      </div>
    </CurtainContext.Provider>
  );
}
