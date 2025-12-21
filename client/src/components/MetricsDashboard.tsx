import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, MapPin } from 'lucide-react';

export function MetricsDashboard() {
  const { data: requests } = trpc.trainingRequest.getAll.useQuery();

  const metrics = {
    totalRevenue: requests?.reduce((sum, r) => sum + (r.totalPrice || 0), 0) || 0,
    monthlyRevenue: requests?.filter(r => {
      const date = new Date(r.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, r) => sum + (r.totalPrice || 0), 0) || 0,
    
    technicianStats: {} as Record<string, number>,
    stateStats: {} as Record<string, number>,
  };

  requests?.forEach(r => {
    if (r.assignedTechnician) {
      metrics.technicianStats[r.assignedTechnician] = (metrics.technicianStats[r.assignedTechnician] || 0) + 1;
    }
    if (r.state) {
      metrics.stateStats[r.state] = (metrics.stateStats[r.state] || 0) + 1;
    }
  });

  const topTechnicians = Object.entries(metrics.technicianStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topStates = Object.entries(metrics.stateStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Todos los cursos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Técnicos Más Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topTechnicians.map(([tech, count]) => (
                <div key={tech} className="flex justify-between items-center">
                  <span className="text-sm">{tech}</span>
                  <span className="text-sm font-semibold">{count} cursos</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Estados con Más Capacitaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topStates.map(([state, count]) => (
                <div key={state} className="flex justify-between items-center">
                  <span className="text-sm">{state}</span>
                  <span className="text-sm font-semibold">{count} cursos</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
