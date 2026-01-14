import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
    API_BASE_URL: process.env.HELP_DESK_BASE_URL || 'http://localhost:18000',
    WEB_BASE_URL: process.env.HELP_DESK_WEB_URL || 'http://localhost:5173',
    ADMIN_EMAIL: process.env.HELP_DESK_E2E_ADMIN_EMAIL || 'admin@acme.com',
    ADMIN_PASS: process.env.HELP_DESK_E2E_ADMIN_PASS || 'password123',
    CUSTOMER_EMAIL: process.env.HELP_DESK_E2E_CUSTOMER_EMAIL || 'customer@acme.com',
    CUSTOMER_PASS: process.env.HELP_DESK_E2E_CUSTOMER_PASS || 'password123',
    HEALTH_TIMEOUT_MS: 60000,
    HEALTH_POLL_INTERVAL_MS: 2000,
    SCREENSHOT_WAIT_MS: 1500,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const FOTOS_DIR = path.join(PROJECT_ROOT, '@fotos');
const DESKTOP_DIR = path.join(FOTOS_DIR, 'desktop');

interface ManifestEntry {
    url: string;
    route: string;
    filename: string;
    viewport: string;
    timestamp: string;
    category: string;
}

const manifest: ManifestEntry[] = [];

// ============================================================================
// Utility Functions
// ============================================================================

function sanitizeFilename(route: string): string {
    return route
        .replace(/^\//, '')
        .replace(/\//g, '-')
        .replace(/[^a-zA-Z0-9-_]/g, '')
        || 'home';
}

async function waitForHealth(): Promise<boolean> {
    const healthUrl = `${CONFIG.API_BASE_URL}/health`;
    const startTime = Date.now();

    console.log(`⏳ Waiting for API health at ${healthUrl}...`);

    while (Date.now() - startTime < CONFIG.HEALTH_TIMEOUT_MS) {
        try {
            const response = await fetch(healthUrl);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ API is healthy: ${JSON.stringify(data)}`);
                return true;
            }
        } catch (e) {
            // Continue polling
        }
        await new Promise(r => setTimeout(r, CONFIG.HEALTH_POLL_INTERVAL_MS));
    }

    console.error('❌ API health check timeout');
    return false;
}

async function ensureDirectories(): Promise<void> {
    if (!fs.existsSync(FOTOS_DIR)) {
        fs.mkdirSync(FOTOS_DIR, { recursive: true });
    }
    if (!fs.existsSync(DESKTOP_DIR)) {
        fs.mkdirSync(DESKTOP_DIR, { recursive: true });
    }
    console.log(`📁 Screenshots directory: ${DESKTOP_DIR}`);
}

async function captureScreenshot(
    page: Page,
    url: string,
    route: string,
    category: string
): Promise<void> {
    const filename = `${sanitizeFilename(route)}.png`;
    const filepath = path.join(DESKTOP_DIR, filename);

    try {
        console.log(`📸 Capturing: ${route} -> ${filename}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(CONFIG.SCREENSHOT_WAIT_MS);

        await page.screenshot({
            path: filepath,
            fullPage: true,
        });

        manifest.push({
            url,
            route,
            filename,
            viewport: '1280x720',
            timestamp: new Date().toISOString(),
            category,
        });

        console.log(`   ✅ Saved: ${filename}`);
    } catch (error) {
        console.error(`   ❌ Failed to capture ${route}: ${error}`);
    }
}

async function loginAndGetToken(email: string, password: string): Promise<string | null> {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            console.error(`❌ Login failed for ${email}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data.data?.access_token || null;
    } catch (error) {
        console.error(`❌ Login error for ${email}: ${error}`);
        return null;
    }
}

async function injectAuthToken(context: BrowserContext, token: string): Promise<void> {
    // Inject token into localStorage before navigating
    await context.addInitScript((authToken: string) => {
        // The app uses zustand persist, which stores auth in localStorage
        const authState = {
            state: {
                token: authToken,
                user: null, // Will be fetched by the app
            },
            version: 0,
        };
        localStorage.setItem('auth-storage', JSON.stringify(authState));
    }, token);
}

// ============================================================================
// Route Definitions
// ============================================================================

const PUBLIC_ROUTES = [
    { route: '/', category: 'public' },
    { route: '/login', category: 'public' },
    { route: '/privacy', category: 'public' },
    { route: '/terms', category: 'public' },
    { route: '/contact', category: 'public' },
];

const API_DOC_ROUTES = [
    { url: `${CONFIG.API_BASE_URL}/docs`, route: '/docs', category: 'api' },
    { url: `${CONFIG.API_BASE_URL}/redoc`, route: '/redoc', category: 'api' },
];

const AGENT_ROUTES = [
    { route: '/agent/inbox', category: 'agent' },
    { route: '/agent/reports', category: 'agent' },
    { route: '/agent/admin/slas', category: 'admin' },
    { route: '/agent/admin/users', category: 'admin' },
    { route: '/agent/admin/workspace', category: 'admin' },
];

const PORTAL_ROUTES = [
    { route: '/portal/tickets', category: 'portal' },
    { route: '/portal/tickets/new', category: 'portal' },
    { route: '/portal/help-center', category: 'portal' },
    { route: '/portal/account', category: 'portal' },
];

// ============================================================================
// Main Capture Functions
// ============================================================================

async function capturePublicPages(browser: Browser): Promise<void> {
    console.log('\n🌐 Capturing PUBLIC pages...');
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    for (const { route, category } of PUBLIC_ROUTES) {
        await captureScreenshot(page, `${CONFIG.WEB_BASE_URL}${route}`, route, category);
    }

    await context.close();
}

async function captureApiDocs(browser: Browser): Promise<void> {
    console.log('\n📚 Capturing API DOCUMENTATION pages...');
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    for (const { url, route, category } of API_DOC_ROUTES) {
        await captureScreenshot(page, url, route, category);
    }

    await context.close();
}

async function captureAgentPages(browser: Browser): Promise<void> {
    console.log('\n👔 Capturing AGENT CONSOLE pages...');

    const token = await loginAndGetToken(CONFIG.ADMIN_EMAIL, CONFIG.ADMIN_PASS);
    if (!token) {
        console.error('❌ Could not authenticate as admin, skipping agent pages');
        return;
    }

    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await injectAuthToken(context, token);
    const page = await context.newPage();

    for (const { route, category } of AGENT_ROUTES) {
        await captureScreenshot(page, `${CONFIG.WEB_BASE_URL}${route}`, route, category);
    }

    await context.close();
}

async function capturePortalPages(browser: Browser): Promise<void> {
    console.log('\n🎫 Capturing CUSTOMER PORTAL pages...');

    const token = await loginAndGetToken(CONFIG.CUSTOMER_EMAIL, CONFIG.CUSTOMER_PASS);
    if (!token) {
        console.error('❌ Could not authenticate as customer, skipping portal pages');
        return;
    }

    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await injectAuthToken(context, token);
    const page = await context.newPage();

    for (const { route, category } of PORTAL_ROUTES) {
        await captureScreenshot(page, `${CONFIG.WEB_BASE_URL}${route}`, route, category);
    }

    await context.close();
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
    console.log('🚀 Helpdesk MVP Screenshot Capture');
    console.log('===================================\n');

    // Wait for API to be healthy
    const isHealthy = await waitForHealth();
    if (!isHealthy) {
        console.error('API is not available. Please run: make up');
        process.exit(1);
    }

    // Ensure directories exist
    await ensureDirectories();

    // Launch browser
    const browser = await chromium.launch({ headless: true });

    try {
        // Capture all page categories
        await capturePublicPages(browser);
        await captureApiDocs(browser);
        await captureAgentPages(browser);
        await capturePortalPages(browser);

        // Write manifest
        const manifestPath = path.join(FOTOS_DIR, 'manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`\n📋 Manifest written to: ${manifestPath}`);

        // Summary
        console.log('\n✅ Screenshot capture complete!');
        console.log(`   Total screenshots: ${manifest.length}`);
        console.log(`   Location: ${DESKTOP_DIR}`);

    } finally {
        await browser.close();
    }
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
