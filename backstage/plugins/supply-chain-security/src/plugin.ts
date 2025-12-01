import {
  createPlugin,
  createRoutableExtension,
  createComponentExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const supplyChainSecurityPlugin = createPlugin({
  id: 'supply-chain-security',
  routes: {
    root: rootRouteRef,
  },
});

export const SupplyChainSecurityPage = supplyChainSecurityPlugin.provide(
  createRoutableExtension({
    name: 'SupplyChainSecurityPage',
    component: () =>
      import('./components/SupplyChainSecurityPage').then(m => m.SupplyChainSecurityPage),
    mountPoint: rootRouteRef,
  }),
);

export const AttestationCard = supplyChainSecurityPlugin.provide(
  createComponentExtension({
    name: 'AttestationCard',
    component: {
      lazy: () =>
        import('./components/AttestationCard').then(m => m.AttestationCard),
    },
  }),
);

export const KyvernoReportCard = supplyChainSecurityPlugin.provide(
  createComponentExtension({
    name: 'KyvernoReportCard',
    component: {
      lazy: () =>
        import('./components/KyvernoReportCard').then(m => m.KyvernoReportCard),
    },
  }),
);

export const TrivyScanCard = supplyChainSecurityPlugin.provide(
  createComponentExtension({
    name: 'TrivyScanCard',
    component: {
      lazy: () =>
        import('./components/TrivyScanCard').then(m => m.TrivyScanCard),
    },
  }),
);

export const SLSABadge = supplyChainSecurityPlugin.provide(
  createComponentExtension({
    name: 'SLSABadge',
    component: {
      lazy: () =>
        import('./components/SLSABadge').then(m => m.SLSABadge),
    },
  }),
);
