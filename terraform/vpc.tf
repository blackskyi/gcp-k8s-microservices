# VPC Network
resource "google_compute_network" "vpc" {
  name                    = var.network_name
  auto_create_subnetworks = false
  description             = "VPC network for GKE cluster"
}

# Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = var.subnet_name
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc.id
  description   = "Subnet for GKE nodes"

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = var.pods_cidr
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = var.services_cidr
  }

  private_ip_google_access = true
}

# Cloud Router for NAT
resource "google_compute_router" "router" {
  name    = "${var.cluster_name}-router"
  region  = var.region
  network = google_compute_network.vpc.id
}

# NAT Gateway for private nodes to access internet
resource "google_compute_router_nat" "nat" {
  name                               = "${var.cluster_name}-nat"
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Firewall rule to allow internal communication
resource "google_compute_firewall" "allow_internal" {
  name    = "${var.cluster_name}-allow-internal"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = [
    var.subnet_cidr,
    var.pods_cidr,
    var.services_cidr,
  ]
}

# Firewall rule to allow health checks
resource "google_compute_firewall" "allow_health_check" {
  name    = "${var.cluster_name}-allow-health-check"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
  }

  source_ranges = [
    "130.211.0.0/22",
    "35.191.0.0/16",
  ]
}
