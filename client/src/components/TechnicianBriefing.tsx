import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Phone, Mail, User, Building, Wrench, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface TechnicianBriefingProps {
  requestId: number;
  referenceCode: string;
}

interface BriefingData {
  // End User Information
  companyName: string;
  contactPerson: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  machineBrand?: string;
  machineModel?: string;
  
  // OEM Information (if applicable)
  oemName?: string;
  oemContact?: string;
  oemAddress?: string;
  oemEmail?: string;
  oemPhone?: string;
  
  // Training Details
  controllerModel: string;
  machineType?: string;
  programmingType?: string;
  trainingDays: number;
  trainees: number;
  knowledgeLevel?: string;
  trainingDetails?: string;
  
  // Scheduling
  referenceCode: string;
  assignedTechnician: string;
  confirmedStartDate?: string;
  confirmedEndDate?: string;
  status: string;
  
  // Travel Information
  nearestAirport: string;
  mapUrl: string;
}

export default function TechnicianBriefing({ requestId, referenceCode }: TechnicianBriefingProps) {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptNewDates, setAcceptNewDates] = useState(false);
  const [showDateChangeNotification, setShowDateChangeNotification] = useState(false);

  useEffect(() => {
    fetchBriefingData();
  }, [requestId]);

  const fetchBriefingData = async () => {
    try {
      const response = await fetch(`/api/training-requests/${requestId}/technician-briefing`);
      if (response.ok) {
        const data = await response.json();
        setBriefing(data);
        
        // Check if dates were recently updated
        if (data.datesRecentlyUpdated) {
          setShowDateChangeNotification(true);
        }
      }
    } catch (error) {
      console.error('Error fetching briefing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptNewDates = async () => {
    if (!acceptNewDates) {
      alert('Please confirm that you accept the new training dates');
      return;
    }

    try {
      const response = await fetch(`/api/training-requests/${requestId}/accept-date-change`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setShowDateChangeNotification(false);
        alert('Thank you for confirming the new training dates');
      }
    } catch (error) {
      console.error('Error accepting new dates:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading briefing document...</div>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Unable to load briefing document</div>
      </div>
    );
  }

  const isConfirmed = briefing.status === 'confirmed';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Date Change Notification */}
      {showDateChangeNotification && (
        <Card className="mb-6 p-6 border-orange-500 bg-orange-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-orange-900 mb-2">
                Training Dates Have Been Updated
              </h3>
              <p className="text-orange-800 mb-4">
                The training dates for this course have been modified. Please review the new dates below and confirm your acceptance.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="acceptDates"
                  checked={acceptNewDates}
                  onChange={(e) => setAcceptNewDates(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="acceptDates" className="text-sm font-medium text-orange-900">
                  I accept the new training dates
                </label>
              </div>
              <Button 
                onClick={handleAcceptNewDates}
                disabled={!acceptNewDates}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Confirm New Dates
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Print Button (hidden when printing) */}
      <div className="mb-6 print:hidden">
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          Print / Save as PDF
        </Button>
      </div>

      {/* Main Briefing Document */}
      <Card className="max-w-5xl mx-auto bg-white shadow-lg">
        {/* Header with Logo and Address */}
        <div className="p-8 border-b-2 border-red-600">
          <div className="flex justify-between items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/fagor-logo.png" 
                alt="Fagor Automation" 
                className="h-16"
              />
            </div>
            
            {/* Company Address */}
            <div className="text-right text-sm">
              <div className="font-bold text-red-600 text-lg">FAGOR AUTOMATION Corp.</div>
              <div className="text-gray-700 mt-1">4020 Winnetta Ave, Rolling Meadows, IL 60008</div>
              <div className="text-gray-700">Tel: 847-981-1500 | Fax: 847-981-1311</div>
              <div className="text-gray-700">service@fagor-automation.com</div>
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="p-8 bg-gray-50 border-b">
          <h1 className="text-3xl font-bold text-center text-red-600 mb-2">
            TRAINING ASSIGNMENT BRIEFING
          </h1>
          <div className="text-center text-lg font-semibold text-gray-700">
            Reference Code: {briefing.referenceCode}
          </div>
          {isConfirmed && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-semibold">CONFIRMED</span>
            </div>
          )}
        </div>

        {/* Assigned Technician */}
        <div className="p-8 bg-blue-50 border-b">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-900">Assigned Technician</h2>
          </div>
          <div className="text-2xl font-bold text-blue-600 ml-9">
            {briefing.assignedTechnician}
          </div>
        </div>

        {/* Training Dates */}
        {isConfirmed && briefing.confirmedStartDate && briefing.confirmedEndDate && (
          <div className="p-8 bg-green-50 border-b">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-green-900">Confirmed Training Dates</h2>
            </div>
            <div className="grid grid-cols-2 gap-6 ml-9">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Start Date</div>
                <div className="text-lg font-bold text-green-700">
                  {new Date(briefing.confirmedStartDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">End Date</div>
                <div className="text-lg font-bold text-green-700">
                  {new Date(briefing.confirmedEndDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* End User Information */}
        <div className="p-8 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Building className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">End User Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-6 ml-9">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Company Name</div>
              <div className="text-lg font-medium">{briefing.companyName}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Contact Person</div>
              <div className="text-lg font-medium">{briefing.contactPerson}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm font-semibold text-gray-600 mb-1">Location</div>
              <div className="text-lg font-medium">
                {briefing.address}, {briefing.city}, {briefing.state} {briefing.zipCode}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Phone</div>
              <div className="text-lg font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                {briefing.phone}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Email</div>
              <div className="text-lg font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                {briefing.email}
              </div>
            </div>
            {briefing.machineBrand && (
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Machine Brand</div>
                <div className="text-lg font-medium">{briefing.machineBrand}</div>
              </div>
            )}
            {briefing.machineModel && (
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Machine Model</div>
                <div className="text-lg font-medium">{briefing.machineModel}</div>
              </div>
            )}
          </div>
        </div>

        {/* OEM Information (if applicable) */}
        {briefing.oemName && (
          <div className="p-8 border-b bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <Building className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">OEM Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-6 ml-9">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">OEM Name</div>
                <div className="text-lg font-medium">{briefing.oemName}</div>
              </div>
              {briefing.oemContact && (
                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-1">OEM Contact</div>
                  <div className="text-lg font-medium">{briefing.oemContact}</div>
                </div>
              )}
              {briefing.oemAddress && (
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-gray-600 mb-1">OEM Address</div>
                  <div className="text-lg font-medium">{briefing.oemAddress}</div>
                </div>
              )}
              {briefing.oemEmail && (
                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-1">OEM Email</div>
                  <div className="text-lg font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {briefing.oemEmail}
                  </div>
                </div>
              )}
              {briefing.oemPhone && (
                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-1">OEM Phone</div>
                  <div className="text-lg font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {briefing.oemPhone}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Training Course Details */}
        <div className="p-8 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Training Course Details</h2>
          </div>
          <div className="grid grid-cols-2 gap-6 ml-9">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">CNC Controller Model</div>
              <div className="text-lg font-bold text-orange-600">{briefing.controllerModel}</div>
            </div>
            {briefing.machineType && (
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Machine Type</div>
                <div className="text-lg font-medium">{briefing.machineType}</div>
              </div>
            )}
            {briefing.programmingType && (
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Programming Type</div>
                <div className="text-lg font-medium">{briefing.programmingType}</div>
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Training Duration</div>
              <div className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                {briefing.trainingDays} {briefing.trainingDays === 1 ? 'day' : 'days'}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Number of Trainees</div>
              <div className="text-lg font-medium">{briefing.trainees} participants</div>
            </div>
            {briefing.knowledgeLevel && (
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Knowledge Level</div>
                <div className="text-lg font-medium">{briefing.knowledgeLevel}</div>
              </div>
            )}
            {briefing.trainingDetails && (
              <div className="col-span-2">
                <div className="text-sm font-semibold text-gray-600 mb-1">Special Requirements</div>
                <div className="text-base font-medium bg-yellow-50 p-4 rounded border border-yellow-200">
                  {briefing.trainingDetails}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Travel Route Information */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Travel Route</h2>
          </div>
          <div className="ml-9">
            <div className="text-sm font-semibold text-gray-600 mb-2">Nearest International Airport</div>
            <div className="text-lg font-bold text-blue-600 mb-4">{briefing.nearestAirport}</div>
            
            <div className="text-sm font-semibold text-gray-600 mb-2">Route to Customer Location</div>
            <div className="bg-gray-100 p-2 rounded border">
              <img 
                src={briefing.mapUrl} 
                alt="Route map" 
                className="w-full rounded"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-100 text-center text-sm text-gray-600">
          <p>This is a confidential training assignment document. For internal use only.</p>
          <p className="mt-1">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </Card>
    </div>
  );
}

