const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'src/lib/engines');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));

const importsMap = new Map();

for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    // Handle single and double quotes
    const importRegex = /from\s+['"](\.\/[^'"]+)['"]/g;
    let match;
    const imports = new Set();
    while ((match = importRegex.exec(content)) !== null) {
        let imp = match[1].replace(/^\.\//, '');
        if (!imp.endsWith('.ts')) imp += '.ts';
        imports.add(imp);
    }
    importsMap.set(file, imports);
}

const circularPairs = [];
for (const [file, imports] of importsMap.entries()) {
    for (const imported of imports) {
        if (importsMap.has(imported)) {
            if (importsMap.get(imported).has(file)) {
                if (file < imported) {
                    circularPairs.push(file + ' <-> ' + imported);
                }
            }
        }
    }
}
fs.writeFileSync('circular.txt', circularPairs.join('\n'));
console.log('Done script');
