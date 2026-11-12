import { authStorage } from '@/services/authService';

/** The signed-in user of this tab (see authStorage for which storage that is). */
export function getCurrentUser() {
  return authStorage.getAuthData().user;
}
