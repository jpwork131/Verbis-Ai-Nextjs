import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDir = path.join(__dirname, '..', 'src', 'app');
if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

function writePage(route, content) {
  const dir = path.join(appDir, route);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.jsx'), content, 'utf8');
}

// 1. Home
writePage('', `import Home from '../views/Home';\nexport default function Page() {\n  return <Home />;\n}\n`);

// 2. Login
writePage('login', `import Login from '../../views/Login';\nexport default function Page() {\n  return <Login />;\n}\n`);

// 3. Register
writePage('register', `import Register from '../../views/Register';\nexport default function Page() {\n  return <Register />;\n}\n`);

// 4. Profile
writePage('profile', `import Profile from '../../views/Profile';\nexport default function Page() {\n  return <Profile />;\n}\n`);

// 5. Analytics (Admin)
writePage('analytics', `
import Analytics from '../../views/Analytics';
import AdminRoute from '../../utils/ProtectedRoute';

export default function Page() {
  return (
    <AdminRoute>
      <Analytics />
    </AdminRoute>
  );
}
`.trim());

// 6. Article by ID (Legacy)
writePage('article/[id]', `
import ArticleDetail from '../../../views/ArticleDetail';

export default function Page() {
  return <ArticleDetail />;
}
`.trim());

// 7. Category / Slug
writePage('[category]/[slug]', `
import ArticleDetail from '../../../views/ArticleDetail';

export default function Page() {
  return <ArticleDetail />;
}
`.trim());

console.log('Next.js pages created successfully.');
