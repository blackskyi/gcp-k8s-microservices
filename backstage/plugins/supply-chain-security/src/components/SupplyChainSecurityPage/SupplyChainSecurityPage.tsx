import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Page,
  Header,
  Content,
  InfoCard,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { AttestationCard } from '../AttestationCard';
import { KyvernoReportCard } from '../KyvernoReportCard';
import { TrivyScanCard } from '../TrivyScanCard';

export const SupplyChainSecurityPage = () => {
  const { entity } = useEntity();

  return (
    <Page themeId="tool">
      <Header
        title="Supply Chain Security"
        subtitle={`Security overview for ${entity.metadata.name}`}
      />
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <AttestationCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <TrivyScanCard />
          </Grid>
          <Grid item xs={12}>
            <KyvernoReportCard />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
