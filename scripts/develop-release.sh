#!/bin/bash

# Script simple para publicar desde la rama develop
# Uso: ./scripts/develop-release.sh

set -e

echo "🔧 Iniciando release de desarrollo desde rama develop..."

# Verificar que estamos en la rama develop
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "develop" ]]; then
    echo "⚠️  Debes estar en la rama 'develop' para hacer release de desarrollo"
    echo "💡 Cambia a la rama develop: git checkout develop"
    exit 1
fi

echo "✅ Estás en la rama develop"

# Verificar que no hay cambios sin commitear
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Hay cambios sin commitear"
    echo "💡 Por favor, commitea o descarta los cambios antes de hacer release."
    exit 1
fi

echo "✅ Estado de Git OK"

# Build
echo "🏗️  Construyendo..."
npm run build

# Crear versión de desarrollo con timestamp
CURRENT_VERSION=$(node -p "require('./package.json').version")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S")
DEVELOP_VERSION="${CURRENT_VERSION}-develop.${TIMESTAMP}"

echo "📦 Creando versión de desarrollo: $DEVELOP_VERSION"

# Actualizar package.json con la nueva versión
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '$DEVELOP_VERSION';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

echo "✅ Versión actualizada a: $DEVELOP_VERSION"

# Publicar con tag develop
echo "📤 Publicando a npm con tag 'develop'..."
npm publish --tag develop

echo ""
echo "🎉 ¡Release de desarrollo completado exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Versión: $DEVELOP_VERSION"
echo "🏷️  Tag: develop"
echo "🔗 Instalar con: npm install pudu-graph@develop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
