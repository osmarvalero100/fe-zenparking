# HU-001: Reordenar campos del formulario de registro de vehículo

## Historia de Usuario

**Como** operador del sistema de parking,
**quiero** que el campo "Tipo de Vehículo" aparezca antes del campo "Placa del Vehículo" en los formularios de registro,
**para que** pueda seleccionar el tipo de vehículo primero y agilizar el proceso de registro, ya que el tipo es una selección rápida mientras que la placa requiere verificación del documento del vehículo.

## Criterios de Aceptación

- [ ] El campo "Tipo de Vehículo" se muestra antes del campo "Placa del Vehículo" en el formulario de ingreso (`EntryForm.tsx`)
- [ ] El campo "Tipo de Vehículo" se muestra antes del campo "Placa" en el formulario de gestión de vehículos (`VehiclesTable.tsx`)
- [ ] El orden anterior/plata no altera la funcionalidad existente de validación
- [ ] No se modifican los campos, validaciones ni comportamiento del formulario

## Archivos Modificados

| Archivo | Descripción | Cambio |
|---------|-------------|--------|
| `fe-zenparking/src/components/forms/EntryForm.tsx` | Formulario de ingreso al parking | Swap: Select (Tipo) → Input (Placa) |
| `fe-zenparking/src/components/dashboard/VehiclesTable.tsx` | Formulario CRUD de vehículos en dashboard | Swap: Select (Tipo) → Input (Placa) |

## Detalle del Cambio

### Antes
```
1. Placa del Vehículo (Input)
2. Tipo de Vehículo (Select)
```

### Después
```
1. Tipo de Vehículo (Select)
2. Placa del Vehículo (Input)
```

## Notas

- El cambio aplica a dos formularios distintos del sistema:
  - **EntryForm.tsx**: Formulario utilizado para registrar ingresos de vehículos al parking.
  - **VehiclesTable.tsx**: Formulario de gestión CRUD de vehículos en el módulo de dashboard.
- No se altera la lógica de negocio, únicamente el orden visual de los campos.
- La validación de campos obligatorios se mantiene intacta.
