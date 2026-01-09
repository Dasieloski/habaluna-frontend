'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Componente de búsqueda con autocompletado
 * Muestra sugerencias basadas en productos mientras el usuario escribe
 */
export function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Buscar productos...',
  className,
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [historySuggestions, setHistorySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Cargar historial de búsquedas cuando el input está vacío
  useEffect(() => {
    if (!value.trim() && isAuthenticated()) {
      const loadHistory = async () => {
        try {
          const history = await api.getSearchHistory(5);
          setHistorySuggestions(history.map((h: any) => h.searchTerm));
        } catch {
          // Ignorar errores
        }
      };
      loadHistory();
    } else {
      setHistorySuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Cargar sugerencias cuando el usuario escribe
  useEffect(() => {
    if (!value.trim() || value.length < 2) {
      setSuggestions([]);
      if (!value.trim()) {
        setShowSuggestions(historySuggestions.length > 0);
      } else {
        setShowSuggestions(false);
      }
      return;
    }

    const loadSuggestions = async () => {
      setLoading(true);
      try {
        // Primero intentar obtener sugerencias del historial (silenciosamente)
        try {
          const historySuggestions = await api.getSearchSuggestions(value, 3);
          if (historySuggestions && historySuggestions.length > 0) {
            setSuggestions(historySuggestions);
            setShowSuggestions(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          // Silenciar errores de sugerencias del historial y continuar con búsqueda de productos
          console.debug('Error obteniendo sugerencias del historial:', error);
        }

        // Buscar productos con el término de búsqueda
        const response = await api.getProducts({
          search: value,
          limit: 5, // Solo mostrar 5 sugerencias
        });

        // Extraer nombres únicos de productos que coincidan
        const productNames = response.data
          .map((p) => p.name)
          .filter((name) => name.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5);

        setSuggestions(productNames);
        setShowSuggestions(productNames.length > 0);
      } catch (error) {
        // Silenciar errores de autocompletado
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    if (onSelect) {
      // Si hay callback onSelect (navbar), usarlo y no navegar automáticamente
      // El navbar maneja la navegación con router.push en handleNavbarSearch
      onSelect(suggestion);
    } else {
      // Para product-filters, solo actualizar el estado
      // El debouncedSearch en ProductFilters manejará la actualización de URL
      // No navegamos aquí para mantener la independencia
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Detectar si se usa en navbar (tiene onSelect) o en product-filters
  const isNavbar = !!onSelect;
  
  return (
    <div 
      ref={containerRef} 
      className={cn('relative', isNavbar ? 'flex-1' : 'flex-1', className)}
      data-navbar-search={isNavbar ? 'true' : undefined}
    >
      <div className="relative w-full group">
        <Search className={cn(
          "absolute top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-sky-500 transition-colors",
          isNavbar ? "left-4 w-5 h-5" : "left-3 w-4 h-4 text-gray-400"
        )} />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0 || historySuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={(e) => {
            // No hacer nada con Enter - solo permitir navegación al seleccionar sugerencias
            if (e.key === 'Escape') {
              setShowSuggestions(false);
              inputRef.current?.blur();
            }
          }}
          className={cn(
            isNavbar 
              ? "pl-12 pr-10 h-12 bg-secondary/50 border-0 rounded-2xl focus:ring-2 focus:ring-sky-300 transition-all duration-300 focus:bg-white"
              : "pl-10 pr-10"
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {showSuggestions && (suggestions.length > 0 || historySuggestions.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-sm text-gray-500 text-center">Buscando...</div>
          ) : (
            <>
              {/* Mostrar historial de búsquedas si el input está vacío */}
              {!value.trim() && historySuggestions.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
                    Búsquedas recientes
                  </div>
                  {historySuggestions.map((suggestion, index) => (
                    <button
                      key={`history-${index}`}
                      type="button"
                      onClick={() => handleSelect(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </>
              )}
              {/* Mostrar sugerencias de productos */}
              {value.trim() && suggestions.length > 0 && (
                <>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      type="button"
                      onClick={() => handleSelect(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-3 h-3 text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelect) {
                        // Navbar: ejecutar callback que maneja la navegación
                        onSelect(value);
                      } else {
                        // Product-filters: actualizar el estado, el debounce manejará la URL
                        onChange(value);
                      }
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium text-sky-600 border-t border-gray-200"
                  >
                    Ver todos los resultados para "{value}"
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
