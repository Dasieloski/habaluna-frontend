'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPrice } from '@/lib/utils';
import { SupernovaWidget } from '@/components/payment/supernova-widget';
import { isCatalogMode } from '@/lib/catalog-mode';
import { useCartValidation } from '@/hooks/use-cart-validation';
import { AlertTriangle, Tag, X } from 'lucide-react';
import { showSuccess, showError } from '@/components/ui/use-toast';
import { FormError } from '@/components/ui/form-error';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellidos requeridos'),
  address: z.string().min(1, 'Dirección requerida'),
  municipality: z.string().min(1, 'Municipio requerido'),
  city: z.string().min(1, 'Ciudad requerida'),
  zipCode: z.string().min(1, 'Código postal requerido'),
  country: z.string().min(1, 'País requerido'),
  phone: z.string().min(1, 'Teléfono requerido'),
  reference: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState<CheckoutForm | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount: number; name: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { items, subtotal, clearCart, fetchCart } = useCartStore();
  const { validation, validateCart, isValid, hasIssues, loading: validationLoading } = useCartValidation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      city: 'La Habana',
      country: 'Cuba',
    },
  });

  useEffect(() => {
    // En modo catálogo, redirigir a productos
    if (isCatalogMode()) {
      router.push('/products');
      return;
    }

    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    // Validar el carrito al entrar al checkout
    validateCart();
  }, [isAuthenticated, items, router, validateCart]);

  // Redirigir si hay problemas de stock
  useEffect(() => {
    if (validation && hasIssues) {
      // Mostrar error pero no redirigir automáticamente para que el usuario vea qué está mal
      setError('Hay problemas con el stock de algunos productos. Por favor, revisa tu carrito.');
    }
  }, [validation, hasIssues]);

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    setError('');

    try {
      // Validar el carrito antes de proceder
      await validateCart();
      
      // Si hay problemas de stock, no permitir continuar
      if (hasIssues) {
        setError('Hay problemas con el stock de algunos productos. Por favor, actualiza tu carrito y vuelve a intentar.');
        setLoading(false);
        return;
      }

      // Crear la orden primero (sin procesar el pago aún)
      const orderData = {
        shippingAddress: data,
        billingAddress: data,
        offerId: appliedCoupon?.id, // ID del cupón aplicado
        // No incluimos paymentIntentId todavía, se agregará después del pago exitoso
      };

      const response = await api.post('/orders', orderData);
      setOrderId(response.data.id);
      setShippingData(data);
      setShowPayment(true);
      showSuccess(
        'Orden creada',
        'Tu orden ha sido creada exitosamente. Procede con el pago.'
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear el pedido';
      setError(errorMessage);
      showError('Error al crear la orden', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (data: { transactionId: string; amount: string; currency: string }) => {
    try {
      // Actualizar la orden con el transactionId del pago
      if (orderId) {
        // Actualizar el paymentIntentId y el estado de la orden
        await api.patch(`/orders/${orderId}`, {
          paymentIntentId: data.transactionId,
        });
      }
      
      clearCart();
      showSuccess(
        'Pago exitoso',
        'Tu orden ha sido procesada correctamente. Gracias por tu compra.'
      );
      router.push(`/profile?order=${orderId}&success=true`);
    } catch (err: any) {
      console.error('Error al actualizar la orden:', err);
      // Aún así redirigir, el pago ya fue exitoso
      clearCart();
      showSuccess(
        'Pago exitoso',
        'Tu orden ha sido procesada correctamente. Gracias por tu compra.'
      );
      router.push(`/profile?order=${orderId}&success=true`);
    }
  };

  const handlePaymentError = (error: { error: string }) => {
    setError(`Error en el pago: ${error.error}`);
    setShowPayment(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const result = await api.validateOffer(couponCode.trim(), subtotal);
      
      if (result.valid && result.offer) {
        setAppliedCoupon({
          id: result.offer.id,
          code: result.offer.code,
          discount: result.discount,
          name: result.offer.name,
        });
        setCouponCode('');
        showSuccess('Cupón aplicado', `Descuento de ${formatPrice(result.discount)} aplicado`);
      } else {
        setCouponError(result.message || 'Cupón inválido');
        showError('Cupón inválido', result.message || 'El cupón no es válido');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al validar el cupón';
      setCouponError(errorMessage);
      showError('Error', errorMessage);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const subtotalWithDiscount = subtotal - (appliedCoupon?.discount || 0);
  const tax = subtotalWithDiscount * 0.21;
  const shipping = subtotalWithDiscount >= 50 ? 0 : 5.99;
  const total = subtotalWithDiscount + tax + shipping;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-2">
          {!showPayment ? (
            <Card>
              <CardHeader>
                <CardTitle>Información de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Alertas de validación de stock */}
                  {validation && hasIssues && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-900 mb-2">Problemas de disponibilidad</h3>
                          <ul className="space-y-1 text-sm text-red-800">
                            {validation.items
                              .filter((item) => item.issue !== null)
                              .map((item) => {
                                const variantText = item.variantName ? ` (${item.variantName})` : '';
                                let message = '';
                                switch (item.issue) {
                                  case 'out_of_stock':
                                    message = `"${item.productName}${variantText}" ya no está disponible`;
                                    break;
                                  case 'insufficient_stock':
                                    message = `Solo ${item.availableStock} disponible${item.availableStock > 1 ? 's' : ''} de "${item.productName}${variantText}"`;
                                    break;
                                  case 'unavailable':
                                    message = `"${item.productName}${variantText}" ya no está disponible`;
                                    break;
                                }
                                return message ? (
                                  <li key={item.itemId} className="flex items-start gap-2">
                                    <span className="text-red-600 mt-1">•</span>
                                    <span>{message}</span>
                                  </li>
                                ) : null;
                              })}
                          </ul>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-3"
                            onClick={() => router.push('/cart')}
                          >
                            Ir al carrito
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {error && <FormError message={error} />}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && (
                      <FormError message={errors.firstName.message} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && (
                      <FormError message={errors.lastName.message} />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección completa *</Label>
                  <Input 
                    id="address" 
                    {...register('address')} 
                    placeholder="Calle, número, entre calles"
                  />
                  {errors.address && (
                    <FormError message={errors.address.message} />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="municipality">Municipio *</Label>
                    <Select
                      value={watch('municipality') || ''}
                      onValueChange={(value) => setValue('municipality', value, { shouldValidate: true })}
                    >
                      <SelectTrigger id="municipality">
                        <SelectValue placeholder="Selecciona un municipio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Playa">Playa</SelectItem>
                        <SelectItem value="Vedado">Vedado</SelectItem>
                        <SelectItem value="Centro Habana">Centro Habana</SelectItem>
                        <SelectItem value="Habana Vieja">Habana Vieja</SelectItem>
                        <SelectItem value="Habana del Este">Habana del Este</SelectItem>
                        <SelectItem value="Marianao">Marianao</SelectItem>
                        <SelectItem value="Cerro">Cerro</SelectItem>
                        <SelectItem value="Diez de Octubre">Diez de Octubre</SelectItem>
                        <SelectItem value="Arroyo Naranjo">Arroyo Naranjo</SelectItem>
                        <SelectItem value="Boyeros">Boyeros</SelectItem>
                        <SelectItem value="San Miguel del Padrón">San Miguel del Padrón</SelectItem>
                        <SelectItem value="Cotorro">Cotorro</SelectItem>
                        <SelectItem value="Guanabacoa">Guanabacoa</SelectItem>
                        <SelectItem value="Regla">Regla</SelectItem>
                        <SelectItem value="Plaza de la Revolución">Plaza de la Revolución</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.municipality && (
                      <FormError message={errors.municipality.message} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input 
                      id="city" 
                      {...register('city')} 
                      defaultValue="La Habana"
                      readOnly
                      className="bg-gray-50"
                    />
                    {errors.city && (
                      <FormError message={errors.city.message} />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Código Postal *</Label>
                    <Input 
                      id="zipCode" 
                      {...register('zipCode')} 
                      placeholder="Ej: 10400"
                    />
                    {errors.zipCode && (
                      <FormError message={errors.zipCode.message} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">País *</Label>
                    <Input 
                      id="country" 
                      {...register('country')} 
                      defaultValue="Cuba"
                      readOnly
                      className="bg-gray-50"
                    />
                    {errors.country && (
                      <FormError message={errors.country.message} />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input 
                      id="phone" 
                      {...register('phone')} 
                      placeholder="Ej: +53 5XXXXXXXX"
                    />
                    {errors.phone && (
                      <FormError message={errors.phone.message} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">Referencia (opcional)</Label>
                    <Input 
                      id="reference" 
                      {...register('reference')} 
                      placeholder="Puntos de referencia para la entrega"
                    />
                  </div>
                </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    disabled={loading || validationLoading || Boolean(validation && hasIssues)}
                  >
                    {loading ? 'Creando pedido...' : validationLoading ? 'Validando...' : (validation && hasIssues) ? 'Resuelve los problemas de stock' : 'Continuar al Pago'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Completa tu Pago</CardTitle>
              </CardHeader>
              <CardContent>
                {error && <FormError message={error} className="mb-4" />}
                {orderId && (
                  <SupernovaWidget
                    amount={total.toFixed(2)}
                    currency="USD"
                    orderId={orderId}
                    description={`Pedido ${orderId}`}
                    customerEmail={user?.email}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Sección de cupón */}
              <div className="mb-6 pb-4 border-b">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <Label htmlFor="coupon" className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Código de cupón
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        placeholder="Ingresa tu código"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        disabled={validatingCoupon}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        size="sm"
                      >
                        {validatingCoupon ? '...' : 'Aplicar'}
                      </Button>
                    </div>
                    {couponError && (
                      <FormError message={couponError} />
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Cupón aplicado: {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {appliedCoupon.name} - Descuento: {formatPrice(appliedCoupon.discount)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product.name}
                      {item.productVariant && ` - ${item.productVariant.name}`} x {item.quantity}
                    </span>
                    <span>
                      {formatPrice(
                        item.productVariant?.priceUSD || item.product.priceUSD,
                        item.productVariant?.priceMNs || item.product.priceMNs
                      )}
                      {item.quantity > 1 && ` x ${item.quantity}`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Descuento ({appliedCoupon.code})</span>
                    <span>-{formatPrice(appliedCoupon.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Subtotal con descuento</span>
                  <span>{formatPrice(subtotalWithDiscount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (21%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

