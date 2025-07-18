#!/usr/bin/env python3
"""
Simple test to verify CloudSentinel module imports correctly.
"""

def test_imports():
    """Test that all CloudSentinel components can be imported."""
    try:
        # Test importing from main package
        from echoforge import CloudSentinel, ensure_cloud_environment
        print("✓ Successfully imported CloudSentinel and ensure_cloud_environment from echoforge")
        
        # Test importing from agents package
        from echoforge.agents import CloudSentinel as CloudSentinelAgent
        from echoforge.agents import create_cloud_sentinel
        print("✓ Successfully imported CloudSentinel and create_cloud_sentinel from echoforge.agents")
        
        # Test importing directly from module
        from echoforge.agents.cloud_sentinel import CloudSentinel as DirectCloudSentinel
        from echoforge.agents.cloud_sentinel import CloudSentinelError
        print("✓ Successfully imported CloudSentinel and CloudSentinelError from cloud_sentinel module")
        
        # Test creating instance (without actual GCP credentials)
        try:
            sentinel = CloudSentinel(project_id="test-project")
            print("✓ Successfully created CloudSentinel instance")
        except Exception as e:
            print(f"! Warning: Could not create CloudSentinel instance (expected without GCP libraries): {e}")
        
        print("\n✓ All imports successful!")
        return True
        
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_imports()
