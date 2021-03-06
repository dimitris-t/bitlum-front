/**
 * Send scene
 *
 */

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

import React from 'react';

import logger from 'utils/logging';

import { Root, Header, BackButton, P, CheckDestination, Support } from './styles';

const log = logger();

// -----------------------------------------------------------------------------
// Code
// -----------------------------------------------------------------------------

const Send = ({ wallets, wallet, accounts }) => {
  return (
    <Root>
      <Header>
        <BackButton />
        <P>Pay</P>
        <Support className="openIntercom" />
      </Header>
      <CheckDestination wallets={wallets} wallet={wallet} accounts={accounts} />
    </Root>
  );
};

export default Send;
