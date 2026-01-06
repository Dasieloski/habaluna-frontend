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
import { formatPrice } from '@/lib/utils';
import { SupernovaWidget } from '@/components/payment/supernova-widget';
import { isCatalogMode } from '@/lib/catalog-mode';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellidos requeridos'),
  address: z.string().min(1, 'Dirección requerida'),
  city: z.string().min(1, 'Ciudad requerida'),
  zipCode: z.string().min(1, 'Código postal requerido'),
  country: z.string().min(1, 'País requerido'),
  phone: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState<CheckoutForm | null>(null);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { items, subtotal, clearCart } = useCartStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
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
    }
  }, [isAuthenticated, items, router]);

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    setError('');

    try {
      // Crear la orden primero (sin procesar el pago aún)
      const orderData = {
        shippingAddress: data,
        billingAddress: data,
        // No incluimos paymentIntentId todavía, se agregará después del pago exitoso
      };

      const response = await api.post('/orders', orderData);
      setOrderId(response.data.id);
      setShippingData(data);
      setShowPayment(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el pedido');
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
      router.push(`/profile?order=${orderId}&success=true`);
    } catch (err: any) {
      console.error('Error al actualizar la orden:', err);
      // Aún así redirigir, el pago ya fue exitoso
      clearCart();
      router.push(`/profile?order=${orderId}&success=true`);
    }
  };

  const handlePaymentError = (error: { error: string }) => {
    setError(`Error en el pago: ${error.error}`);
    setShowPayment(false);
  };

  const tax = subtotal * 0.21;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {!showPayment ? (
            <Card>
              <CardHeader>
                <CardTitle>Información de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" {...register('address')} />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" {...register('city')} />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Código Postal</Label>
                    <Input id="zipCode" {...register('zipCode')} />
                    {errors.zipCode && (
                      <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Input id="country" {...register('country')} defaultValue="España" />
                    {errors.country && (
                      <p className="text-sm text-destructive">{errors.country.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (opcional)</Label>
                    <Input id="phone" {...register('phone')} />
                  </div>
                </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Creando pedido...' : 'Continuar al Pago'}
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
                {error && <p className="text-sm text-destructive mb-4">{error}</p>}
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

