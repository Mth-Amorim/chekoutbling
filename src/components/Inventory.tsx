import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { estoqueData } from "@/lib/estoqueData";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState<string>("all");

  const filteredData = useMemo(() => {
    // Filtrar itens que contenham "Grade" ou "M.P" no nome (ocultar do estoque)
    const baseData = estoqueData.filter((item) => {
      const name = item.name.toUpperCase();
      return !name.includes("GRADE") && !name.includes("M.P");
    });

    let dataToFilter = baseData;

    if (location !== "all") {
      dataToFilter = baseData.filter((item) => item.location === location);
    } else {
      const aggregatedMap = new Map<string, typeof estoqueData[0]>();
      baseData.forEach((item) => {
        if (aggregatedMap.has(item.id)) {
          const existing = aggregatedMap.get(item.id)!;
          aggregatedMap.set(item.id, {
            ...existing,
            quantity: existing.quantity + item.quantity,
            open: existing.open + item.open,
            administrative: existing.administrative + item.administrative,
            pending: ((existing as any).pending || 0) + ((item as any).pending || 0),
            available: existing.available + item.available,
            location: "SP / PA"
          });
        } else {
          aggregatedMap.set(item.id, { ...item });
        }
      });
      dataToFilter = Array.from(aggregatedMap.values());
    }

    return dataToFilter.filter((item) => {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             item.id.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, location]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Estoque</h2>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código ou nome do produto..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Local de Estoque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Locais</SelectItem>
                  <SelectItem value="SP">São Paulo (SP)</SelectItem>
                  <SelectItem value="PA">Pará (PA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap w-32">Código do Produto</TableHead>
                  <TableHead className="min-w-[180px]">Nome</TableHead>
                  <TableHead className="text-right">Qtd.</TableHead>
                  <TableHead className="text-right whitespace-normal leading-tight w-24">Pedidos em Aberto</TableHead>
                  <TableHead className="text-right whitespace-normal leading-tight w-28">Pedidos no Administrativo</TableHead>
                  <TableHead className="text-right whitespace-normal leading-tight w-24">Pendentes de embalar</TableHead>
                  <TableHead className="text-right font-bold text-primary whitespace-normal leading-tight w-24">Saldo Disponível</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={`${item.id}-${item.location}-${index}`}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="whitespace-normal break-words max-w-[25ch] text-sm">{item.name}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {item.location}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right text-orange-600">{item.open.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right text-blue-600">{item.administrative.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right text-yellow-600">{((item as any).pending || 0).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right font-bold text-primary text-lg">{item.available.toLocaleString("pt-BR")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
