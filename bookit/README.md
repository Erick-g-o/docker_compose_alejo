# BookIt — Sistema de Reservas Inteligente

**BookIt** es una solución full-stack moderna diseñada para la gestión eficiente de citas y servicios. Con un diseño premium tipo SaaS y una arquitectura robusta basada en contenedores.

## 🚀 Inicio Rápido

Para ejecutar todo el sistema, simplemente corre el siguiente comando en la raíz del proyecto:

```bash
docker compose up -d
```

## 🛠️ Tecnologías
- **Frontend:** React + Vite (Nginx for production stage)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL 15
- **Icons:** Lucide-React
- **Alerts:** SweetAlert2

## 📦 Servicios Docker
1. **Frontend:** `usuario/bookit-frontend:latest` (Puerto 8080)
2. **Backend:** `usuario/bookit-backend:latest` (Puerto 3000)
3. **Database:** `postgres:15-alpine` (Puerto 5432)

## 🔗 URLs del Proyecto
- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend Health:** [http://localhost:3000/health](http://localhost:3000/health)
- **API Endpoints:**
  - `GET /services`: Lista servicios iniciales.
  - `GET /appointments`: Lista todas las citas.
  - `POST /appointments`: Crea una nueva reserva.
  - `PATCH /appointments/:id/status`: Actualiza el estado (PENDING, DONE, CANCELLED).
  - `DELETE /appointments/:id`: Elimina una reserva.

## 📐 Reglas de Negocio
- Estado inicial: `PENDING`.
- No se permiten campos vacíos.
- Un servicio es obligatorio para crear una cita.
- Una cita `CANCELLED` no puede pasar a `DONE`.
- Una cita `DONE` no puede pasar a `CANCELLED`.
