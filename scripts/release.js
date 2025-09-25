#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

function exec(command, options = {}) {
  try {
    console.log(`\n🔧 Ejecutando: ${command}`);
    const result = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
    return result;
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function checkGitStatus(allowDevelop = false) {
  console.log('\n📋 Verificando estado de Git...');
  
  try {
    // Verificar si hay cambios sin commitear
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('⚠️  Hay cambios sin commitear:');
      console.log(status);
      console.log('💡 Por favor, commitea o descarta los cambios antes de hacer release.');
      process.exit(1);
    }
    
    // Verificar si estamos en una rama válida
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const validBranches = ['main', 'master'];
    
    if (allowDevelop) {
      validBranches.push('develop');
    }
    
    if (!validBranches.includes(branch)) {
      console.log(`⚠️  Estás en la rama '${branch}', no en una rama válida para release`);
      console.log(`💡 Ramas válidas: ${validBranches.join(', ')}`);
      if (allowDevelop) {
        console.log('💡 Para publicar desde develop, usa: npm run release:develop');
      }
      process.exit(1);
    }
    
    console.log(`✅ Estado de Git OK - Rama: ${branch}`);
    return branch;
  } catch (error) {
    console.error('❌ Error verificando Git:', error.message);
    process.exit(1);
  }
}

function runTests() {
  console.log('\n🧪 Ejecutando tests...');
  try {
    exec('npm test');
    console.log('✅ Tests pasaron');
  } catch (error) {
    console.log('⚠️  No hay tests configurados o fallaron');
    console.log('💡 Considera agregar tests antes de hacer release');
  }
}

function build() {
  console.log('\n🏗️  Construyendo el proyecto...');
  exec('npm run build');
  console.log('✅ Build completado');
}

function version(type, isDevelop = false) {
  console.log(`\n📦 Incrementando versión ${type}...`);
  
  const validTypes = ['patch', 'minor', 'major'];
  if (!validTypes.includes(type)) {
    console.error(`❌ Tipo de versión inválido: ${type}`);
    console.error(`💡 Tipos válidos: ${validTypes.join(', ')}`);
    process.exit(1);
  }
  
  if (isDevelop) {
    // Para develop, usar pre-release versioning
    const currentVersion = packageJson.version;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const developVersion = `${currentVersion}-develop.${timestamp}`;
    
    // Actualizar package.json directamente
    const newPackageJson = { ...packageJson, version: developVersion };
    writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2) + '\n');
    
    console.log(`✅ Versión de desarrollo actualizada a: ${developVersion}`);
    return developVersion;
  } else {
    exec(`npm version ${type} --no-git-tag-version`);
    
    // Leer la nueva versión
    const newPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    console.log(`✅ Versión actualizada a: ${newPackageJson.version}`);
    
    return newPackageJson.version;
  }
}

function createGitTag(version) {
  console.log(`\n🏷️  Creando tag de Git: v${version}`);
  exec(`git add package.json`);
  exec(`git commit -m "chore: bump version to ${version}"`);
  exec(`git tag v${version}`);
  console.log(`✅ Tag v${version} creado`);
}

function publishToNpm(tag = 'latest', isDevelop = false) {
  console.log(`\n📤 Publicando a npm con tag: ${tag}`);
  
  // Verificar si estamos logueados en npm
  try {
    execSync('npm whoami', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ No estás logueado en npm');
    console.error('💡 Ejecuta: npm login');
    process.exit(1);
  }
  
  if (isDevelop) {
    console.log('🔧 Publicando versión de desarrollo...');
    exec(`npm publish --tag develop`);
    console.log(`✅ Publicado exitosamente con tag: develop`);
  } else {
    exec(`npm publish --tag ${tag}`);
    console.log(`✅ Publicado exitosamente con tag: ${tag}`);
  }
}

function pushToGit() {
  console.log('\n🚀 Enviando cambios a Git...');
  exec('git push origin HEAD');
  exec('git push origin --tags');
  console.log('✅ Cambios enviados a Git');
}

function showReleaseSummary(version, tag) {
  console.log('\n🎉 ¡Release completado exitosamente!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 Versión: ${version}`);
  console.log(`🏷️  Tag: v${version}`);
  console.log(`📤 NPM Tag: ${tag}`);
  console.log(`🔗 NPM: https://www.npmjs.com/package/${packageJson.name}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Función principal
function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  const tag = args[1] || 'latest';
  const skipTests = args.includes('--skip-tests');
  const skipGit = args.includes('--skip-git');
  const isDevelop = args.includes('--develop') || args[0] === 'develop';
  
  console.log('🚀 Iniciando proceso de release...');
  console.log(`📋 Tipo: ${type}`);
  console.log(`🏷️  Tag: ${tag}`);
  console.log(`🔧 Modo develop: ${isDevelop ? 'SÍ' : 'NO'}`);
  
  // Validaciones
  if (!skipGit) {
    const currentBranch = checkGitStatus(isDevelop);
    if (isDevelop && currentBranch !== 'develop') {
      console.log('⚠️  Para publicar desde develop, debes estar en la rama develop');
      process.exit(1);
    }
  }
  
  if (!skipTests) {
    runTests();
  }
  
  // Proceso de release
  build();
  const newVersion = version(type, isDevelop);
  
  if (!skipGit && !isDevelop) {
    createGitTag(newVersion);
  }
  
  publishToNpm(tag, isDevelop);
  
  if (!skipGit && !isDevelop) {
    pushToGit();
  }
  
  const finalTag = isDevelop ? 'develop' : tag;
  showReleaseSummary(newVersion, finalTag);
}

// Manejo de argumentos de ayuda
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📦 Script de Release para ${packageJson.name}

Uso:
  node scripts/release.js [tipo] [tag] [opciones]

Argumentos:
  tipo    Tipo de versión: patch, minor, major, develop (default: patch)
  tag     Tag de npm: latest, beta, alpha (default: latest)

Opciones:
  --skip-tests    Saltar ejecución de tests
  --skip-git      Saltar operaciones de Git
  --develop       Modo desarrollo (publica con tag 'develop')
  --help, -h      Mostrar esta ayuda

Ejemplos:
  # Releases normales (desde main/master)
  node scripts/release.js patch
  node scripts/release.js minor beta
  node scripts/release.js major --skip-tests
  
  # Releases de desarrollo (desde develop)
  node scripts/release.js develop
  node scripts/release.js patch --develop
  
  # Otros ejemplos
  node scripts/release.js patch latest --skip-git
`);
  process.exit(0);
}

main();
