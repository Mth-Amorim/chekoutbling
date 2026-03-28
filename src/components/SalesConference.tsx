import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ScanBarcode, CheckCircle2, AlertCircle, XCircle, ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- Mock order data ---
interface OrderItem {
  barcode: string;
  name: string;
  quantityRequired: number;
}

interface Order {
  id: string;
  items: OrderItem[];
}

const MOCK_ORDERS: Record<string, Order> = {
  "1": {
    id: "1",
    items: [
      { barcode: "7891000100103", name: "Produto A - Caixa 500ml", quantityRequired: 5 },
      { barcode: "7891000200200", name: "Produto B - Pacote 1kg", quantityRequired: 3 },
      { barcode: "7891000300307", name: "Produto C - Unidade 250g", quantityRequired: 8 },
    ],
  },
  "2": {
    id: "2",
    items: [
      { barcode: "7891000100103", name: "Produto A - Caixa 500ml", quantityRequired: 10 },
      { barcode: "7891000300307", name: "Produto C - Unidade 250g", quantityRequired: 2 },
    ],
  },
};

const SalesConference = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanLog, setScanLog] = useState<{ barcode: string; time: Date }[]>([]);
  // Tracks scanned qty per barcode
  const [scannedQty, setScannedQty] = useState<Record<string, number>>({});
  const barcodeRef = useRef<HTMLInputElement>(null);

  const handleOpenOrder = () => {
    const order = MOCK_ORDERS[orderNumber.trim()];
    if (!order) {
      setError("Pedido não encontrado. Tente 1 ou 2.");
      return;
    }
    setError("");
    setActiveOrder(order);
    setScannedQty({});
    setScanLog([]);
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const handleScan = () => {
    const code = barcodeInput.trim();
    if (!code || !activeOrder) return;

    const item = activeOrder.items.find((i) => i.barcode === code);
    if (!item) {
      // Unknown barcode — still log it but flag
      setScanLog((prev) => [{ barcode: code, time: new Date() }, ...prev]);
      setBarcodeInput("");
      barcodeRef.current?.focus();
      return;
    }

    setScannedQty((prev) => ({
      ...prev,
      [code]: (prev[code] || 0) + 1,
    }));
    setScanLog((prev) => [{ barcode: code, time: new Date() }, ...prev]);
    setBarcodeInput("");
    barcodeRef.current?.focus();
  };

  const handleClose = () => {
    setActiveOrder(null);
    setOrderNumber("");
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
      done += Math.min(scannedQty[item.barcode] || 0, item.quantityRequired);
    });
    return { total, done, allDone: done >= total };
  }, [activeOrder, scannedQty]);

  // --- Order input screen ---
  if (!activeOrder) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Conferência de Venda</h2>
          </div>
          <label className="text-sm text-muted-foreground">Número do Pedido</label>
          <Input
            placeholder="Ex: 1"
            value={orderNumber}
            onChange={(e) => { setOrderNumber(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleOpenOrder()}
            className="font-mono text-2xl h-14 bg-muted border-border text-center"
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {error}
            </p>
          )}
          <Button onClick={handleOpenOrder} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base">
            Abrir Pedido
          </Button>
        </div>
      </motion.div>
    );
  }

  // --- Split-screen conference ---
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-120px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground hover:text-foreground p-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-mono font-bold text-foreground">Pedido #{activeOrder.id}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{orderStatus.done}</span>/{orderStatus.total}
          </div>
          {/* Progress bar */}
          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${orderStatus.allDone ? "bg-success" : "bg-primary"}`}
              initial={{ width: 0 }}
              animate={{ width: `${orderStatus.total ? (orderStatus.done / orderStatus.total) * 100 : 0}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
          {orderStatus.allDone && (
            <Button size="sm" onClick={handleClose} className="bg-success text-success-foreground hover:bg-success/90 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Finalizar
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
              autoFocus
            />
          </div>

          {/* Scan log */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            <AnimatePresence>
              {scanLog.map((entry, i) => {
                const isKnown = activeOrder.items.some((item) => item.barcode === entry.barcode);
                return (
                  <motion.div
                    key={`${entry.barcode}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between rounded px-2 py-1.5 text-xs ${
                      isKnown ? "bg-primary/10" : "bg-destructive/10"
                    }`}
                  >
                    <span className={`font-mono ${isKnown ? "text-primary" : "text-destructive"}`}>
                      {entry.barcode}
                    </span>
                    <span className="text-muted-foreground">
                      {entry.time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
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
          <div className="px-3 py-2 border-b border-border bg-muted/50 shrink-0">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Itens do Pedido</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {activeOrder.items.map((item) => {
              const scanned = scannedQty[item.barcode] || 0;
              const isComplete = scanned >= item.quantityRequired;
              const isOver = scanned > item.quantityRequired;

              return (
                <motion.div
                  key={item.barcode}
                  layout
                  className={`rounded-lg border p-3 transition-colors ${
                    isComplete
                      ? "border-success/40 bg-success/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="font-mono text-xs text-muted-foreground mt-0.5">{item.barcode}</p>
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
                          isOver ? "bg-warning" : isComplete ? "bg-success" : "bg-primary"
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
                        isOver ? "text-warning" : isComplete ? "text-success" : "text-foreground"
                      }`}
                    >
                      {scanned}/{item.quantityRequired}
                    </span>
                  </div>

                  {isOver && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-warning">
                      <XCircle className="h-3 w-3" /> Excesso: +{scanned - item.quantityRequired}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SalesConference;
