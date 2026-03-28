import { useState } from "react";
import { motion } from "framer-motion";
import { Search, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface OrderRecord {
  id: string;
  type: "venda" | "compra";
  operator: string;
  status: "pendente" | "em_conferencia" | "finalizado" | "com_divergencia";
  items: number;
  scanned: number;
  date: string;
}

const MOCK_RECORDS: OrderRecord[] = [
  { id: "1", type: "venda", operator: "21", status: "finalizado", items: 16, scanned: 16, date: "2026-03-28 09:15" },
  { id: "2", type: "venda", operator: "21", status: "em_conferencia", items: 12, scanned: 5, date: "2026-03-28 10:30" },
  { id: "3", type: "compra", operator: "21", status: "pendente", items: 8, scanned: 0, date: "2026-03-28 11:00" },
  { id: "4", type: "venda", operator: "15", status: "com_divergencia", items: 20, scanned: 18, date: "2026-03-28 08:45" },
  { id: "5", type: "compra", operator: "15", status: "finalizado", items: 10, scanned: 10, date: "2026-03-27 16:20" },
  { id: "6", type: "venda", operator: "21", status: "pendente", items: 6, scanned: 0, date: "2026-03-28 12:00" },
  { id: "7", type: "compra", operator: "33", status: "em_conferencia", items: 14, scanned: 7, date: "2026-03-28 13:10" },
];

const statusConfig: Record<OrderRecord["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  em_conferencia: { label: "Em Conferência", variant: "secondary" },
  finalizado: { label: "Finalizado", variant: "default" },
  com_divergencia: { label: "Divergência", variant: "destructive" },
};

const MyOrders = () => {
  const [operatorCode, setOperatorCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const filteredOrders = MOCK_RECORDS.filter(
    (r) => r.operator === operatorCode
  );

  if (!confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-4 py-16"
      >
        <div className="rounded-full bg-primary/10 p-4">
          <UserCircle className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Identificação do Operador</h2>
        <p className="text-sm text-muted-foreground">Informe seu código de operador para ver seus pedidos</p>
        <div className="flex gap-2 w-full max-w-xs">
          <Input
            placeholder="Ex: 21"
            value={operatorCode}
            onChange={(e) => setOperatorCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && operatorCode.trim() && setConfirmed(true)}
            className="font-mono text-center text-lg"
          />
          <Button
            onClick={() => setConfirmed(true)}
            disabled={!operatorCode.trim()}
          >
            <Search className="h-4 w-4 mr-1" />
            Buscar
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Operador: <span className="font-mono text-primary">{operatorCode}</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setConfirmed(false); setOperatorCode(""); }}
          className="text-muted-foreground"
        >
          Trocar operador
        </Button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhum pedido encontrado para o operador <span className="font-mono">{operatorCode}</span>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Pedido</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Progresso</TableHead>
                <TableHead className="text-xs text-right">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const cfg = statusConfig[order.status];
                const pct = order.items > 0 ? Math.round((order.scanned / order.items) * 100) : 0;
                return (
                  <TableRow key={`${order.type}-${order.id}`}>
                    <TableCell className="font-mono font-semibold text-foreground">#{order.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {order.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant} className="text-xs">
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {order.scanned}/{order.items}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground font-mono">
                      {order.date}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
};

export default MyOrders;
