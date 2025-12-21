// ============================================================================
// FILE: client/src/pages/AdminDashboard.tsx
// DESCRIPTION: Admin dashboard with tabs for Calendar and Kanban views
// FEATURES: Protected route (admin-only), tab navigation, real-time data
// ============================================================================

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from '@/components/CalendarView';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ExportSettings } from '@/components/ExportSettings';
import { MetricsDashboard } from '@/components/MetricsDashboard';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, Calendar, LayoutGrid, TrendingUp, Users, Clock, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function ExportButton() {
  const exportMutation = trpc.trainingRequest.exportExcel.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([Uint8Array.from(atob(data.data), c => c.charCodeAt(0))], 
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Fagor_Training_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      toast.success('Excel descargado');
    },
    onError: () => toast.error('Error al generar Excel')
  });

  return (
    <Button onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending} className="bg-[#DC241F]">
      <Download className="mr-2 h-4 w-4" />
      {exportMutation.isPending ? 'Generando...' : 'Descargar Excel'}
    </Button>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Fetch training requests for statistics
  const { data: requests } = trpc.trainingRequest.getAll.useQuery();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (!response.ok) {
          navigate('/admin/login');
        }
      } catch (error) {
        navigate('/admin/login');
      }
    };
    checkAuth();
  }, [navigate]);

  // Calculate statistics
  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    awaitingConfirmation: requests?.filter(r => r.status === 'awaiting_client_confirmation').length || 0,
    approved: requests?.filter(r => r.status === 'approved').length || 0,
    rejected: requests?.filter(r => r.status === 'rejected').length || 0,
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authorized (will redirect)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Training Requests Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and track all training requests
              </p>
            </div>
            <ExportButton />
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Total Requests */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Pending */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          {/* Awaiting Confirmation */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Awaiting Confirm</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{stats.awaitingConfirmation}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Approved */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Rejected */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content - Tabs */}
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-6">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kanban Board
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Métricas
            </TabsTrigger>
          </TabsList>

          {/* Kanban Board Tab */}
          <TabsContent value="kanban" className="mt-0">
            <Card className="p-0 overflow-hidden">
              <KanbanBoard />
            </Card>
          </TabsContent>

          {/* Calendar View Tab */}
          <TabsContent value="calendar" className="mt-0">
            <Card className="p-6">
              <CalendarView />
            </Card>
          </TabsContent>

          {/* Export & Settings Tab */}
          <TabsContent value="settings" className="mt-0">
            <Card className="p-6">
              <ExportSettings />
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="mt-0">
            <Card className="p-6">
              <MetricsDashboard />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-center text-muted-foreground">
            Fagor Training Management System © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
