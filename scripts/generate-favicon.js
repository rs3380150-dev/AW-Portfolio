const fs = require('fs');
const path = require('path');

const srcFile = 'C:/Users/sahib/.gemini/antigravity/brain/f99fb7af-1040-4a32-9b99-d542a903af41/.user_uploaded/media_1789318786293.png';
const publicDir = 'd:/OLD WINDOW BACKUP/C drive data backup/window_user_lenovo_onedrive/OneDrive/Documents/Nova Pulse/frontend/public';

const buffer = fs.readFileSync(srcFile);
const base64 = buffer.toString('base64');

// High precision SVG embedding the full-resolution PNG
// Image is 1024 x 558. Placing on 1024 x 1024 black square canvas.
// y-offset = (1024 - 558) / 2 = 233
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  <rect width="1024" height="1024" fill="#000000"/>
  <image href="data:image/png;base64,${base64}" x="0" y="233" width="1024" height="558" preserveAspectRatio="xMidYMid meet" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;"/>
</svg>
`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
fs.copyFileSync(srcFile, path.join(publicDir, 'favicon.png'));
fs.copyFileSync(srcFile, path.join(publicDir, 'apple-touch-icon.png'));

console.log('Successfully created favicon.svg and favicon.png');
