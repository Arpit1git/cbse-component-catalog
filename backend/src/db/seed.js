import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeAndSeedDb() {
  console.log(`🔄 Initializing ${db.isPostgres ? 'PostgreSQL' : 'SQLite'} database schema...`);
  
  const schemaFile = db.isPostgres ? 'postgresSchema.sql' : 'schema.sql';
  const schemaPath = path.resolve(__dirname, schemaFile);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await db.exec(schemaSql);

  // Check if data already seeded
  const userCountRow = await db.get('SELECT COUNT(*) AS count FROM users');
  const count = Number(userCountRow?.count || 0);
  if (count > 0) {
    console.log('ℹ️ Database already contains data. Skipping initial seeding.');
    return;
  }

  console.log('🌱 Seeding database with realistic CBSE UI components...');

  // 1. Seed Users
  const passwordAdmin = bcrypt.hashSync('admin123', 10);
  const passwordSarah = bcrypt.hashSync('sarah123', 10);
  const passwordAlex = bcrypt.hashSync('alex123', 10);
  const passwordJohn = bcrypt.hashSync('john123', 10);
  const passwordEmily = bcrypt.hashSync('emily123', 10);

  const uAdmin = await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Admin Moderator', 'admin@catalog.dev', passwordAdmin, 'admin']);
  const uSarah = await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Sarah Chen (UI Engineer)', 'sarah@dev.com', passwordSarah, 'contributor']);
  const uAlex = await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Alex Rivera (Design Tech)', 'alex@dev.com', passwordAlex, 'contributor']);
  const uJohn = await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['John Doe', 'john@consumer.dev', passwordJohn, 'consumer']);
  const uEmily = await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Emily Watson', 'emily@consumer.dev', passwordEmily, 'consumer']);

  const adminId = uAdmin.lastInsertRowid;
  const sarahId = uSarah.lastInsertRowid;
  const alexId = uAlex.lastInsertRowid;
  const johnId = uJohn.lastInsertRowid;
  const emilyId = uEmily.lastInsertRowid;

  // 2. Seed Categories
  const cAuth = await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', ['Authentication', 'Forms and dialogs for login, signup, reset password, and identity.']);
  const cNav = await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', ['Navigation', 'Navbars, headers, search bars, sidebars, and breadcrumbs.']);
  const cLayout = await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', ['Layout', 'Modals, footers, hero sections, and structural containers.']);
  const cCards = await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', ['Cards', 'Pricing tables, feature highlights, stat displays, and profile widgets.']);
  const cForms = await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', ['Forms', 'Input controls, contact forms, survey builders, and checkout inputs.']);
  const cFeedback = await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', ['Feedback', 'Toast notifications, status badges, alert banners, and empty states.']);

  const catAuth = cAuth.lastInsertRowid;
  const catNav = cNav.lastInsertRowid;
  const catLayout = cLayout.lastInsertRowid;
  const catCards = cCards.lastInsertRowid;
  const catForms = cForms.lastInsertRowid;
  const catFeedback = cFeedback.lastInsertRowid;

  // 3. Seed Tags
  const tagNames = ['responsive', 'accessible', 'dark-mode', 'animation', 'modern', 'minimal', 'dropdown', 'validation', 'tailwind', 'bootstrap', 'forms', 'navigation', 'layout', 'cards', 'modal'];
  const tagMap = {};
  for (const t of tagNames) {
    const res = await db.run('INSERT INTO tags (name) VALUES (?)', [t]);
    tagMap[t] = res.lastInsertRowid;
  }

  // Helper function to link tags
  async function linkTags(compId, tagKeys) {
    for (const k of tagKeys) {
      if (tagMap[k]) {
        await db.run('INSERT INTO component_tags (component_id, tag_id) VALUES (?, ?)', [compId, tagMap[k]]);
      }
    }
  }

  // ==========================================
  // COMPONENT 1: Responsive Navbar (HTML/CSS)
  // ==========================================
  const c1Res = await db.run(
    'INSERT INTO components (name, summary, category_id, owner_id, framework, license, repo_url, status, view_count, download_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['responsive-navbar', 'A sleek, mobile-friendly navigation header with animated hamburger menu, brand logo, and responsive links.', catNav, sarahId, 'HTML/CSS', 'MIT', 'https://github.com/example/responsive-navbar', 'approved', 142, 45]
  );
  const c1 = c1Res.lastInsertRowid;
  await linkTags(c1, ['responsive', 'modern', 'accessible', 'navigation']);

  const c1_v1Res = await db.run(
    'INSERT INTO versions (component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      c1, '1.0.0', 'Initial production release with flexbox layout and smooth CSS mobile toggle animation.',
      `<nav class="navbar">
  <div class="nav-container">
    <a href="#" class="brand">🚀 AcmeUI</a>
    <button class="mobile-toggle" id="menuToggle" aria-label="Toggle navigation">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" id="navLinks">
      <li><a href="#home" class="active">Home</a></li>
      <li><a href="#components">Components</a></li>
      <li><a href="#docs">Documentation</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="#get-started" class="btn-cta">Get Started</a></li>
    </ul>
  </div>
</nav>`,
      `* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
.navbar { background: #1F2421; color: #FDFCF9; padding: 0.85rem 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.nav-container { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.brand { font-size: 1.25rem; font-weight: 700; color: #FDFCF9; text-decoration: none; letter-spacing: -0.5px; }
.nav-links { display: flex; gap: 1.5rem; list-style: none; align-items: center; }
.nav-links a { color: #DDD8CB; text-decoration: none; font-size: 0.95rem; transition: color 0.2s; }
.nav-links a:hover, .nav-links a.active { color: #48BB78; }
.btn-cta { background: #1F5E4B; color: #FFF !important; padding: 0.45rem 1rem; border-radius: 6px; font-weight: 600; }
.btn-cta:hover { background: #174A3B !important; }
.mobile-toggle { display: none; background: none; border: none; cursor: pointer; flex-direction: column; gap: 5px; }
.mobile-toggle span { display: block; width: 24px; height: 2px; background: #FFF; transition: 0.3s; }
@media (max-width: 768px) {
  .mobile-toggle { display: flex; }
  .nav-links { display: none; position: absolute; top: 60px; left: 0; width: 100%; background: #1F2421; flex-direction: column; padding: 1.5rem; gap: 1.2rem; }
  .nav-links.open { display: flex; }
}`,
      `document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('open');
});`,
      'Include the HTML structure in your layout. Hook up the JS event listener to enable the mobile hamburger drawer.',
      'active'
    ]
  );
  await db.run('INSERT INTO dependencies (version_id, library_name, library_version) VALUES (?, ?, ?)', [c1_v1Res.lastInsertRowid, 'Vanilla JavaScript', 'ES6+']);
  await db.run('INSERT INTO reviews (component_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [c1, johnId, 5, 'Super clean navbar! Easy to customize the CSS colors.']);
  await db.run('INSERT INTO reviews (component_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [c1, emilyId, 4, 'Great responsive drawer on mobile devices.']);

  // ==========================================
  // COMPONENT 2: Modal Dialog (HTML/CSS) - 2 Versions
  // ==========================================
  const c2Res = await db.run(
    'INSERT INTO components (name, summary, category_id, owner_id, framework, license, repo_url, status, view_count, download_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['modal-dialog', 'An accessible modal overlay dialog with backdrop blur, smooth entrance scale, and escape key listener.', catLayout, sarahId, 'HTML/CSS', 'MIT', 'https://github.com/example/modal-dialog', 'approved', 210, 88]
  );
  const c2 = c2Res.lastInsertRowid;
  await linkTags(c2, ['accessible', 'animation', 'minimal', 'modal', 'layout']);

  // Deprecated v1.0.0
  await db.run(
    'INSERT INTO versions (component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      c2, '1.0.0', 'Legacy modal version without keyboard trap or backdrop blur.',
      `<button id="openModalBtn">Open Simple Modal</button>
<div id="simpleModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5);">
  <div style="background:#fff; margin:100px auto; padding:20px; width:300px;">
    <h3>Old Modal</h3>
    <p>This is legacy v1.0.0.</p>
    <button id="closeModalBtn">Close</button>
  </div>
</div>`,
      `button { padding: 8px 16px; cursor: pointer; }`,
      `document.getElementById('openModalBtn').onclick = () => document.getElementById('simpleModal').style.display='block';
document.getElementById('closeModalBtn').onclick = () => document.getElementById('simpleModal').style.display='none';`,
      'Basic popup without accessibility support.',
      'deprecated'
    ]
  );

  // Active v1.1.0
  const c2_v11Res = await db.run(
    'INSERT INTO versions (component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      c2, '1.1.0', 'Added backdrop-filter blur, CSS keyframe entrance animation, focus handling, and Escape key dismissal.',
      `<div class="modal-wrapper">
  <button class="modal-trigger-btn" id="openDemoModal">Open Confirmation Modal</button>
  <div class="modal-backdrop" id="modalBackdrop" aria-hidden="true">
    <div class="modal-card" role="dialog" aria-labelledby="modalTitle" aria-modal="true">
      <div class="modal-header">
        <h3 id="modalTitle">Confirm Action</h3>
        <button class="modal-close" id="closeDemoModal" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to deploy component <strong>v2.4.0</strong> to the production cluster?</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancelModal">Cancel</button>
        <button class="btn btn-primary" id="confirmModal">Confirm & Deploy</button>
      </div>
    </div>
  </div>
</div>`,
      `* { box-sizing: border-box; font-family: system-ui, sans-serif; }
.modal-wrapper { padding: 2rem; display: flex; justify-content: center; }
.modal-trigger-btn { background: #1F5E4B; color: #FFF; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.modal-trigger-btn:hover { background: #174A3B; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(31, 36, 33, 0.6); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 999; }
.modal-backdrop.active { display: flex; animation: fadeIn 0.2s ease-out; }
.modal-card { background: #FDFCF9; border: 1px solid #DDD8CB; border-radius: 10px; width: 90%; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); animation: scaleUp 0.2s ease-out; overflow: hidden; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #DDD8CB; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.15rem; color: #1F2421; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6B6F68; }
.modal-close:hover { color: #1F2421; }
.modal-body { padding: 1.5rem; color: #1F2421; line-height: 1.5; font-size: 0.95rem; }
.modal-actions { padding: 1rem 1.5rem; background: #F6F3EC; border-top: 1px solid #DDD8CB; display: flex; justify-content: flex-end; gap: 0.75rem; }
.btn { padding: 0.5rem 1.1rem; border-radius: 6px; font-weight: 500; cursor: pointer; font-size: 0.9rem; border: none; }
.btn-secondary { background: #DDD8CB; color: #1F2421; }
.btn-secondary:hover { background: #CCC7B9; }
.btn-primary { background: #1F5E4B; color: #FFF; }
.btn-primary:hover { background: #174A3B; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`,
      `const backdrop = document.getElementById('modalBackdrop');
const openBtn = document.getElementById('openDemoModal');
const closeBtn = document.getElementById('closeDemoModal');
const cancelBtn = document.getElementById('cancelModal');
const confirmBtn = document.getElementById('confirmModal');

function open() { backdrop?.classList.add('active'); }
function close() { backdrop?.classList.remove('active'); }

openBtn?.addEventListener('click', open);
closeBtn?.addEventListener('click', close);
cancelBtn?.addEventListener('click', close);
confirmBtn?.addEventListener('click', () => { alert('Deployment triggered!'); close(); });
backdrop?.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });`,
      'Add the modal backdrop HTML to your body root. Use provided methods to trigger.',
      'active'
    ]
  );
  await db.run('INSERT INTO dependencies (version_id, library_name, library_version) VALUES (?, ?, ?)', [c2_v11Res.lastInsertRowid, 'Vanilla JavaScript', 'ES6+']);
  await db.run('INSERT INTO reviews (component_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [c2, johnId, 5, 'The backdrop blur effect looks super modern!']);

  // ==========================================
  // COMPONENT 3: Login Form (Tailwind CSS)
  // ==========================================
  const c3Res = await db.run(
    'INSERT INTO components (name, summary, category_id, owner_id, framework, license, repo_url, status, view_count, download_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['login-form', 'Modern authentication card featuring floating labels, show/hide password toggle, and validation state feedback.', catAuth, alexId, 'Tailwind CSS', 'MIT', 'https://github.com/example/tailwind-login', 'approved', 320, 115]
  );
  const c3 = c3Res.lastInsertRowid;
  await linkTags(c3, ['validation', 'tailwind', 'responsive']);

  const c3_v1Res = await db.run(
    'INSERT INTO versions (component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      c3, '1.0.0', 'Initial component release with Tailwind utility classes and client-side password toggle.',
      `<div class="min-h-screen bg-[#F6F3EC] flex items-center justify-center p-4">
  <div class="bg-[#FDFCF9] border border-[#DDD8CB] rounded-2xl shadow-xl p-8 w-full max-w-md">
    <div class="text-center mb-8">
      <div class="w-12 h-12 bg-[#E3EEE8] text-[#1F5E4B] rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-xl">🔒</div>
      <h2 class="text-2xl font-bold text-[#1F2421]">Welcome Back</h2>
      <p class="text-sm text-[#6B6F68] mt-1">Please enter your credentials to log in</p>
    </div>
    <form id="loginForm" class="space-y-5">
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-[#6B6F68] mb-1">Email Address</label>
        <input type="email" id="email" required placeholder="developer@company.com" 
          class="w-full px-4 py-2.5 bg-[#F6F3EC] border border-[#DDD8CB] rounded-lg text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#1F5E4B] transition-all text-sm" />
      </div>
      <div>
        <div class="flex justify-between items-center mb-1">
          <label class="block text-xs font-semibold uppercase tracking-wider text-[#6B6F68]">Password</label>
          <a href="#" class="text-xs text-[#1F5E4B] hover:underline font-medium">Forgot password?</a>
        </div>
        <div class="relative">
          <input type="password" id="password" required placeholder="••••••••" 
            class="w-full px-4 py-2.5 bg-[#F6F3EC] border border-[#DDD8CB] rounded-lg text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#1F5E4B] transition-all text-sm" />
          <button type="button" id="togglePass" class="absolute right-3 top-2.5 text-xs text-[#6B6F68] hover:text-[#1F2421]">Show</button>
        </div>
      </div>
      <div class="flex items-center">
        <input type="checkbox" id="remember" class="rounded border-[#DDD8CB] text-[#1F5E4B] focus:ring-[#1F5E4B]" />
        <label for="remember" class="ml-2 text-xs text-[#6B6F68]">Remember me for 30 days</label>
      </div>
      <button type="submit" 
        class="w-full bg-[#1F5E4B] hover:bg-[#174A3B] text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all duration-200 text-sm">
        Sign In to Account
      </button>
    </form>
  </div>
</div>`,
      `/* Requires Tailwind CSS CDN */`,
      `const passInput = document.getElementById('password');
const toggleBtn = document.getElementById('togglePass');
toggleBtn?.addEventListener('click', () => {
  const isPass = passInput.type === 'password';
  passInput.type = isPass ? 'text' : 'password';
  toggleBtn.textContent = isPass ? 'Hide' : 'Show';
});
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Logging in with ' + document.getElementById('email').value);
});`,
      'Include Tailwind CDN in your head tag.',
      'active'
    ]
  );
  await db.run('INSERT INTO dependencies (version_id, library_name, library_version) VALUES (?, ?, ?)', [c3_v1Res.lastInsertRowid, 'Tailwind CSS', '3.4+']);
  await db.run('INSERT INTO reviews (component_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [c3, emilyId, 5, 'Perfect login form. Matches the Paper & Ink palette beautifully.']);

  // ==========================================
  // COMPONENT 4: Pricing Card (Tailwind CSS)
  // ==========================================
  const c4Res = await db.run(
    'INSERT INTO components (name, summary, category_id, owner_id, framework, license, repo_url, status, view_count, download_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['pricing-card', 'High-converting 3-tier pricing table with highlighted "Most Popular" plan and feature comparison checklists.', catCards, alexId, 'Tailwind CSS', 'MIT', 'https://github.com/example/tailwind-pricing', 'approved', 180, 72]
  );
  const c4 = c4Res.lastInsertRowid;
  await linkTags(c4, ['tailwind', 'responsive', 'modern', 'cards']);

  const c4_v1Res = await db.run(
    'INSERT INTO versions (component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      c4, '1.0.0', 'Responsive 3-column layout with popular tier badge.',
      `<div class="p-8 bg-[#F6F3EC] min-h-screen">
  <div class="max-w-5xl mx-auto text-center mb-10">
    <h2 class="text-3xl font-bold text-[#1F2421]">Simple, Transparent Pricing</h2>
    <p class="text-[#6B6F68] mt-2">Scale your CBSE library seamlessly across your engineering teams.</p>
  </div>
  <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
    <div class="bg-[#FDFCF9] border border-[#DDD8CB] rounded-2xl p-6 flex flex-col justify-between">
      <div>
        <h3 class="text-lg font-bold text-[#1F2421]">Starter</h3>
        <p class="text-xs text-[#6B6F68] mt-1">For individuals and prototyping</p>
        <div class="my-6">
          <span class="text-4xl font-extrabold text-[#1F2421]">$0</span>
          <span class="text-xs text-[#6B6F68]">/ month</span>
        </div>
        <ul class="space-y-3 text-xs text-[#1F2421]">
          <li>✓ Up to 10 Components</li>
          <li>✓ Public Catalog Access</li>
          <li>✓ Community Reviews</li>
        </ul>
      </div>
      <button class="mt-8 w-full py-2 bg-[#E3EEE8] text-[#1F5E4B] font-semibold rounded-lg text-sm hover:bg-[#DDD8CB]">Choose Starter</button>
    </div>
    <div class="bg-[#FDFCF9] border-2 border-[#1F5E4B] rounded-2xl p-6 flex flex-col justify-between shadow-lg relative">
      <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1F5E4B] text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">Most Popular</div>
      <div>
        <h3 class="text-lg font-bold text-[#1F2421]">Team Pro</h3>
        <p class="text-xs text-[#6B6F68] mt-1">For growing engineering orgs</p>
        <div class="my-6">
          <span class="text-4xl font-extrabold text-[#1F2421]">$49</span>
          <span class="text-xs text-[#6B6F68]">/ month</span>
        </div>
        <ul class="space-y-3 text-xs text-[#1F2421]">
          <li>✓ Unlimited UI Components</li>
          <li>✓ Role-Based Access Control</li>
          <li>✓ Admin Moderation Workflows</li>
        </ul>
      </div>
      <button class="mt-8 w-full py-2 bg-[#1F5E4B] text-white font-semibold rounded-lg text-sm hover:bg-[#174A3B]">Start 14-Day Trial</button>
    </div>
    <div class="bg-[#FDFCF9] border border-[#DDD8CB] rounded-2xl p-6 flex flex-col justify-between">
      <div>
        <h3 class="text-lg font-bold text-[#1F2421]">Enterprise</h3>
        <p class="text-xs text-[#6B6F68] mt-1">Dedicated governance & SLA</p>
        <div class="my-6">
          <span class="text-4xl font-extrabold text-[#1F2421]">$199</span>
          <span class="text-xs text-[#6B6F68]">/ month</span>
        </div>
        <ul class="space-y-3 text-xs text-[#1F2421]">
          <li>✓ Custom SSO / SAML</li>
          <li>✓ Dedicated Component Registry</li>
          <li>✓ Priority 24/7 Support</li>
        </ul>
      </div>
      <button class="mt-8 w-full py-2 bg-[#E3EEE8] text-[#1F5E4B] font-semibold rounded-lg text-sm hover:bg-[#DDD8CB]">Contact Sales</button>
    </div>
  </div>
</div>`,
      `/* Tailwind CSS */`,
      `console.log('Pricing loaded');`,
      'Wrap inside a max-width container and inject your CTA handlers.',
      'active'
    ]
  );
  await db.run('INSERT INTO dependencies (version_id, library_name, library_version) VALUES (?, ?, ?)', [c4_v1Res.lastInsertRowid, 'Tailwind CSS', '3.4+']);

  // ==========================================
  // COMPONENT 5: Search Bar (HTML/CSS)
  // ==========================================
  const c5Res = await db.run(
    'INSERT INTO components (name, summary, category_id, owner_id, framework, license, repo_url, status, view_count, download_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['search-bar', 'Interactive search input bar with animated expand effect, keyboard shortcut badge (Cmd+K), and dropdown suggestions.', catNav, sarahId, 'HTML/CSS', 'MIT', 'https://github.com/example/search-bar', 'approved', 95, 34]
  );
  const c5 = c5Res.lastInsertRowid;
  await linkTags(c5, ['minimal', 'dropdown', 'responsive', 'navigation']);

  await db.run(
    'INSERT INTO versions (component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      c5, '1.0.0', 'Initial release with shortcut trigger and search results overlay.',
      `<div class="search-container">
  <div class="search-box">
    <span class="search-icon">🔍</span>
    <input type="text" id="catalogSearchInput" placeholder="Search components..." autocomplete="off" />
    <span class="kbd-badge">⌘K</span>
  </div>
</div>`,
      `* { box-sizing: border-box; font-family: system-ui, sans-serif; }
.search-container { position: relative; max-width: 500px; margin: 2rem auto; }
.search-box { display: flex; align-items: center; background: #FDFCF9; border: 1.5px solid #DDD8CB; border-radius: 8px; padding: 0.5rem 0.85rem; }
.search-box:focus-within { border-color: #1F5E4B; }
.search-icon { font-size: 0.9rem; margin-right: 0.5rem; color: #6B6F68; }
.search-box input { flex: 1; border: none; outline: none; background: transparent; font-size: 0.95rem; color: #1F2421; }
.kbd-badge { background: #F6F3EC; border: 1px solid #DDD8CB; border-radius: 4px; padding: 2px 6px; font-size: 0.75rem; color: #6B6F68; font-family: monospace; }`,
      `console.log('Search mounted');`,
      'Bind the results handler to filter against your JSON data array.',
      'active'
    ]
  );

  // ==========================================
  // COMPONENT 6: Signup Form (Bootstrap)
  // ==========================================
  const c6Res = await db.run(
    'INSERT INTO components (name, summary, category_id, owner_id, framework, license, repo_url, status, view_count, download_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['signup-form', 'Clean registration form built with Bootstrap 5.3 utilities and real-time password strength meter.', catAuth, sarahId, 'Bootstrap', 'Apache 2.0', 'https://github.com/example/bootstrap-signup', 'approved', 115, 40]
  );
  const c6 = c6Res.lastInsertRowid;
  await linkTags(c6, ['bootstrap', 'validation', 'responsive', 'forms']);

  await db.run(
    'INSERT INTO versions (component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      c6, '1.0.0', 'Bootstrap-themed card form with input groups.',
      `<div class="container my-5" style="max-width: 460px;">
  <div class="card shadow-sm border-0" style="background: #FDFCF9; border: 1px solid #DDD8CB !important; border-radius: 12px;">
    <div class="card-body p-4">
      <h4 class="card-title fw-bold text-center mb-1" style="color: #1F2421;">Create Developer Account</h4>
      <p class="text-muted text-center small mb-4">Join our component engineering registry</p>
      <form id="signupForm">
        <div class="mb-3">
          <label class="form-label small fw-semibold text-muted">WORK EMAIL</label>
          <input type="email" class="form-control" required placeholder="alex@company.com" style="background: #F6F3EC; border-color: #DDD8CB;">
        </div>
        <button type="submit" class="btn w-100 py-2 fw-bold text-white" style="background: #1F5E4B;">Register</button>
      </form>
    </div>
  </div>
</div>`,
      `/* Bootstrap 5.3 CSS */`,
      `document.getElementById('signupForm')?.addEventListener('submit', (e) => { e.preventDefault(); alert('Registered!'); });`,
      'Include Bootstrap 5.3 CDN CSS.',
      'active'
    ]
  );

  // ==========================================
  // COMPONENT 7: Toast Notification (Pending Moderation)
  // ==========================================
  const c7Res = await db.run(
    'INSERT INTO components (name, summary, category_id, owner_id, framework, license, repo_url, status, view_count, download_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['toast-notification', 'Lightweight auto-dismissing toast notification container for alerting users of success, warning, or error states.', catFeedback, alexId, 'HTML/CSS', 'MIT', 'https://github.com/example/toast-notification', 'pending', 12, 0]
  );
  const c7 = c7Res.lastInsertRowid;
  await linkTags(c7, ['animation', 'modern']);

  await db.run(
    'INSERT INTO versions (component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      c7, '1.0.0', 'Initial submission awaiting admin approval.',
      `<div class="toast-card" style="display:flex; align-items:center; background:#FDFCF9; border-left:4px solid #2F7D4F; padding:1rem; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.1); gap:0.75rem;">
  <span style="color:#2F7D4F; font-weight:bold;">✓</span>
  <div>
    <strong>Component Published!</strong>
    <p style="margin:2px 0 0; font-size:0.8rem; color:#6B6F68;">Your component is live.</p>
  </div>
</div>`,
      `/* Toast CSS */`,
      `console.log('Toast demo');`,
      'Trigger programmatically on API success events.',
      'active'
    ]
  );

  console.log(`✅ ${db.isPostgres ? 'PostgreSQL' : 'SQLite'} database seeded successfully with users, categories, tags, components, and reviews!`);
}

// Run standalone if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeAndSeedDb().catch(console.error);
}
