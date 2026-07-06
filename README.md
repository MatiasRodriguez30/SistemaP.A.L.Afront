# Sistema P.A.L.A - Frontend

Bienvenido al repositorio del frontend del **Sistema P.A.L.A (Plataforma de Acceso Laboral para Alumnos)**. Este proyecto es una interfaz de usuario moderna que permite a los alumnos interactuar con el sistema, visualizar ofertas laborales y gestionar sus postulaciones.

---

## 🚀 Tutorial Básico: Cómo correr el proyecto localmente

Para probar el frontend en tu computadora, sigue estos pasos básicos.

### Requisitos Previos
Asegúrate de tener instalado:
*   [Node.js](https://nodejs.org/es/) (versión 18 o superior).
*   **npm** (viene con Node.js).

### Pasos para iniciar el Frontend

1. **Clonar el repositorio y abrir la carpeta:**
   Abre una terminal y dirígete al directorio del proyecto:
   ```bash
   cd "SistemaP.A.L.A front"
   ```

2. **Instalar las dependencias:**
   Ejecuta el siguiente comando para descargar todas las librerías necesarias:
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Verifica si existe un archivo llamado `.env` en la raíz del proyecto. Este archivo contiene la URL de conexión al backend (API). Si no existe, puedes crearlo basándote en un `.env.example` o configurar la URL del backend (por ejemplo: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`).

4. **Iniciar el servidor de desarrollo:**
   Ejecuta el comando para levantar el frontend:
   ```bash
   npm run dev
   ```

5. **Abrir la aplicación:**
   Abre tu navegador y entra a: [http://localhost:3000](http://localhost:3000)

> [!NOTE]
> **Sobre el Backend:** Para que el sistema funcione completamente (login, obtener avisos reales, etc.), necesitas tener corriendo también el proyecto Backend localmente. El frontend se conectará al backend mediante peticiones HTTP a la URL definida en tu archivo `.env`.

---

## 📖 De qué trata el proyecto

El frontend del Sistema P.A.L.A está diseñado para ofrecer una experiencia fluida y moderna a los alumnos que buscan oportunidades laborales. 
A través de esta plataforma, los usuarios pueden:
*   **Ver Avisos:** Explorar un listado de oportunidades laborales disponibles.
*   **Detalles del Aviso:** Seleccionar un aviso específico para leer todos los requisitos y descripciones.
*   **Postulaciones:** Iniciar el proceso de postulación a los avisos que les interesen.
*   **Seguimiento:** (Si aplica) Ver el estado de sus postulaciones o completar información adicional.

---

## 🔌 Cómo se conecta (Arquitectura)

Este proyecto (Frontend) funciona como una aplicación Cliente separada del Servidor (Backend).
*   **Comunicación:** El frontend se comunica con el backend a través de una **API REST**.
*   **Peticiones:** Utiliza funciones fetch o librerías de estado para hacer peticiones HTTP (GET, POST, PUT, DELETE) hacia los endpoints del backend.
*   **Variables de Entorno:** La dirección base del backend se configura mediante un archivo `.env` para facilitar el cambio entre entornos (desarrollo local vs producción).

---

## 🛠 Tecnologías Utilizadas

Este proyecto utiliza un stack moderno y eficiente basado en el ecosistema de JavaScript/TypeScript:

*   **Framework Principal:** [Next.js](https://nextjs.org/) (Versión 14/15+ con App Router)
*   **Librería de UI:** [React 19](https://react.dev/)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) para un tipado estricto y seguro.
*   **Estilos y Diseño:** 
    *   [Tailwind CSS v4](https://tailwindcss.com/) para estilos utilitarios rápidos y responsivos.
    *   Componentes base de [Radix UI](https://www.radix-ui.com/) y animaciones.
*   **Manejo de Formularios:** `react-hook-form` y validación con `zod`.
*   **Paquetería:** `npm` (Configurado como gestor principal).

---

## 📂 Estructura del Proyecto

*   `/app`: Contiene las rutas principales de la aplicación gracias al App Router de Next.js (ej. `page.tsx`, `layout.tsx`).
*   `/components`: Componentes visuales reutilizables (botones, modales, tarjetas).
*   `/lib` / `/hooks`: Funciones de utilidad y hooks de React personalizados.
*   `/public`: Recursos estáticos como imágenes o logos.
*   `/types`: Definiciones de tipos e interfaces de TypeScript compartidos.
