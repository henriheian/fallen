import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, TrendingUp, Package, DollarSign, Users } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: kpis, isLoading } = trpc.dashboard.getKPIs.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  const criticalProducts = kpis?.criticalProducts || 0;
  const hasCriticalStock = criticalProducts > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bem-vindo, {user?.name || "Usuário"}!</p>
      </div>

      {/* Alertas Críticos */}
      {hasCriticalStock && (
        <Alert className="border-destructive bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">Produtos com Estoque Crítico</AlertTitle>
          <AlertDescription className="text-destructive/80">
            {criticalProducts} produto(s) com quantidade abaixo do mínimo. Verifique o estoque.
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Produtos */}
        <Card className="border-border hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtos</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpis?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Produtos cadastrados</p>
          </CardContent>
        </Card>

        {/* Estoque Total */}
        <Card className="border-border hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Total</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpis?.totalStock || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Unidades em estoque</p>
          </CardContent>
        </Card>

        {/* Saldo de Caixa */}
        <Card className="border-border hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo de Caixa</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(kpis?.cashBalance || 0) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              R$ {((kpis?.cashBalance || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Saldo consolidado</p>
          </CardContent>
        </Card>

        {/* Estoque Crítico */}
        <Card className={`border-border hover:shadow-lg transition-shadow ${hasCriticalStock ? 'border-destructive/50 bg-destructive/5' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Crítico</CardTitle>
            <AlertTriangle className={`h-5 w-5 ${hasCriticalStock ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasCriticalStock ? 'text-destructive' : 'text-foreground'}`}>
              {criticalProducts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Produtos abaixo do mínimo</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total de Entradas</p>
              <p className="text-2xl font-bold text-green-600">R$ {((kpis?.totalIncome || 0) / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total de Saídas</p>
              <p className="text-2xl font-bold text-destructive">R$ {((kpis?.totalExpense || 0) / 100).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Produtos Vendidos */}
      {kpis?.topProducts && kpis.topProducts.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.topProducts.map((product: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      #{idx + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.quantity} unidades vendidas</p>
                    </div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
