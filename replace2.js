const fs = require('fs');
const path = require('path');

const files = [
  { name: 'components/ui/GlassButton.tsx', relative: './GlassHighlight' },
  { name: 'components/modals/OracleModal.tsx', relative: '../ui/GlassHighlight' },
  { name: 'components/ui/FloatingToolbar.tsx', relative: './GlassHighlight' },
  { name: 'components/modals/DiceModal.tsx', relative: '../ui/GlassHighlight' },
  { name: 'components/ui/PageSettingsPanel.tsx', relative: './GlassHighlight' }
];

files.forEach(f => {
  const filePath = path.join(__dirname, f.name);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (f.name.includes('GlassButton')) {
    content = content.replace(
      /<View\s*style=\{\[\s*StyleSheet\.absoluteFillObject,\s*\{\s*borderRadius,\s*borderWidth: 1,\s*borderTopColor: topHighlight,\s*borderLeftColor: topHighlight,\s*borderBottomColor: bottomHighlight,\s*borderRightColor: bottomHighlight,\s*\}\s*,?\s*\]\}\s*\/>/gs,
      `<GlassHighlight borderRadius={borderRadius} />`
    );
    content = content.replace(/  const topHighlight = [^\n]+\n/g, '');
    content = content.replace(/  const bottomHighlight = [^\n]+\n/g, '');
  } else {
    const rx = /<View style=\{\[StyleSheet\.absoluteFillObject, \{ borderRadius: ([^,]+), borderWidth: 1, borderTopColor: 'rgba\(255, 255, 255, 0\.25\)', borderLeftColor: 'rgba\(255, 255, 255, 0\.25\)', borderBottomColor: 'rgba\(255, 255, 255, 0\.15\)', borderRightColor: 'rgba\(255, 255, 255, 0\.15\)' \}\]} pointerEvents="none" \/>/g;
    content = content.replace(rx, `<GlassHighlight borderRadius={$1} />`);
  }

  if (content.includes('GlassHighlight') && !content.includes('import GlassHighlight')) {
    if (content.includes("import { BlurView } from 'expo-blur';")) {
      content = content.replace("import { BlurView } from 'expo-blur';", `import GlassHighlight from '${f.relative}';\nimport { BlurView } from 'expo-blur';`);
    } else if (content.includes("import { ColorScheme }")) {
      content = content.replace("import { ColorScheme }", `import GlassHighlight from '${f.relative}';\nimport { ColorScheme }`);
    }
  }

  fs.writeFileSync(filePath, content);
  console.log('Replaced in ' + f.name);
});
