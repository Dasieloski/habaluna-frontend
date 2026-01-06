"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { SalesChart } from "@/components/admin/sales-chart"
import { RecentOrders } from "@/components/admin/recent-orders"
import { TopProducts } from "@/components/admin/top-products"
import { QuickActions } from "@/components/admin/quick-actions"
import { CategoryChart } from "@/components/admin/category-chart"
import { ComparisonChart } from "@/components/admin/comparison-chart"
import { TrafficChart } from "@/components/admin/traffic-chart"
import { PerformanceMetrics } from "@/components/admin/performance-metrics"

export default function AdminDashboard() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div
        className={`transition-all duration-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bienvenido de vuelta. Aquí tienes un resumen de tu tienda.</p>
      </div>

      {/* Stats cards */}
      <DashboardStats isLoaded={isLoaded} />

      <PerformanceMetrics isLoaded={isLoaded} />

      {/* Main charts section with tabs */}
      <Card
        className={`border-0 shadow-md transition-all duration-500 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <CardHeader>
          <CardTitle className="text-foreground">Análisis de Ventas</CardTitle>
          <CardDescription>Visualiza el rendimiento de tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="daily">Diario</TabsTrigger>
              <TabsTrigger value="comparison">Comparativa Anual</TabsTrigger>
              <TabsTrigger value="categories">Por Categoría</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <SalesChart />
            </TabsContent>
            <TabsContent value="comparison">
              <ComparisonChart />
            </TabsContent>
            <TabsContent value="categories">
              <CategoryChart />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Charts and tables - 3 column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Traffic sources */}
        <Card
          className={`border-0 shadow-md transition-all duration-500 delay-400 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <CardHeader>
            <CardTitle className="text-foreground">Fuentes de Tráfico</CardTitle>
            <CardDescription>De dónde vienen tus visitantes</CardDescription>
          </CardHeader>
          <CardContent>
            <TrafficChart />
          </CardContent>
        </Card>

        {/* Top products */}
        <Card
          className={`border-0 shadow-md transition-all duration-500 delay-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <CardHeader>
            <CardTitle className="text-foreground">Productos más vendidos</CardTitle>
            <CardDescription>Top 5 este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <TopProducts />
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card
          className={`border-0 shadow-md transition-all duration-500 delay-600 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <CardHeader>
            <CardTitle className="text-foreground">Acciones rápidas</CardTitle>
            <CardDescription>Tareas frecuentes del panel</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>

      {/* Recent orders - full width */}
      <Card
        className={`border-0 shadow-md transition-all duration-500 delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <CardHeader>
          <CardTitle className="text-foreground">Pedidos recientes</CardTitle>
          <CardDescription>Últimas transacciones de tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentOrders />
        </CardContent>
      </Card>
    </div>
  )
}
