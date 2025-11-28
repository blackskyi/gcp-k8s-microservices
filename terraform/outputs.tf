output "cluster_name" {
  description = "GKE cluster name"
  value       = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = google_container_cluster.primary.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "GKE cluster CA certificate"
  value       = google_container_cluster.primary.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

output "region" {
  description = "GCP region"
  value       = var.region
}

output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

output "network_name" {
  description = "VPC network name"
  value       = google_compute_network.vpc.name
}

output "subnet_name" {
  description = "Subnet name"
  value       = google_compute_subnetwork.subnet.name
}

output "kubernetes_cluster_host" {
  description = "GKE Cluster Host"
  value       = google_container_cluster.primary.endpoint
  sensitive   = true
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --region ${var.region} --project ${var.project_id}"
}

output "node_service_account" {
  description = "Service account used by GKE nodes"
  value       = google_service_account.gke_nodes.email
}
