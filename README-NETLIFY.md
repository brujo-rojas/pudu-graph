# Despliegue en Netlify

Este proyecto está configurado para desplegarse en Netlify con las siguientes configuraciones:

## 📁 Archivos de Configuración

### `netlify.toml`
- **Build Command**: `npm run netlify-build`
- **Publish Directory**: `dist`
- **Node Version**: 18
- **Redirects**: Configurados para SPA (Single Page Application)
- **Headers**: Seguridad y cache optimizado

### `.netlifyignore`
- Excluye archivos innecesarios del deploy
- Incluye archivos de desarrollo y dependencias

## 🚀 Pasos para Desplegar

### Opción 1: Desde el Dashboard de Netlify
1. Ve a [netlify.com](https://netlify.com)
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Build command**: `npm run netlify-build`
   - **Publish directory**: `dist`
   - **Node version**: 18

### Opción 2: Netlify CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

## ⚙️ Configuraciones Incluidas

### Build
- Compilación TypeScript
- Build de Vite optimizado
- Copia de assets estáticos
- Generación de tipos

### Headers de Seguridad
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Cache
- Assets estáticos: 1 año
- `pudu-graph.js`: Cache inmutable
- Archivos SVG: Cache optimizado

### Redirects
- SPA routing: Todas las rutas → `index.html`
- Status 200 para mantener URLs limpias

## 🔧 Variables de Entorno

Si necesitas variables de entorno, agrégalas en:
- Dashboard de Netlify → Site settings → Environment variables
- O en `netlify.toml` bajo `[build.environment]`

## 📊 Monitoreo

Netlify proporciona:
- Analytics de tráfico
- Logs de build
- Deploy previews
- Formularios (si se necesitan)

## 🆚 Comparación con Vercel

| Característica | Netlify | Vercel |
|----------------|---------|--------|
| Build Command | `npm run netlify-build` | `npm run vercel-build` |
| Config File | `netlify.toml` | `vercel.json` |
| Ignore File | `.netlifyignore` | `.vercelignore` |
| Functions | `netlify/functions` | `api/` |
| Edge Functions | ✅ | ✅ |

## 🐛 Troubleshooting

### Build Falla
1. Verifica Node.js version (18)
2. Revisa logs de build en Netlify
3. Prueba build local: `npm run netlify-build`

### 404 en Rutas
1. Verifica redirects en `netlify.toml`
2. Asegúrate de que `index.html` esté en `dist/`

### Assets No Cargan
1. Verifica paths en `public/index.html`
2. Revisa headers de cache
3. Confirma que archivos estén en `dist/`
