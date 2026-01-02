import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe, Loader2, AlertCircle } from "lucide-react";
import SignaturePad from "signature_pad";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { useAddressAutocomplete } from "@/hooks/useAddressAutocomplete";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [quotationData, setQuotationData] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string>("");
  const [assignedTechnician, setAssignedTechnician] = useState<string>("");
  const [oemFieldsEnabled, setOemFieldsEnabled] = useState(false);
  const [calendarTrainingDays, setCalendarTrainingDays] = useState<number>(1);
  const [calendarFormData, setCalendarFormData] = useState<any>(null);
  const [calendarQuotationData, setCalendarQuotationData] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTrainingDates, setSelectedTrainingDates] = useState<Date[]>([]);
  const [isSubmittingDates, setIsSubmittingDates] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  // Address autocomplete hook
  const addressInputRef = useAddressAutocomplete({
    onPlaceSelected: (address) => {
      setFormData((prev) => ({
        ...prev,
        address1: address.address1,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      }));
    },
  });

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    machineBrand: "",
    machineModel: "",
    oemName: "",
    oemAddress: "",
    oemContact: "",
    oemEmail: "",
    oemPhone: "",
    controllerModel: "",
    machineType: "",
    programmingType: "",
    trainingDays: "",
    trainees: "",
    knowledgeLevel: "",
    trainingDetails: "",
    applicantName: "",
    applicationDate: new Date().toISOString().split('T')[0],
  });

  const calculateQuotationMutation = trpc.trainingRequest.calculateQuotation.useMutation({
    onSuccess: (data) => {
      setQuotationData(data);
      setShowQuotation(true);
    },
    onError: (error) => {
      toast.error(t("errorMessage"));
      console.error("Error calculating quotation:", error);
    },
  });

  const createRequestMutation = trpc.trainingRequest.create.useMutation({
    onSuccess: (data) => {
      // Store reference code and technician from response
      if (data.referenceCode) {
        setReferenceCode(data.referenceCode);
      }
      if (data.assignedTechnician) {
        setAssignedTechnician(data.assignedTechnician);
      }
      
      // Save form data and quotation data for calendar and PDF
      setCalendarTrainingDays(parseInt(formData.trainingDays) || 1);
      setCalendarFormData({ ...formData });
      setCalendarQuotationData(quotationData);
      
      toast.success(t("successMessage"));
      setShowQuotation(false);
      
      // Show calendar for date selection
      setShowCalendar(true);
      // Reset form
      setFormData({
        companyName: "",
        contactPerson: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        email: "",
        machineBrand: "",
        machineModel: "",
        oemName: "",
        oemAddress: "",
        oemContact: "",
        oemEmail: "",
        oemPhone: "",
        controllerModel: "",
        machineType: "",
        programmingType: "",
        trainingDays: "",
        trainees: "",
        knowledgeLevel: "",
        trainingDetails: "",
        applicantName: "",
        applicationDate: new Date().toISOString().split('T')[0],
      });
      setTermsAccepted(false);
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
      }
    },
    onError: (error) => {
      toast.error(t("errorMessage"));
      console.error("Error submitting request:", error);
    },
  });

  // Mutation to submit selected dates and send PDF email
  const submitDatesMutation = trpc.trainingRequest.submitDates.useMutation({
    onSuccess: () => {
      toast.success('Training dates submitted successfully!');
    },
    onError: (error) => {
      toast.error('Error submitting dates. Please try again.');
      console.error('Error submitting dates:', error);
    },
  });

  useEffect(() => {
    if (canvasRef.current && !signaturePadRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: "rgb(255, 255, 255)",
      });
    }
  }, []);

  // Enable OEM fields when OEM name is filled
  useEffect(() => {
    setOemFieldsEnabled(formData.oemName.trim().length > 0);
  }, [formData.oemName]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const validateForm = (): boolean => {
    // Required fields
    const requiredFields = [
      { field: formData.companyName, name: t("companyNameLabel") },
      { field: formData.contactPerson, name: t("contactPersonLabel") },
      { field: formData.address1, name: "Address 1" },
      { field: formData.city, name: "City" },
      { field: formData.state, name: "State" },
      { field: formData.zipCode, name: "Zip Code" },
      { field: formData.phone, name: t("phoneLabel") },
      { field: formData.email, name: t("emailLabel") },
      { field: formData.trainingDays, name: t("trainingDaysLabel") },
    ];

    for (const { field, name } of requiredFields) {
      if (!field || field.toString().trim() === "") {
        setWarningMessage(`${t("validationMessage")}: ${name}`);
        setShowWarning(true);
        return false;
      }
    }

    if (!termsAccepted) {
      setWarningMessage(t("warningMessage"));
      setShowWarning(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Calculate quotation
    const trainingDays = parseInt(formData.trainingDays);
    if (isNaN(trainingDays) || trainingDays <= 0) {
      setWarningMessage(t("validationMessage"));
      setShowWarning(true);
      return;
    }

    // Combine address fields
    const fullAddress = `${formData.address1}${formData.address2 ? ', ' + formData.address2 : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
    
    calculateQuotationMutation.mutate({
      address: fullAddress,
      city: formData.city,
      state: formData.state,
      trainingDays,
    });
  };

  const handleAcceptQuotation = () => {
    if (!quotationData) return;

    const signatureData = signaturePadRef.current?.toDataURL() || "";

    const fullAddress = `${formData.address1}${formData.address2 ? ', ' + formData.address2 : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
    
    createRequestMutation.mutate({
      ...formData,
      address: fullAddress, // Combined address for backward compatibility
      trainingDays: formData.trainingDays ? parseInt(formData.trainingDays) : undefined,
      trainees: formData.trainees ? parseInt(formData.trainees) : undefined,
      applicationDate: new Date(formData.applicationDate),
      signatureData,
      termsAccepted,
      language,
      trainingPrice: quotationData.trainingPrice,
      travelTimeHours: quotationData.travelExpenses.travelTimeHours,
      travelTime: quotationData.travelExpenses.travelTimeCost,
      hotelCost: quotationData.travelExpenses.hotelCost,
      foodCost: quotationData.travelExpenses.foodCost,
      carRentalCost: quotationData.travelExpenses.carRentalCost,
      flightCost: quotationData.travelExpenses.flightCost,
      travelExpenses: quotationData.travelExpenses.totalTravelExpenses,
      totalPrice: quotationData.totalPrice,
      nearestAirport: quotationData.travelExpenses.nearestAirport,
    });
  };

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "eu", name: "Euskara", flag: "🏴" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-md">
        <div className="container py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/fagor-logo-official.jpg" alt="Fagor Automation" className="h-16 object-contain" />
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Address */}
            <div className="text-sm text-gray-700 text-right mr-4">
              <p className="font-semibold"><span className="text-[#DC241F]">FAGOR AUTOMATION</span> Corp.</p>
              <p>4020 Winnetta Ave, Rolling Meadows, IL 60008</p>
              <p>Tel: 847-981-1500 | Fax: 847-981-1311</p>
              <p>service@fagor-automation.com</p>
            </div>
          </div>
        </div>
      </header>

      {/* Language Selector - Centered above form */}
      <div className="container py-6">
        <div className="flex justify-center">
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700 border-2 border-gray-300 rounded-full"
            >
              <Globe className="w-6 h-6" />
            </button>

            {showLanguageMenu && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                      language === lang.code ? "bg-red-50 text-[#DC241F] font-semibold" : "text-gray-700"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#DC241F] text-center mb-4">
            {t("mainTitle")}
          </h1>
          <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Company Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-[#DC241F] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#DC241F] rounded-full"></div>
                  {t("companyInfoTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName" className="required">
                      {t("companyNameLabel")}
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson" className="required">
                      {t("contactPersonLabel")}
                    </Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address1" className="required">
                      Address 1
                    </Label>
                    <Input
                      ref={addressInputRef}
                      id="address1"
                      value={formData.address1}
                      onChange={(e) => handleInputChange("address1", e.target.value)}
                      placeholder="Street address"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address2">
                      Address 2
                    </Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => handleInputChange("address2", e.target.value)}
                      placeholder="Apt, suite, unit, etc. (optional)"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="required">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="required">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="IL"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="required">
                      Zip Code
                    </Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="60008"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="required">
                      {t("phoneLabel")}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="required">
                      {t("emailLabel")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="machineBrand">{t("machineBrandLabel")}</Label>
                    <Input
                      id="machineBrand"
                      value={formData.machineBrand}
                      onChange={(e) => handleInputChange("machineBrand", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="machineModel">{t("machineModelLabel")}</Label>
                    <Input
                      id="machineModel"
                      value={formData.machineModel}
                      onChange={(e) => handleInputChange("machineModel", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OEM Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-[#DC241F] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#DC241F] rounded-full"></div>
                  {t("oemInfoTitle")}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">{t("oemNote")}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="oemName">{t("oemNameLabel")}</Label>
                    <Input
                      id="oemName"
                      value={formData.oemName}
                      onChange={(e) => handleInputChange("oemName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="oemContact">{t("oemContactLabel")}</Label>
                    <Input
                      id="oemContact"
                      value={formData.oemContact}
                      onChange={(e) => handleInputChange("oemContact", e.target.value)}
                      disabled={!oemFieldsEnabled}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="oemAddress">{t("oemAddressLabel")}</Label>
                  <Input
                    id="oemAddress"
                    value={formData.oemAddress}
                    onChange={(e) => handleInputChange("oemAddress", e.target.value)}
                    disabled={!oemFieldsEnabled}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="oemEmail">{t("oemEmailLabel")}</Label>
                    <Input
                      id="oemEmail"
                      type="email"
                      value={formData.oemEmail}
                      onChange={(e) => handleInputChange("oemEmail", e.target.value)}
                      disabled={!oemFieldsEnabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor="oemPhone">{t("oemPhoneLabel")}</Label>
                    <Input
                      id="oemPhone"
                      type="tel"
                      value={formData.oemPhone}
                      onChange={(e) => handleInputChange("oemPhone", e.target.value)}
                      disabled={!oemFieldsEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-[#DC241F] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#DC241F] rounded-full"></div>
                  {t("trainingDetailsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="controllerModel">{t("controllerModelLabel")}</Label>
                    <Select value={formData.controllerModel} onValueChange={(value) => handleInputChange("controllerModel", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select CNC Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8055">8055</SelectItem>
                        <SelectItem value="8058">8058</SelectItem>
                        <SelectItem value="8060">8060</SelectItem>
                        <SelectItem value="8065">8065</SelectItem>
                        <SelectItem value="8070">8070</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="machineType">{t("machineTypeLabel")}</Label>
                    <Select value={formData.machineType} onValueChange={(value) => handleInputChange("machineType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mill">{t("mill")}</SelectItem>
                        <SelectItem value="lathe">{t("lathe")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="trainingDetails">Training Details / Special Requirements</Label>
                  <textarea
                    id="trainingDetails"
                    value={formData.trainingDetails}
                    onChange={(e) => handleInputChange("trainingDetails", e.target.value)}
                    className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DC241F]"
                    placeholder="Please describe the type of training you would like to receive in detail..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="programmingType">{t("programmingTypeLabel")}</Label>
                    <Select value={formData.programmingType} onValueChange={(value) => handleInputChange("programmingType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversational">{t("conversational")}</SelectItem>
                        <SelectItem value="gcode">G-Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trainingDays" className="required">{t("trainingDaysLabel")}</Label>
                    <Input
                      id="trainingDays"
                      type="number"
                      min="1"
                      value={formData.trainingDays}
                      onChange={(e) => handleInputChange("trainingDays", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trainees">{t("traineesLabel")}</Label>
                    <Input
                      id="trainees"
                      type="number"
                      min="1"
                      max="4"
                      value={formData.trainees}
                      onChange={(e) => handleInputChange("trainees", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="knowledgeLevel">{t("knowledgeLevelLabel")}</Label>
                    <Select value={formData.knowledgeLevel} onValueChange={(value) => handleInputChange("knowledgeLevel", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">{t("beginner")}</SelectItem>
                        <SelectItem value="intermediate">{t("intermediate")}</SelectItem>
                        <SelectItem value="advanced">{t("advanced")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-[#DC241F] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#DC241F] rounded-full"></div>
                  {t("termsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto mb-4">
                  <h3 className="font-bold text-center mb-4">{t("termsMainTitle")}</h3>
                  <div className="space-y-2 text-sm">
                    <p>{t("term1")}</p>
                    <p>{t("term2")}</p>
                    <p>{t("term3")}</p>
                    <p>{t("term4")}</p>
                    <p>{t("term5")}</p>
                    <p>{t("term6")}</p>
                    <p>{t("term7")}</p>
                    <p>{t("term8")}</p>
                    <p>{t("term9")}</p>
                    <p>{t("term10")}</p>
                  </div>
                </div>

                <div className={`flex items-center space-x-2 p-3 rounded ${!termsAccepted && showWarning ? 'bg-red-50 border-2 border-red-500' : ''}`}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {t("acceptTermsLabel")}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Signature and Acceptance */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-[#DC241F] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#DC241F] rounded-full"></div>
                  {t("signatureTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="applicantName">{t("applicantNameLabel")}</Label>
                    <Input
                      id="applicantName"
                      value={formData.applicantName}
                      onChange={(e) => handleInputChange("applicantName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="applicationDate">{t("applicationDateLabel")}</Label>
                    <Input
                      id="applicationDate"
                      type="date"
                      value={formData.applicationDate}
                      onChange={(e) => handleInputChange("applicationDate", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>{t("signatureLabel")}</Label>
                  <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={150}
                      className="w-full border border-gray-200 rounded"
                      style={{ maxWidth: '600px', height: '150px' }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearSignature}
                    className="mt-2"
                  >
                    {t("clearSignature")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                disabled={calculateQuotationMutation.isPending}
                className="bg-[#DC241F] hover:bg-[#B01D1A] text-white px-12 py-6 text-lg font-semibold shadow-lg"
              >
                {calculateQuotationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("submitBtn")}
                  </>
                ) : (
                  t("submitBtn")
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {t("warningTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">{warningMessage}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowWarning(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quotation Dialog */}
      <Dialog open={showQuotation} onOpenChange={setShowQuotation}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {/* Fagor Header in Quotation */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b-2">
              <img src="/fagor-logo-official.jpg" alt="Fagor Automation" className="h-12 object-contain" />
              <div className="text-xs text-gray-700 text-right">
                <p className="font-semibold"><span className="text-[#DC241F]">FAGOR AUTOMATION</span> Corp.</p>
                <p>4020 Winnetta Ave, Rolling Meadows, IL 60008</p>
                <p>Tel: 847-981-1500 | Fax: 847-981-1311</p>
                <p>service@fagor-automation.com</p>
              </div>
            </div>
            <DialogTitle className="text-2xl text-[#DC241F] text-center mb-4">
              {t("quotationTitle") || "TRAINING QUOTATION"}
            </DialogTitle>
          </DialogHeader>
          {quotationData && (
            <div className="space-y-4">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-[#DC241F] mb-2">End User Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>{t("quotationDate") || "Date"}:</strong></div>
                  <div>{new Date().toLocaleDateString()}</div>
                  <div><strong>{t("companyInfo") || "Company"}:</strong></div>
                  <div>{formData.companyName}</div>
                  <div><strong>{t("contactPersonLabel") || "Contact"}:</strong></div>
                  <div>{formData.contactPerson}</div>
                  <div><strong>{t("locationInfo") || "Location"}:</strong></div>
                  <div>{`${formData.address1}${formData.address2 ? ', ' + formData.address2 : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`}</div>
                  <div><strong>{t("phoneLabel") || "Phone"}:</strong></div>
                  <div>{formData.phone}</div>
                  <div><strong>{t("emailLabel") || "Email"}:</strong></div>
                  <div>{formData.email}</div>
                </div>
              </div>

              {/* OEM Information (if provided) */}
              {formData.oemName && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#DC241F] mb-2">OEM Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>OEM Name:</strong></div>
                    <div>{formData.oemName}</div>
                    <div><strong>OEM Contact:</strong></div>
                    <div>{formData.oemContact}</div>
                    <div><strong>OEM Address:</strong></div>
                    <div>{formData.oemAddress}</div>
                    <div><strong>OEM Phone:</strong></div>
                    <div>{formData.oemPhone}</div>
                    <div><strong>OEM Email:</strong></div>
                    <div>{formData.oemEmail}</div>
                  </div>
                </div>
              )}

              {/* Machine Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-[#DC241F] mb-2">Machine & CNC Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>CNC Model:</strong></div>
                  <div>{formData.controllerModel}</div>
                  <div><strong>Machine Brand:</strong></div>
                  <div>{formData.machineBrand}</div>
                  <div><strong>Machine Model:</strong></div>
                  <div>{formData.machineModel}</div>
                  <div><strong>Machine Type:</strong></div>
                  <div>{formData.machineType}</div>
                  <div><strong>Programming Type:</strong></div>
                  <div>{formData.programmingType}</div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Training Costs */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 text-[#DC241F]">Training Costs</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">First Day Training</span>
                      <span className="font-semibold">$1,400.00</span>
                    </div>
                    {parseInt(formData.trainingDays) > 1 && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Additional Days ({parseInt(formData.trainingDays) - 1} × $1,000)</span>
                        <span className="font-semibold">${((parseInt(formData.trainingDays) - 1) * 1000).toLocaleString()}.00</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 bg-gray-50 font-bold">
                      <span>Training Subtotal</span>
                      <span>${quotationData.trainingPrice.toLocaleString()}.00</span>
                    </div>
                  </div>
                </div>

                {/* Travel Time */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 text-[#DC241F]">Travel Time</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Travel Hours</span>
                      <span className="text-right">
                        <div className="text-sm text-gray-600">
                          {quotationData.travelExpenses.flightTimeOneWay} hrs flight + {quotationData.travelExpenses.drivingTimeOneWay} hrs driving × 2 (round trip)
                        </div>
                        <div className="font-semibold">
                          {quotationData.travelExpenses.travelTimeHours} hrs total
                        </div>
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Hourly Rate</span>
                      <span>$110.00/hr</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-gray-50 font-bold">
                      <span>Travel Time Subtotal</span>
                      <span>${quotationData.travelExpenses.travelTimeCost.toLocaleString()}.00</span>
                    </div>
                  </div>
                </div>

                {/* Travel Expenses */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 text-[#DC241F]">Travel Expenses</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Flight (Round Trip to {quotationData.travelExpenses.nearestAirport})</span>
                      <span>${quotationData.travelExpenses.flightCost.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Hotel ({formData.trainingDays} nights)</span>
                      <span>${quotationData.travelExpenses.hotelCost.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Car Rental (${quotationData.travelExpenses.carRentalDailyRate}/day × {quotationData.travelExpenses.carRentalDays} days)</span>
                      <span>${quotationData.travelExpenses.carRentalCost.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Meals & Incidentals ({parseInt(formData.trainingDays) + 1} days)</span>
                      <span>${quotationData.travelExpenses.foodCost.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-gray-50 font-bold">
                      <span>Travel Expenses Subtotal</span>
                      <span>${quotationData.travelExpenses.totalTravelExpenses.toLocaleString()}.00</span>
                    </div>
                  </div>
                </div>

                {/* Route Map */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 text-[#DC241F]">Travel Route</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Route from {quotationData.travelExpenses.nearestAirport} Airport to your location
                  </p>
                  <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&origin=${quotationData.travelExpenses.nearestAirport}+Airport&destination=${encodeURIComponent(`${formData.address1}${formData.address2 ? ', ' + formData.address2 : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`)}&mode=driving`}
                    >
                    </iframe>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="bg-[#DC241F] text-white rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">GRAND TOTAL</span>
                    <span className="text-2xl font-bold">${quotationData.totalPrice.toLocaleString()}.00</span>
                  </div>
                </div>
              </div>

              {/* Estimated Expenses Disclaimer */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-sm italic">
                <p className="font-semibold text-blue-900 mb-2">
                  {language === 'es' ? 'Nota Importante:' : 'Important Note:'}
                </p>
                <p className="text-blue-800">
                  {language === 'es' 
                    ? 'Los gastos de viaje son estimados y sujetos a cambios. Los costos finales serán revisados y ajustados según los gastos reales incurridos.'
                    : 'Travel expenses are estimated and subject to change. Final costs will be reviewed and adjusted based on actual expenses incurred.'}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-1">
                <p><strong>{t("quotationTermsTitle") || "TERMS AND CONDITIONS"}</strong></p>
                <p>{t("quotationTerm1") || "Prices in USD without taxes"}</p>
                <p>{t("quotationTerm2") || "This offer includes 6 hours of on-site training for a maximum of 4 participants."}</p>
                <p>{t("quotationTerm3") || "The total hours and actual travel expenses will be adjusted at the end of the service."}</p>
                <p>{t("quotationTerm4") || "NOTE: The FAGOR application engineer will not carry out any mechanical and/or electrical assembly work."}</p>
                <p>{t("quotationTerm5") || "The date available to be at facilities must be confirmed."}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowQuotation(false)}>
                  {t("calendarCancel") || "Cancel"}
                </Button>
                <Button
                  onClick={handleAcceptQuotation}
                  disabled={createRequestMutation.isPending}
                  className="bg-[#DC241F] hover:bg-[#B01D1A]"
                >
                  {createRequestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("acceptQuotationBtn") || "ACCEPT QUOTATION"}
                    </>
                  ) : (
                    t("acceptQuotationBtn") || "ACCEPT QUOTATION"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">Select Training Dates</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Reference Code: <span className="font-semibold">{referenceCode}</span>
            </p>
          </DialogHeader>
          {showCalendar && referenceCode && (
            <AvailabilityCalendar
              trainingDays={calendarTrainingDays}
              isSubmitting={isSubmittingDates}
              onSubmit={async (selectedDates) => {
                setIsSubmittingDates(true);
                setSelectedTrainingDates(selectedDates);
                try {
                  // Submit dates to backend and send PDF email
                  await submitDatesMutation.mutateAsync({
                    referenceCode,
                    selectedDates: selectedDates.map(d => d.toISOString()),
                    formData: calendarFormData,
                    quotationData: calendarQuotationData,
                  });
                  setShowCalendar(false);
                  setShowConfirmation(true);
                } catch (error) {
                  console.error('Error submitting dates:', error);
                  toast.error('Error submitting dates. Please try again.');
                } finally {
                  setIsSubmittingDates(false);
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-600 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Request Submitted Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Your training request has been submitted with the following dates:
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              {selectedTrainingDates.map((date, index) => (
                <p key={index} className="text-sm text-gray-600">
                  Day {index + 1}: {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              ))}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Important Notice
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                The selected dates will be reviewed and confirmed by the SERVICE office of FAGOR Automation USA. You will receive a confirmation email with the final approved dates.
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              A quotation PDF has been sent to your email address and to our service team.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Reference Code: <span className="font-semibold">{referenceCode}</span>
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setShowConfirmation(false);
                setSelectedTrainingDates([]);
                setReferenceCode('');
              }}
              className="bg-[#DC241F] hover:bg-[#B01D1A]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="container text-center text-gray-600 text-sm">
          <p>© 2025 Fagor Automation Corp. All rights reserved.</p>
          <p className="mt-1">4020 Winnetta Ave, Rolling Meadows, IL 60008</p>
          <p>Tel: 847-981-1500 | Fax: 847-981-1311</p>
        </div>
      </footer>
    </div>
  );
}



// Force rebuild to load environment variables - 2025-10-28

