const fs = require('fs');
const path = require('path');

const files = [
  'components/ui/GlassButton.tsx',
  'components/modals/OracleModal.tsx',
  'components/ui/FloatingToolbar.tsx',
  'components/modals/DiceModal.tsx',
  'components/ui/PageSettingsPanel.tsx'
];

files.forEach(f => {
  const filePath = path.join(__dirname, f);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // For GlassButton.tsx multiline
  content = content.replace(
    /borderTopWidth: 1,\s*borderBottomWidth: 1,\s*borderTopColor: topHighlight,\s*borderBottomColor: bottomHighlight,/g,
    `borderWidth: 1,
            borderTopColor: topHighlight,
            borderLeftColor: topHighlight,
            borderBottomColor: bottomHighlight,
            borderRightColor: bottomHighlight,`
  );

  // For the inline views
  content = content.replace(
    /borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: 'rgba\(255, 255, 255, 0\.25\)', borderBottomColor: 'rgba\(255, 255, 255, 0\.15\)'/g,
    "borderWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.25)', borderLeftColor: 'rgba(255, 255, 255, 0.25)', borderBottomColor: 'rgba(255, 255, 255, 0.15)', borderRightColor: 'rgba(255, 255, 255, 0.15)'"
  );

  fs.writeFileSync(filePath, content);
  console.log('Replaced in ' + f);
});
