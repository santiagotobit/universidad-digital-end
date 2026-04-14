# Guia de contribución

Gracias por ayudar a mejorar Universidad Digital. Esta guía explica cómo contribuir de forma consistente.

## Flujo de trabajo recomendado

1. Trabaja en una rama nueva basada en `main` o `develop`.
2. Usa un nombre de rama descriptivo, por ejemplo `feature/login-improvements` o `fix/backend-cors`.
3. Envía Pull Requests claros con el problema que resuelve, los cambios principales y los pasos para probar.

## Antes de crear un PR

- Asegúrate de que el backend y el frontend compilan y funcionan.
- Ejecuta los tests relevantes.
- Revisa las variables de entorno necesarias.
- Añade documentación si cambias configuración, scripts, despliegue o arquitectura.

## Backend

### Ejecutar tests

```bash
cd backend
pytest
```

### Linting

```bash
pip install flake8
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
```

## Frontend

### Ejecutar tests unitarios

```bash
cd frontend
npm run test:run
```

### Ejecutar pruebas E2E

```bash
cd frontend
npm run e2e
```

## CI/CD actual

La integración continua actual está en `.github/workflows/ci.yml`.

- El pipeline valida backend y frontend.
- Construye imágenes Docker para backend y frontend.
- No despliega automáticamente a producción.

## Cómo documentar cambios

- Si añades un endpoint, actualiza `README.md` y la documentación OpenAPI en `/docs`.
- Si modificas variables de entorno, agrega el cambio a `README.md`.
- Si cambias despliegue o Docker, documenta el nuevo flujo y la configuración en `README.md`.

## Recomendaciones de calidad

- Escribe tests para funcionalidad nueva o cambios críticos.
- No ignores errores de lint.
- Mantén el código modular y de fácil lectura.
- Usa nombres descriptivos en funciones y variables.

## Dependencias

- Backend: `backend/requirements.txt`
- Frontend: `frontend/package.json`

## Checklist para PRs

- [ ] `pytest` pasa en backend
- [ ] `npm run test:run` pasa en frontend
- [ ] El frontend compila (`npm run build`)
- [ ] Cambios documentados en `README.md` o `CONTRIBUTING.md`
- [ ] No se suben secretos ni archivos de entorno
- [ ] Si hay cambios en Docker o despliegue, se añade explicación clara
