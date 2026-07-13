const fs = require('fs');
function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  let p = 0, b = 0, line = 1, lastP = [], lastB = [];
  let inString = false, inStringChar = '';
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (c === '\n') line++;
    if (!inString && (c === '"' || c === "'" || c === "`")) { inString = true; inStringChar = c; continue; }
    if (inString && c === inStringChar && content[i-1] !== '\\') { inString = false; continue; }
    if (inString) continue;
    
    if (c === '(') { p++; lastP.push(line); }
    else if (c === ')') { p--; lastP.pop(); }
    else if (c === '{') { b++; lastB.push(line); }
    else if (c === '}') { b--; lastB.pop(); }
  }
  console.log(`${file}: Unclosed parens at lines: ${lastP.join(', ')}`);
  console.log(`${file}: Unclosed braces at lines: ${lastB.join(', ')}`);
}
checkFile('src/app/demo/advanced/page.tsx');
checkFile('src/app/demo/enterprise/page.tsx');
