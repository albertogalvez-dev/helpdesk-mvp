# Helpdesk Screenshot Automation

Automated screenshot capture for the Helpdesk MVP project.

## Requirements

- Node.js 18+
- Docker (for running the stack)

## Usage

```bash
# Install dependencies
npm install
npx playwright install chromium

# Run capture (stack must be running)
npm run capture
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HELP_DESK_BASE_URL` | `http://localhost:18000` | API base URL |
| `HELP_DESK_WEB_URL` | `http://localhost:5173` | Web app URL |
| `HELP_DESK_E2E_ADMIN_EMAIL` | `admin@acme.com` | Admin email for auth |
| `HELP_DESK_E2E_ADMIN_PASS` | `password123` | Admin password |
| `HELP_DESK_E2E_CUSTOMER_EMAIL` | `customer@acme.com` | Customer email |
| `HELP_DESK_E2E_CUSTOMER_PASS` | `password123` | Customer password |

## Output

Screenshots are saved to `@fotos/desktop/` with a `manifest.json` listing all captures.
