import { useState } from "react";
import { Search, Package, Scale, FileText, Truck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

// Interface para demonstrar a estrutura do pedido
interface OrderInfo {
  id: string;
  customer: string;
  date: string;
  notes: string;
  trackingCode: string;
  volumes: number;
  weight: string;
  logisticsStatus: string;
  history: { date: string; status: string }[];
}

const OrderDetails = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [searched, setSearched] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setLoading(true);
    setSearched(true);
    setOrder(null);
    setPermissionError(false);
    
    // Simulação de chamada à API do ERP/Logística com bloqueio de permissão
    setTimeout(() => {
      /* O design foi mantido no código, mas a resposta agora é bloqueada
      setOrder({ ... });
      */
      setPermissionError(true);
      setLoading(false);
    }, 600);
  };

  const getStatusColor = (status: string) => {
    if (status.includes("Entregue")) return "bg-green-500";
    if (status.includes("A caminho") || status.includes("trânsito")) return "bg-blue-500";
    if (status.includes("postado")) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Detalhes do Pedido</h2>
      </div>

      {/* Área de Busca */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Consultar Pedido</CardTitle>
          <CardDescription>Digite o número do pedido para ver todas as informações</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ex: 15833"
                className="pl-9"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading || !orderId.trim()} className="sm:w-32">
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resultado da Busca */}
      {!loading && searched && order && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Principais */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Pedido #{order.id}</CardTitle>
                <CardDescription>Cliente: {order.customer} • Data: {order.date}</CardDescription>
              </div>
              <Badge className={`${getStatusColor(order.logisticsStatus)} text-white px-3 py-1`}>
                {order.logisticsStatus}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex flex-col gap-1 p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Truck className="h-4 w-4" />
                    <span>Rastreio</span>
                  </div>
                  <span className="font-semibold text-primary">{order.trackingCode}</span>
                </div>
                
                <div className="flex flex-col gap-1 p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Package className="h-4 w-4" />
                    <span>Volumes</span>
                  </div>
                  <span className="font-semibold">{order.volumes} caixas</span>
                </div>
                
                <div className="flex flex-col gap-1 p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Scale className="h-4 w-4" />
                    <span>Peso Total</span>
                  </div>
                  <span className="font-semibold">{order.weight}</span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Última Atualização</span>
                  </div>
                  <span className="font-semibold text-sm">{order.history[order.history.length - 1].date}</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Observações */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <FileText className="h-4 w-4" />
                  <h3>Observações do Pedido</h3>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-200 rounded-lg border border-orange-200 dark:border-orange-900/50">
                  <p className="text-sm">{order.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linha do Tempo / Histórico Logístico */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Histórico de Logística</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.history.slice().reverse().map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                      {index !== order.history.length - 1 && (
                        <div className="h-full w-px bg-border my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {event.status}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado de Erro de Permissão */}
      {!loading && searched && permissionError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-destructive">Acesso Negado</h3>
            <p className="text-muted-foreground mt-2 font-medium">Usuário sem permissão de consulta</p>
            <p className="text-sm text-muted-foreground mt-1">Você não tem privilégios para visualizar os detalhes deste pedido.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDetails;
