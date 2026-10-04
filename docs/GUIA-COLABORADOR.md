# Guía para colaborar en Ca$erIA

Pasos para trabajar en el proyecto **Ca$erIA** con GitHub, Antigravity y Supabase. Van en orden, desde crear la cuenta de GitHub hasta tener todo listo.

- **Repositorio:** https://github.com/EduardoAEGES/caseria
- **Qué es:** una app web solo para celular (HTML, CSS y JavaScript puros, sin instalar dependencias) que compara precios de canastas en Paucarpata (Arequipa) y traza la ruta a la tienda.

---

## 1. Crear tu cuenta de GitHub

1. Entra a https://github.com/signup.
2. Escribe tu correo, una contraseña y un **nombre de usuario**. Ese usuario es el que le das al dueño del repo. Por ejemplo, en el perfil "proyectoconta (contatap2026)" el usuario es `contatap2026`.
3. Confirma el código que llega a tu correo.
4. **Recomendado:** activa la verificación en dos pasos en *Settings → Password and authentication*.

## 2. Aceptar la invitación al repositorio

1. El dueño (`EduardoAEGES`) te agrega en *Settings → Collaborators*.
2. Te llega un correo de GitHub. También aparece en https://github.com/notifications.
3. Abre la invitación y pulsa **Accept invitation**, o entra directo a https://github.com/EduardoAEGES/caseria/invitations.
4. Mientras no la aceptes, no podrás subir cambios.

## 3. Instalar Git

Antigravity necesita Git instalado en tu computadora.

- **Windows:** descárgalo de https://git-scm.com/download/win e instálalo con las opciones por defecto.
- **macOS:** abre la Terminal y ejecuta `git --version`; si no lo tienes, el sistema te ofrece instalarlo.
- **Linux:** `sudo apt install git` (Ubuntu/Debian).

Luego, en una terminal, configura tu nombre y correo (los mismos de GitHub):

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
```

## 4. Instalar Antigravity

1. Descarga Antigravity desde su página oficial, https://antigravity.google, para tu sistema (Windows, macOS o Linux).
2. Instálalo y ábrelo.
3. Inicia sesión con tu **cuenta de Google** (la pide la primera vez para usar el agente de IA).
4. Si te pregunta por la configuración inicial, puedes importar la de VS Code o empezar de cero. Cualquiera sirve.

## 5. Clonar el proyecto en Antigravity

1. En la pantalla de inicio elige **Clone Git Repository** (o `Ctrl+Shift+P` → `Git: Clone`).
2. Pega esta dirección:
   ```
   https://github.com/EduardoAEGES/caseria.git
   ```
3. Elige una carpeta en tu computadora.
4. Cuando lo pida, **inicia sesión en GitHub** con tu cuenta (se abre el navegador para autorizar).
5. Abre la carpeta clonada.

También puedes clonarlo desde una terminal:

```bash
git clone https://github.com/EduardoAEGES/caseria.git
cd caseria
```

## 6. Ver la app funcionando

No hay que instalar nada (`npm install` no hace falta).

- **Forma rápida:** abre `index.html` con doble clic.
- **Recomendada** (para que todo funcione igual que en un servidor): en la terminal de Antigravity, dentro de la carpeta del proyecto, ejecuta:
  ```bash
  python -m http.server 8000
  ```
  y abre http://localhost:8000 en el navegador.
- Para verla como en un celular: en Chrome pulsa `F12` → ícono de celular (*Toggle device toolbar*).
- **El GPS en un celular real** solo funciona si la app se abre desde una dirección `https` (por ejemplo, publicada en GitHub Pages). Sin permiso de ubicación, la app usa una ubicación aproximada de Paucarpata.

## 7. Antes de cambiar algo: lee `AGENTS.md`

En la raíz del repo, `AGENTS.md` explica cómo está organizado el proyecto: pantallas, tiendas, precios, GPS, scrapers y la actualización diaria.

Si usas el agente de IA de Antigravity, pídele primero:

> Lee AGENTS.md antes de hacer cambios y sigue sus convenciones.

## 8. Subir tus cambios (flujo diario)

> ⚠️ **Importante:** todos los días a las 6:17 a. m. un proceso automático de GitHub guarda precios nuevos en la rama `main`. Por eso, **siempre haz Pull antes de empezar y antes de subir**. Si no, GitHub rechaza tu push.

**Desde Antigravity** (panel *Source Control*, el ícono de ramas):

1. **Pull** (o *Sync*) para traer lo último.
2. Haz tus cambios.
3. Escribe un mensaje que diga qué cambiaste y pulsa **Commit**.
4. Pulsa **Push** (o *Sync Changes*).

**Desde la terminal:**

```bash
git pull --rebase          # traer lo último
# ... editar archivos ...
git add .
git commit -m "Describe el cambio"
git pull --rebase          # por si llegaron precios nuevos mientras trabajabas
git push
```

### Si van a trabajar dos personas al mismo tiempo

Usa una rama propia para no pisarse:

```bash
git checkout -b mi-mejora          # crea tu rama
# ... cambios y commits ...
git push -u origin mi-mejora
```

Después, en GitHub, abre un **Pull Request** de `mi-mejora` hacia `main` para revisarlo antes de unirlo.

## 9. Crear tu cuenta y proyecto en Supabase

> **Nota:** hoy Ca$erIA **todavía no usa Supabase**. Los precios se guardan como archivos en el repo (`js/data/prices-*.js`) y la cuenta del usuario vive en el navegador (`localStorage`). Estos pasos dejan Supabase listo para cuando se conecte, por ejemplo para guardar cuentas, listas o el historial de precios.

1. Entra a https://supabase.com y pulsa **Start your project**.
2. Regístrate con **GitHub** (la misma cuenta del paso 1). Es lo más simple.
3. Crea una **organización** (por ejemplo, "Caseria") con el plan **Free**.
4. Pulsa **New project**:
   - **Name:** `caseria`
   - **Database Password:** genera una segura y **guárdala en un gestor de contraseñas** (no la pongas en el código ni en el repo).
   - **Region:** la más cercana a Perú que ofrezca, por ejemplo *South America (São Paulo)*.
5. Espera unos minutos a que el proyecto termine de crearse.
6. Ve a *Project Settings → API* (o al botón **Connect**) y anota:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon / publishable key**

### Reglas de seguridad de Supabase

- La **anon / publishable key** puede ir en el código de la app (es pública), **siempre que las tablas tengan RLS activado** (*Row Level Security*) con políticas que limiten qué puede leer o escribir cada usuario.
- La **service_role / secret key** y la **contraseña de la base de datos** **nunca** van en el código ni en el repo. Si un proceso de GitHub las necesita, se guardan como *secret* en *Settings → Secrets and variables → Actions* del repositorio.
- Para dar acceso a otra persona al mismo proyecto de Supabase, el dueño la invita en *Organization Settings → Team*.

## 10. Lista final

- [ ] Cuenta de GitHub creada y verificación en dos pasos activada
- [ ] Invitación a `EduardoAEGES/caseria` aceptada
- [ ] Git instalado y configurado (`user.name`, `user.email`)
- [ ] Antigravity instalado y con sesión de Google iniciada
- [ ] Repo clonado y sesión de GitHub autorizada en Antigravity
- [ ] La app abre en `http://localhost:8000`
- [ ] `AGENTS.md` leído
- [ ] Primer cambio de prueba: Pull → Commit → Push sin errores
- [ ] Proyecto de Supabase creado; URL y anon key anotadas; contraseña guardada en un lugar seguro

## Problemas comunes

| Problema | Solución |
|---|---|
| `Permission denied` o `403` al hacer push | No aceptaste la invitación, o iniciaste sesión con otra cuenta de GitHub. |
| `rejected … fetch first` al hacer push | Llegaron cambios nuevos (por ejemplo, los precios diarios). Haz `git pull --rebase` y vuelve a hacer push. |
| Conflicto en `js/data/prices-*.js` o `data/*-catalogo.json` | Son archivos generados por el proceso diario: quédate con la versión de `main`. Durante `git pull --rebase` ejecuta `git checkout --ours <archivo>` (en un rebase, *ours* es la versión de `main`), luego `git add <archivo>` y `git rebase --continue`. |
| El mapa o la ruta no cargan | Hace falta internet: el mapa usa OpenStreetMap y la ruta usa el servicio OSRM. |
| El GPS no pide permiso en el celular | La app tiene que abrirse desde `https`, no desde un archivo ni desde `http`. |
