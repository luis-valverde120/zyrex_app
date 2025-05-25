# Zyrex - Plataforma E-commerce para Artesanos de Tulcán

![Logo de Zyrex](ruta/a/tu/logo.png) Zyrex es una aplicación web de comercio electrónico diseñada para empoderar a los artesanos de Tulcán, Ecuador, proporcionándoles una plataforma digital para exhibir y vender sus creaciones únicas. El proyecto busca conectar el talento local con un público más amplio, gestionando inventario, compras y pedidos en línea.

## Tabla de Contenidos

- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Prerrequisitos](#prerrequisitos)
- [Configuración del Entorno Local](#configuración-del-entorno-local)
  - [Variables de Entorno](#variables-de-entorno)
  - [Base de Datos (PostgreSQL con Docker)](#base-de-datos-postgresql-con-docker)
  - [Instalación de Dependencias](#instalación-de-dependencias)
  - [Migraciones y Seed de Base de Datos](#migraciones-y-seed-de-base-de-datos)
- [Ejecutar el Proyecto](#ejecutar-el-proyecto)
- [Estructura del Proyecto (Resumen)](#estructura-del-proyecto-resumen)
- [Despliegue (Vercel)](#despliegue-vercel)
- [Equipo de Desarrollo](#equipo-de-desarrollo)
- [Futuras Mejoras](#futuras-mejoras)

## Características Principales

-   **Catálogo de Productos:** Visualización de artesanías con detalles, precios e imágenes.
-   **Paginación:** Navegación eficiente por el catálogo de productos.
-   **Búsqueda de Productos:** Funcionalidad de búsqueda en el catálogo por nombre y descripción.
-   **Registro y Autenticación de Usuarios:** Cuentas para Clientes y Artesanos con manejo de sesiones.
-   **Roles de Usuario:** Diferenciación entre Clientes, Artesanos y Administradores (futuro).
-   **Carrito de Compras:** Funcionalidad para agregar, ver (y futuramente actualizar/eliminar) productos del carrito (persistente en base de datos).
-   **Proceso de Checkout:** Formulario para datos de envío y simulación de finalización de compra.
-   **Gestión de Pedidos:** Creación de pedidos en la base de datos y páginas de confirmación e historial (Mis Pedidos).
-   **Panel de Inventario para Artesanos:** Vista donde los artesanos pueden ver sus productos (futuramente añadir, editar, eliminar).
-   **Interfaz Responsiva:** Desarrollada con EJS y Tailwind CSS.

## Tecnologías Utilizadas

-   **Backend:** Node.js, Express.js
-   **Lenguaje:** TypeScript
-   **Base de Datos:** PostgreSQL
-   **ORM:** Prisma
-   **Motor de Plantillas (SSR):** EJS (Embedded JavaScript Templating)
-   **CSS Framework:** Tailwind CSS (con proceso de build PostCSS)
-   **Manejo de Sesiones:** `express-session` con cookies.
-   **Hashing de Contraseñas:** `bcryptjs`
-   **Subida de Archivos:** Multer (para imágenes de productos)
-   **Logging HTTP:** Morgan
-   **CORS:** Módulo `cors` de Express
-   **Variables de Entorno:** `dotenv` (implícito o explícito)
-   **Ejecución Concurrente (Desarrollo):** `concurrently`
-   **Reinicio Automático del Servidor (Desarrollo):** `nodemon`
-   **Ejecución de TypeScript (Desarrollo):** `ts-node`

## Prerrequisitos

-   Node.js (v18.x o superior recomendado)
-   npm (v8.x o superior recomendado)
-   Docker y Docker Compose (para la base de datos PostgreSQL local)
-   Un editor de código (ej. VS Code)
-   Git

## Configuración del Entorno Local

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### 1. Clonar el Repositorio (Si aplica)

```bash
git clone <URL_DEL_REPOSITORIO_GIT>
cd zyrex # O el nombre de tu carpeta de proyecto