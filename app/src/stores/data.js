/**
 * Entrypoint of all app stores
 *
 */

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

import log from 'utils/logging';

import { createNewStore } from './dataGeneric';

// -----------------------------------------------------------------------------
// Code
// -----------------------------------------------------------------------------

export const getApiUrl = strings => {
  const urlsWithoutApi = strings.map(string => string.replace(/^\/api/, ''));
  if (process.env.NODE_ENV === 'development') {
    return `http://lvh.me:3004${urlsWithoutApi}`;
  }
  return `https://api.bitlum.io${urlsWithoutApi}`;
};

export const accounts = {
  authenticate: createNewStore({
    name: 'AccountsAuthenticate',
    data: (() => {
      try {
        return JSON.parse(localStorage.getItem('authData'));
      } catch (error) {
        log.error(`Unable to read auth data from local storage (${error.message})`);
        return undefined;
      }
    })(),
    fetchOptions: {
      url: getApiUrl`/api/accounts/auth`,
      method: 'POST',
    },
    updateData(data) {
      try {
        localStorage.setItem('authData', JSON.stringify(data));
      } catch (error) {
        log.error(`Unable to save auth data to local storage (${error.message})`);
      }
      if (!this.data || !data) {
        this.data = data;
      } else {
        Object.assign(this.data, data);
      }
      accounts.get.updateData(data);
    },
    async run(email, password) {
      this.startFetching({ body: { email, password } });
    },
    signout() {
      this.updateData(undefined);
      Object.keys(payments).forEach(method => {
        payments[method].cleanup();
      });
    },
    get isAuthenticated() {
      return !!(this.data && this.data.token);
    },
  }),
  signup: createNewStore({
    name: 'AccountsSignup',
    fetchOptions: {
      url: getApiUrl`/api/accounts`,
      method: 'POST',
    },
    updateData(data) {
      try {
        localStorage.setItem('authData', JSON.stringify(data));
      } catch (error) {
        log.error(`Unable to save auth data to local storage (${error.message})`);
      }
      if (!this.data || !data) {
        this.data = data;
      } else {
        Object.assign(this.data, data);
      }
      accounts.authenticate.updateData(data);
      accounts.get.updateData(data);
    },
    async run(email, password) {
      const referral = localStorage.getItem('referral') || email;
      this.startFetching({ body: { email, password, referral } });
    },
  }),
  get: createNewStore({
    name: 'AccountsAuthenticate',
    data: (() => {
      try {
        return JSON.parse(localStorage.getItem('authData'));
      } catch (error) {
        log.error(`Unable to read auth data from local storage (${error.message})`);
        return undefined;
      }
    })(),
    fetchOptions: {
      url: getApiUrl`/api/accounts`,
    },
    async run() {
      const result = await this.startFetching({
        headers: {
          Authorization: `Bearer ${accounts.authenticate.data && accounts.authenticate.data.token}`,
        },
      });
      if (result.error && result.error.code.match('^401.*$')) {
        accounts.authenticate.signout();
      }
    },
  }),
};

export const payments = {
  get: createNewStore({
    name: 'PaymentsGet',
    async run() {
      const result = await this.startFetching({
        headers: {
          Authorization: `Bearer ${accounts.authenticate.data && accounts.authenticate.data.token}`,
        },
      });
      if (result.error && result.error.code.match('^401.*$')) {
        accounts.authenticate.signout();
      }
    },
    fetchOptions: {
      url: getApiUrl`/api/payments`,
    },
  }),
  send: createNewStore({
    name: 'PaymentsSend',
    async run(to, amount, asset) {
      const result = await this.startFetching({
        headers: {
          Authorization: `Bearer ${accounts.authenticate.data && accounts.authenticate.data.token}`,
        },
        body: { to, amount, asset },
      });
      if (result.error && result.error.code.match('^401.*$')) {
        accounts.authenticate.signout();
      }
    },
    fetchOptions: {
      url: getApiUrl`/api/payments/send`,
      method: 'POST',
    },
  }),
  receive: createNewStore({
    name: 'PaymentsReceive',
    async run(type, amount, asset) {
      const result = await this.startFetching({
        headers: {
          Authorization: `Bearer ${accounts.authenticate.data && accounts.authenticate.data.token}`,
        },
        body: { type, amount, asset },
      });
      if (result.error && result.error.code.match('^401.*$')) {
        accounts.authenticate.signout();
      }
    },
    fetchOptions: {
      url: getApiUrl`/api/payments/receive`,
      method: 'POST',
    },
  }),
};

export const wallets = {
  getDetails: createNewStore({
    name: 'WalletsGetDetails',
    async run(wuid, asset) {
      this.startFetching({
        url: `${this.fetchOptions.url}?asset=${asset}&wuid=${wuid}`,
        headers: {
          Authorization: `Bearer ${accounts.authenticate.data && accounts.authenticate.data.token}`,
        },
      });
    },
    fetchOptions: {
      url: getApiUrl`/api/wallets/details`,
    },
  }),
};

export default { payments, accounts, wallets };
