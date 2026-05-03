import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const SubOrder = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">SubPedido</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de SubPedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo de subpedidos em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubOrder;
