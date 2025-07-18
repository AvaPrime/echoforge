#!/usr/bin/env python3
"""
Example script demonstrating CloudSentinel usage.

This script shows how other agents can invoke CloudSentinel to ensure
their GCP environment is properly configured.
"""

import sys
import os
import logging

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from echoforge import CloudSentinel, ensure_cloud_environment

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def main():
    """Main function demonstrating CloudSentinel usage."""
    
    # Example 1: Direct usage
    print("=== CloudSentinel Direct Usage ===")
    project_id = "your-gcp-project-id"  # Replace with actual project ID
    
    try:
        # Create CloudSentinel instance
        sentinel = CloudSentinel(project_id=project_id)
        
        # Ensure specific API is enabled
        api_enabled = sentinel.ensure_api("serviceusage.googleapis.com")
        print(f"Service Usage API enabled: {api_enabled}")
        
        # Ensure specific IAM role for service account
        sa_email = "your-service-account@your-project.iam.gserviceaccount.com"
        role_assigned = sentinel.ensure_role(sa_email, "roles/secretmanager.secretAccessor")
        print(f"Secret Manager role assigned: {role_assigned}")
        
        # Full environment validation
        results = sentinel.ensure_environment()
        print(f"Environment validation results: {results}")
        
    except Exception as e:
        print(f"Error with direct usage: {e}")
    
    # Example 2: Using convenience function (recommended for other agents)
    print("\n=== CloudSentinel Convenience Function Usage ===")
    
    try:
        # This is how other agents should call CloudSentinel
        results = ensure_cloud_environment(project_id=project_id)
        print(f"Environment status: {results['overall_status']}")
        print(f"APIs enabled: {len(results['apis_enabled'])}")
        print(f"APIs failed: {len(results['apis_failed'])}")
        print(f"Permissions valid: {len(results['permissions_valid'])}")
        print(f"Permissions missing: {len(results['permissions_missing'])}")
        
    except Exception as e:
        print(f"Error with convenience function: {e}")

if __name__ == "__main__":
    main()
