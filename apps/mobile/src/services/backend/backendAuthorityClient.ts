import { createBackendAuthorityClient } from '@pridicta/firebase';

import { env } from '../../config/env';
import { getCurrentFirebaseIdToken } from '../firebase/authService';

export function getBackendAuthorityClient() {
  return createBackendAuthorityClient({
    baseUrl: env.backendAuthorityUrl,
    getIdToken: getCurrentFirebaseIdToken,
  });
}
