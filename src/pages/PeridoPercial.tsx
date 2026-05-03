import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, PackageSearch, Printer, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE = ""; // requests go via Vite proxy → VITE_API_BASE in .env
const API_BASE_FALLBACK = (import.meta.env.VITE_API_BASE || "").trim();
const PARTIAL_ORDER_ENDPOINTS = [
  "/api/pedido/parcial",
  "/api/pedidos/parcial",
  "/api/pedidos/parciais",
];

const getApiErrorMessage = async (response: Response) => {
  const fallback = `Erro ao lançar pedido parcial (${response.status}).`;

  if (response.status === 404) {
    return "Endpoint de pedido parcial não encontrado (404). Verifique a rota da API para lançamento parcial.";
  }

  try {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await response.json();

      if (typeof json?.detail === "string") {
        return json.detail;
      }

      if (Array.isArray(json?.detail)) {
        return json.detail
          .map((item) => item?.msg || item?.message)
          .filter(Boolean)
          .join("; ");
      }

      if (typeof json?.message === "string") {
        return json.message;
      }
    }

    const text = await response.text();
    return text || fallback;
  } catch {
    return fallback;
  }
};

interface ApiProduct {
  item_id: number;
  codigo: string;
  codigo_barras?: string;
  descricao: string;
  link?: string;
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
    codigo_barras?: string;
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
  codigoBarras: string;
  gradeBarcodes: string[];
  link: string;
  product: string;
  imageUrl?: string;
  unidade: string;
  gradeFactor: number;
  quantityTotal: number;
  quantityInOrder: number;
}

interface PartialOrderPayload {
  numero_pedido: number;
  itens: {
    codigo_barras: string;
    estrutura_grade: {
      codigo_barras: string;
    }[];
    quantidade_parcial: number;
  }[];
}

interface PartialOrder {
  id: string;
  idPedido: number;
  totalItens: number;
  produtos: Record<string, ApiProduct>;
  items: PartialOrderItem[];
}

const postPartialOrder = async (payload: PartialOrderPayload) => {
  const bases = [API_BASE, API_BASE_FALLBACK].filter(
    (base, index, allBases) => Boolean(base) || index === 0 || !allBases[0],
  );

  let lastResponse: Response | null = null;
  let lastNetworkError: Error | null = null;

  for (const base of bases) {
    for (const endpoint of PARTIAL_ORDER_ENDPOINTS) {
      try {
        const response = await fetch(`${base}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 404) {
          lastResponse = response;
          continue;
        }

        return response;
      } catch (error) {
        lastNetworkError =
          error instanceof Error
            ? error
            : new Error("Falha de rede ao enviar pedido parcial.");
      }
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw (
    lastNetworkError ||
    new Error(
      "Falha de rede ao enviar pedido parcial. Verifique proxy/API e tente novamente.",
    )
  );
};

const PeridoPercial = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [activeOrder, setActiveOrder] = useState<PartialOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [separationByItem, setSeparationByItem] = useState<
    Record<string, number>
  >({});
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const selectedProduct = useMemo(() => {
    if (!selectedProductId || !activeOrder) return null;
    return (
      activeOrder.items.find((item) => item.id === selectedProductId) || null
    );
  }, [selectedProductId, activeOrder]);

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
      const { numero_pedido, id_pedido, total_itens, produtos } = json.data;

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
          codigoBarras: (p.codigo_barras || "").trim(),
          gradeBarcodes: (p.estrutura_grade || [])
            .map((grade) => (grade.codigo_barras || "").trim())
            .filter(Boolean),
          link: (p.link || p.imagem_url || "").trim(),
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

      setActiveOrder({
        id: String(numero_pedido),
        idPedido: id_pedido,
        totalItens: total_itens,
        produtos,
        items,
      });
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
    setSelectedProductId(null);
  };

  const handleSelectProduct = (itemId: string) => {
    setSelectedProductId(itemId);
  };

  const handleCloseModal = () => {
    setSelectedProductId(null);
  };

  const handlePrint = async () => {
    if (!activeOrder) return;

    try {
      const response = await fetch(
        `/api/relatorio/${activeOrder.id}/producao`,
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar relatório: ${response.status}`);
      }

      const html = await response.text();

      const win = window.open("", "_blank", "width=900,height=700");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } catch (printError) {
      toast({
        title: "Erro ao gerar relatório",
        description:
          printError instanceof Error
            ? printError.message
            : "Não foi possível carregar o relatório de impressão.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitPartialOrder = async () => {
    if (!activeOrder || totals.toSeparate <= 0) {
      return;
    }

    const payload: PartialOrderPayload = {
      numero_pedido: Number(activeOrder.id),
      itens: activeOrder.items
        .map((item) => ({
          codigo_barras: item.codigoBarras,
          estrutura_grade: item.gradeBarcodes.map((barcode) => ({
            codigo_barras: barcode,
          })),
          quantidade_parcial: separationByItem[item.id] ?? 0,
        }))
        .filter((item) => item.quantidade_parcial > 0),
    };

    setSubmitting(true);

    try {
      const response = await postPartialOrder(payload);

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      setSeparationByItem(
        activeOrder.items.reduce<Record<string, number>>((acc, item) => {
          acc[item.id] = 0;
          return acc;
        }, {}),
      );

      toast({
        title: "Pedido parcial lançado",
        description: `Pedido #${activeOrder.id} enviado com ${payload.itens.length} item(ns).`,
      });

      // Aguarda um momento para o toast aparecer antes de iniciar a impressão
      await handlePrint();
    } catch (submissionError) {
      toast({
        title: "Erro ao lançar pedido parcial",
        description:
          submissionError instanceof Error
            ? submissionError.message
            : "Não foi possível enviar o pedido parcial.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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
                <TableRow
                  key={item.id}
                  onClick={() => handleSelectProduct(item.id)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
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

          <div className="px-4 py-3 border-t border-border bg-card flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={totals.toSeparate <= 0}
              className="min-w-36"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button
              onClick={handleSubmitPartialOrder}
              disabled={totals.toSeparate <= 0 || submitting}
              className="min-w-52"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Lançar pedido parcial"
              )}
            </Button>
          </div>
        </motion.div>
      </main>

      {selectedProduct && (
        <Dialog
          open={Boolean(selectedProductId)}
          onOpenChange={handleCloseModal}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sticky top-0 bg-background pb-4 border-b">
              <DialogTitle className="text-xl">
                {selectedProduct.product}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Imagem grande */}
              {selectedProduct.imageUrl && (
                <div className="flex justify-center">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.product}
                    className="max-h-96 max-w-full object-contain rounded-lg border border-border"
                  />
                </div>
              )}

              {/* Informações do produto */}
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Código</p>
                    <p className="font-mono font-semibold text-foreground">
                      {selectedProduct.codigo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Código de Barras
                    </p>
                    <p className="font-mono font-semibold text-foreground">
                      {selectedProduct.codigoBarras || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Unidade
                    </p>
                    <p className="font-semibold text-foreground">
                      {selectedProduct.unidade}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Fator de Grade
                    </p>
                    <p className="font-semibold text-foreground">
                      {selectedProduct.gradeFactor || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantidades */}
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground">Quantidades</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Qtd no Pedido
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedProduct.quantityInOrder}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Qtd Total
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedProduct.quantityTotal}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Qtd para Separar
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {separationByItem[selectedProduct.id] ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Editar quantidade para separar */}
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                <label className="text-sm font-semibold text-foreground">
                  Ajustar quantidade para separação
                </label>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min={0}
                      max={selectedProduct.quantityTotal}
                      value={separationByItem[selectedProduct.id] ?? 0}
                      onChange={(event) =>
                        handleChangeSeparation(
                          selectedProduct.id,
                          selectedProduct.quantityTotal,
                          event.target.value,
                        )
                      }
                      className="font-mono text-lg h-12 bg-background border-border"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleChangeSeparation(
                        selectedProduct.id,
                        selectedProduct.quantityTotal,
                        String(selectedProduct.quantityTotal),
                      )
                    }
                    className="h-12"
                  >
                    Max
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleChangeSeparation(
                        selectedProduct.id,
                        selectedProduct.quantityTotal,
                        "0",
                      )
                    }
                    className="h-12"
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              {/* Link do produto */}
              {selectedProduct.link && (
                <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Link do Produto
                  </p>
                  <a
                    href={selectedProduct.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate break-all"
                  >
                    {selectedProduct.link}
                  </a>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PeridoPercial;
