'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type PaymentSuccess = {
  transactionId: string;
  amount: string;
  currency: string;
};

type PaymentError = {
  error: string;
};

export type SupernovaWidgetProps = {
  amount: string;
  currency: string;
  orderId: string;
  description?: string;
  customerEmail?: string;
  onSuccess: (data: PaymentSuccess) => void;
  onError: (error: PaymentError) => void;
};

/**
 * Placeholder del widget de pago "Supernova".
 *
 * Motivo: el proyecto referencia este componente pero no existía en el repo,
 * lo que rompe `next build` (y por ende Vercel).
 *
 * Reemplázalo por la integración real cuando tengas el SDK/API del proveedor.
 */
export function SupernovaWidget({
  amount,
  currency,
  orderId,
  description,
  customerEmail,
  onSuccess,
  onError,
}: SupernovaWidgetProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      // Aquí iría la integración real (SDK/redirect/checkout session, etc.)
      // Por ahora simulamos un pago exitoso para no bloquear el deploy.
      const transactionId = `sn_${orderId}_${Date.now()}`;
      onSuccess({ transactionId, amount, currency });
    } catch (e: any) {
      onError({ error: e?.message || 'No se pudo procesar el pago' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="text-sm">
        <p className="font-semibold">Pago</p>
        <p className="text-muted-foreground">
          {description || `Pedido ${orderId}`}
          {customerEmail ? ` · ${customerEmail}` : ''}
        </p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Importe</span>
        <span className="font-semibold">
          {amount} {currency}
        </span>
      </div>

      <Button type="button" className="w-full" onClick={handlePay} disabled={loading}>
        {loading ? 'Procesando...' : 'Pagar ahora'}
      </Button>
    </div>
  );
}

