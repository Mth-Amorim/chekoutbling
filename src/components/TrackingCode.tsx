import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const TrackingCode = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Código de Rastreio</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Rastreamento de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo de código de rastreio em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingCode;
