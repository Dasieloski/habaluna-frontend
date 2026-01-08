'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import {
  ArrowLeft,
  Package,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function normalizeImageUrl(imagePath: string): string {
  if (!imagePath) return '/placeholder.svg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');
  if (imagePath.startsWith('/')) return `${base}${imagePath}`;
  return `${base}/uploads/${imagePath}`;
}

const getStatusBadge = (status: string) => {
  const statusMap: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; color: string }
  > = {
    PENDING: {
      label: 'Pendiente',
      variant: 'secondary',
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    },
    PROCESSING: {
      label: 'Procesando',
      variant: 'secondary',
      icon: Package,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    SHIPPED: {
      label: 'Enviado',
      variant: 'default',
      icon: Truck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    DELIVERED: {
      label: 'Entregado',
      variant: 'default',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    COMPLETED: {
      label: 'Completado',
      variant: 'default',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    CANCELLED: {
      label: 'Cancelado',
      variant: 'destructive',
      icon: XCircle,
      color: 'text-red-600 bg-red-50 border-red-200',
    },
  };
  const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const, icon: Package, color: '' };
  const Icon = statusInfo.icon;
  return (
    <Badge
      variant={statusInfo.variant}
      className={`flex items-center gap-1.5 ${statusInfo.color} border`}
    >
      <Icon className="w-3.5 h-3.5" />
      {statusInfo.label}
    </Badge>
  );
};

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        const ordersList = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersList);
        setFilteredOrders(ordersList);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: error?.response?.data?.message || 'No se pudieron cargar los pedidos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router, toast]);

  useEffect(() => {
    let filtered = orders;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query) ||
          order.items?.some((item: any) =>
            item.product?.name?.toLowerCase().includes(query)
          )
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter]);

  // Calcular estadísticas
  const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (o) => o.status === 'DELIVERED' || o.status === 'COMPLETED'
  ).length;
  const pendingOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'PROCESSING'
  ).length;

  const statusOptions = [
    { value: 'all', label: 'Todos los pedidos' },
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'PROCESSING', label: 'Procesando' },
    { value: 'SHIPPED', label: 'Enviados' },
    { value: 'DELIVERED', label: 'Entregados' },
    { value: 'COMPLETED', label: 'Completados' },
    { value: 'CANCELLED', label: 'Cancelados' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
              <p className="text-muted-foreground">Cargando tus pedidos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mi perfil
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Mis Pedidos</h1>
          <p className="text-muted-foreground">
            Gestiona y revisa todos tus pedidos realizados
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md bg-gradient-to-br from-sky-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total gastado</p>
                  <p className="text-2xl font-bold text-sky-600">{formatPrice(totalSpent)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-sky-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-sky-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total pedidos</p>
                  <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completados</p>
                  <p className="text-2xl font-bold text-emerald-600">{completedOrders}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="border-0 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por número de pedido o producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>
              <div className="relative md:w-64">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-secondary/50 border border-transparent rounded-lg focus:border-primary focus:outline-none text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pedidos */}
        {filteredOrders.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12">
              <div className="text-center">
                {orders.length === 0 ? (
                  <>
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No tienes pedidos aún
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Comienza a explorar nuestros productos y realiza tu primer pedido
                    </p>
                    <Link href="/products">
                      <Button className="bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg">
                        Explorar productos
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No se encontraron pedidos
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Intenta ajustar los filtros o la búsqueda
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block group"
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:border-sky-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Información principal */}
                      <div className="flex-1 space-y-4">
                        {/* Header del pedido */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-6 h-6 text-sky-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                Pedido #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(order.createdAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(order.status)}
                            <div className="text-right">
                              <p className="text-2xl font-bold text-sky-600">{formatPrice(order.total)}</p>
                              {order.items && order.items.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  {order.items.length}{' '}
                                  {order.items.length === 1 ? 'producto' : 'productos'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Productos */}
                        {order.items && order.items.length > 0 && (
                          <div className="pt-4 border-t">
                            <div className="flex gap-3 overflow-x-auto pb-2">
                              {order.items.slice(0, 6).map((item: any, idx: number) => {
                                const product = item.product || {};
                                const img =
                                  Array.isArray(product.images) && product.images.length
                                    ? normalizeImageUrl(product.images[0])
                                    : '/placeholder.svg';
                                return (
                                  <div
                                    key={idx}
                                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-sky-300 transition-colors"
                                  >
                                    <Image
                                      src={img}
                                      alt={product.name || 'Producto'}
                                      width={80}
                                      height={80}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                );
                              })}
                              {order.items.length > 6 && (
                                <div className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
                                  <span className="text-xs font-semibold text-muted-foreground">
                                    +{order.items.length - 6}
                                  </span>
                                </div>
                              )}
                            </div>
                            {order.items.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                                <TrendingUp className="w-4 h-4" />
                                <span>
                                  Cantidad total: {order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)} unidades
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Información adicional */}
                        {order.shippingAddress && (
                          <div className="pt-3 border-t">
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Package className="w-4 h-4 mt-0.5" />
                              <span>
                                {order.shippingAddress.city && `${order.shippingAddress.city}, `}
                                {order.shippingAddress.country || 'Cuba'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Flecha de navegación */}
                      <div className="flex items-center md:flex-col md:justify-center">
                        <div className="w-10 h-10 rounded-full bg-sky-100 group-hover:bg-sky-200 flex items-center justify-center transition-colors">
                          <ArrowLeft className="w-5 h-5 text-sky-600 rotate-180" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Información adicional */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Mostrando {filteredOrders.length} de {orders.length} pedidos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
