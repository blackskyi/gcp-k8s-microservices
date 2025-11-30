import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Chip, Box, Tooltip } from '@material-ui/core';
import { VerifiedUser as VerifiedUserIcon } from '@material-ui/icons';

export const SLSABadge = () => {
  const { entity } = useEntity();

  const slsaLevel =
    entity.spec?.securityMetadata?.slsaLevel ||
    entity.metadata.annotations?.['slsa/level'] ||
    '0';

  const getColor = (level: string) => {
    switch (level) {
      case '3':
      case '4':
        return { background: '#4caf50', color: 'white' };
      case '2':
        return { background: '#2196f3', color: 'white' };
      case '1':
        return { background: '#ff9800', color: 'white' };
      default:
        return { background: '#9e9e9e', color: 'white' };
    }
  };

  const getTooltip = (level: string) => {
    const tooltips: Record<string, string> = {
      '4': 'SLSA Level 4: Highest level - Two-person reviewed',
      '3': 'SLSA Level 3: Hardened builds with provenance',
      '2': 'SLSA Level 2: Hosted build service with provenance',
      '1': 'SLSA Level 1: Provenance exists',
      '0': 'SLSA Level 0: No guarantees',
    };
    return tooltips[level] || 'Unknown SLSA level';
  };

  return (
    <Tooltip title={getTooltip(slsaLevel)}>
      <Box display="inline-flex">
        <Chip
          icon={<VerifiedUserIcon />}
          label={`SLSA L${slsaLevel}`}
          size="small"
          style={getColor(slsaLevel)}
        />
      </Box>
    </Tooltip>
  );
};
