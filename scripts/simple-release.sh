#!/bin/bash

# Script simple para versionar y publicar
# Uso: ./scripts/simple-release.sh [patch|minor|major] [beta|latest]

set -e

TYPE=${1:-patch}
TAG=${2:-latest}

echo "🚀 Iniciando release simple..."
echo "📋 Tipo: $TYPE"
echo "🏷️  Tag: $TAG"

# Verificar que estamos en la rama correcta
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo "⚠️  Estás en la rama '$CURRENT_BRANCH', no en main/master"
    echo "💡 Cambia a la rama principal antes de hacer release."
    exit 1
fi

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

# Versionar
echo "📦 Incrementando versión $TYPE..."
npm version $TYPE --no-git-tag-version

# Obtener nueva versión
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ Versión actualizada a: $NEW_VERSION"

# Commit y tag
echo "🏷️  Creando commit y tag..."
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"
git tag "v$NEW_VERSION"

# Publicar
echo "📤 Publicando a npm..."
npm publish --tag $TAG

# Push
echo "🚀 Enviando a Git..."
git push origin HEAD
git push origin --tags

echo ""
echo "🎉 ¡Release completado exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Versión: $NEW_VERSION"
echo "🏷️  Tag: v$NEW_VERSION"
echo "📤 NPM Tag: $TAG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
