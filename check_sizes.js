const fs = require('fs');
const path = require('path');

function getFiles(d) {
    let res = [];
    fs.readdirSync(d, { withFileTypes: true }).forEach(f => {
        let p = path.join(d, f.name);
        if (f.isDirectory()) {
            if (f.name !== 'node_modules') res = [...res, ...getFiles(p)];
        } else if (f.name.endsWith('.tsx')) {
            res.push({ path: p, size: fs.statSync(p).size });
        }
    });
    return res;
}

let files = getFiles('d:/Desktop/PMS/Placement Management System/frontend/src/pages');
files.sort((a, b) => b.size - a.size);
let output = files.slice(0, 15).map(f => f.path + ' - ' + Math.round(f.size / 1024) + 'KB').join('\n');
fs.writeFileSync('C:/Users/ADITYA HALDER/.gemini/antigravity/brain/0ce055eb-0c43-402d-a2b9-1508928a56f5/file_sizes.txt', output);
