terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.18"
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
