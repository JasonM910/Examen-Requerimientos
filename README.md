# Dieta Saludable · Vista del Oferente

Prototipo React + Tailwind CSS, en español y adaptable a escritorio y móvil. Incluye inicio de sesión de demostración, perfil público, especialidades, cobertura, capacidad diaria, políticas, preparaciones con ingredientes personalizables, solicitudes, cotizaciones, acuerdos, calendario, clientes y finanzas.

## Ejecutar

Requiere Node.js 22.12+ o 24 y npm.

```sh
npm install
npm run dev
```

Abre la dirección que imprime Vite. Cuenta de demostración:

- Correo: `oferente@demo.cr`
- Contraseña: `Demo2026!`

También puedes completar estas credenciales con el botón de la pantalla de acceso.

```sh
npm run build
npm run preview
```

## Datos y funcionamiento

Los datos iniciales corresponden al 29 de octubre de 2026. Se incluyen planes veganos, sin gluten, bajos en calorías y deportivos, con solicitudes y servicios históricos vinculados. Los cambios se conservan en `localStorage`; la sesión se guarda en `sessionStorage`. En **Mi perfil → Reiniciar demostración** puedes recuperar los ejemplos originales.

Desde una solicitud, prepara y envía una cotización. En su detalle, **Simular respuesta del cliente → Aceptar propuesta** crea un acuerdo y una entrega por cada día consecutivo del plan. La aceptación valida vigencia, cobertura y cupo de todas las fechas antes de programar el acuerdo. En el calendario puedes cambiar estados y ajustar horarios. Los ingresos corresponden a entregas completadas según su fecha, y se diferencian del valor completo de un acuerdo.

Los precios se calculan con céntimos enteros. Las cotizaciones conservan sus precios, ingredientes y políticas originales aunque cambie el catálogo o el perfil. La baja de preparaciones cambia su estado a Inactivo y conserva las referencias históricas.

La autenticación, el envío, las notificaciones y las respuestas del cliente son simulaciones locales. Este prototipo no incluye servidor, comunicaciones reales, almacenamiento seguro de credenciales, transacciones ACID ni garantías de rendimiento de base de datos.

## Pruebas y evidencias

Instala Chromium una vez:

```sh
npx playwright install chromium
npm test
```

`npm test` ejecuta las pruebas del dominio y los recorridos de Playwright. Playwright inicia Vite en `http://127.0.0.1:4173`, o reutiliza ese servidor si ya está disponible. Cada prueba usa un navegador aislado, sin modificar los datos de tu sesión habitual.

Las capturas se generan en:

- `evidencias/flujo-1-preparaciones/`: registro, ingredientes y publicación.
- `evidencias/flujo-2-cotizacion/`: solicitud, cálculos, políticas y envío.
- `evidencias/flujo-3-calendario/`: programación del acuerdo y entrega completada.
- `evidencias/flujo-4-metricas/`: períodos, clientes frecuentes e historial.

También se incluyen vistas del resumen y de la interfaz móvil. Los reportes de ejecución se guardan en `playwright-report/` y las trazas de fallos en `test-results/` (ambos excluidos de Git). Para abrir el reporte, ejecuta `npx playwright show-report`.

## Organización

`src/features/` agrupa las pantallas por funcionalidad; `src/components/` contiene los elementos compartidos, `src/store/` administra el estado local, `src/data/seed.js` define los ejemplos relacionados y `src/lib/domain.js` reúne cálculos, fechas y validaciones. Las fotografías de demostración se incluyen en `public/images/` para evitar depender de su carga externa.
