# Universidad Digital

Bienvenido a Universidad Digital: una solución académica moderna diseñada para acelerar la gestión de estudiantes, docentes y datos administrativos en entornos universitarios.

## Por qué Universidad Digital

- Arquitectura profesional con **FastAPI + SQLAlchemy** en el backend.
- Frontend moderno con **React + Vite**, optimizado para experiencia rápida y fluida.
- Autenticación segura con **JWT + cookies HttpOnly**.
- Base de datos escalable en **PostgreSQL**.
- Preparado para despliegue en **Google Cloud Platform (GCP)**.

Esta plataforma está pensada para ser adoptada por equipos reales: fácil de instalar, simple de extender, y con un flujo de desarrollo alineado a buenas prácticas.

---

## Qué ofrece

- Gestión de usuarios y roles.
- Administración de asignaturas, períodos académicos y tareas.
- Inscripciones y calificaciones.
- API REST con documentación automática en `/docs`.
- Tests integrados para backend y frontend.
- Pipeline CI que valida código, tests y builds.

---

## Estructura del repositorio

```
/                    # raíz del repositorio
├─ backend/          # API FastAPI, modelos, servicios, pruebas
├─ frontend/         # SPA React, servicios, pruebas UI y E2E
├─ .github/workflows # integración continua
├─ docker-compose.yml# entorno local con Postgres + API + frontend
├─ render.yaml       # blueprint legado (no en uso para despliegue GCP)
├─ README.md         # documentación principal
└─ CONTRIBUTING.md   # guía de contribución
```

> Nota: la referencia a Render existe como histórico, pero el objetivo actual es desplegar en **GCP**.

---

## Requisitos de desarrollo

- Python 3.11
- Node.js 20
- PostgreSQL local o gestionado
- Docker y Docker Compose para desarrollo contenerizado

---

## Instalación local

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Variables recomendadas en desarrollo:

```powershell
set APP_ENV=development
set APP_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/universidad
set APP_CORS_ORIGINS=http://localhost:3000
```

Ejecuta el backend:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:3000`.

---

## Configuración de variables de entorno

### Frontend

Vite solo expone variables que empiezan con `VITE_`.

- `VITE_API_BASE_URL` — URL pública del backend en producción.

Ejemplo de `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend

El backend utiliza variables de entorno que pueden provenir de un `.env` o del entorno del sistema.

| Variable | Obligatoria en producción | Descripción |
|----------|---------------------------|-------------|
| `APP_ENV` | Recomendada | `production` activa seguridad y restricciones más estrictas. |
| `APP_DATABASE_URL` o `DATABASE_URL` | Sí | Cadena SQLAlchemy para PostgreSQL. Se normalizan `postgres://` y `postgresql://`. |
| `APP_JWT_SECRET` | Sí | Secreto para firmar JWT. Debe ser aleatorio y seguro. |
| `APP_CORS_ORIGINS` | Sí | Orígenes permitidos por CORS. Debe incluir el dominio del frontend. |
| `APP_JWT_EXPIRATION` | No | Minutos de vida del token JWT. Por defecto 60. |
| `APP_COOKIE_SECURE` | No | Si `production`, se fuerza cookie segura. |
| `APP_COOKIE_SAMESITE` | No | `lax`, `strict` o `none`. Si front/API son dominios distintos, use `none` y HTTPS. |
| `APP_DATABASE_SSL_MODE` | No | Util para conexiones remotas, por ejemplo `require`. |

> En producción, `APP_JWT_SECRET` y `APP_CORS_ORIGINS` son obligatorios. La aplicación no arranca sin ellos.

---

## Desarrollo con Docker Compose

El archivo `docker-compose.yml` permite levantar un entorno completo localmente:

- `db` — Postgres 16
- `api` — backend FastAPI
- `web` — frontend servido con nginx

```powershell
docker-compose up --build
```

Accede a:

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:8080`

---

## Testing

### Backend

```powershell
cd backend
pytest
```

### Frontend

```powershell
cd frontend
npm run test:run
```

### Pruebas E2E

```powershell
cd frontend
npm run e2e
```

---

## Pipeline CI/CD

La integración continua se gestiona con GitHub Actions en `.github/workflows/ci.yml`.

### Qué valida

- Backend:
  - Instala dependencias Python
  - Ejecuta linting con `flake8`
  - Corre `pytest`
  - Sube cobertura a Codecov
- Frontend:
  - Instala dependencias Node
  - Ejecuta `npm run test:run`
  - Construye el proyecto con `npm run build`
- Docker:
  - Construye imagen backend
  - Construye imagen frontend

### Estatus actual

El pipeline valida calidad y build, pero aún no realiza despliegue automático a GCP.

### Próximo paso recomendado

- Extender el pipeline para desplegar a **Cloud Run**.
- Usar **Cloud Build** para construir imágenes y publicar artefactos.
- Conectar la base de datos a **Cloud SQL**.

---

## Despliegue en Google Cloud Platform

Este proyecto está enfocado en GCP. La ruta ideal es:

1. Backend en **Cloud Run**.
2. Base de datos en **Cloud SQL (Postgres)**.
3. Frontend estático en **Cloud Storage + Cloud CDN**, o desplegado como aplicación separada.
4. Pipeline de despliegue con **Cloud Build** y/o GitHub Actions.

### Puntos críticos de configuración

- `VITE_API_BASE_URL` debe apuntar a la URL pública del backend.
- `APP_CORS_ORIGINS` debe incluir el origen del frontend.
- Usar HTTPS entre frontend y backend.
- Configurar acceso seguro a Cloud SQL mediante Cloud SQL Auth Proxy o SSL.

> Si la base de datos ya está conectada y funcionando en GCP, el siguiente paso es formalizar el pipeline de despliegue y documentar los secretos y variables de entorno de GCP.

---

## Arquitectura del backend

El backend está organizado por dominios y sigue el patrón:

- `core/` — configuración, base de datos y dependencias.
- `auth/` — autenticación, login/logout y JWT.
- `users/`, `roles/`, `subjects/`, `periods/`, `enrollments/`, `grades/`, `tasks/` — CRUD y lógica de negocio.
- `admin/` — endpoints administrativos.

Cada dominio incluye:

- `models.py`
- `schemas.py`
- `services.py`
- `routes.py`

La aplicación se inicializa desde `backend/app/main.py`.

---

## Arquitectura del frontend

El frontend está organizado en:

- `src/api/` — llamadas HTTP a la API.
- `src/services/` — lógica de negocio del cliente.
- `src/hooks/` — hooks reutilizables.
- `src/tests/` — pruebas unitarias.
- `cypress/` — pruebas E2E.

Utiliza Axios y la variable `VITE_API_BASE_URL` para comunicarse con el backend.

---

## Endpoints principales

El backend expone las siguientes rutas principales:

- `/auth`
- `/users`
- `/roles`
- `/subjects`
- `/periods`
- `/enrollments`
- `/grades`
- `/tasks`
- `/admin`



```
GET/POST    /users
GET/PUT     /users/{id}
DELETE      /users/{id}

GET/POST    /roles
GET/PUT     /roles/{id}
DELETE      /roles/{id}

GET/POST    /subjects
GET/PUT     /subjects/{id}
DELETE      /subjects/{id}

GET/POST    /periods
GET/PUT     /periods/{id}
DELETE      /periods/{id}

GET/POST    /enrollments
GET/PUT     /enrollments/{id}
DELETE      /enrollments/{id}

GET/POST    /grades
GET/PUT     /grades/{id}
DELETE      /grades/{id}
```


Para ver la documentación completa, accede a `/docs` cuando el backend esté en ejecución.

---

## Contribuir

Lee `CONTRIBUTING.md` para conocer el flujo de trabajo, la ejecución de pruebas y las reglas de calidad.

---

## Documentación adicional

- `backend/READMEv3.md`
- `frontend/README_FRONTEND.md`
- `TESTING_GUIDE.md`
- `execution_testing.md`
- `docker-compose.yml`
- `.github/workflows/ci.yml`
- `render.yaml`
