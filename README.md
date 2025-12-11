## Estructura

```
src/
├── domain/          # Reglas de negocio puras
├── application/     # Casos de uso
├── infrastructure/  # Repositorios y motor de concurrencia
└── test/           # Pruebas de concurrencia
```

---

## 🧱 Arquitectura Hexagonal (Ligera)

Tomé la decisión de crear una arquitectura hexagonal minimalista con tres capas bien diferenciadas:

- **Dominio**: Reglas de negocio puras (`Account`)
- **Aplicación**: Casos de uso (`UpdateBalance`)
- **Infraestructura**: Repositorio y motor de concurrencia

### ¿Por qué esta arquitectura?

Porque permite mantener el proyecto modular, testeable y fácil de extender, sin añadir complejidad innecesaria. Así el dominio se mantiene limpio y libre de dependencias externas.

---

## ⚡ Manejo de Concurrencia

La solución implementa **optimistic concurrency control** con versionado y un mecanismo **CAS (Compare-And-Swap)**:

1. Se lee la cuenta y se obtiene su versión actual
2. Se aplica la operación (depósito/retiro)
3. Se intenta guardar validando que la versión no cambió
4. Si hubo conflicto → se reintenta automáticamente

### Ventajas

- Evita locks pesados que bloquean recursos
- Reduce contención entre operaciones concurrentes
- Permite alto rendimiento en escenarios de alta concurrencia

---

## 🔁 Sistema de Reintentos Controlados

El caso de uso reintenta operaciones conflictivas hasta un **máximo configurable**.

**Motivo**: Asegura robustez ante colisiones sin riesgo de loops infinitos o degradación del sistema.

---

## 💼 Dominio Seguro

La entidad `Account` valida todas las operaciones:

- ✅ Depósitos deben ser positivos
- ✅ Retiros deben ser válidos (fondos suficientes)
- ✅ Previene saldos negativos

El dominio es **completamente independiente** de la infraestructura y garantiza la consistencia de las reglas de negocio.

---

## 🗂️ Repositorio In-Memory

Se utiliza un repositorio en memoria que devuelve **copias defensivas** de las entidades.

**Beneficios**:

- Simula escenarios de concurrencia realistas
- No produce efectos colaterales
- Facilita pruebas sin dependencias externas

---

## 🔍 Justificación Técnica

### Decisión Arquitectónica: Copias Profundas en el InMemoryAccountRepository

Una de las decisiones más importantes en esta implementación fue configurar el repositorio en memoria para que devuelva copias profundas de las entidades:

```typescript
return account
	? new Account(account.id, account.balance, account.version)
	: null;
```

Puede parecer una decisión simple, pero en realidad es fundamental para que todo el sistema funcione correctamente. Te explico por qué:

**1. Simula el comportamiento de bases de datos reales**

Cuando haces un query a una base de datos real, esta te devuelve un snapshot inmutable del estado en ese momento. No te está dando acceso directo a la fila interna de la base de datos. Así que si queremos que nuestras pruebas sean realistas y reflejen lo que pasaría en producción, nuestro repositorio in-memory debe comportarse de la misma manera.

**2. Evita que operaciones concurrentes compartan la misma instancia**

Imagina esto: si el repositorio devolviera siempre la misma referencia de objeto, todas las operaciones concurrentes estarían trabajando sobre la misma instancia en memoria. Esto significaría que cuando una operación modifica el saldo, todas las demás verían ese cambio instantáneamente. Suena conveniente, ¿no? Pues no. En realidad, esto rompe completamente el control de concurrencia basado en versiones, porque todas las operaciones verían siempre la última versión actualizada, y el optimistic locking no tendría sentido.

**3. Permite que el optimistic locking funcione de verdad**

El optimistic concurrency control se basa en la premisa de que cada operación trabaja sobre su propio snapshot independiente del estado. Luego, cuando intenta guardar los cambios, compite con otras operaciones para aplicar su actualización. Si todas las operaciones compartieran la misma instancia, no habría competencia real, y el mecanismo CAS (Compare-And-Swap) no podría detectar conflictos de versión.

**4. Elimina efectos colaterales sorpresa**

Devolver copias defensivas hace que la lógica sea pura y predecible. No hay modificaciones "fantasma" que aparezcan de la nada porque otra parte del código tocó el mismo objeto. Cada operación es independiente y no afecta a las demás hasta que intenta persistir sus cambios.

### ¿Qué logramos con este enfoque?

Este diseño permite implementar correctamente tres conceptos clave:

- **Optimistic Concurrency Control (OCC)**: Las operaciones detectan conflictos cuando intentan guardar, no mientras trabajan.
- **Reintentos**: Si hay conflicto, la operación puede reintentar con un estado fresco sin interferir con otras.
- **Evitar locks pesados**: No necesitamos bloquear recursos porque cada operación trabaja de forma aislada.

Al final del día, devolver copias profundas es la opción más segura, más cercana a cómo funcionaría un entorno de producción real, y es coherente con los requisitos del ejercicio. Es uno de esos detalles que marcan la diferencia entre una simulación que "funciona por suerte" y una implementación que realmente entiende y respeta los principios de concurrencia.

---

## 🧪 Pruebas de Concurrencia

Las pruebas simulan **múltiples operaciones paralelas** usando `setImmediate`, generando colisiones reales dentro del event loop de Node.js.

### Esto valida:

- ✓ Correcta detección de conflictos de versión
- ✓ Funcionamiento del mecanismo CAS
- ✓ Consistencia final del saldo tras operaciones concurrentes

---

## 🚀 Ejecución

```bash
# Instalar dependencias
pnpm install

# Ejecutar pruebas
pnpm test

# Iniciar aplicación
pnpm start
```

---

## ✨ Resultado Esperado

La cuenta mantiene un **estado consistente** aunque reciba cientos de operaciones concurrentes simultáneas, garantizando la integridad de los datos sin necesidad de locks o transacciones pesadas.
