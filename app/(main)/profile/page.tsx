'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';
import { 
  User, 
  Package, 
  Heart, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Edit,
  ShoppingBag,
  TrendingUp,
  Award,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

function normalizeImageUrl(imagePath: string): string {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api\/?$/, "");
  if (imagePath.startsWith("/")) return `${base}${imagePath}`;
  return `${base}/uploads/${imagePath}`;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user, accessToken, refreshToken, setAuth } = useAuthStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [profileResponse, ordersResponse] = await Promise.all([
          api.get('/users/me'),
          api.get('/orders'),
        ]);

        setProfile(profileResponse.data);
        reset(profileResponse.data);
        setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
        fetchWishlist();

        // Mantener el store sincronizado
        if (accessToken && refreshToken) {
          setAuth({ ...(user || {}), ...profileResponse.data }, accessToken, refreshToken);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: error?.response?.data?.message || 'No se pudieron cargar los datos del perfil',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router, reset, accessToken, refreshToken, user, setAuth, fetchWishlist, toast]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      await api.patch('/users/me', data);
      const profileResponse = await api.get('/users/me');
      setProfile(profileResponse.data);
      reset(profileResponse.data);
      if (accessToken && refreshToken) {
        setAuth({ ...(user || {}), ...profileResponse.data }, accessToken, refreshToken);
      }
      toast({
        title: 'Éxito',
        description: 'Perfil actualizado correctamente',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Calcular estadísticas
  const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
  const wishlistCount = wishlistItems.length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Pendiente', variant: 'secondary' },
      PROCESSING: { label: 'Procesando', variant: 'secondary' },
      SHIPPED: { label: 'Enviado', variant: 'default' },
      DELIVERED: { label: 'Entregado', variant: 'default' },
      COMPLETED: { label: 'Completado', variant: 'default' },
      CANCELLED: { label: 'Cancelado', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
              <p className="text-muted-foreground">Cargando tu perfil...</p>
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Mi Perfil
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal, pedidos y productos favoritos
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
                  <p className="text-sm text-muted-foreground mb-1">Pedidos</p>
                  <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Favoritos</p>
                  <p className="text-2xl font-bold text-rose-600">{wishlistCount}</p>
                </div>
                <Heart className="w-8 h-8 text-rose-500" />
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
                <Award className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-border/50 shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-600">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-600">
              Información Personal
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-600">
              Mis Pedidos ({totalOrders})
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-600">
              Favoritos ({wishlistCount})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información de cuenta */}
              <Card className="lg:col-span-2 border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">
                        {profile?.firstName && profile?.lastName
                          ? `${profile.firstName} ${profile.lastName}`
                          : user?.email || 'Usuario'}
                      </CardTitle>
                      <CardDescription className="mt-1">{user?.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estado de cuenta</span>
                    <Badge variant={profile?.isActive === false ? 'destructive' : 'default'}>
                      {profile?.isActive === false ? 'Inactivo' : 'Activo'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cliente desde</span>
                    <span className="font-medium">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Teléfono
                      </span>
                      <span className="font-medium">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Dirección
                      </span>
                      <span className="font-medium text-right max-w-[60%]">
                        {profile.address}
                        {profile.city && `, ${profile.city}`}
                        {profile.zipCode && ` ${profile.zipCode}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumen de actividad */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pedidos pendientes</span>
                      <span className="font-semibold">{pendingOrders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pedidos completados</span>
                      <span className="font-semibold">{completedOrders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Promedio por pedido</span>
                      <span className="font-semibold">
                        {totalOrders > 0 ? formatPrice(totalSpent / totalOrders) : formatPrice(0)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Link href="/orders">
                      <Button variant="outline" className="w-full">
                        Ver todos los pedidos
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pedidos recientes */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pedidos Recientes</CardTitle>
                  <Link href="/orders">
                    <Button variant="ghost" size="sm">
                      Ver todos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No tienes pedidos aún</p>
                    <Link href="/products">
                      <Button>Explorar productos</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="block p-4 border rounded-lg hover:bg-sky-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-foreground">
                                Pedido #{order.orderNumber || order.id.slice(0, 8)}
                              </span>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleDateString('es-ES')}
                              </span>
                              <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información personal y de contacto</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        className="bg-secondary/50 border-transparent focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellidos</Label>
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        className="bg-secondary/50 border-transparent focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+53 5XX XXX XXXX"
                      className="bg-secondary/50 border-transparent focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      {...register('address')}
                      placeholder="Calle y número"
                      className="bg-secondary/50 border-transparent focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        {...register('city')}
                        placeholder="Ciudad"
                        className="bg-secondary/50 border-transparent focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Código Postal</Label>
                      <Input
                        id="zipCode"
                        {...register('zipCode')}
                        placeholder="CP"
                        className="bg-secondary/50 border-transparent focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        {...register('country')}
                        placeholder="País"
                        className="bg-secondary/50 border-transparent focus:border-primary"
                        defaultValue="Cuba"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Historial de Pedidos</CardTitle>
                <CardDescription>Gestiona y revisa todos tus pedidos</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No tienes pedidos aún</p>
                    <Link href="/products">
                      <Button>Explorar productos</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="block p-6 border rounded-lg hover:bg-sky-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-semibold text-foreground">
                                Pedido #{order.orderNumber || order.id.slice(0, 8)}
                              </span>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                              {order.items && order.items.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Package className="w-4 h-4" />
                                  {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-sky-600">{formatPrice(order.total)}</p>
                            <ArrowRight className="w-5 h-5 text-muted-foreground mt-2 ml-auto" />
                          </div>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="pt-4 border-t">
                            <div className="flex gap-2 overflow-x-auto">
                              {order.items.slice(0, 5).map((item: any, idx: number) => {
                                const product = item.product || {};
                                const img =
                                  Array.isArray(product.images) && product.images.length
                                    ? normalizeImageUrl(product.images[0])
                                    : '/placeholder.svg';
                                return (
                                  <div key={idx} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border">
                                    <Image
                                      src={img}
                                      alt={product.name || 'Producto'}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                );
                              })}
                              {order.items.length > 5 && (
                                <div className="flex-shrink-0 w-16 h-16 rounded-lg border border-dashed flex items-center justify-center bg-muted/50">
                                  <span className="text-xs text-muted-foreground">+{order.items.length - 5}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Productos Favoritos</CardTitle>
                <CardDescription>Tus productos guardados para más tarde</CardDescription>
              </CardHeader>
              <CardContent>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Tu lista de favoritos está vacía</p>
                    <Link href="/products">
                      <Button>Explorar productos</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlistItems.map((wi) => {
                      const p: any = wi.product || {};
                      const price = typeof p.priceUSD === 'number' ? p.priceUSD : Number(p.priceUSD || 0);
                      const compare =
                        p.comparePriceUSD !== null && p.comparePriceUSD !== undefined
                          ? Number(p.comparePriceUSD)
                          : null;
                      const hasDiscount = compare !== null && compare > price;
                      const img =
                        Array.isArray(p.images) && p.images.length
                          ? normalizeImageUrl(p.images[0])
                          : '/placeholder.svg';
                      return (
                        <Link
                          key={wi.id}
                          href={`/products/${p.slug}`}
                          className="group block"
                        >
                          <div className="relative aspect-square rounded-lg overflow-hidden mb-3 border">
                            <Image
                              src={img}
                              alt={p.name || 'Producto'}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-sky-600">
                              {formatPrice(price)}
                            </span>
                            {hasDiscount && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(compare!)}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
