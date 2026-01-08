# UI Design System - Helpdesk MVP

## Color Tokens

### Primary
| Token | Value | Usage |
|-------|-------|-------|
| `--primary-green` | #d1f470 | Primary buttons, active states |
| `--primary-green-hover` | #c5e865 | Hover states |
| `--primary-green-muted` | rgba(209, 244, 112, 0.2) | Backgrounds |

### Dark Theme (Agent Sidebar)
| Token | Value | Usage |
|-------|-------|-------|
| `--dark-primary` | #11110d | Text primary |
| `--dark-tertiary` | #203524 | Sidebar background |
| `--sidebar-background` | hsl(140 25% 12%) | Sidebar bg |

### Light Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--white` | #ffffff | Card backgrounds |
| `--light-gray` | #f5f5f2 | Page backgrounds |

---

## Typography

**Font:** Inter (400/500/700)

| Style | Size | Weight |
|-------|------|--------|
| Heading 1 | 2xl (24px) | Bold |
| Heading 2 | xl (20px) | Semibold |
| Body | sm (14px) | Regular |
| Caption | xs (12px) | Regular |

---

## Spacing (8px base)

| Token | Value |
|-------|-------|
| `--s-1` | 8px |
| `--s-2` | 16px |
| `--s-3` | 24px |
| `--s-4` | 32px |
| `--s-5` | 48px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Inputs |
| `--radius-md` | 12px | Buttons |
| `--radius-lg` | 16px | Cards |
| `--radius-full` | 9999px | Badges |

---

## Status Badges

| Status | Class | Appearance |
|--------|-------|------------|
| NEW | `.badge-new` | Lime bg, dark text |
| OPEN | `.badge-open` | Amber bg |
| PENDING | `.badge-pending` | Orange bg |
| RESOLVED | `.badge-resolved` | Emerald bg |
| CLOSED | `.badge-closed` | Gray bg |

---

## Components

### Button (Primary)
```css
.btn-primary {
  background-color: var(--primary-green);
  color: var(--dark-primary);
  border-radius: var(--radius-md);
}
```

### Card
```css
.card-premium {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
```

### Table (Dense)
```css
.table-dense th { padding: 8px 16px; }
.table-dense td { padding: 12px 16px; }
.table-dense tr:hover { background: var(--bg-overlay-light); }
```
