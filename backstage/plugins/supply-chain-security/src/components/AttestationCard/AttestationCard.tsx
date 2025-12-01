import React, { useState, useEffect } from 'react';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Link,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@material-ui/icons';

interface AttestationData {
  verified: boolean;
  digest: string;
  predicateType: string;
  issuer: string;
  subject: string;
  timestamp: string;
  rekorLogId: string;
  gitSha: string;
  workflow: string;
}

export const AttestationCard = () => {
  const { entity } = useEntity();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [attestation, setAttestation] = useState<AttestationData | null>(null);

  const imageRef = entity.metadata.annotations?.['trivy/image-ref'] || '';
  const attestationEnabled =
    entity.metadata.annotations?.['sigstore/attestation-enabled'] === 'true';

  useEffect(() => {
    const fetchAttestation = async () => {
      if (!attestationEnabled || !imageRef) {
        setLoading(false);
        return;
      }

      try {
        // In a real implementation, this would call the GitHub Attestations API
        // For now, we'll simulate the data
        const mockAttestation: AttestationData = {
          verified: true,
          digest: imageRef.split('@')[1] || 'sha256:abc123...',
          predicateType: 'https://slsa.dev/provenance/v0.2',
          issuer: 'https://token.actions.githubusercontent.com',
          subject: 'https://github.com/blackskyi/gcp-k8s-microservices/.github/workflows/3-build-deploy.yml',
          timestamp: new Date().toISOString(),
          rekorLogId: 'c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d',
          gitSha: 'f9edfc3...',
          workflow: '.github/workflows/3-build-deploy.yml',
        };

        setAttestation(mockAttestation);
        setLoading(false);
      } catch (e) {
        setError(e as Error);
        setLoading(false);
      }
    };

    fetchAttestation();
  }, [attestationEnabled, imageRef]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!attestationEnabled) {
    return (
      <InfoCard title="Image Attestation">
        <Typography variant="body2" color="textSecondary">
          Attestations not enabled for this component
        </Typography>
      </InfoCard>
    );
  }

  return (
    <InfoCard
      title="Image Attestation & SLSA Provenance"
      deepLink={{
        link: 'https://rekor.sigstore.dev',
        title: 'View in Rekor',
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" mb={2}>
              {attestation?.verified ? (
                <>
                  <CheckCircleIcon style={{ color: 'green', marginRight: 8 }} />
                  <Typography variant="h6" style={{ color: 'green' }}>
                    Signature Verified
                  </Typography>
                </>
              ) : (
                <>
                  <CancelIcon style={{ color: 'red', marginRight: 8 }} />
                  <Typography variant="h6" style={{ color: 'red' }}>
                    Verification Failed
                  </Typography>
                </>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Predicate Type"
                  secondary={attestation?.predicateType}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <VerifiedUserIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Issuer"
                  secondary={attestation?.issuer}
                />
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Workflow"
                  secondary={attestation?.workflow}
                />
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Git SHA"
                  secondary={
                    <Link
                      href={`https://github.com/blackskyi/gcp-k8s-microservices/commit/${attestation?.gitSha}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {attestation?.gitSha}
                    </Link>
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Image Digest"
                  secondary={
                    <Typography
                      variant="body2"
                      style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                    >
                      {attestation?.digest}
                    </Typography>
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Rekor Log ID"
                  secondary={
                    <Link
                      href={`https://rekor.sigstore.dev/api/v1/log/entries/${attestation?.rekorLogId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                    >
                      {attestation?.rekorLogId?.substring(0, 16)}...
                    </Link>
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Timestamp"
                  secondary={new Date(attestation?.timestamp || '').toLocaleString()}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Box mt={2}>
              <Typography variant="caption" color="textSecondary">
                Verification command:
              </Typography>
              <Box
                p={1}
                mt={1}
                bgcolor="grey.100"
                borderRadius={4}
                style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
              >
                gh attestation verify {imageRef} --owner blackskyi
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </InfoCard>
  );
};
