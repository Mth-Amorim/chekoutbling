import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PartialOrderItem {
  id: string;
  product: string;
  quantityInOrder: number;
}

interface PartialOrder {
  id: string;
  items: PartialOrderItem[];
}

const MOCK_ORDERS: Record<string, PartialOrder> = {
  "1001": {
    id: "1001",
    items: [
      { id: "a1", product: "Caixa Organizadora P", quantityInOrder: 12 },
      { id: "a2", product: "Kit Unha Gel", quantityInOrder: 8 },
      { id: "a3", product: "Lixa Profissional", quantityInOrder: 20 },
    ],
  },
  "1002": {
    id: "1002",
    items: [
      { id: "b1", product: "Base Fortalecedora", quantityInOrder: 15 },
      { id: "b2", product: "Esmalte Nude", quantityInOrder: 30 },
    ],
  },
};

const PeridoPercial = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [activeOrder, setActiveOrder] = useState<PartialOrder | null>(null);
  const [error, setError] = useState("");
  const [separationByItem, setSeparationByItem] = useState<
    Record<string, number>
  >({});

  const handleSearchOrder = () => {
    const order = MOCK_ORDERS[orderNumber.trim()];

    if (!order) {
      setActiveOrder(null);
      setSeparationByItem({});
      setError("Pedido não encontrado.");
      return;
    }

    const initialSeparation = order.items.reduce<Record<string, number>>(
      (accumulator, item) => {
        accumulator[item.id] = 0;
        return accumulator;
      },
      {},
    );

    setActiveOrder(order);
    setSeparationByItem(initialSeparation);
    setError("");
  };

  const handleChangeSeparation = (
    itemId: string,
    quantityInOrder: number,
    value: string,
  ) => {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    const clampedValue = Math.max(0, Math.min(quantityInOrder, parsedValue));

    setSeparationByItem((previous) => ({
      ...previous,
      [itemId]: clampedValue,
    }));
  };

  const totals = useMemo(() => {
    if (!activeOrder) {
      return { inOrder: 0, toSeparate: 0 };
    }

    const inOrder = activeOrder.items.reduce(
      (total, item) => total + item.quantityInOrder,
      0,
    );
    const toSeparate = activeOrder.items.reduce((total, item) => {
      return total + (separationByItem[item.id] ?? 0);
    }, 0);

    return { inOrder, toSeparate };
  }, [activeOrder, separationByItem]);

  const handleResetOrder = () => {
    setActiveOrder(null);
    setOrderNumber("");
    setError("");
    setSeparationByItem({});
  };

  const handleSubmitPartialOrder = () => {
    if (!activeOrder || totals.toSeparate <= 0) {
      return;
    }

    toast({
      title: "Pedido parcial lançado",
      description: `Pedido #${activeOrder.id} com ${totals.toSeparate} item(ns) para separação.`,
    });
  };

  if (!activeOrder) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <img
              src="https://acdn-us.mitiendanube.com/stores/005/081/561/themes/toluca/img-49697943-1757160534-b49360ea4a826198c3297547b5588ade1757160534.png?4022911048044583491"
              alt="Logo da empresa"
              className="h-10 object-contain"
            />
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Checkout Conferência
              </h1>
              <p className="text-xs text-muted-foreground">Pedido parcial</p>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <PackageSearch className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Abrir pedido parcial
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Número do pedido"
                value={orderNumber}
                onChange={(event) => {
                  setOrderNumber(event.target.value);
                  setError("");
                }}
                onKeyDown={(event) =>
                  event.key === "Enter" && handleSearchOrder()
                }
                className="font-mono text-lg h-12 bg-muted border-border"
                autoFocus
              />
              <Button onClick={handleSearchOrder} className="h-12 px-6">
                Buscar pedido
              </Button>
            </div>

            {error && <p className="text-sm text-destructive mt-3">{error}</p>}

            <p className="text-xs text-muted-foreground mt-4">
              Pedidos de teste: 1001 e 1002.
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="https://acdn-us.mitiendanube.com/stores/005/081/561/themes/toluca/img-49697943-1757160534-b49360ea4a826198c3297547b5588ade1757160534.png?4022911048044583491"
              alt="Logo da empresa"
              className="h-10 object-contain"
            />
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Checkout Conferência
              </h1>
              <p className="text-xs text-muted-foreground">
                Pedido parcial #{activeOrder.id}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleResetOrder}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Trocar pedido
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border overflow-hidden bg-card"
        >
          <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                Pedido #{activeOrder.id}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Total no pedido:{" "}
              <span className="font-semibold text-foreground">
                {totals.inOrder}
              </span>{" "}
              • Total para separar:{" "}
              <span className="font-semibold text-foreground">
                {totals.toSeparate}
              </span>
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd no pedido</TableHead>
                <TableHead className="text-right">Qtd para separar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeOrder.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell className="text-right font-mono">
                    {item.quantityInOrder}
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={0}
                      max={item.quantityInOrder}
                      value={separationByItem[item.id] ?? 0}
                      onChange={(event) =>
                        handleChangeSeparation(
                          item.id,
                          item.quantityInOrder,
                          event.target.value,
                        )
                      }
                      className="w-24 ml-auto text-right font-mono bg-muted border-border"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="px-4 py-3 border-t border-border bg-card flex justify-end">
            <Button
              onClick={handleSubmitPartialOrder}
              disabled={totals.toSeparate <= 0}
              className="min-w-52"
            >
              Lançar pedido parcial
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PeridoPercial;
