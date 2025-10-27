import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Loader2 } from "lucide-react";
import SignaturePad from "signature_pad";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
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

  const createRequestMutation = trpc.trainingRequest.create.useMutation({
    onSuccess: () => {
      toast.success(t("successMessage"));
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast.error(t("acceptTermsLabel"));
      return;
    }

    const signatureData = signaturePadRef.current?.toDataURL() || "";

    createRequestMutation.mutate({
      ...formData,
      trainingDays: formData.trainingDays ? parseInt(formData.trainingDays) : undefined,
      trainees: formData.trainees ? parseInt(formData.trainees) : undefined,
      applicationDate: new Date(formData.applicationDate),
      signatureData,
      termsAccepted,
      language,
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
      <header className="bg-gradient-to-r from-[#0055a4] to-[#003a75] text-white shadow-lg">
        <div className="container py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <img src="/fagor-logo.png" alt="Fagor Automation" className="h-12 object-contain" />
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
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
                        language === lang.code ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
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
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0055a4] text-center mb-4">
            {t("mainTitle")}
          </h1>
          <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Company Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-[#0055a4] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0055a4] rounded-full"></div>
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
                <CardTitle className="text-[#0055a4] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0055a4] rounded-full"></div>
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
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="oemAddress">{t("oemAddressLabel")}</Label>
                  <Input
                    id="oemAddress"
                    value={formData.oemAddress}
                    onChange={(e) => handleInputChange("oemAddress", e.target.value)}
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="oemPhone">{t("oemPhoneLabel")}</Label>
                    <Input
                      id="oemPhone"
                      type="tel"
                      value={formData.oemPhone}
                      onChange={(e) => handleInputChange("oemPhone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-[#0055a4] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0055a4] rounded-full"></div>
                  {t("trainingDetailsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="controllerModel">{t("controllerModelLabel")}</Label>
                    <Input
                      id="controllerModel"
                      value={formData.controllerModel}
                      onChange={(e) => handleInputChange("controllerModel", e.target.value)}
                    />
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
                    <Label htmlFor="trainingDays">{t("trainingDaysLabel")}</Label>
                    <Input
                      id="trainingDays"
                      type="number"
                      min="1"
                      value={formData.trainingDays}
                      onChange={(e) => handleInputChange("trainingDays", e.target.value)}
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

            {/* Signature and Acceptance */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-[#0055a4] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0055a4] rounded-full"></div>
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

            {/* Terms and Conditions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-[#0055a4] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0055a4] rounded-full"></div>
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

                <div className="flex items-center space-x-2">
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

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                disabled={!termsAccepted || createRequestMutation.isPending}
                className="bg-[#0055a4] hover:bg-[#004085] text-white px-12 py-6 text-lg font-semibold shadow-lg"
              >
                {createRequestMutation.isPending ? (
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

