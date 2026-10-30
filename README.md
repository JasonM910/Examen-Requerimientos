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

Todos los datos se guardan en **`data/db.json`**: perfil, preparaciones, clientes, solicitudes, cotizaciones, acuerdos y entregas. Cada modificación se escribe en ese archivo antes de mostrar la confirmación de guardado. Los cambios permanecen al cerrar la página, cambiar de navegador o reiniciar el servidor local.

Ejecuta la aplicación con `npm run dev` o, después de compilar, con `npm run preview`. Ambos comandos incluyen el servicio local que lee y escribe el JSON. Abrir `dist/index.html` directamente o servir `dist/` con un servidor estático no permite actualizar el archivo.

Puedes editar `data/db.json` con la aplicación cerrada y volver a abrirla para cargar los cambios. Si se modifica mientras una página sigue abierta, los guardados desactualizados se rechazan para conservar la versión más reciente. Un error de formato se muestra sin reemplazar el archivo. Conviene respaldar el JSON antes de editarlo manualmente.

Los datos iniciales corresponden al 29 de octubre de 2026 y se generan desde `src/data/seed.js`. En **Mi perfil → Reiniciar demostración** puedes reemplazar el contenido del JSON por los ejemplos originales. La sesión de demostración se guarda en `sessionStorage`; las credenciales no se almacenan en el JSON.

Si tenías cambios de la versión anterior en `localStorage`, se importan automáticamente la primera vez que abres la aplicación, siempre que el JSON todavía contenga los datos iniciales. Después, el archivo es la fuente de datos.

Desde una solicitud, prepara y envía una cotización. En su detalle, **Simular respuesta del cliente → Aceptar propuesta** crea un acuerdo y una entrega por cada día consecutivo del plan. La aceptación valida vigencia, cobertura y cupo de todas las fechas antes de programar el acuerdo. En el calendario puedes cambiar estados y ajustar horarios. Los ingresos corresponden a entregas completadas según su fecha, y se diferencian del valor completo de un acuerdo.

Los precios se calculan con céntimos enteros. Las cotizaciones conservan sus precios, ingredientes y políticas originales aunque cambie el catálogo o el perfil. La baja de preparaciones cambia su estado a Inactivo y conserva las referencias históricas.

La autenticación, el envío, las notificaciones y las respuestas del cliente son simulaciones. El servicio local de persistencia usa un archivo JSON; no es un backend de producción e incluye únicamente lectura, validación y guardado de los datos del prototipo.

## Pruebas y evidencias

Instala Chromium una vez:

```sh
npx playwright install chromium
npm test
```

`npm test` ejecuta las pruebas de dominio, persistencia y los recorridos de Playwright. Se verifica el guardado en disco, el reinicio del servidor, la reapertura sin datos en el navegador, los conflictos y los errores de escritura. Playwright inicia su propio Vite en `http://127.0.0.1:4175` y usa un JSON temporal separado: las pruebas no modifican `data/db.json`.

Las capturas se generan en:

- `evidencias/flujo-1-preparaciones/`: registro, ingredientes y publicación.
- `evidencias/flujo-2-cotizacion/`: solicitud, cálculos, políticas y envío.
- `evidencias/flujo-3-calendario/`: programación del acuerdo y entrega completada.
- `evidencias/flujo-4-metricas/`: períodos, clientes frecuentes e historial.

También se incluyen vistas del resumen y de la interfaz móvil. Los reportes de ejecución se guardan en `playwright-report/` y las trazas de fallos en `test-results/` (ambos excluidos de Git). Para abrir el reporte, ejecuta `npx playwright show-report`.

## Organización

`src/features/` agrupa las pantallas por funcionalidad; `src/components/` contiene los elementos compartidos, `src/store/` administra el estado, `src/lib/database.js` conecta con el servicio local de `server/json-database.js` y `data/db.json` conserva la información. `src/data/seed.js` define los ejemplos para inicializar o restablecer los datos y `src/lib/domain.js` reúne cálculos, fechas y validaciones. Las fotografías de demostración se incluyen en `public/images/`.
