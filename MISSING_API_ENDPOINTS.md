# Endpoints de API Faltantes - ZenParking

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

## 4. Registro de Salida de Vehículos

**Estado actual:** Existe `/api/v1/sessions/{id}/exit` pero requiere payment_status.
**Requerido:** Endpoint simplificado para registrar salida.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| POST | `/api/v1/sessions/exit` | Registrar salida por placa o ticket | ALTA |

**Request Body:**
```json
{
  "ticket_number": "ZP-2026-0001"
}
```

**Response:**
```json
{
  "session_id": 1,
  "plate": "ABC123",
  "entry_time": "2026-04-25T10:00:00Z",
  "exit_time": "2026-04-25T12:30:00Z",
  "duration_minutes": 150,
  "total_amount": 15000,
  "payment_status": "pending"
}
```

---

## 5. Consultar Tarifa Actual

**Estado actual:** Existe GET rates pero no hay endpoint para tarifa por tipo de vehículo.
**Requerido:** Obtener tarifa aplicable según tipo de vehículo.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/rates/active` | Obtener todas las tarifas activas | ALTA |
| GET | `/api/v1/rates/by-type/{vehicle_type}` | Obtener tarifa por tipo de vehículo | ALTA |

---

## 6. Endpoint de Capacidad/Ocupación

**Estado actual:** Existe `/api/v1/system/capacity-alert` pero la respuesta está TBD.
**Requerido:** Respuesta bien definida.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/system/capacity-alert` | Estado de ocupación del parqueadero | ALTA |

**Response esperada:**
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

---

## 7. Notificaciones (Sockets o Polling)

**Estado actual:** Existen endpoints de notificaciones pero están TBD.
**Requerido:** Sistema de notificaciones en tiempo real.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/notifications/` | Obtener todas las notificaciones | MEDIA |
| WS | `/ws/notifications` | WebSocket para notificaciones en tiempo real | ALTA |

**Alternative: Endpoint de polling optimizado**
| GET | `/api/v1/notifications/alerts` | Obtener alertas activas (blacklist, capacidad) | ALTA |

---

## 8. Rates (Tarifas) - CRUD Completo

**Estado actual:** Solo existe GET para tarifas.
**Requerido:** Endpoints para administrar tarifas.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| POST | `/api/v1/rates/` | Crear nueva tarifa | MEDIA |
| PUT | `/api/v1/rates/{id}` | Actualizar tarifa | MEDIA |
| DELETE | `/api/v1/rates/{id}` | Eliminar tarifa | BAJA |

---

## 9. Verificación de Placa en Blacklist

**Estado actual:** Existe pero retorna TBD.
**Requerido:** Endpoint que retorne información de blacklist.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/vehicles/blacklist/check/{plate}` | Verificar si placa está en blacklist | ALTA |

**Response esperada:**
```json
{
  "is_blacklisted": true,
  "entry": {
    "id": 1,
    "reason": "Reporte de robo",
    "alert_level": "high",
    "created_at": "2026-04-20T10:00:00Z"
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

---

## 10. Usuarios - Actualización y Desactivación

**Estado actual:** GET y POST usuarios existen, pero PUT y DELETE están faltando.
**Requerido:** Endpoints para gestionar usuarios.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| PUT | `/api/v1/users/{id}` | Actualizar usuario | ALTA |
| DELETE | `/api/v1/users/{id}` | Desactivar usuario | ALTA |

---

## 11. Reportes - Detalles de Movimientos Diarios

**Estado actual:** GET daily-movements existe pero retorna TBD.
**Requerido:** Definir respuesta del reporte.

| Método | Endpoint | Descripción | Prioridad |
|--------|----------|-------------|-----------|
| GET | `/api/v1/reports/daily-movements` | Detalle de movimientos del día | ALTA |

**Response esperada:**
```json
{
  "date": "2026-04-25",
  "total_entries": 45,
  "total_exits": 38,
  "current_vehicles": 7,
  "entries": [
    {
      "id": 1,
      "plate": "ABC123",
      "ticket_number": "ZP-2026-0001",
      "vehicle_type": "car",
      "entry_time": "2026-04-25T08:00:00Z"
    }
  ],
  "exits": [
    {
      "id": 2,
      "plate": "DEF456",
      "ticket_number": "ZP-2026-0002",
      "entry_time": "2026-04-25T07:00:00Z",
      "exit_time": "2026-04-25T10:00:00Z",
      "duration_minutes": 180,
      "total_amount": 18000
    }
  ],
  "summary": {
    "total_revenue": 450000,
    "average_stay_minutes": 120,
    "occupancy_percentage": 75
  }
}
```

---

## Resumen de Prioridades

### ALTA (Críticos para MVP)
1. `/api/v1/blacklist/` - POST
2. `/api/v1/system/parking-map` - Response definida
3. `/api/v1/sessions/exit` - Salida por placa/ticket
4. `/api/v1/rates/active` - Tarifas activas
5. `/api/v1/system/capacity-alert` - Response definida
6. `/api/v1/vehicles/blacklist/check/{plate}` - Response definida
7. `/api/v1/users/{id}` - PUT y DELETE
8. `/api/v1/reports/daily-movements` - Response definida

### MEDIA (Importantes)
1. `/api/v1/blacklist/{id}` - DELETE y PATCH
2. `/api/v1/spots/{id}` - PUT, DELETE, PATCH
3. `/api/v1/notifications/` - GET y WS

### BAJA (Mejoras)
1. `/api/v1/rates/` - POST, PUT, DELETE
2. `/api/v1/spots/{id}` - DELETE

---

## Notas Adicionales

1. **Moneda:** Todos los valores monetarios deben estar en COP (Peso Colombiano)
2. **Zona horaria:** Usar timezone de Colombia (America/Bogota)
3. **Documentación:** Por favor actualizar el OpenAPI spec con los schemas de respuesta TBD
4. **Autenticación:** Verificar que todos los endpoints requeridos estén protegidos con OAuth2

---

*Documento generado: 2026-04-25*
*Frontend: ZenParking Next.js App*