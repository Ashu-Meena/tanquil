const fs = require('fs');

const files = [
  'src/app/admin/(dashboard)/customers/page.tsx',
  'src/app/admin/(dashboard)/discounts/page.tsx',
  'src/app/admin/(dashboard)/inventory/page.tsx',
  'src/app/admin/(dashboard)/media/page.tsx',
  'src/app/admin/(dashboard)/products/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Just find useEffect(() => { fetch...
  const match = content.match(/\s*useEffect\(\(\) => \{ fetch[a-zA-Z0-9_]+\(\); \}, \[fetch[a-zA-Z0-9_]+\]\);/);
  if (match) {
    const effectStr = match[0];
    content = content.replace(effectStr, '');
    
    // Find the end of useCallback block for fetchXXX (with multiline 'm' flag)
    const fetchRegex = /const fetch[a-zA-Z0-9_]+ = useCallback\(async \(\) => \{[\s\S]*?^\s*\}, \[[^\]]*\]\);/m;
    const fetchMatch = content.match(fetchRegex);
    if (fetchMatch) {
      const fetchStr = fetchMatch[0];
      content = content.replace(fetchStr, fetchStr + '\n' + effectStr);
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
    } else {
      console.log('Could not find fetch block in', file);
    }
  } else {
      console.log('Could not find useEffect in', file);
  }
});
