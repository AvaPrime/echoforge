/**
 * A simple function to test the refinement loop
 */
function processData(data) {
  // Validate input
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Extract relevant fields
  const { name, values } = data;

  // Process the values
  const result = values.map((val) => val * 2);

  // Return processed data
  return {
    name,
    processed: result,
    timestamp: new Date().toISOString(),
  };
}

// Export the function
module.exports = { processData };
