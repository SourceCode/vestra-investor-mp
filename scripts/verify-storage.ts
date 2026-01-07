
import { initializeServer } from '@/server/init';
import { storageRouter } from '@/server/controllers/storage.controller';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 4001;
const BASE_URL = `http://localhost:${PORT}`;

async function startTestServer() {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/api/storage', storageRouter);

    const server = http.createServer(app);

    return new Promise<http.Server>((resolve) => {
        server.listen(PORT, async () => {
            console.log(`Test server running on port ${PORT}`);
            // Ensure init
            await initializeServer().catch(() => { }); // fast init
            resolve(server);
        });
    });
}

async function runTests() {
    console.log('Starting verification...');
    const server = await startTestServer();

    try {
        // 1. Get Presigned URL
        console.log('1. Testing generateUploadUrl...');
        const presignedRes = await fetch(`${BASE_URL}/api/storage/presigned-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entityType: 'test',
                entityId: '123',
                fileName: 'hello.txt',
                contentType: 'text/plain'
            })
        });

        if (!presignedRes.ok) throw new Error(`Presigned URL failed: ${presignedRes.statusText}`);
        const presignedData = await presignedRes.json() as any;
        console.log('   Received upload URL:', presignedData.uploadUrl);

        // 2. Upload File
        console.log('2. Testing Upload...');
        // The upload URL from local provider includes the full localhost:4000 base, 
        // we need to adjust it to use our test port 4001 for this test script specific run
        // IF the LocalStorageProvider uses process.env.API_URL or defaults to localhost:4000.
        // We might need to override the provider's base URL or just hack the URL here.

        // Hack: replace port 4000 with 4001 in the returned URL
        const uploadUrl = presignedData.uploadUrl.replace(':4000', `:${PORT}`);

        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: 'Hello World Content'
        });

        if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.statusText}`);
        console.log('   Upload successful');

        // 3. Verify File Exists via Download
        console.log('3. Testing Download...');
        const downloadUrl = presignedData.downloadUrl.replace(':4000', `:${PORT}`);
        const downloadRes = await fetch(downloadUrl);

        if (!downloadRes.ok) throw new Error(`Download failed: ${downloadRes.statusText}`);
        const content = await downloadRes.text();

        if (content !== 'Hello World Content') {
            throw new Error(`Content mismatch. Expected 'Hello World Content', got '${content}'`);
        }
        console.log('   Download verification successful');

        // Cleanup
        // In a real test we might call execute delete, but for now we trust the tmp dir will be cleaned up or ignored.
        // Let's try to delete just to be sure.
        // We don't have a public delete endpoint in the controller yet (only get/post/put), 
        // so we skip delete verification via API.

        console.log('VERIFICATION PASSED ✅');

    } catch (error) {
        console.error('VERIFICATION FAILED ❌:', error);
        process.exit(1);
    } finally {
        server.close();
        process.exit(0);
    }
}

runTests();
