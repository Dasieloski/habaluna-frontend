'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { getFirstImage, getImageUrl } from '@/lib/image-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container py-12">
        <p>Cargando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Pedido no encontrado</h2>
        <Link href="/profile">
          <Button>Volver a mis pedidos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Link href="/profile" className="inline-flex items-center gap-2 text-primary mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Volver a mis pedidos
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Pedido {order.orderNumber}</h1>
        <p className="text-gray-600">
          Realizado el {new Date(order.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Estado del pedido</p>
                <p className="font-semibold capitalize">{order.status.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado del pago</p>
                <p className="font-semibold capitalize">{order.paymentStatus.toLowerCase()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección de Envío
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-semibold">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.zipCode} {order.shippingAddress.city}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (21%)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>
                  {order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {getFirstImage(item.product.images) ? (
                    <img
                      src={getImageUrl(getFirstImage(item.product.images))!}
                      alt={item.product.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-semibold hover:text-primary">{item.product.name}</h3>
                  </Link>
                  {item.variantName && (
                    <p className="text-sm text-gray-500">Variante: {item.variantName}</p>
                  )}
                  <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.price)}</p>
                  <p className="text-sm text-gray-600">
                    Total: {formatPrice(Number(item.price) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

