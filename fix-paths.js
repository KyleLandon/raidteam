const fs = require('fs');
const path = require('path');

// Directories to search for files
const directories = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'lib'),
];

// Find all JS/TS/JSX/TSX files recursively
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Replace @/ imports with relative paths
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace @/lib/... with relative paths
  content = content.replace(/from ['"]@\/lib\/([^'"]+)['"]/g, (match, p1) => {
    const relPath = path.relative(path.dirname(filePath), path.join(__dirname, 'lib', p1))
      .replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes
    return `from '${relPath.startsWith('.') ? relPath : './' + relPath}'`;
  });
  
  // Replace @/app/... with relative paths
  content = content.replace(/from ['"]@\/app\/([^'"]+)['"]/g, (match, p1) => {
    const relPath = path.relative(path.dirname(filePath), path.join(__dirname, 'app', p1))
      .replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes
    return `from '${relPath.startsWith('.') ? relPath : './' + relPath}'`;
  });
  
  // Only write to file if content changed
  if (content !== originalContent) {
    console.log(`Fixed imports in: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Run the script
console.log('Fixing import paths...');
let fixedCount = 0;

directories.forEach(dir => {
  const files = findFiles(dir);
  files.forEach(file => {
    if (fixImports(file)) {
      fixedCount++;
    }
  });
});

console.log(`Done! Fixed imports in ${fixedCount} files.`); 