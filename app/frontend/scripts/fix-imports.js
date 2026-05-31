const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('[...nextauth]/route')) {
        console.log(`Fixing imports in: ${fullPath}`);
        // Thay thế cả dạng nháy đơn và nháy kép
        content = content.replace(/\[\.\.\.nextauth\]\/route/g, '[...nextauth]/options');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

console.log(`Starting to replace NextAuth imports in ${srcDir}...`);
walk(srcDir);
console.log('Finished fixing imports!');
