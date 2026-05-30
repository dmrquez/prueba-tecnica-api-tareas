# Prueba Técnica - Analista Programador Jr.

Solución para el servicio API de gestión de tareas asignadas a usuarios internos.

## Decisiones Técnicas Tomadas
1. **Lenguaje y Framework**: Se utilizó Node.js con Express. Es una pila tecnológica ágil, ideal para construir APIs RESTful rápidas y legibles.
2. **Base de Datos**: Se optó por SQLite. Esto facilita enormemente la evaluación de la prueba, ya que no requiere configurar un servidor de base de datos externo; el archivo de la base de datos (`database.sqlite`) se genera automáticamente en local tras ejecutar el código por primera vez.
3. **Eliminación de Tareas**: Se implementó **eliminación física** (instrucción `DELETE` de SQL). Dado que el objetivo es un servicio API sencillo, añadir eliminación lógica requeriría modificar las consultas futuras para filtrar las inactivas. La eliminación física mantiene la simplicidad del código y cumple con el requerimiento base.

## Pasos para ejecutar la solución
1. Asegúrate de tener **Node.js** instalado en tu sistema.
2. Clona o descarga este repositorio.
3. Abre una terminal en la raíz del proyecto y ejecuta el comando `npm install` para instalar las dependencias necesarias (Express y SQLite3).
4. Ejecuta el servidor con el comando: `node server.js`
5. La base de datos se creará automáticamente y el servidor correrá en `http://localhost:3000`.

## Flujo Completo de Pruebas (Guía para Postman)

A continuación, se detalla el ciclo de vida completo para probar la API en orden lógico: desde la creación del usuario hasta la finalización y eliminación de su tarea. 

> **Nota para reinicio de pruebas:** Si deseas empezar las pruebas desde cero (para que los IDs vuelvan a iniciar en 1), simplemente detén el servidor (`Ctrl + C`), elimina el archivo `database.sqlite` y vuelve a iniciar el servidor.

### Paso 1: Crear Usuario
Crea el usuario al que se le asignarán las tareas.
* **Método:** `POST`
* **URL:** `http://localhost:3000/usuarios`
* **Body (raw > JSON):**
  ```json
  {
    "nombre": "Juan Perez",
    "email": "juan@example.com"
  }


Paso 2: Registrar Tarea (Nace PENDIENTE)
Asigna una tarea al usuario recién creado (ID 1). La API le asignará el estado 'PENDIENTE' por defecto.

Método: POST

URL: http://localhost:3000/tareas

Body (raw > JSON):

JSON
{
  "usuario_id": 1,
  "titulo": "Revisar servidores",
  "descripcion": "Verificar logs del servidor principal"
}


Paso 3: Cambiar estado a EN_PROCESO
Simula que el usuario ha comenzado a trabajar en su tarea (ID 1).

Método: PUT

URL: http://localhost:3000/tareas/1/estado

Body (raw > JSON):

JSON
{
  "estado": "EN_PROCESO"
}


Paso 4: Consultar Tareas EN_PROCESO
Verifica que la tarea se haya actualizado correctamente filtrando por el estado.

Método: GET

URL Base: http://localhost:3000/usuarios/1/tareas
(El número 1 es el ID del usuario cuyas tareas quieres ver).

Aplicar los filtros:

Ve a la pestaña Params (está al lado de Headers y Body).

En la tabla inferior llamada "Query Params", puedes agregar los filtros que requiere la prueba. Escribe lo siguiente en las columnas de Key y Value:

Key: estado | Value: EN_PROCESO

Key: desde | Value: 2023-01-01

Key: hasta | Value: 2026-12-31


Paso 5: Marcar Tarea como COMPLETADA
El usuario ha terminado su trabajo. Actualizamos el estado final.

Método: PUT

URL: http://localhost:3000/tareas/1/estado

Body (raw > JSON):

JSON
{
  "estado": "COMPLETADA"
}


Paso 6: Consultar Tareas COMPLETADAS
Confirmamos que el sistema guardó el estado final correctamente.

Método: GET

URL: http://localhost:3000/usuarios/1/tareas (Asumiendo que el ID del usuario es 1).

Configurar los filtros:

Ve a la pestaña Params (justo debajo de la barra de la URL).

En la tabla "Query Params", vas a agregar el filtro de estado escribiendo lo siguiente:

Key: estado | Value: COMPLETADA


Paso 7: Eliminar Tarea
Limpiamos el registro eliminando la tarea completada.

Método: DELETE

URL: http://localhost:3000/tareas/1




