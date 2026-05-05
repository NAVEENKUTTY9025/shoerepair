const fs = require('fs');
const path = require('path');

const files = [
  'service.html',
  'service-details.html',
  'pricing.html',
  'index.html',
  'home2.html',
  'gallery.html',
  'contact.html',
  'blog.html',
  'blog-details.html',
  'about.html'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. :root variables
  content = content.replace(/--navbar-bg:\s*#111111;/g, '--navbar-bg: #FFFFFF;\n            --navbar-text: #111111;');

  // 2. dark mode variables
  // Find the dark mode navbar-bg line and add navbar-text below it
  content = content.replace(/(--navbar-bg:\s*#0A0A0A;)/g, '$1\n            --navbar-text: #FFFFFF;');

  // 3. colors in various classes
  // We need to replace color: var(--white); with color: var(--navbar-text); in specific selectors
  // Since parsing CSS is hard, we can use regex targeting specific blocks

  const replacements = [
    { regex: /\.nav-link\s*{[\s\S]*?color:\s*var\(--white\);/g },
    { regex: /\.dropdown-item\s*{[\s\S]*?color:\s*var\(--white\);/g },
    { regex: /\.theme-toggle,\s*\.rtl-toggle\s*{[\s\S]*?color:\s*var\(--white\);/g },
    { regex: /\.mobile-menu-btn\s*{[\s\S]*?color:\s*var\(--white\);/g },
    { regex: /\.mobile-theme-toggle,\s*\.mobile-rtl-toggle\s*{[\s\S]*?color:\s*var\(--white\);/g },
    { regex: /\.mobile-close-btn\s*{[\s\S]*?color:\s*var\(--white\);/g },
    { regex: /\.mobile-nav-link\s*{[\s\S]*?color:\s*var\(--white\);/g },
    { regex: /\.btn-outline\s*{[\s\S]*?color:\s*var\(--white\);/g }
  ];

  for (const rep of replacements) {
    content = content.replace(rep.regex, match => match.replace('var(--white)', 'var(--navbar-text)'));
  }

  // Also replace `.logo-icon i` color from white to navbar-text? 
  // No, the logo is secondary color usually. The icon inside is white. If the navbar bg is white, the white icon on secondary bg is still fine.
  
  // 4. White logo in dark mode
  // The user asked to use a white logo in dark mode.
  // We can just append a rule to the CSS.
  // Find `</style>` and inject the dark mode logo overrides before it.
  if (!content.includes('/* Dark Mode Logo Overrides */')) {
    const darkModeLogoCSS = `
        /* Dark Mode Logo Overrides */
        [data-theme="dark"] .navbar .logo-text,
        [data-theme="dark"] .navbar .logo-text span {
            color: var(--white);
        }
        [data-theme="dark"] .navbar .logo-icon {
            background-color: var(--white);
        }
        [data-theme="dark"] .navbar .logo-icon i {
            color: #000000;
        }
    `;
    content = content.replace('</style>', darkModeLogoCSS + '</style>');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
