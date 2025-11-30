import React, { useState, useEffect } from 'react';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  CardContent,
  Chip,
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@material-ui/icons';

interface PolicyResult {
  policy: string;
  rule: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  message: string;
  category: string;
}

interface KyvernoReport {
  summary: {
    pass: number;
    fail: number;
    warn: number;
    skip: number;
  };
  results: PolicyResult[];
}

export const KyvernoReportCard = () => {
  const { entity } = useEntity();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [report, setReport] = useState<KyvernoReport | null>(null);

  const policyEnforced =
    entity.metadata.annotations?.['kyverno/policy-enforced'] === 'true';
  const namespace =
    entity.metadata.annotations?.['backstage.io/kubernetes-namespace'] || 'microservices';

  useEffect(() => {
    const fetchReport = async () => {
      if (!policyEnforced) {
        setLoading(false);
        return;
      }

      try {
        // Mock Kyverno policy report data
        const mockReport: KyvernoReport = {
          summary: {
            pass: 5,
            fail: 0,
            warn: 0,
            skip: 0,
          },
          results: [
            {
              policy: 'verify-signed-images',
              rule: 'verify-slsa-provenance',
              status: 'pass',
              message: 'Image signature verified with SLSA provenance',
              category: 'Security',
            },
            {
              policy: 'security-best-practices',
              rule: 'require-non-root',
              status: 'pass',
              message: 'Container runs as non-root user',
              category: 'Security',
            },
            {
              policy: 'security-best-practices',
              rule: 'restrict-registries',
              status: 'pass',
              message: 'Image from allowed registry',
              category: 'Security',
            },
            {
              policy: 'security-best-practices',
              rule: 'require-resource-limits',
              status: 'pass',
              message: 'CPU and memory limits configured',
              category: 'Best Practice',
            },
            {
              policy: 'block-latest-tag',
              rule: 'block-latest',
              status: 'pass',
              message: 'Using specific image tag (not :latest)',
              category: 'Best Practice',
            },
          ],
        };

        setReport(mockReport);
        setLoading(false);
      } catch (e) {
        setError(e as Error);
        setLoading(false);
      }
    };

    fetchReport();
  }, [policyEnforced, namespace]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!policyEnforced) {
    return (
      <InfoCard title="Kyverno Policy Report">
        <Typography variant="body2" color="textSecondary">
          Policy enforcement not enabled for this component
        </Typography>
      </InfoCard>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircleIcon style={{ color: 'green' }} />;
      case 'fail':
        return <ErrorIcon style={{ color: 'red' }} />;
      case 'warn':
        return <WarningIcon style={{ color: 'orange' }} />;
      default:
        return null;
    }
  };

  const getStatusChip = (status: string) => {
    const colors: Record<string, any> = {
      pass: { background: '#4caf50', color: 'white' },
      fail: { background: '#f44336', color: 'white' },
      warn: { background: '#ff9800', color: 'white' },
      skip: { background: '#9e9e9e', color: 'white' },
    };

    return (
      <Chip
        label={status.toUpperCase()}
        size="small"
        style={colors[status]}
      />
    );
  };

  return (
    <InfoCard title="Kyverno Policy Report">
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" gap={2} mb={3}>
              <Box textAlign="center">
                <Typography variant="h3" style={{ color: 'green' }}>
                  {report?.summary.pass || 0}
                </Typography>
                <Typography variant="caption">PASS</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" style={{ color: 'red' }}>
                  {report?.summary.fail || 0}
                </Typography>
                <Typography variant="caption">FAIL</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" style={{ color: 'orange' }}>
                  {report?.summary.warn || 0}
                </Typography>
                <Typography variant="caption">WARN</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" style={{ color: 'gray' }}>
                  {report?.summary.skip || 0}
                </Typography>
                <Typography variant="caption">SKIP</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Policy</TableCell>
                    <TableCell>Rule</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report?.results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getStatusIcon(result.status)}
                          {getStatusChip(result.status)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ fontWeight: 500 }}>
                          {result.policy}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{result.rule}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={result.category} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {result.message}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Box mt={2}>
              <Typography variant="caption" color="textSecondary">
                Policies enforced: verify-signed-images, security-best-practices, block-latest-tag
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </InfoCard>
  );
};
