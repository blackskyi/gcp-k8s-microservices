terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  backend "gcs" {
    bucket = "job-automation-470905-terraform-state"
    prefix = "terraform/gke-microservices"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Get GKE cluster credentials for Kubernetes provider
data "google_client_config" "default" {}

data "google_container_cluster" "primary" {
  name     = google_container_cluster.primary.name
  location = var.region

  depends_on = [google_container_cluster.primary]
}

provider "kubernetes" {
  host                   = "https://${data.google_container_cluster.primary.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(data.google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
}
