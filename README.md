# PALA - Ver Avisos UI

Bienvenido al repositorio del frontend de **Ver Avisos** para el sistema **PALA (Plataforma de Acceso Laboral para Alumnos)**. Este proyecto es una interfaz de usuario construida con Next.js y React que permite a los alumnos visualizar y postularse a ofertas laborales.

## Descripción

El módulo "Ver Avisos" es una aplicación web moderna que presenta un listado de oportunidades laborales. Los usuarios pueden:
*   Ver una lista de avisos disponibles.
*   Seleccionar un aviso para ver sus detalles completos.
*   Iniciar el proceso de postulación a un aviso.
*   Visualizar si su postulación fue exitosa o si requiere acciones adicionales (como subir un CV).

## Tecnologías Utilizadas

Este proyecto está construido sobre un stack tecnológico moderno enfocado en rendimiento y experiencia de desarrollador:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router, versión 14/15+)
*   **Librería UI:** [React](https://react.dev/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes Base:** [radix-ui](https://www.radix-ui.com/) y diseño inspirado en shadcn/ui.
*   **Iconografía:** [Lucide React](https://lucide.dev/)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu entorno local:

*   [Node.js](https://nodejs.org/es/) (versión 18 o superior recomendada).
*   **pnpm**: Este proyecto utiliza `pnpm` como gestor de paquetes (indicado por el archivo `pnpm-lock.yaml`). Puedes instalarlo globalmente con `npm install -g pnpm`.

## Instrucciones de Instalación y Ejecución

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local:

### 1. Clonar el repositorio y navegar a la carpeta

Si aún no lo has hecho, abre tu terminal y navega hasta el directorio del proyecto:

```bash
cd D:\PALASeminario\DiseñoPALA\ver-avisos-ui
```

### 2. Instalar las dependencias

Utiliza `pnpm` para instalar todas las dependencias necesarias definidas en el `package.json`:

```bash
pnpm install
```
*(Si prefieres usar npm, puedes ejecutar `npm install`, pero se recomienda pnpm para respetar el lockfile del proyecto).*

### 3. Iniciar el servidor de desarrollo

Una vez instaladas las dependencias, inicia el servidor de desarrollo de Next.js:

```bash
pnpm dev
```
*(O `npm run dev` si usaste npm).*

### 4. Abrir la aplicación

Abre tu navegador web y visita la siguiente dirección:

[http://localhost:3000](http://localhost:3000)

Deberías ver la interfaz de "Ver Avisos" cargada y lista para interactuar.

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

*   `pnpm dev`: Inicia la aplicación en modo desarrollo.
*   `pnpm build`: Construye la aplicación optimizada para producción en la carpeta `.next`.
*   `pnpm start`: Inicia el servidor de Next.js utilizando la versión de producción previamente construida (requiere ejecutar `build` antes).
*   `pnpm lint`: Ejecuta ESLint para analizar el código en busca de problemas.

## Estructura del Proyecto

*   `/app`: Contiene las rutas y páginas de la aplicación según el App Router de Next.js (por ejemplo, `page.tsx` es la vista principal).
*   `/components`: Componentes reutilizables de UI (tarjetas, botones, alertas).
*   `/data`: Archivos con datos simulados (mocks) utilizados para la interfaz, como `avisos-mock.ts`.
*   `/lib` y `/hooks`: Utilidades generales y hooks personalizados.
*   `/public`: Archivos estáticos como imágenes y fuentes.
