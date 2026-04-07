import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, PackageSearch } from "lucide-react";
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

const API_BASE = ""; // requests go via Vite proxy → VITE_API_BASE in .env

interface ApiProduct {
  item_id: number;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  quantidade_total?: number;
  valor: number;
  desconto: number;
  produto: { id: number };
  imagem_url?: string;
  estrutura_grade?: {
    produto_id: number;
    quantidade_estrutura: number;
    quantidade_pedido: number;
    quantidade_total: number;
  }[];
}

interface ApiResponse {
  data: {
    numero_pedido: number;
    id_pedido: number;
    total_itens: number;
    produtos: Record<string, ApiProduct>;
  };
}

interface PartialOrderItem {
  id: string;
  codigo: string;
  product: string;
  imageUrl?: string;
  unidade: string;
  gradeFactor: number;
  quantityTotal: number;
  quantityInOrder: number;
}

interface PartialOrder {
  id: string;
  items: PartialOrderItem[];
}

const PeridoPercial = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [activeOrder, setActiveOrder] = useState<PartialOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [separationByItem, setSeparationByItem] = useState<
    Record<string, number>
  >({});

  const handleSearchOrder = async () => {
    const num = orderNumber.trim();
    if (!num) return;

    setLoading(true);
    setError("");
    setActiveOrder(null);
    setSeparationByItem({});

    try {
      const response = await fetch(`${API_BASE}/api/pedidos/${num}/itens`);

      if (!response.ok) {
        setError(
          response.status === 404
            ? "Pedido não encontrado."
            : `Erro ao buscar pedido (${response.status}).`,
        );
        return;
      }

      const json: ApiResponse = await response.json();
      const { numero_pedido, produtos } = json.data;

      const items: PartialOrderItem[] = Object.values(produtos).map((p) => {
        const gradeFactor =
          p.estrutura_grade?.reduce(
            (acc, grade) => acc + Number(grade.quantidade_estrutura || 0),
            0,
          ) ?? 0;

        const gradeTotal =
          p.estrutura_grade?.reduce(
            (acc, grade) => acc + Number(grade.quantidade_total || 0),
            0,
          ) ?? 0;

        const quantityTotal =
          Number(p.quantidade_total ?? 0) > 0
            ? Number(p.quantidade_total)
            : gradeTotal > 0
              ? gradeTotal
              : Number(p.quantidade);

        return {
          id: String(p.item_id),
          codigo: p.codigo,
          product: p.descricao,
          imageUrl: p.imagem_url,
          unidade: p.unidade,
          gradeFactor,
          quantityTotal,
          quantityInOrder: p.quantidade,
        };
      });

      const initialSeparation = items.reduce<Record<string, number>>(
        (acc, item) => {
          acc[item.id] = 0;
          return acc;
        },
        {},
      );

      setActiveOrder({ id: String(numero_pedido), items });
      setSeparationByItem(initialSeparation);
    } catch {
      setError(
        "Não foi possível conectar à API. Verifique se ela está rodando.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSeparation = (
    itemId: string,
    quantityLimit: number,
    value: string,
  ) => {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    const clampedValue = Math.max(0, Math.min(quantityLimit, parsedValue));

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
                disabled={loading}
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
              />
              <Button
                onClick={handleSearchOrder}
                className="h-12 px-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                    Buscando...
                  </>
                ) : (
                  "Buscar pedido"
                )}
              </Button>
            </div>

            {error && <p className="text-sm text-destructive mt-3">{error}</p>}
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
                <TableHead className="w-20">Imagem</TableHead>
                <TableHead>Informações</TableHead>
                <TableHead className="text-right">Qtd pedido</TableHead>
                <TableHead className="text-right">Qtd total</TableHead>
                <TableHead className="text-right">Qtd para separar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeOrder.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="h-14 w-14 overflow-hidden rounded-md border border-border bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.product}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                          Sem imagem
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium leading-tight text-foreground break-words">
                        {item.product}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">Cod: {item.codigo}</span>
                        <span>Unid: {item.unidade}</span>
                        {item.gradeFactor > 0 && (
                          <span>Grade: {item.gradeFactor}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.quantityInOrder}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.quantityTotal}
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={0}
                      max={item.quantityTotal}
                      value={separationByItem[item.id] ?? 0}
                      onChange={(event) =>
                        handleChangeSeparation(
                          item.id,
                          item.quantityTotal,
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
