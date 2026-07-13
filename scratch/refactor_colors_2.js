const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

const replacements = [
  { regex: /\[#666666\]/g, to: 'neutral-500' },
  { regex: /\[#999999\]/g, to: 'neutral-400' },
  { regex: /\[#333333\]/g, to: 'neutral-800' },
  { regex: /\[#222222\]/g, to: 'neutral-900' },
  { regex: /\[#CDAA5D\]/g, to: 'gold' }
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

console.log("Starting color refactor part 2...");
processDirectory(srcDir);
console.log("Done!");
