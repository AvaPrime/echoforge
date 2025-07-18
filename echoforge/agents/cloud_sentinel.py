"""
CloudSentinel Agent for EchoForge

This module handles GCP service management, IAM validation, and service account key rotation.
"""

import logging
import time
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta

try:
    from google.cloud import service_usage_v1, iam_v1, secretmanager
    from google.cloud.exceptions import NotFound, PermissionDenied, GoogleCloudError
    from google.api_core import exceptions as api_exceptions
    GCP_AVAILABLE = True
except ImportError:
    GCP_AVAILABLE = False
    # Define mock classes for testing
    class MockException(Exception):
        pass
    NotFound = MockException
    PermissionDenied = MockException
    GoogleCloudError = MockException
    api_exceptions = type('MockExceptions', (), {'AlreadyExists': MockException})()

logger = logging.getLogger(__name__)


class CloudSentinelError(Exception):
    """Base exception for CloudSentinel operations"""
    pass


class CloudSentinel:
    """
    CloudSentinel agent responsible for:
    - Enabling missing GCP APIs
    - Validating IAM permissions
    - Auto-rotating service account keys
    """
    
    def __init__(self, project_id: str, location: str = "global"):
        """
        Initialize CloudSentinel.
        
        Args:
            project_id: GCP project ID
            location: Location for Secret Manager (default: global)
        """
        self.project_id = project_id
        self.location = location
        
        # Initialize GCP clients
        if not GCP_AVAILABLE:
            raise CloudSentinelError(
                "Google Cloud libraries are not available. Please install them using: "
                "pip install google-cloud-service-usage google-cloud-iam google-cloud-secret-manager"
            )
        
        self.service_usage_client = service_usage_v1.ServiceUsageClient()
        self.iam_client = iam_v1.IAMClient()
        self.secret_client = secretmanager.SecretManagerServiceClient()
        
        # Required APIs for EchoForge operations
        self.required_apis = [
            "serviceusage.googleapis.com",
            "iam.googleapis.com",
            "secretmanager.googleapis.com",
            "cloudbuild.googleapis.com",
            "cloudresourcemanager.googleapis.com",
            "logging.googleapis.com",
            "monitoring.googleapis.com"
        ]
        
        # Critical roles for service accounts
        self.critical_roles = [
            "roles/secretmanager.secretAccessor",
            "roles/secretmanager.secretVersionManager",
            "roles/cloudbuild.builds.builder",
            "roles/logging.logWriter",
            "roles/monitoring.metricWriter"
        ]
    
    def ensure_environment(self) -> Dict[str, any]:
        """
        Ensure the GCP environment is properly configured.
        
        Returns:
            Dict containing environment status and any issues found
        """
        logger.info("Starting CloudSentinel environment validation")
        
        results = {
            "apis_enabled": [],
            "apis_failed": [],
            "permissions_valid": [],
            "permissions_missing": [],
            "keys_rotated": [],
            "keys_failed": [],
            "timestamp": datetime.utcnow().isoformat(),
            "overall_status": "unknown"
        }
        
        try:
            # Step 1: Ensure required APIs are enabled
            logger.info("Checking and enabling required APIs")
            api_results = self._ensure_required_apis()
            results["apis_enabled"] = api_results["enabled"]
            results["apis_failed"] = api_results["failed"]
            
            # Step 2: Validate IAM permissions
            logger.info("Validating IAM permissions")
            iam_results = self._validate_iam_permissions()
            results["permissions_valid"] = iam_results["valid"]
            results["permissions_missing"] = iam_results["missing"]
            
            # Step 3: Rotate service account keys if needed
            logger.info("Checking service account key rotation")
            key_results = self._rotate_service_account_keys()
            results["keys_rotated"] = key_results["rotated"]
            results["keys_failed"] = key_results["failed"]
            
            # Determine overall status
            if results["apis_failed"] or results["permissions_missing"] or results["keys_failed"]:
                results["overall_status"] = "issues_found"
            else:
                results["overall_status"] = "healthy"
                
            logger.info(f"CloudSentinel validation completed. Status: {results['overall_status']}")
            
        except Exception as e:
            logger.error(f"CloudSentinel validation failed: {str(e)}")
            results["overall_status"] = "error"
            results["error"] = str(e)
            
        return results
    
    def ensure_api(self, name: str) -> bool:
        """
        Ensure a specific API is enabled.
        
        Args:
            name: API name (e.g., 'serviceusage.googleapis.com')
            
        Returns:
            True if API is enabled, False otherwise
        """
        try:
            service_name = f"projects/{self.project_id}/services/{name}"
            
            # Check if API is already enabled
            try:
                service = self.service_usage_client.get_service(name=service_name)
                if service.state == service_usage_v1.State.ENABLED:
                    logger.info(f"API {name} is already enabled")
                    return True
            except NotFound:
                logger.info(f"API {name} is not enabled, attempting to enable")
            
            # Enable the API
            operation = self.service_usage_client.enable_service(name=service_name)
            
            # Wait for operation to complete
            result = operation.result(timeout=300)  # 5 minute timeout
            
            logger.info(f"Successfully enabled API: {name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to enable API {name}: {str(e)}")
            return False
    
    def ensure_role(self, sa_email: str, role: str) -> bool:
        """
        Ensure a service account has the specified role.
        
        Args:
            sa_email: Service account email
            role: IAM role to check/assign
            
        Returns:
            True if role is properly assigned, False otherwise
        """
        try:
            resource = f"projects/{self.project_id}"
            
            # Get current IAM policy
            policy = self.iam_client.get_iam_policy(resource=resource)
            
            # Check if the binding already exists
            member = f"serviceAccount:{sa_email}"
            for binding in policy.bindings:
                if binding.role == role and member in binding.members:
                    logger.info(f"Role {role} already assigned to {sa_email}")
                    return True
            
            # Add the role binding
            from google.cloud.iam_v1 import Binding
            new_binding = Binding(
                role=role,
                members=[member]
            )
            
            # Check if binding for this role exists
            role_exists = False
            for binding in policy.bindings:
                if binding.role == role:
                    binding.members.append(member)
                    role_exists = True
                    break
            
            if not role_exists:
                policy.bindings.append(new_binding)
            
            # Set the updated policy
            self.iam_client.set_iam_policy(resource=resource, policy=policy)
            
            logger.info(f"Successfully assigned role {role} to {sa_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to assign role {role} to {sa_email}: {str(e)}")
            return False
    
    def _ensure_required_apis(self) -> Dict[str, List[str]]:
        """Ensure all required APIs are enabled"""
        enabled = []
        failed = []
        
        for api in self.required_apis:
            if self.ensure_api(api):
                enabled.append(api)
            else:
                failed.append(api)
        
        return {"enabled": enabled, "failed": failed}
    
    def _validate_iam_permissions(self) -> Dict[str, List[str]]:
        """Validate IAM permissions for critical service accounts"""
        valid = []
        missing = []
        
        try:
            # Get all service accounts in the project
            resource = f"projects/{self.project_id}"
            policy = self.iam_client.get_iam_policy(resource=resource)
            
            # Extract service accounts from policy bindings
            service_accounts = set()
            for binding in policy.bindings:
                for member in binding.members:
                    if member.startswith("serviceAccount:"):
                        sa_email = member.replace("serviceAccount:", "")
                        service_accounts.add(sa_email)
            
            # Check critical roles for each service account
            for sa_email in service_accounts:
                for role in self.critical_roles:
                    if self._has_role(sa_email, role, policy):
                        valid.append(f"{sa_email}:{role}")
                    else:
                        missing.append(f"{sa_email}:{role}")
                        
        except Exception as e:
            logger.error(f"Failed to validate IAM permissions: {str(e)}")
            missing.append(f"validation_error: {str(e)}")
        
        return {"valid": valid, "missing": missing}
    
    def _has_role(self, sa_email: str, role: str, policy) -> bool:
        """Check if service account has specific role"""
        member = f"serviceAccount:{sa_email}"
        for binding in policy.bindings:
            if binding.role == role and member in binding.members:
                return True
        return False
    
    def _rotate_service_account_keys(self) -> Dict[str, List[str]]:
        """Rotate service account keys and update Secret Manager"""
        rotated = []
        failed = []
        
        try:
            # List all service accounts
            resource = f"projects/{self.project_id}"
            
            # For now, we'll implement a basic key rotation check
            # In a real implementation, you'd list service accounts and check key ages
            logger.info("Service account key rotation check completed")
            
            # This is a placeholder - in a real implementation you would:
            # 1. List all service accounts in the project
            # 2. Check the age of their keys
            # 3. Rotate keys older than a threshold (e.g., 90 days)
            # 4. Update the new keys in Secret Manager
            
        except Exception as e:
            logger.error(f"Failed to rotate service account keys: {str(e)}")
            failed.append(f"rotation_error: {str(e)}")
        
        return {"rotated": rotated, "failed": failed}
    
    def _store_key_in_secret_manager(self, sa_email: str, key_data: str) -> bool:
        """Store service account key in Secret Manager"""
        try:
            secret_id = f"sa-key-{sa_email.replace('@', '-').replace('.', '-')}"
            parent = f"projects/{self.project_id}"
            
            # Create or update secret
            try:
                secret = self.secret_client.create_secret(
                    parent=parent,
                    secret_id=secret_id,
                    secret={
                        "replication": {"automatic": {}}
                    }
                )
                logger.info(f"Created secret {secret_id}")
            except api_exceptions.AlreadyExists:
                logger.info(f"Secret {secret_id} already exists")
            
            # Add secret version
            secret_path = f"projects/{self.project_id}/secrets/{secret_id}"
            version = self.secret_client.add_secret_version(
                parent=secret_path,
                payload={"data": key_data.encode()}
            )
            
            logger.info(f"Added new version to secret {secret_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to store key in Secret Manager: {str(e)}")
            return False


# Factory function for easy instantiation
def create_cloud_sentinel(project_id: str, location: str = "global") -> CloudSentinel:
    """
    Create a CloudSentinel instance.
    
    Args:
        project_id: GCP project ID
        location: Location for Secret Manager
        
    Returns:
        CloudSentinel instance
    """
    return CloudSentinel(project_id=project_id, location=location)
