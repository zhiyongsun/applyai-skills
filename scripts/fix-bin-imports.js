#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const binFile = path.join(__dirname, '../dist/bin/applyai-skills.js');

if (!fs.existsSync(binFile)) {
  console.error('Error: bin file not found:', binFile);
  process.exit(1);
}

let content = fs.readFileSync(binFile, 'utf8');
// 将 ../src/index 替换为 ../index（编译后的路径）
content = content.replace(/require\(['"]\.\.\/src\/index['"]\)/g, "require('../index')");
content = content.replace(/from ['"]\.\.\/src\/index['"]/g, "from '../index'");
fs.writeFileSync(binFile, content, 'utf8');
console.log('✓ Fixed bin file imports');
