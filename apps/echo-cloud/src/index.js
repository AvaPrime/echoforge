import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Logger } from '@echoforge/forgekit';
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'codessa-core';
// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
// Initialize Secret Manager client
const secretClient = new SecretManagerServiceClient();
// Function to load credentials from Secret Manager
async function loadCredentials() {
    try {
        const [version] = await secretClient.accessSecretVersion({
            name: `projects/${PROJECT_ID}/secrets/codessa-deploy-key/versions/latest`,
        });
        const credentials = version.payload?.data?.toString();
        if (credentials) {
            // Parse and use the credentials
            const creds = JSON.parse(credentials);
            Logger.info('Successfully loaded credentials from Secret Manager');
            return creds;
        }
    }
    catch (error) {
        Logger.error('Failed to load credentials from Secret Manager:', error);
        throw error;
    }
}
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        service: 'echo-cloud',
        version: '0.1.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});
// Codessa integration endpoint
app.post('/api/codessa/execute', async (req, res) => {
    try {
        const { directive, context } = req.body;
        // Here we would integrate with Codessa Core
        // For now, return a placeholder response
        res.json({
            success: true,
            result: {
                directive,
                context,
                executed_at: new Date().toISOString(),
                status: 'queued'
            }
        });
    }
    catch (error) {
        Logger.error('Error executing Codessa directive:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Initialize and start server
async function startServer() {
    try {
        // Load credentials on startup
        await loadCredentials();
        app.listen(PORT, () => {
            Logger.info(`🚀 EchoCloud server running on port ${PORT}`);
            Logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
            Logger.info(`📡 Project ID: ${PROJECT_ID}`);
        });
    }
    catch (error) {
        Logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    Logger.info('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    Logger.info('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map