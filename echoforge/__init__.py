"""
EchoForge - Infrastructure Management and Automation Platform

EchoForge provides a comprehensive suite of agents and tools for managing
cloud infrastructure, CI/CD pipelines, and development workflows.
"""

from .agents import CloudSentinel, create_cloud_sentinel

__version__ = "0.1.0"

__all__ = [
    'CloudSentinel',
    'create_cloud_sentinel'
]


# Convenience function for other agents to use
def ensure_cloud_environment(project_id: str, location: str = "global"):
    """
    Convenience function to ensure GCP environment is properly configured.
    
    This function creates a CloudSentinel instance and runs environment validation.
    Other agents can call this function to ensure their GCP dependencies are met.
    
    Args:
        project_id: GCP project ID
        location: Location for Secret Manager (default: global)
        
    Returns:
        Dict containing environment status and any issues found
    """
    sentinel = create_cloud_sentinel(project_id=project_id, location=location)
    return sentinel.ensure_environment()
