'use client';

import dynamic from 'next/dynamic';
import { AuthButtonSkeleton } from './Skeleton';

const AuthDialog = dynamic(
  () => import('./AuthDialog').then(module => module.AuthDialog),
  {
    loading: () => <AuthButtonSkeleton />,
    ssr: false,
  },
);

export function LazyAuthDialog(): React.JSX.Element {
  return <AuthDialog />;
}
