import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Download, Mail, Calendar } from 'lucide-react';

export function ExportSettings() {
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [autoExportEmail, setAutoExportEmail] = useState('jcrobledolopez@gmail.com');
  const [autoExportFreq, setAutoExportFreq] = useState('weekly');

  const exportMutation = trpc.trainingRequest.exportExcel.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([Uint8Array.from(atob(data.data), c => c.charCodeAt(0))], 
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Fagor_Training_${dateFilter}_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      toast.success('Excel descargado');
    },
    onError: () => toast.error('Error al generar Excel')
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Exportación Manual</h3>
        <div className="space-y-4">
          <div>
            <Label>Filtro de Fecha</Label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los registros</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Año actual</SelectItem>
                <SelectItem value="custom">Rango personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateFilter === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha Inicio</Label>
                <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
              </div>
              <div>
                <Label>Fecha Fin</Label>
                <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
              </div>
            </div>
          )}

          <Button onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending} className="bg-[#DC241F]">
            <Download className="mr-2 h-4 w-4" />
            {exportMutation.isPending ? 'Generando...' : 'Descargar Excel'}
          </Button>
        </div>
      </div>

      <hr />

      <div>
        <h3 className="text-lg font-semibold mb-4">Exportación Automática</h3>
        <div className="space-y-4">
          <div>
            <Label>Email Destinatario</Label>
            <Input type="email" value={autoExportEmail} onChange={e => setAutoExportEmail(e.target.value)} />
          </div>
          <div>
            <Label>Frecuencia</Label>
            <Select value={autoExportFreq} onValueChange={setAutoExportFreq}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal (Lunes 8:00 AM)</SelectItem>
                <SelectItem value="monthly">Mensual (Día 1, 8:00 AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Mail className="mr-2 h-4 w-4" />
            Activar Exportación Automática
          </Button>
          <p className="text-sm text-gray-600">Se enviará automáticamente un Excel con todos los registros del período</p>
        </div>
      </div>
    </div>
  );
}
