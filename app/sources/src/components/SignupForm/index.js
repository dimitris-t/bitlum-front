import { observer, inject } from 'mobx-react';
import { withNamespaces } from 'react-i18next';

import view from './view';

export default withNamespaces()(inject('accounts')(observer(view)));
