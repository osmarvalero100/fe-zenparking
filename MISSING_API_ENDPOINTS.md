# Endpoints de API Faltantes - ZenParking (Actualizado)

## Documentación para el Equipo de Backend

La siguiente lista enumera los endpoints que se requieren en el frontend pero que **no están disponibles** en la API actual (`https://bk-zenparking.vercel.app`). Se solicita al equipo de backend su implementación.

---

## 1. Gestión de Blacklist (CRUD Completo)

**Estado actual:** Solo existe GET para consultar blacklist.
**Requerido:** CRUD completo para administrar vehículos sospechosos.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| POST | `/api/v1/blacklist/` | Agregar vehículo a blacklist | ALTA |
| DELETE | `/api/v1/blacklist/{id}` | Eliminar vehículo de blacklist | ALTA |
| PATCH | `/api/v1/blacklist/{id}` | Actualizar nivel de alerta o razón | MEDIA |

**Request Body para POST/PATCH:**
```json
{
  "vehicle_id": 123,
  "reason": "Robo reportado",
  "alert_level": "high"
}
```

---

## 2. Mapa Lógico del Parqueadero (Layout Visual)

**Estado actual:** Existe `/api/v1/system/parking-map` pero la respuesta no está definida (TBD).
**Requerido:** Endpoint que retorne la estructura visual del parqueadero.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/system/parking-map` | Obtener layout del parqueadero | ALTA |

**Response esperada:**
```json
{
  "zones": [
    {
      "id": "A",
      "name": "Zona A - Carros",
      "rows": 5,
      "columns": 10,
      "vehicle_type": "car",
      "spots": [
        {
          "id": 1,
          "spot_number": "A1",
          "status": "free",
          "is_near_exit": true
        }
      ]
    }
  ],
  "total_capacity": 100,
  "available_now": 45
}
```

---

## 3. Gestión de Espacios (CRUD)

**Estado actual:** GET spots y POST spots existen, pero falta actualización.
**Requerido:** Endpoints para modificar espacios existentes.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| PUT | `/api/v1/spots/{id}` | Actualizar información de espacio | MEDIA |
| DELETE | `/api/v1/spots/{id}` | Eliminar espacio | BAJA |
| PATCH | `/api/v1/spots/{id}` | Cambiar estado (libre/ocupado/mantenimiento) | ALTA |

---

## 4. Salida de Vehículos con Cálculo de Tiempo

**Estado actual:** Existe `/api/v1/sessions/{id}/exit` pero requiere session_id explícito.
**Requerido:** Endpoint para buscar sesión por ticket o placa y retornar datos calculados.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/sessions/ticket/{ticket}` | Buscar sesión por número de ticket | ALTA |
| GET | `/api/v1/sessions/active?plate={plate}` | Buscar sesiones activas por placa | ALTA |
| POST | `/api/v1/sessions/{id}/exit` | Procesar salida con cálculo automático | ALTA |

**Response para GET /sessions/ticket/{ticket}:**
```json
{
  "session_id": 1,
  "plate": "ABC123",
  "ticket_number": "ZP-2026-0001",
  "vehicle_type": "car",
  "entry_time": "2026-04-25T10:00:00Z",
  "exit_time": "2026-04-25T12:30:00Z",
  "duration_minutes": 150,
  "total_amount": 15000,
  "pending_fines": [],
  "payment_status": "pending"
}
```

**RF-004, RF-010:** El sistema debe calcular automáticamente el tiempo de permanencia y el valor a pagar.

---

## 5. Vehículos Residentes / Mensuales

**Estado actual:** No existe endpoint para gestionar vehículos con planes mensuales.
**Requerido:** CRUD para vehículos residentes.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/vehicles/resident` | Obtener todos los vehículos residentes | ALTA |
| POST | `/api/v1/vehicles/` | Crear vehículo residente | ALTA |
| GET | `/api/v1/notifications/monthly-expiring` | Obtener mensualidades por vencer | ALTA |
| PUT | `/api/v1/vehicles/{id}` | Actualizar vehículo residente | MEDIA |
| DELETE | `/api/v1/vehicles/{id}` | Eliminar vehículo residente | BAJA |

**Response para GET /vehicles/resident:**
```json
{
  "id": 1,
  "vehicle_id": 123,
  "plate": "ABC123",
  "vehicle_type": "car",
  "owner_name": "Juan Pérez",
  "owner_phone": "3001234567",
  "owner_email": "juan@email.com",
  "spot_id": 5,
  "spot_number": "A-12",
  "monthly_rate_id": 1,
  "rate_name": "Plan Mensual Carro",
  "start_date": "2026-04-01",
  "end_date": "2026-05-01",
  "is_active": true,
  "created_at": "2026-04-01T00:00:00Z"
}
```

**RF-006, RF-007, RF-025, RF-039:** Gestión de vehículos frecuentes/residentes.

---

## 6. Gestión de Multas

**Estado actual:** Existe GET /fines/ pero no POST para crear multas.
**Requerido:** Endpoints para registrar y gestionar multas.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/fines/` | Obtener todas las multas | ALTA |
| POST | `/api/v1/fines/` | Registrar nueva multa | ALTA |
| POST | `/api/v1/fines/{id}/pay` | Marcar multa como pagada | ALTA |
| PUT | `/api/v1/fines/{id}` | Actualizar multa | MEDIA |
| DELETE | `/api/v1/fines/{id}` | Eliminar multa | BAJA |

**Request Body para POST /fines/:**
```json
{
  "vehicle_id": 123,
  "session_id": 456,
  "fine_type": "mal_parking",
  "description": "Estacionado en zona prohibida",
  "photo_url": "https://storage.example.com/fine-123.jpg"
}
```

**Response con vehículo:**
```json
{
  "id": 1,
  "vehicle_id": 123,
  "session_id": 456,
  "fine_type": "mal_parking",
  "amount": 50000,
  "description": "Estacionado en zona prohibida",
  "photo_url": "https://storage.example.com/fine-123.jpg",
  "status": "pending",
  "paid_at": null,
  "created_at": "2026-04-25T12:00:00Z",
  "vehicle": {
    "id": 123,
    "plate": "ABC123",
    "vehicle_type": "car",
    "owner_name": "Juan Pérez"
  }
}
```

**RF-022, RF-023, RF-024, RF-26, RF-028, RF-029:** Sistema de multas.

---

## 7. Verificación de Placa en Blacklist

**Estado actual:** Existe pero retorna TBD.
**Requerido:** Endpoint que retorne información estructurada.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/vehicles/blacklist/check/{plate}` | Verificar si placa está en blacklist | ALTA |
| GET | `/api/v1/blacklist/` | Obtener todas las entradas de blacklist | ALTA |

**Response:**
```json
{
  "is_blacklisted": true,
  "entry": {
    "id": 1,
    "reason": "Reporte de robo",
    "alert_level": "high",
    "created_at": "2026-04-20T10:00:00Z",
    "vehicle": {
      "id": 123,
      "plate": "ABC123",
      "owner_name": "Juan Pérez"
    }
  }
}
```

O si no está en blacklist:
```json
{
  "is_blacklisted": false,
  "entry": null
}
```

**RF-002, RF-027:** Validación de restricciones de acceso.

---

## 8. Endpoint de Capacidad/Ocupación

**Estado actual:** Existe `/api/v1/system/capacity-alert` pero la respuesta está TBD.
**Requerido:** Respuesta bien definida.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/system/capacity-alert` | Estado de ocupación del parqueadero | ALTA |

**Response:**
```json
{
  "total_spots": 100,
  "occupied_spots": 85,
  "available_spots": 15,
  "percentage": 85,
  "is_full": false,
  "last_updated": "2026-04-25T12:00:00Z"
}
```

**RF-005, RF-008:** Alerta visual de capacidad al 100%.

---

## 9. Reportes - Detalles de Movimientos Diarios

**Estado actual:** GET daily-movements existe pero retorna TBD.
**Requerido:** Definir respuesta del reporte.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/reports/daily-movements` | Detalle de movimientos del día | ALTA |
| GET | `/api/v1/reports/daily-movements-csv` | Exportar movimientos en CSV | ALTA |

**Response:**
```json
{
  "date": "2026-04-25",
  "total_entries": 45,
  "total_exits": 38,
  "current_vehicles": 7,
  "entries": [...],
  "exits": [...],
  "summary": {
    "total_revenue": 450000,
    "average_stay_minutes": 120,
    "occupancy_percentage": 75
  }
}
```

**RF-009:** Generación de reportes exportables.

---

## 10. Rates (Tarifas)

**Estado actual:** Solo existe GET para tarifas.
**Requerido:** Endpoint para tarifas activas.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/rates/` | Obtener todas las tarifas | ALTA |
| GET | `/api/v1/rates/{id}` | Obtener tarifa por ID | ALTA |
| POST | `/api/v1/rates/` | Crear nueva tarifa | MEDIA |
| PUT | `/api/v1/rates/{id}` | Actualizar tarifa | MEDIA |

---

## 11. Historial de Celdas (Spot History)

**Estado actual:** No existe.
**Requerido:** Para analítica de uso por celda.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/spots/{id}/history` | Obtener historial de uso de una celda | MEDIA |
| GET | `/api/v1/spots/statistics` | Estadísticas de uso por zona/celda | MEDIA |

**RF-018:** Identificar zonas de mayor y menor rotación.

---

## 12. Notificaciones

**Estado actual:** Endpoints TBD.
**Requerido:** Sistema de notificaciones.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/notifications/` | Obtener todas las notificaciones | MEDIA |
| GET | `/api/v1/notifications/time-exceeded/{session_id}` | Verificar si sesión excedió tiempo | ALTA |
| POST | `/api/v1/notifications/process-queue` | Procesar cola de notificaciones | MEDIA |

**RF-021, RF-023, RF-025:** Notificaciones automáticas.

---

## 13. Bitácora de Sesiones (Audit Logs)

**Estado actual:** GET audit-logs existe.
**Requerido:** Verificar que incluya IP, fecha, hora y acciones.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/reports/audit-logs` | Obtener bitácora de auditoría | ALTA |

**RF-035:** Registro de sesiones y acciones críticas.

---

## Resumen de Prioridades

### 🔴 ALTA (Críticos para MVP)

1. `/api/v1/vehicles/resident` - GET vehículos residentes
2. `/api/v1/vehicles/` - POST crear vehículo residente
3. `/api/v1/notifications/monthly-expiring` - Mensualidades por vencer
4. `/api/v1/fines/` - POST registrar multa
5. `/api/v1/sessions/ticket/{ticket}` - Buscar sesión por ticket
6. `/api/v1/system/capacity-alert` - Response definida
7. `/api/v1/vehicles/blacklist/check/{plate}` - Response definida
8. `/api/v1/reports/daily-movements` - Response definida

### 🟡 MEDIA (Importantes)

1. `/api/v1/blacklist/` - POST, DELETE
2. `/api/v1/spots/{id}` - PUT, PATCH
3. `/api/v1/notifications/` - GET
4. `/api/v1/rates/` - POST, PUT
5. `/api/v1/spots/{id}/history` - Historial de celdas

### 🟢 BAJA (Mejoras)

1. `/api/v1/vehicles/{id}` - DELETE
2. `/api/v1/fines/{id}` - DELETE
3. `/api/v1/rates/{id}` - DELETE

---

## Notas Adicionales

1. **Moneda:** Todos los valores monetarios deben estar en COP (Peso Colombiano)
2. **Zona horaria:** Usar timezone de Colombia (America/Bogota)
3. **Documentación:** Por favor actualizar el OpenAPI spec con los schemas de respuesta TBD
4. **Autenticación:** Verificar que todos los endpoints requeridos estén protegidos con OAuth2
5. **Transacciones ACID:** Las operaciones de ingreso/salida deben ser atómicas (RNF05)

---

## Mapeo de Requerimientos -> Endpoints

| RF | Descripción | Endpoint Requerido |
|----|-------------|-------------------|
| RF-001 | Registro de ingreso | `/api/v1/sessions/entry` ✅ |
| RF-002 | Validar restricciones | `/api/v1/vehicles/blacklist/check/{plate}` 🔴 |
| RF-003 | Generar ticket digital | `/api/v1/sessions/entry` ✅ |
| RF-004 | Calcular tiempo/valor | `/api/v1/sessions/ticket/{ticket}` 🔴 |
| RF-005 | Disponibilidad en tiempo real | `/api/v1/system/capacity-alert` 🔴 |
| RF-006 | CRUD vehículos frecuentes | `/api/v1/vehicles/resident` 🔴 |
| RF-007 | CRUD vehículos residentes | `/api/v1/vehicles/resident` 🔴 |
| RF-008 | Alerta 100% capacidad | `/api/v1/system/capacity-alert` 🔴 |
| RF-009 | Reportes exportables | `/api/v1/reports/daily-movements-csv` 🔴 |
| RF-010 | Validar ticket salida | `/api/v1/sessions/{id}/exit` ✅ |
| RF-011 | CRUD celdas | `/api/v1/spots/` ✅ |
| RF-013 | Dashboard estado | `/api/v1/spots/` ✅ |
| RF-014 | Bloqueo mantenimiento | `/api/v1/spots/{id}/maintenance` ✅ |
| RF-017 | Mapa lógico | `/api/v1/system/parking-map` 🔴 |
| RF-019 | Liberación manual | `/api/v1/spots/{id}/release` ✅ |
| RF-021 | Notificación por email | `/api/v1/notifications/` 🔴 |
| RF-022 | Multas automáticas | `/api/v1/fines/` 🔴 |
| RF-023 | Alerta tiempo agotado | `/api/v1/notifications/time-exceeded/{id}` 🔴 |
| RF-024 | Multas por mal parqueo | `/api/v1/fines/` POST 🔴 |
| RF-025 | Notificar vencimiento | `/api/v1/notifications/monthly-expiring` 🔴 |
| RF-026 | Bloquear salida con multas | `/api/v1/sessions/{id}/exit` 🔴 |
| RF-027 | Alerta placa sospechosa | `/api/v1/vehicles/blacklist/check/{plate}` 🔴 |
| RF-028 | CRUD tipos de multa | `/api/v1/fines/` 🔴 |
| RF-029 | Comprobante multa | `/api/v1/fines/{id}` GET 🔴 |
| RF-030 | Bitácora de notificaciones | `/api/v1/reports/audit-logs` ✅ |
| RF-031 | Login seguro | `/api/v1/auth/login` ✅ |
| RF-032 | CRUD perfiles | `/api/v1/users/` ✅ |
| RF-033 | Control acceso roles | N/A (frontend) ✅ |
| RF-035 | Bitácora sesiones | `/api/v1/reports/audit-logs` ✅ |

✅ = Endpoint existe | 🔴 = Endpoint falta | N/A = No aplica

---

*Documento generado: 2026-04-25*
*Frontend: ZenParking Next.js App*
*Actualizado según Requerimientos-sistema-Parqueadero.docx*