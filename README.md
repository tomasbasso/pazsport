# Paz Sport - E-commerce de Indumentaria Deportiva 🛍️

<div align="center">
  <img src="https://pazsport.vercel.app/logo.png" alt="Paz Sport Logo" width="200" />
  <br />
  <br />
  <a href="https://pazsport.vercel.app/"><strong>Ver Demo en Vivo »</strong></a>
</div>

---

## 📌 Sobre el Proyecto

**Paz Sport** es una plataforma de comercio electrónico diseñada para ofrecer una experiencia de compra rápida, minimalista y efectiva. El sistema prioriza la **conversión directa a través de WhatsApp**, permitiendo gestionar pedidos sin intermediarios ni comisiones de plataformas externas, ideal para un negocio local en crecimiento.

> *"Indumentaria deportiva premium diseñada para el máximo rendimiento y confort."*

## 🚀 Características Principales

*   **⚡ Ultra Rápido**: Construido con **Vite** para una carga instantánea y navegación fluida.
*   **📱 Mobile First**: Diseño totalmente responsivo, optimizado para la experiencia de compra en celulares.
*   **🛒 Carrito Persistente**: Gestión de estado global para una experiencia de usuario continua.
*   **💬 Checkout vía WhatsApp**: Generación automática de mensajes con el detalle del pedido listo para enviar.
*   **🔒 Seguridad Robusta**: Protección contra ataques (Helmet, Rate Limiting, CORS estricto) y manejo seguro de datos.
*   **🌍 SEO Local**: Optimización avanzada para motores de búsqueda, enfocado en "Winifreda, La Pampa" con datos estructurados (JSON-LD).
*   **🖼️ Administración**: Panel de control protegido para gestionar productos, precios y stock en tiempo real.

## 🛠️ Stack Tecnológico

El proyecto utiliza una arquitectura moderna separada en Frontend y Backend:

### Frontend (Cliente)
*   **React 18**: Biblioteca principal para la interfaz de usuario.
*   **Vite**: Build tool de última generación para desarrollo rápido.
*   **React Router**: Navegación SPA (Single Page Application).
*   **React Helmet Async**: Gestión dinámica de metadatos para SEO.
*   **CSS Modules / Modern CSS**: Estilos modulares y variables CSS para un diseño consistente.

### Backend (Servidor)
*   **Node.js & Express**: API RESTful escalable.
*   **PostgreSQL**: Base de datos relacional robusta (alojada en Supabase/Render).
*   **JWT**: Autenticación segura para el panel de administración.
*   **Multer**: Gestión de subida de imágenes optimizada.

## 📦 Instalación y Despliegue

### Requisitos Previos
*   Node.js v18+
*   PostgreSQL

### Configuración Local

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/tomasbasso/pazsport.git
    cd pazsport
    ```

2.  **Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Backend**
    ```bash
    cd backend
    npm install
    # Configurar .env con DATABASE_URL, JTW_SECRET, etc.
    npm run dev
    ```

## 🌐 Despliegue

*   **Frontend**: Desplegado automáticamente en [Vercel](https://vercel.com).
*   **Backend**: Alojado en [Render](https://render.com).
*   **Base de Datos**: PostgreSQL en la nube.

---

<div align="center">
  <p>Desarrollado con ❤️ por <strong>Tomas Basso</strong></p>
  <p><em>Técnico en Informática de Gestión</em></p>
</div>
