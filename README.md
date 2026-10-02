# 🏛️ CBSE Software Component Cataloging System

A modern, production-grade **Component-Based Software Engineering (CBSE)** web application designed to solve the UI component reusability and discovery problem in software development teams.

---

## 🎨 Theme & Aesthetic: Paper & Ink

Built with a dedicated **Paper & Ink** design system:
- **Background:** `#F6F3EC` (Warm off-white)
- **Surface:** `#FDFCF9` (Cards & panels)
- **Border:** `#DDD8CB` (Card outlines & separators)
- **Text:** `#1F2421` (High-contrast charcoal)
- **Muted Text:** `#6B6F68` (Captions & metadata)
- **Accent:** `#1F5E4B` / `#174A3B` (Deep forest green)
- **Accent Tint:** `#E3EEE8` (Selected chips & tags)
- **Code Block:** `#1E2420` (Dark pine code editor background)
- **Status Badges:**
  - `Approved / Active`: `#2F7D4F`
  - `Pending Review`: `#B7791F`
  - `Rejected`: `#B3402F`
  - `Deprecated`: `#7A7F87`

---

## ⚡ Quick Start

### 1. Backend Server (Express + SQLite)
```bash
cd backend
npm install
npm run seed     # (Optional, seeds automatically on startup)
npm start        # Runs on http://localhost:5000
```

### 2. Frontend Application (React + Tailwind + Vite)
```bash
cd frontend
npm install
npm run dev      # Runs on http://localhost:3000
```

---

## 👥 Demo Accounts (Instant One-Click Login)

The login page contains one-click demo login buttons for each role:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@catalog.dev` | `admin123` | Moderate pending submissions, approve/reject components, manage user roles, view catalog analytics |
| **Contributor** | `sarah@dev.com` | `sarah123` | Publish UI components, release new versions, toggle deprecation, manage "My Components" |
| **Consumer** | `john@consumer.dev` | `john123` | Search, faceted filter, live iframe sandbox preview, copy code, download standalone `.html`, rate and review |

---

## 🚀 Key Features Implemented

### 1. Catalog Explorer & Faceted Search
- **Keyword Search:** Instant live filtering by component title, description, and author.
- **Faceted Filters:** Filter by Framework (`HTML/CSS`, `Tailwind CSS`, `Bootstrap`, `React`), Category (`Authentication`, `Navigation`, `Layout`, `Cards`, `Forms`, `Feedback`), and Minimum Star Rating.
- **Sorting:** Sort by Newest First, Highest Rated, Most Downloaded, Most Viewed, and Alphabetical.

### 2. Live Sandboxed `<iframe>` Preview
- Components are stored as structured `html_code`, `css_code`, and `js_code` in SQLite.
- Rendered securely inside a sandboxed `<iframe>` (`sandbox="allow-scripts"`).
- Responsive device mode toggles (**Desktop 100%**, **Tablet 768px**, **Mobile 375px**) and live preview refresh.

### 3. Component Details, Code Snippets & One-Click Actions
- **Syntax Code Viewer:** Tabbed HTML, CSS, JS, and "How to Use / Props" instructions with line numbers.
- **One-Click Actions:**
  - `Copy Code` with animated feedback.
  - `Download Component (.html)`: Bundles HTML + CSS + JS + Framework CDN into a standalone `.html` file and tracks download metrics.
- **Version Switcher:** Seamlessly switch between active and deprecated versions.
- **Dependencies List:** Transparently shows required external libraries (e.g. `Bootstrap 5.3`, `Tailwind CSS 3.4`).

### 4. Reviews & Ratings
- 5-star interactive rating widget with written commentary.
- Enforced constraint: One review per user per component (`UNIQUE(component_id, user_id)`).
- Real-time recalculation of average ratings and total feedback.

### 5. Contributor Portal & Live Authoring
- Form to register components with metadata, tags, license, and repository URL.
- **Split-screen live authoring preview** allowing contributors to test their component layout and scripts in real time before publishing.
- Ability to release new versions (`v1.1.0`, `v2.0.0`) and toggle version deprecation.

### 6. Admin Moderation & Governance
- **Moderation Queue:** Inspect pending component submissions, test their functionality in a live preview iframe, and one-click `Approve` or `Reject`.
- **System Analytics:** Total components, downloads, views, reviews, and category/framework distribution charts.
- **User Role Management:** Promote or update user permissions.

---

## 🗄️ Relational Database Schema (SQLite)

- `users (id, name, email, password_hash, role, created_at)`
- `categories (id, name, description)`
- `tags (id, name)`
- `components (id, name, summary, category_id, owner_id, framework, license, repo_url, status, view_count, download_count, created_at)`
- `component_tags (component_id, tag_id)`
- `versions (id, component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status, created_at)`
- `dependencies (id, version_id, library_name, library_version)`
- `reviews (id, component_id, user_id, rating, comment, created_at)`

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new consumer or contributor | Public |
| `POST` | `/api/auth/login` | Login and receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/components` | Search & filter approved components | Public |
| `GET` | `/api/components/:id` | Get full component details & increment views | Public |
| `POST` | `/api/components` | Register new component | Contributor / Admin |
| `POST` | `/api/components/:id/versions` | Release new version for component | Contributor / Admin |
| `PATCH` | `/api/components/:id/versions/:vId/status` | Toggle version status (`active`/`deprecated`) | Contributor / Admin |
| `POST` | `/api/components/:id/download` | Bundle standalone HTML & increment downloads | Public |
| `POST` | `/api/components/:id/reviews` | Submit star rating and comment | Authenticated |
| `GET` | `/api/admin/pending` | Moderation queue for pending components | Admin |
| `PATCH` | `/api/admin/components/:id/status` | Approve or reject component | Admin |
| `GET` | `/api/admin/stats` | System metrics and usage analytics | Admin |
| `GET` | `/api/admin/users` | List users and manage roles | Admin |
