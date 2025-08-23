/**
 * Documentation Generator
 *
 * This file implements the documentation generator for the EchoForge
 * Codebase Assessment & Living Documentation System.
 */

const fs = require('fs-extra');
const path = require('path');
const markdownIt = require('markdown-it');

/**
 * Generate living documentation based on assessment results
 * @param {Object} assessment - Assessment results
 * @param {Object} config - System configuration
 * @returns {Promise<Object>} Generated documentation files
 */
async function generateDocumentation(assessment, config) {
  console.log('Generating living documentation...');

  const generatedDocs = {};

  // Generate each configured document type
  for (const [docType, docConfig] of Object.entries(
    config.livingDocumentation.templates
  )) {
    if (docConfig.enabled) {
      try {
        const docContent = await generateDocumentType(
          docType,
          assessment,
          config
        );
        const outputPath = docConfig.outputPath;

        // Ensure output directory exists
        await fs.ensureDir(path.dirname(outputPath));

        // Write document to file
        await fs.writeFile(outputPath, docContent);

        generatedDocs[docType] = {
          path: outputPath,
          size: docContent.length,
          format: getDocumentFormat(outputPath),
        };

        console.log(`Generated ${docType} documentation: ${outputPath}`);
      } catch (error) {
        console.error(`Error generating ${docType} documentation:`, error);
      }
    }
  }

  // Generate documentation index
  await generateDocumentationIndex(generatedDocs, config);

  return generatedDocs;
}

/**
 * Generate a specific document type
 * @param {string} docType - Type of document to generate
 * @param {Object} assessment - Assessment results
 * @param {Object} config - System configuration
 * @returns {Promise<string>} Generated document content
 */
async function generateDocumentType(docType, assessment, config) {
  const docConfig = config.livingDocumentation.templates[docType];
  const templatePath = docConfig.templatePath;

  // Read template file
  const templateContent = await fs.readFile(templatePath, 'utf8');

  // Process template based on format
  const format = getDocumentFormat(templatePath);

  switch (format) {
    case 'markdown':
      return processMarkdownTemplate(templateContent, assessment, config);
    case 'json':
      return processJsonTemplate(templateContent, assessment, config);
    case 'html':
      return processHtmlTemplate(templateContent, assessment, config);
    default:
      return templateContent; // Return unprocessed for unknown formats
  }
}

/**
 * Process a markdown template
 * @param {string} template - Template content
 * @param {Object} assessment - Assessment results
 * @param {Object} config - System configuration
 * @returns {string} Processed markdown content
 */
function processMarkdownTemplate(template, assessment, config) {
  let content = template;

  // Replace date placeholders
  content = content.replace(
    /\[Date\]/g,
    new Date().toISOString().split('T')[0]
  );
  content = content.replace(/\[Version\]/g, config.system.version);

  // Replace assessment data placeholders
  // This is a simplified implementation - a real one would be more sophisticated
  if (assessment.architectureAssessment) {
    content = replaceJsonPlaceholders(
      content,
      'architecture',
      assessment.architectureAssessment
    );
  }

  if (assessment.codeQualityMatrix) {
    content = replaceJsonPlaceholders(
      content,
      'quality',
      assessment.codeQualityMatrix
    );
  }

  if (assessment.securityAssessment) {
    content = replaceJsonPlaceholders(
      content,
      'security',
      assessment.securityAssessment
    );
  }

  if (assessment.performanceAssessment) {
    content = replaceJsonPlaceholders(
      content,
      'performance',
      assessment.performanceAssessment
    );
  }

  if (assessment.opportunities) {
    content = replaceJsonPlaceholders(
      content,
      'opportunities',
      assessment.opportunities
    );
  }

  return content;
}

/**
 * Process a JSON template
 * @param {string} template - Template content
 * @param {Object} assessment - Assessment results
 * @param {Object} config - System configuration
 * @returns {string} Processed JSON content
 */
function processJsonTemplate(template, assessment, config) {
  let templateObj;

  try {
    templateObj = JSON.parse(template);
  } catch (error) {
    console.error('Error parsing JSON template:', error);
    return template;
  }

  // Merge assessment data with template
  const mergedObj = mergeAssessmentData(templateObj, assessment);

  // Add metadata
  mergedObj.metadata = mergedObj.metadata || {};
  mergedObj.metadata.generated_at = new Date().toISOString();
  mergedObj.metadata.version = config.system.version;

  return JSON.stringify(mergedObj, null, 2);
}

/**
 * Process an HTML template
 * @param {string} template - Template content
 * @param {Object} assessment - Assessment results
 * @param {Object} config - System configuration
 * @returns {string} Processed HTML content
 */
function processHtmlTemplate(template, assessment, config) {
  let content = template;

  // Replace date placeholders
  content = content.replace(
    /\{\{date\}\}/g,
    new Date().toISOString().split('T')[0]
  );
  content = content.replace(/\{\{version\}\}/g, config.system.version);

  // Replace assessment data placeholders
  // This is a simplified implementation - a real one would use a proper template engine
  if (assessment.architectureAssessment) {
    content = replaceHtmlPlaceholders(
      content,
      'architecture',
      assessment.architectureAssessment
    );
  }

  if (assessment.codeQualityMatrix) {
    content = replaceHtmlPlaceholders(
      content,
      'quality',
      assessment.codeQualityMatrix
    );
  }

  if (assessment.securityAssessment) {
    content = replaceHtmlPlaceholders(
      content,
      'security',
      assessment.securityAssessment
    );
  }

  if (assessment.performanceAssessment) {
    content = replaceHtmlPlaceholders(
      content,
      'performance',
      assessment.performanceAssessment
    );
  }

  if (assessment.opportunities) {
    content = replaceHtmlPlaceholders(
      content,
      'opportunities',
      assessment.opportunities
    );
  }

  return content;
}

/**
 * Replace JSON placeholders in content
 * @param {string} content - Content with placeholders
 * @param {string} prefix - Placeholder prefix
 * @param {Object} data - Data to replace placeholders with
 * @returns {string} Content with replaced placeholders
 */
function replaceJsonPlaceholders(content, prefix, data) {
  // This is a simplified implementation - a real one would be more sophisticated
  const flattenedData = flattenObject(data, prefix);

  for (const [key, value] of Object.entries(flattenedData)) {
    const placeholder = `[${key}]`;
    content = content.replace(
      new RegExp(escapeRegExp(placeholder), 'g'),
      String(value)
    );
  }

  return content;
}

/**
 * Replace HTML placeholders in content
 * @param {string} content - Content with placeholders
 * @param {string} prefix - Placeholder prefix
 * @param {Object} data - Data to replace placeholders with
 * @returns {string} Content with replaced placeholders
 */
function replaceHtmlPlaceholders(content, prefix, data) {
  // This is a simplified implementation - a real one would use a proper template engine
  const flattenedData = flattenObject(data, prefix);

  for (const [key, value] of Object.entries(flattenedData)) {
    const placeholder = `{{${key}}}`;
    content = content.replace(
      new RegExp(escapeRegExp(placeholder), 'g'),
      String(value)
    );
  }

  return content;
}

/**
 * Merge assessment data with template object
 * @param {Object} template - Template object
 * @param {Object} assessment - Assessment data
 * @returns {Object} Merged object
 */
function mergeAssessmentData(template, assessment) {
  // Deep clone the template to avoid modifying it
  const result = JSON.parse(JSON.stringify(template));

  // Recursively merge assessment data into template
  for (const [key, value] of Object.entries(assessment)) {
    if (
      result[key] &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key]) &&
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      // Recursively merge objects
      result[key] = mergeAssessmentData(result[key], value);
    } else {
      // Replace or add value
      result[key] = value;
    }
  }

  return result;
}

/**
 * Generate documentation index
 * @param {Object} generatedDocs - Generated documentation files
 * @param {Object} config - System configuration
 * @returns {Promise<void>}
 */
async function generateDocumentationIndex(generatedDocs, config) {
  const indexPath = path.join(
    config.system.outputPath,
    'living-docs',
    'index.html'
  );

  // Create basic HTML index
  let indexContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EchoForge Codebase Assessment Documentation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #0066cc;
          border-bottom: 2px solid #eee;
          padding-bottom: 10px;
        }
        h2 {
          color: #0066cc;
          margin-top: 30px;
        }
        .doc-card {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
          background-color: #f9f9f9;
        }
        .doc-card h3 {
          margin-top: 0;
          color: #0066cc;
        }
        .doc-card p {
          margin-bottom: 10px;
        }
        .doc-link {
          display: inline-block;
          background-color: #0066cc;
          color: white;
          padding: 8px 15px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
        .doc-link:hover {
          background-color: #004c99;
        }
        .metadata {
          color: #666;
          font-size: 0.9em;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <h1>EchoForge Codebase Assessment Documentation</h1>
      <p>Generated on ${new Date().toISOString().split('T')[0]} (Version ${config.system.version})</p>
      
      <h2>Available Documentation</h2>
  `;

  // Add cards for each document
  for (const [docType, docInfo] of Object.entries(generatedDocs)) {
    const relativePath = path.relative(path.dirname(indexPath), docInfo.path);
    const docTitle = formatDocTitle(docType);

    indexContent += `
      <div class="doc-card">
        <h3>${docTitle}</h3>
        <p>${getDocDescription(docType)}</p>
        <a href="${relativePath}" class="doc-link">View Document</a>
        <div class="metadata">
          Format: ${docInfo.format.toUpperCase()} | 
          Size: ${formatFileSize(docInfo.size)}
        </div>
      </div>
    `;
  }

  indexContent += `
    </body>
    </html>
  `;

  // Write index file
  await fs.writeFile(indexPath, indexContent);
  console.log(`Generated documentation index: ${indexPath}`);
}

/**
 * Get document format from file path
 * @param {string} filePath - Path to document file
 * @returns {string} Document format
 */
function getDocumentFormat(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.md':
      return 'markdown';
    case '.json':
      return 'json';
    case '.html':
      return 'html';
    default:
      return 'unknown';
  }
}

/**
 * Format document title from document type
 * @param {string} docType - Document type
 * @returns {string} Formatted title
 */
function formatDocTitle(docType) {
  // Convert camelCase to Title Case with spaces
  return docType
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim(); // Remove leading/trailing spaces
}

/**
 * Get document description based on document type
 * @param {string} docType - Document type
 * @returns {string} Document description
 */
function getDocDescription(docType) {
  const descriptions = {
    systemOverview:
      'Comprehensive overview of the system architecture, health metrics, and key strengths.',
    architectureAssessment:
      'Detailed assessment of the codebase architecture, patterns, and modularity.',
    refactoringCandidates:
      'Identified opportunities for code refactoring and improvement.',
    enhancementIdeas:
      'Ideas for enhancing existing functionality and capabilities.',
    newFeatures: 'Proposed new features and capabilities to add to the system.',
    optimizationTargets:
      'Specific targets for performance optimization and improvement.',
  };

  return (
    descriptions[docType] ||
    'Documentation generated by the Codebase Assessment System.'
  );
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

/**
 * Flatten an object with nested properties
 * @param {Object} obj - Object to flatten
 * @param {string} prefix - Prefix for flattened keys
 * @returns {Object} Flattened object
 */
function flattenObject(obj, prefix = '') {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(result, flattenObject(value, newKey));
    } else {
      // Add leaf value
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Escape special characters in string for use in RegExp
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  generateDocumentation,
};
