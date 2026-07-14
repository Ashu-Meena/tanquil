const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'src'));
let modifiedCount = 0;

files.forEach(file => {
  const original = fs.readFileSync(file, 'utf8');
  let content = original;
  
  content = content.replace(/â€”/g, '—');
  content = content.replace(/â€“/g, '–');
  content = content.replace(/Â·/g, '·');
  content = content.replace(/â†’/g, '→');
  content = content.replace(/â‚¹/g, '₹');
  content = content.replace(/â€™/g, '’');
  content = content.replace(/â€œ/g, '“');
  content = content.replace(/â€\x9D/g, '”'); // using hex for right double quote to avoid parsing issues if any
  content = content.replace(/â€¦/g, '…');
  content = content.replace(/â”€/g, '─');

  // There is a case where 'â€' might just be matched if the rest wasn't grabbed. 
  // We'll also just replace 'â€' with '”' if it's left over.
  content = content.replace(/â€/g, '”');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
});

console.log('Fixed files:', modifiedCount);
