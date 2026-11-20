# PataLimpia — Mascotas y salubridad en Lima Norte

Aplicación web donde los vecinos de **Los Olivos, Comas, San Martín de Porres e Independencia** reportan puntos críticos (heces, orina, mascota suelta) con foto y ubicación, y registran a sus mascotas. El **fiscalizador** municipal atiende los reportes de SU distrito y registra sanciones. El **administrador** ve indicadores por distrito.

**Autor:** Rolando Roller V. — Proyecto Final de Carrera III, USIL.

## Roles

| Rol | Qué hace |
|---|---|
| Vecino | Registra mascotas, crea reportes con foto y ve el estado de los suyos |
| Fiscalizador | Atiende los reportes de su distrito y registra sanciones |
| Administrador | Ve indicadores por distrito (no se elige al registrarse; se asigna por SQL) |

## Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Presentación | Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 | Páginas en el servidor, tipado estático y diseño mobile-first |
| Negocio | Zod + reglas puras (`src/lib/reglas.ts`) | Toda entrada se valida antes de llegar a la BD |
| Datos | Supabase: PostgreSQL + Auth + Storage | Modelo relacional con Row Level Security por rol y bucket de fotos |
| Pruebas | Vitest | Pruebas unitarias e integración |
| CI/CD | GitHub Actions + Vercel (región `gru1`, São Paulo) | Lint, tipos, pruebas, build y `npm audit` en cada push y PR |

## Estructura

```
src/
  app/              Capa de presentación (una carpeta por ruta)
  components/       UI reutilizable (Navbar, Formulario, Tabla, Estado vacío)
  lib/
    config.ts       Textos, roles, distritos, tipos y estados
    validaciones.ts Esquemas Zod
    reglas.ts       Reglas de negocio puras
    acciones/       Server actions (escriben en la BD)
    supabase/       Clientes de Supabase (navegador y servidor)
  middleware.ts     Protege las rutas según sesión y rol
supabase/
  schema.sql        Tablas, RLS, funciones (RPC) y bucket de fotos
  seed.sql          Datos de prueba
  reset.sql         Limpia la base para empezar de nuevo
tests/              Pruebas unitarias e integración (Vitest)
```

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # completar con la URL y la anon key de Supabase
npm run dev                  # http://localhost:3000
```

Scripts: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

Base de datos: ejecutar `supabase/schema.sql` en el SQL Editor de Supabase, registrar los usuarios de prueba desde `/registro` y luego ejecutar `supabase/seed.sql` (las instrucciones están al inicio del archivo).

## Despliegue (Vercel)

La app se despliega en Vercel desde la rama `main`, en la región `gru1` (São Paulo), igual que la base de datos (`vercel.json`). En *Project Settings → Environment Variables* se configuran, para Production, Preview y Development:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave `anon` pública de Supabase |

No se usa la clave `service_role`: la seguridad la da Row Level Security. Las fotos de los reportes se guardan en el bucket público `reportes` de Supabase Storage; la política de seguridad de contenido (CSP) solo permite imágenes propias, `blob:` (vista previa) y `*.supabase.co`.

## Estrategia de ramas

- `main`: producción. Vercel despliega desde aquí.
- `test`: integración y pruebas. Todo cambio pasa por aquí antes de `main`.
- `feature/PC2-xx-nombre`: una rama por historia de usuario de Jira.

Cada `feature/*` entra a `test` por Pull Request con el CI en verde. Al cerrar el sprint, `test` entra a `main` con un PR de release.

## Seguridad

- **Row Level Security** en todas las tablas: cada rol solo ve y modifica lo suyo; el fiscalizador solo ve su distrito.
- **Zod** valida toda entrada en el servidor.
- El **rol** se lee de la tabla `usuarios`, nunca del navegador. El rol admin no se puede elegir al registrarse.
- **Cabeceras HTTP**: CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y HSTS.
- **HTTPS** automático en Vercel y **Dependabot** semanal.
- **Pipeline de seguridad** (`.github/workflows/seguridad.yml`): **CodeQL** (análisis estático), **gitleaks** (busca claves o secretos en el código) y **`npm audit`**, con permisos mínimos (`contents: read`, `security-events: write`).
