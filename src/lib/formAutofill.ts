/**
 * For fields that hold cloud credentials (storage keys, compute secrets), not
 * the user's sign-in. Without this, browsers see "text field + password field",
 * fill the saved Malumetrix email and password, and saving the form would store
 * that password as a cloud key.
 *
 * Chrome ignores autocomplete="off" on password fields but honours
 * "new-password" (it never fills a saved password there). The data attributes
 * make 1Password, LastPass and Bitwarden skip the field.
 */
export const NOT_A_LOGIN = {
  'data-1p-ignore': true,
  'data-lpignore': 'true',
  'data-bwignore': true,
  'data-form-type': 'other',
} as const;

export const credentialAutoComplete = (secret: boolean) => (secret ? 'new-password' : 'off');
