const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

const replacements = [
  { regex: /\[#111111\]/g, to: 'rich-black' },
  { regex: /\[#111\]/g, to: 'rich-black' },
  { regex: /\[#C7A17A\]/g, to: 'gold' },
  { regex: /\[#FAF8F5\]/g, to: 'ivory' },
  { regex: /\[#EFEFEF\]/g, to: 'border-light' },
  { regex: /\[#E63946\]/g, to: 'sale' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      replacements.forEach(({ regex, to }) => {
        content = content.replace(regex, to);
      });
      
      if (content !== original) {
        console.log(`Updated ${fullPath}`);
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

console.log("Starting color refactor...");
processDirectory(srcDir);
console.log("Done!");
