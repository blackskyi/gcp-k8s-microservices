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
  Link,
} from '@material-ui/core';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@material-ui/icons';

interface VulnerabilitySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  scanTime: string;
  status: 'passed' | 'failed';
}

export const TrivyScanCard = () => {
  const { entity } = useEntity();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [scanResult, setScanResult] = useState<VulnerabilitySummary | null>(null);

  const imageRef = entity.metadata.annotations?.['trivy/image-ref'] || '';
  const projectSlug = entity.metadata.annotations?.['github.com/project-slug'] || '';

  useEffect(() => {
    const fetchScanResults = async () => {
      if (!imageRef) {
        setLoading(false);
        return;
      }

      try {
        // Mock Trivy scan results
        const mockResult: VulnerabilitySummary = {
          critical: 0,
          high: 0,
          medium: 3,
          low: 5,
          scanTime: new Date().toISOString(),
          status: 'passed',
        };

        setScanResult(mockResult);
        setLoading(false);
      } catch (e) {
        setError(e as Error);
        setLoading(false);
      }
    };

    fetchScanResults();
  }, [imageRef]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!imageRef) {
    return (
      <InfoCard title="Trivy Vulnerability Scan">
        <Typography variant="body2" color="textSecondary">
          No image reference configured
        </Typography>
      </InfoCard>
    );
  }

  const getSeverityIcon = (severity: string, count: number) => {
    if (count === 0) return <CheckCircleIcon style={{ color: 'green' }} />;

    switch (severity) {
      case 'CRITICAL':
        return <ErrorIcon style={{ color: '#d32f2f' }} />;
      case 'HIGH':
        return <ErrorIcon style={{ color: '#f44336' }} />;
      case 'MEDIUM':
        return <WarningIcon style={{ color: '#ff9800' }} />;
      case 'LOW':
        return <InfoIcon style={{ color: '#2196f3' }} />;
      default:
        return null;
    }
  };

  const totalVulns =
    (scanResult?.critical || 0) +
    (scanResult?.high || 0) +
    (scanResult?.medium || 0) +
    (scanResult?.low || 0);

  return (
    <InfoCard
      title="Trivy Vulnerability Scan"
      deepLink={{
        link: `https://github.com/${projectSlug}/security/code-scanning`,
        title: 'View in GitHub Security',
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" mb={2}>
              {scanResult?.status === 'passed' ? (
                <>
                  <CheckCircleIcon style={{ color: 'green', marginRight: 8 }} />
                  <Typography variant="h6" style={{ color: 'green' }}>
                    Scan Passed
                  </Typography>
                </>
              ) : (
                <>
                  <ErrorIcon style={{ color: 'red', marginRight: 8 }} />
                  <Typography variant="h6" style={{ color: 'red' }}>
                    Scan Failed
                  </Typography>
                </>
              )}
              <Box ml="auto">
                <Chip
                  label={`${totalVulns} Total`}
                  color={totalVulns === 0 ? 'primary' : 'default'}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box
                  p={2}
                  textAlign="center"
                  border={1}
                  borderColor="grey.300"
                  borderRadius={4}
                  bgcolor={scanResult?.critical === 0 ? '#e8f5e9' : '#ffebee'}
                >
                  <Box display="flex" justifyContent="center" mb={1}>
                    {getSeverityIcon('CRITICAL', scanResult?.critical || 0)}
                  </Box>
                  <Typography variant="h4">{scanResult?.critical || 0}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    CRITICAL
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box
                  p={2}
                  textAlign="center"
                  border={1}
                  borderColor="grey.300"
                  borderRadius={4}
                  bgcolor={scanResult?.high === 0 ? '#e8f5e9' : '#fff3e0'}
                >
                  <Box display="flex" justifyContent="center" mb={1}>
                    {getSeverityIcon('HIGH', scanResult?.high || 0)}
                  </Box>
                  <Typography variant="h4">{scanResult?.high || 0}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    HIGH
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box
                  p={2}
                  textAlign="center"
                  border={1}
                  borderColor="grey.300"
                  borderRadius={4}
                >
                  <Box display="flex" justifyContent="center" mb={1}>
                    {getSeverityIcon('MEDIUM', scanResult?.medium || 0)}
                  </Box>
                  <Typography variant="h4">{scanResult?.medium || 0}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    MEDIUM
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box
                  p={2}
                  textAlign="center"
                  border={1}
                  borderColor="grey.300"
                  borderRadius={4}
                >
                  <Box display="flex" justifyContent="center" mb={1}>
                    {getSeverityIcon('LOW', scanResult?.low || 0)}
                  </Box>
                  <Typography variant="h4">{scanResult?.low || 0}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    LOW
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                Last scanned: {new Date(scanResult?.scanTime || '').toLocaleString()}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                Scans run on every build before image push. Blocks on CRITICAL and HIGH vulnerabilities.
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                ignore-unfixed: true (ignores vulnerabilities with no available fix)
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Link
              href={`https://github.com/${projectSlug}/security/code-scanning`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View detailed scan results in GitHub Security →
            </Link>
          </Grid>
        </Grid>
      </CardContent>
    </InfoCard>
  );
};
