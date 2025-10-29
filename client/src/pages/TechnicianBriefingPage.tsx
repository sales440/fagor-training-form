import { useParams } from 'wouter';
import TechnicianBriefing from '@/components/TechnicianBriefing';

export default function TechnicianBriefingPage() {
  const params = useParams<{ requestId: string }>();
  const requestId = parseInt(params.requestId || '0', 10);

  if (!requestId || isNaN(requestId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Invalid request ID</div>
      </div>
    );
  }

  return <TechnicianBriefing requestId={requestId} referenceCode="" />;
}

