# [CASO] — PFC3 · PC2

Aplicación web para **[CASO]**: los usuarios se registran con un rol, registran [entidad principal], publican [entidad hija] con precio y stock, y generan [transacciones] con detalle. El administrador ve indicadores en vivo.

**Autor:** Rolando Roller V. — Proyecto Final de Carrera III, USIL.

## Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Presentación | Next.js 15 (App Router) + TypeScript + Tailwind CSS | Páginas renderizadas en el servidor, tipado estático y diseño responsive |
| Negocio | Zod + reglas puras (`src/lib/reglas.ts`) | Toda entrada se valida antes de llegar a la BD |
| Datos | Supabase: PostgreSQL + Auth (región São Paulo) | Modelo relacional con PK/FK y Row Level Security por rol |
| Pruebas | Vitest | Pruebas unitarias de las reglas de negocio |
| CI/CD | GitHub Actions + Vercel (región `gru1`, São Paulo) | Lint, tipos, pruebas, build y `npm audit` en cada push y PR |

## Estructura

```
src/
  app/              Capa de presentación (una carpeta por ruta)
  components/       UI reutilizable (Navbar, Formulario, Tabla, Estado vacío)
  lib/
    config.ts       Nombres del caso (actores, entidades, tablas)
    validaciones.ts Esquemas Zod
    reglas.ts       Reglas de negocio (total, stock)
    acciones/       Server actions (crear y editar en la BD)
    supabase/       Clientes de Supabase (navegador y servidor)
  middleware.ts     Protege las rutas según sesión y rol
supabase/
  schema.sql        Tablas, FK, índices, trigger y políticas RLS
  seed.sql          Datos de prueba
tests/              Pruebas unitarias e integración (Vitest)
```

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # completar con la URL y la anon key de Supabase
npm run dev                  # http://localhost:3000
```

Scripts: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

Base de datos: ejecutar `supabase/schema.sql` en el SQL Editor de Supabase, registrar los usuarios de prueba desde `/registro` y luego ejecutar `supabase/seed.sql`.

## Estrategia de ramas

- `main`: producción. Vercel despliega desde aquí.
- `develop`: integración.
- `feature/*`: una rama por historia de Jira (ej. `feature/auth-roles` → PC2-5).

Cada feature entra a `develop` por Pull Request con el CI en verde. Al cerrar el sprint, `develop` entra a `main` con un PR de release.

## Seguridad

- **Row Level Security** en todas las tablas: cada rol solo ve y modifica lo suyo.
- **Zod** valida toda entrada en el servidor.
- El **rol** se lee de la tabla `usuarios`, nunca del navegador. El rol admin no se puede elegir al registrarse.
- **Cabeceras HTTP**: CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y HSTS.
- **HTTPS** automático en Vercel, **`npm audit`** en el pipeline y **Dependabot** semanal (DevSecOps).
