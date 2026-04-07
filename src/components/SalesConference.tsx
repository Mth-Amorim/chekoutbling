import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ScanBarcode,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApiProduct {
  codigo_barras: string;
  nome: string;
  codigo_item: string;
  imagem_url?: string;
  quantidade: number;
}

interface ApiResponse {
  data: {
    numero_pedido: number;
    total_codigos_barras: number;
    produtos: Record<string, ApiProduct>;
  };
}

interface ApiObservationResponse {
  data: {
    numero_pedido: number;
    id_pedido: number;
    observacoes?: string;
  };
}

interface OrderItem {
  id: string;
  code: string;
  name: string;
  imageUrl?: string;
  barcodes: string[];
  quantityRequired: number;
}

interface Order {
  id: string;
  items: OrderItem[];
}

interface PendingExcessScan {
  barcode: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  required: number;
  current: number;
}

interface BoxLine {
  id: string;
  itemId: string;
  quantity: number;
}

interface BoxDraft {
  id: string;
  boxType: string;
  weightKg: number;
  lines: BoxLine[];
}

const API_BASE = "";
const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const createEmptyBox = (): BoxDraft => ({
  id: createId(),
  boxType: "",
  weightKg: 0,
  lines: [{ id: createId(), itemId: "", quantity: 1 }],
});

const SalesConference = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderObservations, setOrderObservations] = useState("");
  const [isPackagingStep, setIsPackagingStep] = useState(false);
  const [boxes, setBoxes] = useState<BoxDraft[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanLog, setScanLog] = useState<
    { barcode: string; time: Date; status: "known" | "warning" }[]
  >([]);
  const [pendingUnknownBarcode, setPendingUnknownBarcode] = useState<
    string | null
  >(null);
  const [pendingExcessScan, setPendingExcessScan] =
    useState<PendingExcessScan | null>(null);
  const [scannedQty, setScannedQty] = useState<Record<string, number>>({});
  const barcodeRef = useRef<HTMLInputElement>(null);
  const isUnknownDialogOpen = Boolean(pendingUnknownBarcode);
  const isExcessDialogOpen = Boolean(pendingExcessScan);
  const isDialogOpen = isUnknownDialogOpen || isExcessDialogOpen;

  const barcodeToItemId = useMemo(() => {
    if (!activeOrder) return {} as Record<string, string>;

    return activeOrder.items.reduce<Record<string, string>>((acc, item) => {
      item.barcodes.forEach((barcode) => {
        acc[barcode] = item.id;
      });
      return acc;
    }, {});
  }, [activeOrder]);

  const handleResetConference = () => {
    setScannedQty({});
    setScanLog([]);
    setBarcodeInput("");
    setPendingUnknownBarcode(null);
    setPendingExcessScan(null);
    setIsPackagingStep(false);
    setBoxes([]);
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const handleOpenOrder = async () => {
    const num = orderNumber.trim();
    if (!num) return;

    setLoading(true);
    setError("");
    setOrderObservations("");

    try {
      const response = await fetch(`${API_BASE}/api/pedidos/${num}/chekout`);

      if (!response.ok) {
        setError(
          response.status === 404
            ? "Pedido não encontrado."
            : `Erro ao buscar pedido (${response.status}).`,
        );
        setActiveOrder(null);
        return;
      }

      const json: ApiResponse = await response.json();
      const { numero_pedido, produtos } = json.data;

      const observationResponse = await fetch(
        `${API_BASE}/api/pedido/${num}/observacoes`,
      );

      if (observationResponse.ok) {
        const observationJson: ApiObservationResponse =
          await observationResponse.json();
        setOrderObservations(observationJson.data.observacoes?.trim() || "");
      } else {
        setOrderObservations("");
      }

      const items: OrderItem[] = Object.values(produtos).map((product) => {
        const directBarcode = (product.codigo_barras || "").trim();
        const uniqueBarcodes = directBarcode ? [directBarcode] : [];

        return {
          id: product.codigo_barras || product.codigo_item,
          code: product.codigo_item,
          name: product.nome,
          imageUrl: product.imagem_url,
          barcodes: uniqueBarcodes,
          quantityRequired: Number(product.quantidade),
        };
      });

      setActiveOrder({ id: String(numero_pedido), items });
      setScannedQty({});
      setScanLog([]);
      setPendingUnknownBarcode(null);
      setPendingExcessScan(null);
      setIsPackagingStep(false);
      setBoxes([]);
      setTimeout(() => barcodeRef.current?.focus(), 100);
    } catch {
      setError(
        "Não foi possível conectar à API. Verifique se ela está rodando.",
      );
      setActiveOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    if (isDialogOpen) return;

    const code = barcodeInput.trim();
    if (!code || !activeOrder) return;

    const itemId = barcodeToItemId[code];

    if (!itemId) {
      setPendingUnknownBarcode(code);
      setBarcodeInput("");
      return;
    }

    const targetItem = activeOrder.items.find((item) => item.id === itemId);
    if (!targetItem) {
      setPendingUnknownBarcode(code);
      setBarcodeInput("");
      return;
    }

    const currentItemQty = scannedQty[itemId] || 0;
    if (currentItemQty + 1 > targetItem.quantityRequired) {
      setPendingExcessScan({
        barcode: code,
        itemId,
        itemCode: targetItem.code,
        itemName: targetItem.name,
        required: targetItem.quantityRequired,
        current: currentItemQty,
      });
      setBarcodeInput("");
      return;
    }

    setScannedQty((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
    setScanLog((prev) => [
      { barcode: code, time: new Date(), status: "known" },
      ...prev,
    ]);
    setBarcodeInput("");
    barcodeRef.current?.focus();
  };

  const handleContinueUnknown = () => {
    if (!pendingUnknownBarcode) return;
    setScanLog((prev) => [
      { barcode: pendingUnknownBarcode, time: new Date(), status: "warning" },
      ...prev,
    ]);
    setPendingUnknownBarcode(null);
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const handleContinueExcess = () => {
    if (!pendingExcessScan) return;

    setScannedQty((prev) => ({
      ...prev,
      [pendingExcessScan.itemId]: (prev[pendingExcessScan.itemId] || 0) + 1,
    }));
    setScanLog((prev) => [
      {
        barcode: pendingExcessScan.barcode,
        time: new Date(),
        status: "warning",
      },
      ...prev,
    ]);
    setPendingExcessScan(null);
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const handleResetItemCount = () => {
    if (!pendingExcessScan) return;

    setScannedQty((prev) => ({
      ...prev,
      [pendingExcessScan.itemId]: 0,
    }));
    setPendingExcessScan(null);
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const handleRestartFromUnknown = () => {
    handleResetConference();
  };

  const handleClose = () => {
    setActiveOrder(null);
    setOrderNumber("");
    setOrderObservations("");
    setIsPackagingStep(false);
    setBoxes([]);
    setScannedQty({});
    setScanLog([]);
    setError("");
  };

  // Derived status
  const orderStatus = useMemo(() => {
    if (!activeOrder) return { total: 0, done: 0, allDone: false };
    let total = 0;
    let done = 0;
    activeOrder.items.forEach((item) => {
      total += item.quantityRequired;
      done += Math.min(scannedQty[item.id] || 0, item.quantityRequired);
    });
    return { total, done, allDone: done >= total };
  }, [activeOrder, scannedQty]);

  const startPackagingStep = () => {
    if (!activeOrder) return;
    setIsPackagingStep(true);
    setBoxes([createEmptyBox()]);
  };

  const updateBox = (boxId: string, updater: (box: BoxDraft) => BoxDraft) => {
    setBoxes((prev) =>
      prev.map((box) => (box.id === boxId ? updater(box) : box)),
    );
  };

  const addBox = () => {
    setBoxes((prev) => [...prev, createEmptyBox()]);
  };

  const removeBox = (boxId: string) => {
    setBoxes((prev) => prev.filter((box) => box.id !== boxId));
  };

  const addLineToBox = (boxId: string) => {
    updateBox(boxId, (box) => ({
      ...box,
      lines: [...box.lines, { id: createId(), itemId: "", quantity: 1 }],
    }));
  };

  const removeLineFromBox = (boxId: string, lineId: string) => {
    updateBox(boxId, (box) => ({
      ...box,
      lines: box.lines.filter((line) => line.id !== lineId),
    }));
  };

  const updateLineInBox = (
    boxId: string,
    lineId: string,
    updater: (line: BoxLine) => BoxLine,
  ) => {
    updateBox(boxId, (box) => ({
      ...box,
      lines: box.lines.map((line) =>
        line.id === lineId ? updater(line) : line,
      ),
    }));
  };

  const generateLabelsHtml = () => {
    if (!activeOrder) return;

    const orderItemsById = new Map(
      activeOrder.items.map((item) => [item.id, item]),
    );

    if (boxes.length === 0) {
      toast({ title: "Adicione ao menos uma caixa" });
      return;
    }

    const assignedByItem: Record<string, number> = {};

    for (const box of boxes) {
      if (!box.boxType.trim()) {
        toast({ title: "Informe o modelo da caixa" });
        return;
      }

      if (!Number.isFinite(box.weightKg) || box.weightKg <= 0) {
        toast({ title: "Informe o peso da caixa" });
        return;
      }

      const validLines = box.lines.filter(
        (line) => line.itemId && line.quantity > 0,
      );
      if (validLines.length === 0) {
        toast({ title: "Cada caixa deve ter pelo menos um produto" });
        return;
      }

      for (const line of validLines) {
        const item = orderItemsById.get(line.itemId);
        if (!item) {
          toast({ title: "Há item inválido em uma caixa" });
          return;
        }

        assignedByItem[line.itemId] =
          (assignedByItem[line.itemId] || 0) + line.quantity;
        if (assignedByItem[line.itemId] > item.quantityRequired) {
          toast({
            title: "Quantidade excede o pedido",
            description: `${item.name}: pedido ${item.quantityRequired}, informado ${assignedByItem[line.itemId]}.`,
          });
          return;
        }
      }
    }

    const labels = boxes
      .map((box, index) => {
        const validLines = box.lines.filter(
          (line) => line.itemId && line.quantity > 0,
        );
        const productsHtml = validLines
          .map((line) => {
            const item = orderItemsById.get(line.itemId);
            if (!item) return "";
            return `<li><strong>${escapeHtml(item.name)}</strong> — Qtd: ${line.quantity}</li>`;
          })
          .join("");

        return `
          <section class="label">
            <h2>Etiqueta Caixa ${index + 1}</h2>
            <p><strong>Modelo da Caixa:</strong> ${escapeHtml(box.boxType)}</p>
            <p><strong>Peso da Caixa:</strong> ${box.weightKg} kg</p>
            <p><strong>Produtos:</strong></p>
            <ul>${productsHtml}</ul>
          </section>
        `;
      })
      .join("");

    const html = `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Etiquetas Pedido #${activeOrder.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; color: #111; }
            .label { border: 1px solid #000; padding: 12px; margin-bottom: 12px; page-break-inside: avoid; }
            h1 { margin: 0 0 12px; }
            h2 { margin: 0 0 8px; font-size: 18px; }
            p { margin: 4px 0; }
            ul { margin: 8px 0 0 18px; }
          </style>
        </head>
        <body>
          <h1>Etiquetas Pedido #${activeOrder.id}</h1>
          ${labels}
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Não foi possível abrir a janela de impressão" });
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // --- Order input screen ---
  if (!activeOrder) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Conferência de Venda
            </h2>
          </div>
          <label className="text-sm text-muted-foreground">
            Número do Pedido
          </label>
          <Input
            placeholder="Ex: 15865"
            value={orderNumber}
            onChange={(e) => {
              setOrderNumber(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleOpenOrder()}
            className="font-mono text-2xl h-14 bg-muted border-border text-center"
            disabled={loading}
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {error}
            </p>
          )}
          <Button
            onClick={handleOpenOrder}
            disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Buscando...
              </>
            ) : (
              "Abrir Pedido"
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (isPackagingStep) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-[calc(100vh-120px)]"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPackagingStep(false)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono font-bold text-foreground">
              Embalagem Pedido #{activeOrder.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={addBox}>
              Adicionar caixa
            </Button>
            <Button onClick={generateLabelsHtml}>Gerar etiquetas</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {boxes.map((box, index) => (
            <div
              key={box.id}
              className="rounded-lg border border-border bg-card p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Caixa {index + 1}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBox(box.id)}
                >
                  Remover caixa
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">
                    Modelo da caixa
                  </label>
                  <Input
                    value={box.boxType}
                    onChange={(e) =>
                      updateBox(box.id, (prev) => ({
                        ...prev,
                        boxType: e.target.value,
                      }))
                    }
                    placeholder="Ex: Tipo 02"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Peso da caixa (kg)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={box.weightKg || ""}
                    onChange={(e) =>
                      updateBox(box.id, (prev) => ({
                        ...prev,
                        weightKg: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="Ex: 5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {box.lines.map((line, lineIndex) => (
                  <div
                    key={line.id}
                    className="grid grid-cols-12 gap-2 items-end"
                  >
                    <div className="col-span-7">
                      <label className="text-xs text-muted-foreground">
                        Produto {lineIndex + 1}
                      </label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={line.itemId}
                        onChange={(e) =>
                          updateLineInBox(box.id, line.id, (prev) => ({
                            ...prev,
                            itemId: e.target.value,
                          }))
                        }
                      >
                        <option value="">Selecione um produto</option>
                        {activeOrder.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.code} - {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs text-muted-foreground">
                        Quantidade
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          updateLineInBox(box.id, line.id, (prev) => ({
                            ...prev,
                            quantity: Math.max(1, Number(e.target.value) || 1),
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => removeLineFromBox(box.id, line.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={() => addLineToBox(box.id)}>
                Adicionar produto na caixa
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // --- Split-screen conference ---
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-120px)]"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-mono font-bold text-foreground">
            Pedido #{activeOrder.id}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">
              {orderStatus.done}
            </span>
            /{orderStatus.total}
          </div>
          {/* Progress bar */}
          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${orderStatus.allDone ? "bg-success" : "bg-primary"}`}
              initial={{ width: 0 }}
              animate={{
                width: `${orderStatus.total ? (orderStatus.done / orderStatus.total) * 100 : 0}%`,
              }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
          {orderStatus.allDone && (
            <Button
              size="sm"
              onClick={startPackagingStep}
              className="bg-success text-success-foreground hover:bg-success/90 text-xs"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" /> Finalizar pedido
            </Button>
          )}
        </div>
      </div>

      {/* Two columns */}
      <div className="flex-1 grid grid-cols-2 min-h-0">
        {/* LEFT — Bipagem */}
        <div className="flex flex-col border-r border-border">
          <div className="px-3 py-2 border-b border-border bg-muted/50 shrink-0">
            <div className="flex items-center gap-2">
              <ScanBarcode className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Bipagem</h3>
            </div>
          </div>

          {/* Scan input */}
          <div className="px-3 py-3 border-b border-border shrink-0">
            <Input
              ref={barcodeRef}
              placeholder="Bipar código..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              className="font-mono bg-muted border-border h-12 text-lg"
              disabled={isDialogOpen}
              autoFocus
            />
          </div>

          {/* Scan log */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            <AnimatePresence>
              {scanLog.map((entry, i) => {
                return (
                  <motion.div
                    key={`${entry.barcode}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between rounded px-2 py-1.5 text-xs ${
                      entry.status === "known"
                        ? "bg-primary/10"
                        : "bg-warning/20"
                    }`}
                  >
                    <span
                      className={`font-mono ${entry.status === "known" ? "text-primary" : "text-warning"}`}
                    >
                      {entry.barcode}
                    </span>
                    <span className="text-muted-foreground">
                      {entry.time.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {scanLog.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                Aguardando bipagem...
              </p>
            )}
          </div>
        </div>

        {/* RIGHT — Itens do pedido */}
        <div className="flex flex-col">
          <div className="px-3 py-2 border-b border-border bg-card/80 shrink-0 space-y-1">
            <p className="text-xs font-semibold text-foreground">
              Observações do pedido
            </p>
            <Textarea
              value={orderObservations || "Sem observações para este pedido."}
              readOnly
              className="min-h-20 text-xs bg-muted border-border"
            />
          </div>
          <div className="px-3 py-2 border-b border-border bg-muted/50 shrink-0">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Itens do Pedido
              </h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {activeOrder.items.map((item) => {
              const scanned = scannedQty[item.id] || 0;
              const isComplete = scanned >= item.quantityRequired;
              const isOver = scanned > item.quantityRequired;

              return (
                <motion.div
                  key={item.id}
                  layout
                  className={`rounded-lg border p-3 transition-colors ${
                    isComplete
                      ? "border-success/40 bg-success/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                              Sem
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground mt-0.5">
                            {item.code} •{" "}
                            {item.barcodes[0] || "Sem código de barras"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Quantity bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          isOver
                            ? "bg-warning"
                            : isComplete
                              ? "bg-success"
                              : "bg-primary"
                        }`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((scanned / item.quantityRequired) * 100, 100)}%`,
                        }}
                        transition={{ type: "spring", stiffness: 120 }}
                      />
                    </div>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isOver
                          ? "text-warning"
                          : isComplete
                            ? "text-success"
                            : "text-foreground"
                      }`}
                    >
                      {scanned}/{item.quantityRequired}
                    </span>
                  </div>

                  {isOver && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-warning">
                      <XCircle className="h-3 w-3" /> Excesso: +
                      {scanned - item.quantityRequired}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <AlertDialog open={isUnknownDialogOpen}>
        <AlertDialogContent
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            event.preventDefault();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Produto não consta no pedido</AlertDialogTitle>
            <AlertDialogDescription>
              O código{" "}
              <span className="font-mono">{pendingUnknownBarcode}</span> não foi
              encontrado neste pedido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContinueUnknown}>
              Continuar conferindo
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestartFromUnknown}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reiniciar conferência
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isExcessDialogOpen}>
        <AlertDialogContent
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            event.preventDefault();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Você bipou uma unidade a mais</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block font-medium text-foreground">
                {pendingExcessScan?.itemName}
              </span>
              <span className="block font-mono mt-1">
                Item: {pendingExcessScan?.itemCode} • Barras:{" "}
                {pendingExcessScan?.barcode}
              </span>
              <span className="block mt-1">
                Quantidade permitida: {pendingExcessScan?.required} • Bipado:{" "}
                {(pendingExcessScan?.current ?? 0) + 1}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleContinueExcess}>
              Continuar
            </Button>
            <Button variant="outline" onClick={handleResetItemCount}>
              Reiniciar contagem do item
            </Button>
            <Button
              onClick={handleRestartFromUnknown}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reiniciar contagem do pedido
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default SalesConference;
