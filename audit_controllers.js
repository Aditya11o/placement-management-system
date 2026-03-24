const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'backend/controllers');

const auditFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const missingNext = [];

  lines.forEach((line, index) => {
    // Look for (req, res) => or function(req, res)
    if (line.includes('(req, res) =>') || line.includes('function(req, res)')) {
      // Check if it's NOT (req, res, next)
      if (!line.includes('next')) {
        missingNext.push({ line: index + 1, content: line.trim() });
      }
    }
  });

  return missingNext;
};

const controllers = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

controllers.forEach(controller => {
  const filePath = path.join(controllersDir, controller);
  const issues = auditFile(filePath);
  if (issues.length > 0) {
    console.log(`\nIssues in ${controller}:`);
    issues.forEach(issue => console.log(`  Line ${issue.line}: ${issue.content}`));
  }
});
