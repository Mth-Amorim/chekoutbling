import { useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <PackageSearch className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Pedido Parcial
            </h1>
            <p className="text-sm text-muted-foreground">
              Informe o pedido e preencha a quantidade para separar.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Número do pedido"
            value={orderNumber}
            onChange={(event) => {
              setOrderNumber(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => event.key === "Enter" && handleSearchOrder()}
            className="font-mono"
          />
          <Button onClick={handleSearchOrder}>Buscar pedido</Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {activeOrder && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
              <p className="text-sm text-foreground">
                Pedido:{" "}
                <span className="font-mono font-semibold">
                  #{activeOrder.id}
                </span>
              </p>
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
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd no pedido</TableHead>
                  <TableHead className="text-right">Qtd para separar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeOrder.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product}</TableCell>
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
                        className="w-24 ml-auto text-right font-mono"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default PeridoPercial;
