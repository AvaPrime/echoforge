#!/usr/bin/env python3
"""
Automated Codebase Assessment Controller
Orchestrates MCP agents for comprehensive codebase analysis
"""

import json
import asyncio
from datetime import datetime
from pathlib import Path

class CodebaseAssessmentOrchestrator:
    def __init__(self, mcp_agent_endpoint):
        self.agent = mcp_agent_endpoint
        self.assessment_date = datetime.now().isoformat()
    
    async def run_comprehensive_assessment(self):
        """Run full codebase assessment using MCP agent"""
        
        # Phase 1: Repository Analysis
        repo_analysis = await self.agent.analyze_repository({
            "focus_areas": [
                "architecture_patterns",
                "code_quality",
                "security_vulnerabilities",
                "performance_bottlenecks",
                "technical_debt"
            ],
            "output_format": "structured_json"
        })
        
        # Phase 2: Opportunity Identification
        opportunities = await self.agent.identify_opportunities({
            "analysis_input": repo_analysis,
            "categories": [
                "refactoring_candidates",
                "performance_optimizations",
                "security_improvements",
                "feature_enhancements",
                "developer_experience"
            ]
        })
        
        # Phase 3: Living Documentation Update
        await self.update_living_documentation(repo_analysis, opportunities)
        
        # Phase 4: Generate Action Items
        action_items = await self.generate_action_items(opportunities)
        
        return {
            "assessment_date": self.assessment_date,
            "repository_analysis": repo_analysis,
            "opportunities": opportunities,
            "action_items": action_items
        }
    
    async def update_living_documentation(self, analysis, opportunities):
        """Update living documentation with latest findings"""
        
        # Update system overview
        system_overview = await self.agent.update_system_overview({
            "current_analysis": analysis,
            "previous_version": self.load_previous_overview(),
            "template": "system_overview_template.md"
        })
        
        # Update improvement roadmap
        improvement_roadmap = await self.agent.update_improvement_roadmap({
            "current_analysis": analysis,
            "opportunities": opportunities,
            "previous_version": self.load_previous_roadmap(),
            "template": "improvement_roadmap_template.md"
        })
        
        # Update architecture evolution document
        architecture_evolution = await self.agent.update_architecture_evolution({
            "current_analysis": analysis,
            "previous_version": self.load_previous_architecture_evolution(),
            "template": "architecture_evolution_template.md"
        })
        
        # Save updated documentation
        self.save_documentation({
            "system_overview": system_overview,
            "improvement_roadmap": improvement_roadmap,
            "architecture_evolution": architecture_evolution
        })
        
        return {
            "system_overview": system_overview,
            "improvement_roadmap": improvement_roadmap,
            "architecture_evolution": architecture_evolution
        }
    
    async def generate_action_items(self, opportunities):
        """Generate actionable items from identified opportunities"""
        
        # Generate action items with priorities
        action_items = await self.agent.generate_action_items({
            "opportunities": opportunities,
            "prioritization_criteria": [
                "business_impact",
                "technical_feasibility",
                "effort_estimation",
                "risk_assessment"
            ],
            "output_format": "github_issues"
        })
        
        return action_items
    
    def load_previous_overview(self):
        """Load previous system overview document"""
        overview_path = Path("output/living-docs/system-overview.md")
        if overview_path.exists():
            return overview_path.read_text()
        return None
    
    def load_previous_roadmap(self):
        """Load previous improvement roadmap document"""
        roadmap_path = Path("output/living-docs/improvement-roadmap.md")
        if roadmap_path.exists():
            return roadmap_path.read_text()
        return None
    
    def load_previous_architecture_evolution(self):
        """Load previous architecture evolution document"""
        evolution_path = Path("output/living-docs/architecture-evolution.md")
        if evolution_path.exists():
            return evolution_path.read_text()
        return None
    
    def save_documentation(self, documentation):
        """Save updated documentation to output directory"""
        output_dir = Path("output/living-docs")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save each document
        for doc_name, content in documentation.items():
            file_path = output_dir / f"{doc_name.replace('_', '-')}.md"
            file_path.write_text(content)
        
        # Save assessment metadata
        metadata = {
            "last_updated": self.assessment_date,
            "documents": list(documentation.keys())
        }
        metadata_path = output_dir / "assessment-metadata.json"
        metadata_path.write_text(json.dumps(metadata, indent=2))

# Example usage
async def main():
    # Initialize with MCP agent endpoint
    orchestrator = CodebaseAssessmentOrchestrator("http://localhost:3000/mcp-agent")
    
    # Run comprehensive assessment
    assessment_results = await orchestrator.run_comprehensive_assessment()
    
    # Output summary
    print(f"Assessment completed at {assessment_results['assessment_date']}")
    print(f"Generated {len(assessment_results['action_items'])} action items")

if __name__ == "__main__":
    asyncio.run(main())