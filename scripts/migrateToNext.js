import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // React Router changes
  if (content.includes('react-router-dom')) {
    // Basic replacements
    content = content.replace(/import\s+{(.*?)}\s+from\s+['"]react-router-dom['"];?/g, (match, imports) => {
      let nextImports = [];
      let nextNavImports = [];
      
      if (imports.includes('Link')) nextImports.push('Link');
      if (imports.includes('useNavigate')) nextNavImports.push('useRouter as useNavigate');
      if (imports.includes('useParams')) nextNavImports.push('useParams');
      if (imports.includes('useLocation')) nextNavImports.push('usePathname as useLocation');

      let newImports = [];
      if (nextImports.length > 0) {
        newImports.push(`import ${nextImports.join(', ')} from 'next/link';`);
      }
      if (nextNavImports.length > 0) {
        newImports.push(`import { ${nextNavImports.join(', ')} } from 'next/navigation';`);
      }
      
      return newImports.join('\n');
    });

    // Replace <Link to="..."> with <Link href="...">
    content = content.replace(/<Link([^>]*)to=(['"{].*?['"}])/g, "<Link$1href=$2");
    
    // Replace useNavigate() usage:
    // It's safer to just replace `navigate(` with `navigate.push(` where navigate is used as a function, but that requires careful regex.
    // Assuming `navigate` is the common variable name:
    content = content.replace(/navigate\((.*?)\)/g, 'navigate.push($1)');
    
    changed = true;
  }

  // ENV variables change
  if (content.includes('import.meta.env.VITE_')) {
    content = content.replace(/import\.meta\.env\.VITE_/g, 'process.env.NEXT_PUBLIC_');
    changed = true;
  }
  
  // Client component annotation
  if ((filePath.endsWith('.jsx') || filePath.endsWith('.js')) && 
      (content.includes('useState') || content.includes('useEffect') || content.includes('useContext') || content.includes('useRef') || content.includes('useRouter') || content.includes('usePathname') || content.includes('useParams') || content.match(/onClick={/))) {
        if (!content.includes('"use client"') && !content.includes("'use client'")) {
            content = '"use client";\n' + content;
            changed = true;
        }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

walk(srcDir, processFile);

// Also process .env (only in the backend or frontend context)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(/VITE_/g, 'NEXT_PUBLIC_');
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('Updated .env');
}
