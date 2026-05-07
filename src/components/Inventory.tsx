import { useState, useMemo, useEffect } from "react";
import { Search, Loader2, AlertCircle, RefreshCw, Warehouse, ChevronRight, Info } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useToast } from "./ui/use-toast";

interface Product {
  id: number;
  codigo: string;
  nome: string;
}

interface Deposito {
  id: number;
  saldoFisico: number;
  saldoVirtual: number;
  descricao: string;
}

interface EstoqueItem {
  produto: Product;
  saldoFisicoTotal: number;
  saldoVirtualTotal: number;
  depositos: Deposito[];
}

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Reverting to proxy route to avoid CORS errors (Failed to Fetch)
      const response = await fetch("/api/estoques/saldos");
      if (!response.ok) throw new Error(`Erro ${response.status}: Falha ao carregar dados do estoque`);
      const json = await response.json();
      setData(json.data || []);
      setLastUpdate(new Date());
      toast({
        title: "Dados Atualizados",
        description: "O estoque foi sincronizado com sucesso.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const depositsList = useMemo(() => {
    const allDeposits = new Map<number, string>();
    data.forEach(item => {
      item.depositos.forEach(dep => {
        allDeposits.set(dep.id, dep.descricao);
      });
    });
    return Array.from(allDeposits.entries()).map(([id, descricao]) => ({ id, descricao }));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const search = searchTerm.toLowerCase();
      return (
        item.produto.nome.toLowerCase().includes(search) ||
        item.produto.codigo.toLowerCase().includes(search)
      );
    });
  }, [searchTerm, data]);

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-primary opacity-50" />
        </motion.div>
        <p className="text-zinc-500 font-medium animate-pulse uppercase tracking-[0.2em] text-xs">
          Sincronizando Base de Dados...
        </p>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Erro de Conexão</h3>
          <p className="text-zinc-400 mb-6 max-w-md">{error}</p>
          <Button onClick={fetchData} variant="outline" className="border-white/10 text-white">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            placeholder="Filtrar por código ou descrição do produto..."
            className="pl-12 h-14 bg-white/5 border-white/5 text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-2xl text-lg shadow-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Última Atualização</p>
            <p className="text-xs text-zinc-300 font-mono">{lastUpdate.toLocaleTimeString()}</p>
          </div>
          <Button 
            onClick={fetchData} 
            disabled={loading}
            className="h-14 px-6 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all text-primary font-bold gap-2 shadow-lg shadow-primary/5 active:scale-95"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'ATUALIZANDO...' : 'ATUALIZAR'}</span>
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden rounded-[2rem] shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5 hover:bg-transparent h-20">
                  <TableHead className="w-40 text-zinc-400 font-black tracking-widest uppercase text-[10px] pl-8">SKU / Identificação</TableHead>
                  <TableHead className="text-zinc-400 font-black tracking-widest uppercase text-[10px]">Descrição do Produto</TableHead>
                  {depositsList.map(dep => (
                    <TableHead key={dep.id} className="text-center text-zinc-400 font-black tracking-widest uppercase text-[10px] border-l border-white/5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-primary/70 truncate max-w-[120px]">{dep.descricao.split(' - ')[0]}</span>
                        <div className="flex justify-around text-[7px] gap-2 opacity-50">
                          <span>VIRTUAL</span>
                          <span>FÍSICO</span>
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-right text-emerald-500 font-black tracking-widest uppercase text-[10px] pr-8 bg-emerald-500/5 border-l border-white/5">
                    <div className="flex flex-col items-end">
                      <span>Saldo Total</span>
                      <div className="flex gap-3 text-[7px] opacity-70">
                        <span>VIRTUAL</span>
                        <span>FÍSICO</span>
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredData.map((item, idx) => (
                    <motion.tr
                      key={item.produto.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-white/5 hover:bg-white/[0.03] transition-colors group h-20"
                    >
                      <TableCell className="pl-8">
                        <div className="flex flex-col">
                          <span className="text-primary font-mono font-bold tracking-tight">{item.produto.codigo}</span>
                          <span className="text-[10px] text-zinc-600 font-mono">ID: {item.produto.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors max-w-xs xl:max-w-md line-clamp-2 leading-snug">
                          {item.produto.nome}
                        </p>
                      </TableCell>
                      {depositsList.map(depHeader => {
                        const dep = item.depositos.find(d => d.id === depHeader.id);
                        const virtual = dep?.saldoVirtual ?? 0;
                        const fisico = dep?.saldoFisico ?? 0;
                        return (
                          <TableCell key={depHeader.id} className="text-center font-mono border-l border-white/5">
                            <div className="flex justify-around items-center gap-2">
                              <span className={`text-xs font-bold ${
                                virtual < 0 ? 'text-red-500' : 
                                virtual > 0 ? 'text-zinc-200' : 'text-zinc-700'
                              }`}>
                                {virtual.toLocaleString('pt-BR')}
                              </span>
                              <span className={`text-[10px] ${
                                fisico < 0 ? 'text-red-500/70' : 
                                fisico > 0 ? 'text-zinc-500' : 'text-zinc-800'
                              }`}>
                                {fisico.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right pr-8 bg-emerald-500/5 border-l border-white/5">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-black drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] ${
                              item.saldoVirtualTotal < 0 ? 'text-red-500' : 'text-emerald-400'
                            }`}>
                              {item.saldoVirtualTotal.toLocaleString('pt-BR')}
                            </span>
                            <ChevronRight className="h-4 w-4 text-emerald-500/30 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </div>
                          <span className={`text-[10px] font-bold mr-6 ${
                            item.saldoFisicoTotal < 0 ? 'text-red-500/50' : 'text-emerald-900/50'
                          }`}>
                            Físico: {item.saldoFisicoTotal.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={depositsList.length + 3} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                        <Warehouse className="h-12 w-12 mb-4" />
                        <p className="text-lg font-bold uppercase tracking-widest">Nenhum Registro Encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center gap-2 text-zinc-600 px-4">
        <Info className="h-4 w-4" />
        <p className="text-xs">Os valores exibidos em destaque representam o <strong>Saldo Virtual</strong> (disponível para venda), enquanto os valores menores representam o <strong>Saldo Físico</strong>.</p>
      </div>
    </div>
  );
};

export default Inventory;
