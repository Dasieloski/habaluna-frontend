# Microinteracciones Profesionales - Habaluna

## 📋 Resumen

Sistema completo de microinteracciones profesionales integrado en todo el frontend usando **Framer Motion**. Todas las animaciones son sutiles, rápidas y coherentes entre sí, creando una experiencia de usuario "premium" y moderna.

## 🎯 Objetivos Cumplidos

✅ Sensación moderna, fluida y "premium" en todo el sitio  
✅ Feedback visual sutil a las acciones del usuario  
✅ Alto rendimiento y coherencia visual  
✅ Animaciones sutiles, nada exagerado ni molesto  

## 📁 Archivos Modificados

### Componentes Base (UI)

1. **`components/ui/button.tsx`**
   - Microinteracciones: hover scale (1.02), tap scale (0.98)
   - Duración: 150ms con easing suave
   - Comentarios: Cómo desactivar animaciones

2. **`components/ui/input.tsx`**
   - Microinteracciones: focus scale (1.01), hover shadow, error shake
   - Animación shake automática cuando hay error
   - Duración: 200ms para transiciones

3. **`components/ui/card.tsx`**
   - Microinteracciones: hover lift (-2px) y sombra más pronunciada
   - Duración: 200ms con easing suave

4. **`components/ui/select.tsx`**
   - Microinteracciones: hover shadow mejorada
   - Transiciones suaves para focus y hover

### Componentes Nuevos

5. **`components/ui/form-error.tsx`** (NUEVO)
   - Microinteracciones: aparición con fade + slide + shake sutil
   - Desaparición suave al ocultar
   - Usado en: Formularios de checkout y otros

6. **`components/ui/form-success.tsx`** (NUEVO)
   - Microinteracciones: aparición con fade + scale + check icon bounce
   - Animación de check con spring animation
   - Usado en: Confirmaciones de formularios

7. **`components/ui/animated-list.tsx`** (NUEVO)
   - Microinteracciones: aparición progresiva (stagger) con fade + slide
   - Animación solo cuando entra al viewport (IntersectionObserver)
   - Configurable: staggerDelay, enableAnimations, animateOnViewport

8. **`components/ui/animated-link.tsx`** (NUEVO)
   - Microinteracciones: 3 variantes (underline, scale, lift)
   - Hover suave según variante
   - Usado en: Navegación y links del sitio

### Transiciones de Página

9. **`components/layout/page-transition.tsx`**
   - Microinteracciones: Estilo SSGOI (salida → entrada)
   - Entrada: opacity 0→1, translateY 8px→0
   - Salida: opacity 1→0, translateY 0→-8px
   - Duración: 300ms, easing: easeInOut
   - Integrado en: `components/layout/conditional-layout.tsx`

10. **`components/layout/conditional-layout.tsx`**
    - Integración de PageTransition dentro del `<main>`
    - Mantiene Header y Footer estáticos (sin transición)

### Componentes de Productos

11. **`components/product/product-card.tsx`**
    - Microinteracciones: aparición con fade + slide, hover lift (-4px)
    - Animación de entrada: opacity 0→1, y 20→0 (300ms)

12. **`app/(main)/products/products-client.tsx`**
    - Integración de `AnimatedList` para grid de productos
    - Stagger delay: 50ms entre cada producto
    - Animación solo cuando entra al viewport

### Formularios

13. **`app/(main)/checkout/page.tsx`**
    - Todos los mensajes de error ahora usan `FormError`
    - Animaciones de error mejoradas en todos los campos
    - Integración completa de microinteracciones

### Estilos Globales

14. **`app/globals.css`**
    - Animación `shake` agregada para inputs con error
    - Keyframes para animación shake sutil

## 🎨 Tipos de Microinteracciones Aplicadas

### 1. Navegación entre Páginas
- ✅ Transiciones estilo SSGOI (salida → entrada)
- ✅ Entrada: opacity 0→1, translateY 8px→0 (300ms)
- ✅ Salida: opacity 1→0, translateY 0→-8px (300ms)
- ✅ Easing: easeInOut
- ✅ Sin parpadeos ni dobles renders (mode="wait")

### 2. Botones y Elementos Clickeables
- ✅ Hover: scale 1.02 (ligero crecimiento)
- ✅ Click/Tap: scale 0.98 (feedback táctil)
- ✅ Duración: 150ms, easing: easeOut
- ✅ Transiciones suaves entre estados

### 3. Formularios
- ✅ Inputs: focus scale 1.01, hover shadow mejorada
- ✅ Error: shake animation sutil (0.4s)
- ✅ Mensajes de error: fade + slide + shake al aparecer
- ✅ Mensajes de éxito: fade + scale + check icon bounce
- ✅ Confirmación visual al enviar

### 4. Listas y Tarjetas
- ✅ Aparición progresiva (stagger) con fade + slide
- ✅ Delay configurable entre elementos (default: 50ms)
- ✅ Animación solo cuando entra al viewport (performance)
- ✅ ProductCard: hover lift (-4px) y sombra mejorada

### 5. Links y Navegación
- ✅ Variante underline: subrayado animado al hover
- ✅ Variante scale: ligero scale (1.05) al hover
- ✅ Variante lift: lift sutil (-2px) al hover

## 🔧 Cómo Ajustar o Desactivar Animaciones

### Desactivar Todas las Animaciones de un Componente

```tsx
// Button sin animaciones
<Button enableAnimations={false}>Click me</Button>

// Input sin animaciones
<Input enableAnimations={false} />

// Card sin animaciones
<Card enableAnimations={false}>Content</Card>

// AnimatedList sin animaciones
<AnimatedList enableAnimations={false}>
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</AnimatedList>

// AnimatedLink sin animaciones
<AnimatedLink enableAnimations={false} href="/">Link</AnimatedLink>
```

### Ajustar Parámetros de Animación

#### AnimatedList
```tsx
<AnimatedList
  staggerDelay={0.1} // Cambiar delay entre elementos (default: 0.05)
  animateOnViewport={false} // Animar inmediatamente sin esperar viewport
  enableAnimations={true} // Habilitar/deshabilitar
>
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</AnimatedList>
```

#### Button (modificar en `button.tsx`)
```tsx
// Cambiar scale de hover
whileHover: { scale: 1.05 } // Más pronunciado

// Cambiar scale de click
whileTap: { scale: 0.95 } // Más pronunciado

// Cambiar duración
transition: { duration: 0.2 } // Más lento
```

#### Input (modificar en `input.tsx`)
```tsx
// Cambiar scale de focus
whileFocus: { scale: 1.02 } // Más pronunciado

// Cambiar duración de shake
// En globals.css, modificar @keyframes shake
```

#### PageTransition (modificar en `page-transition.tsx`)
```tsx
// Cambiar distancia de movimiento
initial: { y: 12 } // Más movimiento (default: 8)

// Cambiar duración
duration: 0.4 // Más lento (default: 0.3)

// Cambiar easing
ease: 'easeIn' // Diferente curva (default: 'easeInOut')
```

#### FormError (modificar en `form-error.tsx`)
```tsx
// Cambiar distancia de shake
animate: { x: [0, -6, 6, -6, 6, 0] } // Más pronunciado (default: -4/4)

// Cambiar duración
duration: 0.4 // Más lento (default: 0.3)
```

### Cambiar Estilo de AnimatedLink

```tsx
// Underline animado (default)
<AnimatedLink href="/products" variant="underline">Productos</AnimatedLink>

// Scale al hover
<AnimatedLink href="/about" variant="scale">Sobre nosotros</AnimatedLink>

// Lift al hover
<AnimatedLink href="/contact" variant="lift">Contacto</AnimatedLink>
```

## 🚀 Rendimiento

- ✅ Animaciones optimizadas: duraciones cortas (150-300ms)
- ✅ IntersectionObserver: animaciones solo cuando entran al viewport
- ✅ SSR compatible: componentes 'use client' solo donde es necesario
- ✅ No afecta layouts: todas las animaciones son transform/opacity
- ✅ Scroll behavior intacto: no interfiere con el scroll nativo

## 📝 Notas Técnicas

1. **Framer Motion ya estaba instalado**: No se añadieron nuevas dependencias
2. **App Router**: Todas las integraciones son compatibles con Next.js App Router
3. **TypeScript**: Todos los componentes tienen tipos completos
4. **Accesibilidad**: Las animaciones respetan `prefers-reduced-motion` implícitamente
5. **Comentarios claros**: Todos los componentes tienen documentación inline

## 🎯 Próximos Pasos (Opcional)

Si quieres agregar más microinteracciones:

1. **Loading states**: Spinners con animaciones sutiles
2. **Skeleton loaders**: Animaciones de shimmer para carga
3. **Modal animations**: Aparición/desaparición de modales
4. **Dropdown animations**: Animaciones en menús desplegables
5. **Toast notifications**: Ya mejorado en `toaster.tsx`

## ⚠️ Precauciones

- No modificar `transition-all` a `transition-none` globalmente (rompería las animaciones)
- Mantener duraciones entre 150-300ms para sensación "snappy"
- Evitar animaciones pesadas (transform/opacity son las más eficientes)
- No animar `width` o `height` directamente (usar `scale` en su lugar)

---

**Última actualización**: 2025-01-09  
**Versión**: 1.0.0  
**Framework**: Next.js 16 (App Router) + Framer Motion 12
