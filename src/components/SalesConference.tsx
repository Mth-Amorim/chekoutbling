import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ScanBarcode, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScannedItem {
  id: string;
  barcode: string;
  quantity: number;
  boxFormat: string;
  timestamp: Date;
}

const BOX_FORMATS = ["Caixa Pequena", "Caixa Média", "Caixa Grande", "Palete", "Envelope"];

const SalesConference = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [boxFormat, setBoxFormat] = useState("");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const handleConfirmOrder = () => {
    if (orderNumber.trim()) {
      setOrderConfirmed(true);
      setTimeout(() => barcodeRef.current?.focus(), 100);
    }
  };

  const handleScanBarcode = () => {
    if (!barcodeInput.trim() || !boxFormat) return;
    const newItem: ScannedItem = {
      id: crypto.randomUUID(),
      barcode: barcodeInput,
      quantity,
      boxFormat,
      timestamp: new Date(),
    };
    setScannedItems((prev) => [newItem, ...prev]);
    setBarcodeInput("");
    setQuantity(1);
    barcodeRef.current?.focus();
  };

  const handleRemoveItem = (id: string) => {
    setScannedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFinalize = () => {
    setOrderNumber("");
    setOrderConfirmed(false);
    setBarcodeInput("");
    setQuantity(1);
    setBoxFormat("");
    setScannedItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Order Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Pedido de Venda</h2>
        </div>

        {!orderConfirmed ? (
          <div className="flex gap-3">
            <Input
              placeholder="Número do pedido..."
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmOrder()}
              className="font-mono text-lg bg-muted border-border"
            />
            <Button onClick={handleConfirmOrder} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
              Confirmar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="font-mono text-lg text-foreground">Pedido #{orderNumber}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setOrderConfirmed(false)} className="border-border text-muted-foreground hover:text-foreground">
              Alterar
            </Button>
          </div>
        )}
      </motion.div>

      {/* Barcode Scanning */}
      <AnimatePresence>
        {orderConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-border bg-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <ScanBarcode className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Bipagem de Código de Barras</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                ref={barcodeRef}
                placeholder="Bipar código de barras..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScanBarcode()}
                className="font-mono bg-muted border-border"
                autoFocus
              />
              <Select value={boxFormat} onValueChange={setBoxFormat}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Formato da caixa" />
                </SelectTrigger>
                <SelectContent>
                  {BOX_FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Qtd. Caixas:</label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 font-mono bg-muted border-border"
                />
              </div>
              <Button onClick={handleScanBarcode} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanned Items */}
      {scannedItems.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Itens Conferidos ({scannedItems.length})
            </h3>
            <Button onClick={handleFinalize} className="bg-success text-success-foreground hover:bg-success/90">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Finalizar Conferência
            </Button>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {scannedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between rounded-md border border-border bg-muted p-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-primary">{item.barcode}</span>
                    <span className="text-sm text-muted-foreground">{item.boxFormat}</span>
                    <span className="text-sm font-semibold text-foreground">×{item.quantity}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SalesConference;
