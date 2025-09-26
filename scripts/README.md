# Scripts de Release y Publicación

Este proyecto incluye varios scripts para facilitar el proceso de versionado y publicación a npm.

## 🚀 Scripts Principales

### Scripts de Release (Recomendados)

```bash
# Release con validaciones completas (Node.js)
npm run release:patch    # Incrementa patch (0.0.1 → 0.0.2)
npm run release:minor    # Incrementa minor (0.0.1 → 0.1.0)
npm run release:major    # Incrementa major (0.0.1 → 1.0.0)
npm run release:beta     # Release beta (patch + tag beta)

# Release de desarrollo (desde rama develop)
npm run release:develop  # Release desde develop con tag 'develop'
npm run release:dev      # Release patch desde develop
npm run release:develop-simple  # Script simple para develop

# Release simple (Bash)
npm run release:simple   # Ejecuta ./scripts/simple-release.sh patch latest
```

### Scripts de Publicación Básicos

```bash
# Publicación directa
npm run publish          # Build + publish a npm
npm run publish:beta     # Build + publish con tag beta
npm run publish:develop  # Build + publish con tag develop
npm run pre-release      # Alias para publish:beta
npm run post-release     # Alias para publish
npm run dev-release      # Alias para publish:develop

# Verificación antes de publicar
npm run publish:check    # Build + dry-run (ver qué se publicará)
npm run publish:dry-run  # Solo dry-run
```

## 🔧 Scripts de Desarrollo

### Para trabajar desde la rama `develop`:

```bash
# Cambiar a rama develop
git checkout develop

# Release de desarrollo (recomendado)
npm run release:develop  # Release completo desde develop

# Release simple de desarrollo
npm run release:develop-simple  # Script bash simple

# Solo publicar (sin versionar)
npm run publish:develop  # Build + publish con tag develop
npm run dev-release      # Alias para publish:develop
```

### Instalación de versiones de desarrollo:

```bash
# Instalar la última versión de desarrollo
npm install pudu-graph@develop

# Instalar una versión específica de desarrollo
npm install pudu-graph@0.0.1-develop.2024-09-25T02-30-15
```

### Scripts de Versionado Manual

```bash
# Solo incrementar versión (sin publicar)
npm run version:patch    # Incrementa patch
npm run version:minor    # Incrementa minor  
npm run version:major    # Incrementa major
```

## 📋 Scripts de Utilidad

```bash
# Limpieza
npm run clean           # Limpia dist y cache de vite
npm run clean:all       # Limpia todo (dist, node_modules, package-lock.json)
npm run reinstall       # Limpieza completa + reinstalación

# Desarrollo
npm run dev             # Modo desarrollo
npm run build           # Build completo
npm run preview         # Preview del build
```

## 🔧 Scripts Avanzados

### Script de Release Completo (`scripts/release.js`)

El script avanzado incluye:
- ✅ Validación de estado de Git
- ✅ Verificación de rama (main/master)
- ✅ Ejecución de tests (si existen)
- ✅ Build automático
- ✅ Creación de tags de Git
- ✅ Publicación a npm
- ✅ Push de cambios y tags

**Uso:**
```bash
# Básico
node scripts/release.js patch
node scripts/release.js minor
node scripts/release.js major

# Con tag específico
node scripts/release.js patch beta
node scripts/release.js minor alpha

# Con opciones
node scripts/release.js patch latest --skip-tests
node scripts/release.js minor beta --skip-git

# Ayuda
node scripts/release.js --help
```

### Script Simple (`scripts/simple-release.sh`)

Script bash más ligero para casos básicos:

```bash
# Uso directo
./scripts/simple-release.sh patch
./scripts/simple-release.sh minor latest
./scripts/simple-release.sh major beta

# Via npm
npm run release:simple
```

## 📦 Flujo de Trabajo Recomendado

### Para Releases Normales:
```bash
# 1. Verificar cambios
git status
git diff

# 2. Commit cambios
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Release automático
npm run release:patch  # o minor/major según corresponda
```

### Para Releases Beta:
```bash
# Release beta
npm run release:beta
# o
npm run pre-release
```

### Para Releases de Desarrollo:
```bash
# 1. Cambiar a rama develop
git checkout develop

# 2. Commit cambios
git add .
git commit -m "feat: nueva funcionalidad en desarrollo"

# 3. Release de desarrollo
npm run release:develop
# o
npm run release:develop-simple
```

### Para Publicación Manual:
```bash
# 1. Verificar qué se publicará
npm run publish:check

# 2. Publicar
npm run publish
```

## ⚠️ Requisitos Previos

1. **Estar logueado en npm:**
   ```bash
   npm login
   ```

2. **Estar en la rama principal:**
   ```bash
   git checkout main  # o master
   ```

3. **Sin cambios sin commitear:**
   ```bash
   git status  # Debe estar limpio
   ```

## 🎯 Ejemplos de Uso

### Release de Bug Fix:
```bash
npm run release:patch
```

### Release de Nueva Funcionalidad:
```bash
npm run release:minor
```

### Release de Cambio Breaking:
```bash
npm run release:major
```

### Release Beta para Testing:
```bash
npm run release:beta
```

### Verificar Antes de Publicar:
```bash
npm run publish:check
```

## 🔍 Troubleshooting

### Error: "No estás logueado en npm"
```bash
npm login
```

### Error: "Hay cambios sin commitear"
```bash
git add .
git commit -m "mensaje descriptivo"
```

### Error: "No estás en la rama principal"
```bash
git checkout main
```

### Limpiar y Reinstalar:
```bash
npm run clean:all
npm install
```
