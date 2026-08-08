 
   Output matches the final response. 
   [Done.] 
   *Output Generation* (matches the final response)
   `# applyai-skills`
   `[English](./README.md) | [中文](./README.zh.md)`
   `Una herramienta CLI para instalar paquetes de habilidades desde repositorios de GitHub. Descarga directorios específicos de repositorios de GitHub sin necesidad de clonar todo el repositorio.`
   `## Funcionalidades`
   `- 🚀 **Instalación fácil** - Instala habilidades directamente desde URLs de GitHub`
   `- 📦 **Descarga selectiva** - Descarga solo el directorio que necesitas, no todo el repositorio`
   `- 🔄 **Descarga recursiva** - Descarga automáticamente todos los archivos y subdirectorios`
   `- 📁 **Conservar estructura** - Mantiene la estructura original del directorio`
   `- ✨ **Seguridad de tipos** - Construido con TypeScript para mayor fiabilidad`
   `- 🎨 **Fácil de usar** - Mensajes de error claros e indicadores de progreso`
   ... (and so on)
   All constraints met. Proceeds. 
   [Final Check of the Prompt]: "Preserve Markdown, code blocks, commands, identifiers, image targets, and link targets exactly. Output only the translated README text."
   I will ensure absolutely no extra text is included.
   Ready. 
   [Output Generation] -> *Proceeds.*
</think>

# applyai-skills

[English](./README.md) | [中文](./README.zh.md)

Una herramienta CLI para instalar paquetes de habilidades desde repositorios de GitHub. Descarga directorios específicos de repositorios de GitHub sin necesidad de clonar todo el repositorio.

## Funcionalidades

- 🚀 **Instalación fácil** - Instala habilidades directamente desde URLs de GitHub
- 📦 **Descarga selectiva** - Descarga solo el directorio que necesitas, no todo el repositorio
- 🔄 **Descarga recursiva** - Descarga automáticamente todos los archivos y subdirectorios
- 📁 **Conservar estructura** - Mantiene la estructura original del directorio
- ✨ **Seguridad de tipos** - Construido con TypeScript para mayor fiabilidad
- 🎨 **Fácil de usar** - Mensajes de error claros e indicadores de progreso

## Instalación

### Como usuario

¡No es necesaria ninguna instalación! Usa `npx` para ejecutar directamente:

```bash
npx applyai-skills install <github-url>
```

### Como desarrollador

```bash
npm install
```

## Uso

### Uso básico

```bash
npx applyai-skills install <github-url>
```

### Ejemplo

```bash
npx applyai-skills install https://github.com/01000001-01001110/agent-jira-skills/tree/main/jira-safe/jira-workflow
```

Esto descargará todos los archivos del directorio de GitHub especificado al directorio actual y creará una carpeta llamada `jira-workflow` (usando el último nombre de directorio de la URL).

### Formatos de URL admitidos

- `https://github.com/owner/repo/tree/branch/path/to/directory`
- `https://github.com/owner/repo/blob/branch/path/to/file`
- Compatible con los protocolos `http` y `https`
- Funciona con cualquier nombre de rama (`main`, `master`, `develop`, etc.)

## Desarrollo

### Prerrequisitos

- Node.js >= 14.0.0
- npm >= 6.0.0

### Configuración

```bash
# Clona el repositorio
git clone <repository-url>
cd applyai-skills

# Instalar dependencias
npm install

# Compilar código TypeScript
npm run build
```

### Scripts disponibles

```bash
# Compilar el proyecto
npm run build

# Ejecutar pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Generar informe de cobertura de pruebas
npm run test:coverage

# Vincular localmente para pruebas
npm link
```

### Estructura del proyecto

```
applyai-skills/
├── bin/
│   └── applyai-skills.ts      # Punto de entrada CLI
├── src/
│   ├── index.ts               # Lógica principal
│   ├── downloader.ts          # Módulo de descarga de GitHub
│   ├── utils.ts               # Funciones utilitarias
│   └── *.test.ts              # Archivos de prueba
├── scripts/
│   └── fix-bin-imports.js      # Script de posprocesamiento de compilación
├── tsconfig.json              # Configuración de TypeScript
└── jest.config.js              # Configuración de pruebas de Jest
```

## Publicación

### Opción 1: Publicar en npm (Producción)

```bash
# 1. Compilar el proyecto
npm run build

# 2. Publicar en npm
npm publish
```

Después de publicar, los usuarios pueden usarla directamente:

```bash
npx applyai-skills install <github-url>
```

### Opción 2: Desarrollo local (No se requiere publicación)

```bash
# 1. Compilar el proyecto
npm run build

# 2. Crear enlace simbólico global
npm link

# 3. Usar desde cualquier directorio
npx applyai-skills install <github-url>
```

## Cómo funciona

1. **Análisis de URL**: Extrae la información del repositorio (propietario, repositorio, rama, ruta) de la URL de GitHub
2. **Extracción del nombre del directorio**: Utiliza el último nombre de directorio de la ruta de la URL como el nombre de la carpeta de destino
3. **Llamada a la API de GitHub**: Utiliza la API REST de GitHub para obtener el contenido del directorio
4. **Descarga recursiva**: Descarga archivos y procesa subdirectorios de forma recursiva
5. **Sistema de archivos**: Guarda los archivos en el directorio de trabajo actual, preservando la estructura original

Para obtener documentación técnica detallada, consulta [PRINCIPLE.md](./PRINCIPLE.md).

## Manejo de errores

La herramienta maneja diversos escenarios de error:

- **Formato de URL no válido**: Valida la estructura de la URL de GitHub
- **Directorio no encontrado**: Maneja errores 404 de la API de GitHub
- **Límites de velocidad**: Detecta y reporta problemas de límites de la API
- **Errores de red**: Maneja fallos de conexión de forma eficiente
- **Errores del sistema de archivos**: Evita sobrescribir directorios existentes
- **Errores de permisos**: Informa sobre problemas de permisos del sistema de archivos

## Casos de uso

### Instalar un paquete de habilidades

```bash
npx applyai-skills install https://github.com/owner/repo/tree/main/path/to/skill
```

### Instalación en lote

```bash
# Crear un archivo con URLs
cat > skills.txt << EOF
https://github.com/owner/repo1/tree/main/skill1
https://github.com/owner/repo2/tree/main/skill2
EOF

# Instalar todas las habilidades
while read url; do
  npx applyai-skills install "$url"
done < skills.txt
```

### Integración con CI/CD

```yaml
# Ejemplo de GitHub Actions
- name: Instalar habilidades
  run: |
    npx applyai-skills install ${{ secrets.SKILL_URL }}
```

## Pruebas

El proyecto incluye una cobertura de pruebas exhaustiva:

- **Pruebas unitarias**: Prueba funciones y módulos individuales
- **Pruebas de integración**: Prueba el flujo de trabajo de descarga completo
- **Pruebas de manejo de errores**: Verifica que los escenarios de error se manejen correctamente

Ejecuta las pruebas con:

```bash
npm test
```

## Pila tecnológica

- **TypeScript** - JavaScript con seguridad de tipos
- **Node.js** - Entorno de ejecución
- **Commander.js** - Framework CLI
- **Axios** - Cliente HTTP para llamadas a la API
- **fs-extra** - Operaciones mejoradas del sistema de archivos
- **Jest** - Framework de pruebas
- **Chalk** - Estilizado de cadenas en terminal

## Contribuir

¡Las contribuciones son bienvenidas! No dudes en enviar una Pull Request.

1. Bifurca (fork) el repositorio
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Confirma tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Envía los cambios a la rama (`git push origin feature/AmazingFeature`)
5. Abre una Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo LICENSE para más detalles.

## Soporte

Si encuentras algún problema o tienes preguntas, por favor abre un issue en GitHub.

## Agradecimientos

- Construido con ❤️ usando TypeScript
- Inspirado por la necesidad de descargas selectivas de directorios de GitHub
