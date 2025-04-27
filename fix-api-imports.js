const fs = require('fs');
const path = require('path');

// Directories to search for files with import issues
const directories = [
  path.join(__dirname, 'app/api/crayon-points'),
];

// Find all JS files recursively
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (/\.js$/.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fix imports for the players module
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Fix deep imports like ../../../../lib/db/players
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\/db\/players['"]/g, 
    `from '@/lib/db/players'`);
  
  // Fix three-level imports like ../../../lib/db/players
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/lib\/db\/players['"]/g, 
    `from '@/lib/db/players'`);
  
  // Only write to file if content changed
  if (content !== originalContent) {
    console.log(`Fixed player imports in: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Run the script
console.log('Fixing API import paths...');
let fixedCount = 0;

directories.forEach(dir => {
  const files = findFiles(dir);
  files.forEach(file => {
    if (fixImports(file)) {
      fixedCount++;
    }
  });
});

console.log(`Done! Fixed imports in ${fixedCount} API files.`); 