/**
 * Receive scene
 *
 */

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

import React from 'react';

import { Root, Header, SelectReceiveAsset, P, BackButton, Support, Message } from './styles';

// -----------------------------------------------------------------------------
// Code
// -----------------------------------------------------------------------------

const Receive = ({ payments, t }) => (
  <Root loading={payments.receive.loading}>
    <Header>
      <BackButton />
      <P>Receive</P>
      <Support className="openIntercom" />
    </Header>
    {payments.receive.error ? (
      <Message type="error">{t([`errors.${payments.receive.error.code}`, 'errors.default'])}</Message>
    ) : null}
    <SelectReceiveAsset disabled={payments.receive.error} />
  </Root>
);

export default Receive;
