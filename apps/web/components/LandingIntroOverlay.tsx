'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const INTRO_STORAGE_KEY = 'pridicta-web-intro-seen';

export function LandingIntroOverlay(): React.JSX.Element | null {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(INTRO_STORAGE_KEY);

      if (!seen) {
        window.localStorage.setItem(INTRO_STORAGE_KEY, 'true');
        setVisible(true);
      }
    } catch {
      setVisible(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const timer = window.setTimeout(
      () => setVisible(false),
      reduceMotion ? 420 : 2200,
    );

    return () => window.clearTimeout(timer);
  }, [reduceMotion, visible]);

  if (!ready) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          aria-label="Predicta introduction"
          className="intro-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 1 }}
          role="dialog"
          transition={{ duration: reduceMotion ? 0.18 : 0.55, ease: 'easeOut' }}
        >
          <motion.div
            className="intro-logo-wrap"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.24, y: 18 }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              alt="Predicta"
              className="intro-logo"
              height={260}
              priority
              src="/predicta-logo.png"
              width={260}
            />
            <motion.p
              className="intro-tagline"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.55, duration: 0.7 }}
            >
              Ancient insight, beautifully revealed
            </motion.p>
          </motion.div>
          <button
            className="intro-skip"
            onClick={() => setVisible(false)}
            type="button"
          >
            Skip
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
