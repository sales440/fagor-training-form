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

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [quotationData, setQuotationData] = useState<any>(null);
  const [oemFieldsEnabled, setOemFieldsEnabled] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    address: "",
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
    onSuccess: () => {
      toast.success(t("successMessage"));
      setShowQuotation(false);
      // Reset form
      setFormData({
        companyName: "",
        contactPerson: "",
        address: "",
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
      { field: formData.address, name: t("addressLabel") },
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

    calculateQuotationMutation.mutate({
      address: formData.address,
      trainingDays,
    });
  };

  const handleAcceptQuotation = () => {
    if (!quotationData) return;

    const signatureData = signaturePadRef.current?.toDataURL() || "";

    createRequestMutation.mutate({
      ...formData,
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

            {/* Address and Language Selector */}
            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-700 text-right">
                <p className="font-semibold">Fagor Automation Corp.</p>
                <p>4020 Winnetta Ave, Rolling Meadows, IL 60008</p>
                <p>Tel: 847-981-1500 | Fax: 847-981-1311</p>
                <p>service@fagor-automation.com</p>
              </div>
              
              {/* Language Selector */}
              <div className="relative">
                <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
              >
                <Globe className="w-6 h-6" />
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
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
        </div>
      </header>

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
                    <Label htmlFor="address" className="required">
                      {t("addressLabel")}
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>
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
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="machineBrand">{t("machineBrandLabel")}</Label>
                    <Input
                      id="machineBrand"
                      value={formData.machineBrand}
                      onChange={(e) => handleInputChange("machineBrand", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="machineModel">{t("machineModelLabel")}</Label>
                  <Input
                    id="machineModel"
                    value={formData.machineModel}
                    onChange={(e) => handleInputChange("machineModel", e.target.value)}
                  />
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="programmingType">{t("programmingTypeLabel")}</Label>
                    <Select value={formData.programmingType} onValueChange={(value) => handleInputChange("programmingType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversational">{t("conversational")}</SelectItem>
                        <SelectItem value="iso">{t("iso")}</SelectItem>
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
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                      height={200}
                      className="w-full border border-gray-200 rounded"
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#DC241F] text-center">
              {t("quotationTitle") || "TRAINING QUOTATION"}
            </DialogTitle>
          </DialogHeader>
          {quotationData && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>{t("quotationDate") || "Date"}:</strong></div>
                  <div>{new Date().toLocaleDateString()}</div>
                  <div><strong>{t("companyInfo") || "Company"}:</strong></div>
                  <div>{formData.companyName}</div>
                  <div><strong>{t("locationInfo") || "Location"}:</strong></div>
                  <div>{formData.address}</div>
                </div>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">{t("serviceDescHeader") || "Service Description"}</th>
                    <th className="border p-2 text-right">{t("quantityHeader") || "Quantity"}</th>
                    <th className="border p-2 text-right">{t("unitPriceHeader") || "Unit Price (USD)"}</th>
                    <th className="border p-2 text-right">{t("subtotalHeader") || "Subtotal (USD)"}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">{t("trainingServiceDesc") || "FAGOR CNC Training Course"}</td>
                    <td className="border p-2 text-right">{formData.trainingDays} {t("trainingDaysLabel") || "days"}</td>
                    <td className="border p-2 text-right">$1,200</td>
                    <td className="border p-2 text-right">${quotationData.trainingPrice.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="border p-2">{t("travelTimeDesc") || "Travel Time"}</td>
                    <td className="border p-2 text-right">{quotationData.travelExpenses.travelTimeHours} hrs</td>
                    <td className="border p-2 text-right">$110</td>
                    <td className="border p-2 text-right">${quotationData.travelExpenses.travelTimeCost.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="border p-2" colSpan={3}>{t("travelExpensesDesc") || "Travel Expenses"} (Flight: ${quotationData.travelExpenses.flightCost}, Hotel: ${quotationData.travelExpenses.hotelCost}, Food: ${quotationData.travelExpenses.foodCost}, Car: ${quotationData.travelExpenses.carRentalCost})</td>
                    <td className="border p-2 text-right">${quotationData.travelExpenses.totalTravelExpenses.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border p-2" colSpan={3}>{t("totalLabel") || "TOTAL"}</td>
                    <td className="border p-2 text-right">${quotationData.totalPrice.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

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

