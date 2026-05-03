import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Plus, Trash2, Printer, Save, Package, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/use-toast";

interface PostagemItem {
  id: string;
  pedido: string;
  modeloCaixa: string;
  peso: string;
  servico: "SEDEX" | "PAC";
}

const PrePostagem = () => {
  const [carrier, setCarrier] = useState<"CORREIOS" | "MELHOR_ENVIO">("CORREIOS");
  const [items, setItems] = useState<PostagemItem[]>([
    { id: Math.random().toString(36).substring(2, 9), pedido: "", modeloCaixa: "", peso: "", servico: "SEDEX" }
  ]);
  const { toast } = useToast();

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substring(2, 9), pedido: "", modeloCaixa: "", peso: "", servico: "SEDEX" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      toast({
        variant: "destructive",
        title: "Ação não permitida",
        description: "É necessário ter pelo menos uma linha.",
      });
    }
  };

  const updateItem = (id: string, field: keyof PostagemItem, value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleFinish = () => {
    const hasEmptyFields = items.some(item => !item.pedido || !item.peso);
    if (hasEmptyFields) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha o Pedido e o Peso em todas as linhas.",
      });
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        variant: "destructive",
        title: "Erro ao abrir impressão",
        description: "Certifique-se que o bloqueador de pop-ups está desativado.",
      });
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Remessa de Postagem - Uze Nails</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .logo img { height: 60px; }
            .company-info { text-align: right; font-size: 12px; line-height: 1.4; }
            h1 { text-align: center; font-size: 22px; text-transform: uppercase; margin: 20px 0; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f5f5f5; border-bottom: 2px solid #333; padding: 12px 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
            td { border-bottom: 1px solid #eee; padding: 12px 8px; font-size: 13px; }
            .error { color: #e11d48; font-weight: bold; font-size: 11px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-around; }
            .signature { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-size: 10px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <img src="https://acdn-us.mitiendanube.com/stores/005/081/561/themes/toluca/img-49697943-1757160534-b49360ea4a826198c3297547b5588ade1757160534.png?4022911048044583491" />
            </div>
            <div class="company-info">
              <strong>UZE NAILS COSMETICOS LTDA</strong><br />
              Rua Ricardo Fracassi, N° 610, CONJ 12<br />
              Santa Bárbara D'Oeste, SP - 13456-141<br />
              CNPJ: 56.992.238/0001-03<br />
              (91) 99130-3454
            </div>
          </div>

          <h1>Remessa de Postagem</h1>

          <div class="meta-info">
            <div><strong>Transportadora:</strong> ${carrier === "CORREIOS" ? "Correios" : "Melhor Envio"}</div>
            <div><strong>Emissão:</strong> ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Modelo Caixa</th>
                <th>Peso (kg)</th>
                <th>Modalidade</th>
                <th>Status da Geração</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td><strong>#${item.pedido}</strong></td>
                  <td>${item.modeloCaixa || "-"}</td>
                  <td>${item.peso} kg</td>
                  <td>${item.servico}</td>
                  <td class="error">ERRO: USUÁRIO NÃO AUTORIZADO</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="footer">
            <div class="signature">Responsável Conferência</div>
            <div class="signature">Responsável Expedição</div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in slide-in-from-top-2 duration-500">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Pré-postagem</h2>
          <p className="text-muted-foreground text-sm font-medium">Configure as informações de envio para impressão rápida.</p>
        </div>
        <Button 
          onClick={handleFinish} 
          size="lg"
          className="gap-2 px-8 h-12 bg-primary hover:bg-primary/90 text-white font-black shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all active:scale-95"
        >
          <Save className="h-5 w-5" />
          CONCLUIR
        </Button>
      </div>

      <Card className="border-border shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500 delay-150">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 pb-8 border-b border-dashed border-border/50">
            <div className="space-y-4 w-full md:w-auto">
              <Label className="text-xs font-black uppercase text-white tracking-[0.2em] ml-1">Transportadora</Label>
              <RadioGroup
                value={carrier}
                onValueChange={(val: any) => setCarrier(val)}
                className="flex gap-4"
              >
                <div className="relative group">
                  <RadioGroupItem value="CORREIOS" id="correios" className="peer sr-only" />
                  <Label
                    htmlFor="correios"
                    className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white cursor-pointer hover:bg-white/10 transition-all peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10 peer-data-[state=checked]:ring-4 peer-data-[state=checked]:ring-white/10"
                  >
                    <span className="font-bold">Correios</span>
                  </Label>
                </div>
                <div className="relative group">
                  <RadioGroupItem value="MELHOR_ENVIO" id="melhor_envio" className="peer sr-only" />
                  <Label
                    htmlFor="melhor_envio"
                    className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white cursor-pointer hover:bg-white/10 transition-all peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10 peer-data-[state=checked]:ring-4 peer-data-[state=checked]:ring-white/10"
                  >
                    <span className="font-bold">Melhor Envio</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            {/* Table Header (Desktop Only) */}
            <div className="hidden md:grid grid-cols-12 gap-6 px-6 text-[10px] font-black uppercase text-white tracking-[0.2em] mb-2">
              <div className="col-span-3">Pedido</div>
              <div className="col-span-3">Modelo Caixa</div>
              <div className="col-span-2">Peso (kg)</div>
              <div className="col-span-3">Serviço</div>
              <div className="col-span-1"></div>
            </div>

            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-background/80 p-5 md:p-3 border border-border/60 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                >
                  <div className="col-span-3 relative">
                    <Label className="md:hidden text-[10px] font-black uppercase text-white mb-1 block ml-1">Pedido</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                      <Input
                        placeholder="Nº Pedido"
                        value={item.pedido}
                        onChange={(e) => updateItem(item.id, "pedido", e.target.value)}
                        className="pl-9 h-11 bg-white/10 border-transparent focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all font-bold text-white placeholder:text-white/30"
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <Label className="md:hidden text-[10px] font-black uppercase text-white mb-1 block ml-1">Modelo Caixa</Label>
                    <div className="relative">
                      <Package className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                      <Input
                        placeholder="Ex: Caixa P"
                        value={item.modeloCaixa}
                        onChange={(e) => updateItem(item.id, "modeloCaixa", e.target.value)}
                        className="pl-9 h-11 bg-white/10 border-transparent focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all font-medium text-white placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label className="md:hidden text-[10px] font-black uppercase text-white mb-1 block ml-1">Peso</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={item.peso}
                      onChange={(e) => updateItem(item.id, "peso", e.target.value)}
                      className="h-11 bg-white/10 border-transparent focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all font-black text-center text-white placeholder:text-white/30"
                    />
                  </div>

                  <div className="col-span-3">
                    <Label className="md:hidden text-[10px] font-black uppercase text-white mb-1 block ml-1">Serviço</Label>
                    <Select
                      value={item.servico}
                      onValueChange={(val: any) => updateItem(item.id, "servico", val)}
                    >
                      <SelectTrigger className="h-11 bg-white/10 border-transparent focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all font-bold text-white">
                        <SelectValue placeholder="Serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEDEX" className="font-bold">SEDEX</SelectItem>
                        <SelectItem value="PAC" className="font-bold">PAC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-11 w-11 rounded-xl text-white/50 hover:text-destructive hover:bg-destructive/5 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-start mt-6">
              <Button 
                onClick={addItem} 
                variant="outline" 
                className="gap-2 h-12 px-6 rounded-xl border-white/20 hover:border-white hover:bg-white/5 text-white font-bold transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                ADICIONAR LINHA
              </Button>
            </div>

            {items.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-3xl bg-accent/5">
                <Package className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium italic">Nenhuma postagem adicionada à lista.</p>
                <Button onClick={addItem} variant="link" className="mt-2 text-primary font-black">
                  Adicionar o primeiro pacote
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          #printable-summary { 
            box-shadow: none !important; 
            border: none !important; 
            padding: 0 !important;
            width: 100% !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default PrePostagem;
