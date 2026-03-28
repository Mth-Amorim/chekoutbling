import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Camera, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DamageRecord {
  id: string;
  barcode: string;
  damageType: string;
  quantity: number;
  description: string;
  photoUrl: string | null;
  timestamp: Date;
}

const DAMAGE_TYPES = [
  "Produto Amassado",
  "Produto Molhado",
  "Embalagem Violada",
  "Produto Quebrado",
  "Produto Vencido",
  "Etiqueta Danificada",
  "Outro",
];

const DamageRegistration = () => {
  const [barcode, setBarcode] = useState("");
  const [damageType, setDamageType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [records, setRecords] = useState<DamageRecord[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!barcode.trim() || !damageType) return;
    const record: DamageRecord = {
      id: crypto.randomUUID(),
      barcode,
      damageType,
      quantity,
      description,
      photoUrl: photoPreview,
      timestamp: new Date(),
    };
    setRecords((prev) => [record, ...prev]);
    setBarcode("");
    setDamageType("");
    setQuantity(1);
    setDescription("");
    setPhotoPreview(null);
  };

  const handleRemove = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-destructive/30 bg-card p-6 space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">Registrar Avaria</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Código de barras do produto..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="font-mono bg-muted border-border"
          />
          <Select value={damageType} onValueChange={setDamageType}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Tipo de avaria" />
            </SelectTrigger>
            <SelectContent>
              {DAMAGE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Qtd. Itens:</label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20 font-mono bg-muted border-border"
            />
          </div>
        </div>

        <Textarea
          placeholder="Descrição adicional (opcional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-muted border-border min-h-[80px]"
        />

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground flex items-center gap-1">
            <Camera className="h-4 w-4" /> Foto do produto (opcional)
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center gap-2 rounded-md border border-dashed border-border bg-muted px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <ImageIcon className="h-4 w-4" />
              {photoPreview ? "Trocar foto" : "Selecionar foto"}
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
            </label>
            {photoPreview && (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded-md object-cover border border-border" />
                <button
                  onClick={() => setPhotoPreview(null)}
                  className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground h-5 w-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
          <Plus className="h-4 w-4 mr-1" /> Registrar Avaria
        </Button>
      </motion.div>

      {/* Records */}
      {records.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Avarias Registradas ({records.length})
          </h3>
          <div className="space-y-2">
            <AnimatePresence>
              {records.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between rounded-md border border-destructive/20 bg-muted p-3"
                >
                  <div className="flex items-center gap-4">
                    {record.photoUrl && (
                      <img src={record.photoUrl} alt="Avaria" className="h-10 w-10 rounded object-cover border border-border" />
                    )}
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-primary">{record.barcode}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">{record.damageType}</span>
                        <span className="text-sm font-semibold text-foreground">×{record.quantity}</span>
                      </div>
                      {record.description && (
                        <p className="text-xs text-muted-foreground mt-1">{record.description}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(record.id)} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
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

export default DamageRegistration;
