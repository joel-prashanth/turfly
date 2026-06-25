import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Hash,
  Loader2,
  QrCode,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";
import { updateSettings } from "../api/authApi";
import { uploadImage } from "../services/upload.service";

import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:bg-slate-50">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
          checked ? "bg-green-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

function SettingsPage() {
  const { user, setUser } = useAuth();
  const qrInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docType, setDocType] = useState("");

  const [notifs, setNotifs] = useState({
    notifyNewBooking: true,
    notifyCancellation: true,
    notifyDailySummary: false,
  });
  const [savingNotif, setSavingNotif] = useState(null);

  const [bizForm, setBizForm] = useState({
    businessName: "",
    gstNumber: "",
    upiId: "",
  });
  const [savingBiz, setSavingBiz] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setNotifs({
        notifyNewBooking: user.notifyNewBooking ?? true,
        notifyCancellation: user.notifyCancellation ?? true,
        notifyDailySummary: user.notifyDailySummary ?? false,
      });
      setBizForm({
        businessName: user.businessName || "",
        gstNumber: user.gstNumber || "",
        upiId: user.upiId || "",
      });
    }
  }, [user]);

  const handleToggle = async (key, value) => {
    setNotifs((prev) => ({ ...prev, [key]: value }));
    setSavingNotif(key);
    try {
      const res = await updateSettings({ [key]: value });
      setUser(res.data.user);
    } catch {
      setNotifs((prev) => ({ ...prev, [key]: !value }));
      toast.error("Failed to update notification preference.");
    } finally {
      setSavingNotif(null);
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG or WEBP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    try {
      setQrUploading(true);
      const uploaded = await uploadImage(file);
      const res = await updateSettings({
        paymentQrUrl: uploaded.image.url,
        paymentQrPublicId: uploaded.image.publicId,
      });
      setUser(res.data.user);
      toast.success("Payment QR updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload QR.");
    } finally {
      setQrUploading(false);
      e.target.value = "";
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!docType) { toast.error("Select a document type first."); return; }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) { toast.error("Only JPG, PNG, WEBP or PDF allowed."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be under 10 MB."); return; }
    try {
      setDocUploading(true);
      const uploaded = await uploadImage(file);
      const res = await updateSettings({
        verificationDocUrl: uploaded.image.url,
        verificationDocPublicId: uploaded.image.publicId,
        verificationDocType: docType,
      });
      setUser(res.data.user);
      toast.success("Verification document uploaded.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setDocUploading(false);
      e.target.value = "";
    }
  };

  const handleDocRemove = async () => {
    try {
      setDocUploading(true);
      const res = await updateSettings({ verificationDocUrl: null, verificationDocPublicId: null, verificationDocType: null });
      setUser(res.data.user);
      toast.success("Document removed.");
    } catch { toast.error("Failed to remove document."); }
    finally { setDocUploading(false); }
  };

  const handleQrRemove = async () => {
    try {
      setQrUploading(true);
      const res = await updateSettings({ paymentQrUrl: null, paymentQrPublicId: null });
      setUser(res.data.user);
      toast.success("Payment QR removed.");
    } catch {
      toast.error("Failed to remove QR.");
    } finally {
      setQrUploading(false);
    }
  };

  const handleBizSave = async (e) => {
    e.preventDefault();
    setSavingBiz(true);
    try {
      const res = await updateSettings({
        businessName: bizForm.businessName,
        gstNumber: bizForm.gstNumber,
        upiId: bizForm.upiId,
      });
      setUser(res.data.user);
      toast.success("Business details saved.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save.");
    } finally {
      setSavingBiz(false);
    }
  };

  const statusBanner = {
    PENDING_REVIEW: { icon: Clock, text: "Your account is pending review. Upload a verification document below to help speed up approval.", color: "border-amber-200 bg-amber-50 text-amber-800" },
    ACTIVE: { icon: ShieldCheck, text: "Your account is active and visible to players.", color: "border-emerald-200 bg-emerald-50 text-emerald-800" },
    SUSPENDED: { icon: XCircle, text: `Your account is suspended${user?.ownerStatusReason ? `: ${user.ownerStatusReason}` : "."}`, color: "border-red-200 bg-red-50 text-red-800" },
  }[user?.ownerStatus] || null;

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage notification preferences and business details.
        </p>
      </div>

      {statusBanner && (() => {
        const BannerIcon = statusBanner.icon;
        return (
          <div className={`mb-6 flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm ${statusBanner.color}`}>
            <BannerIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{statusBanner.text}</p>
          </div>
        );
      })()}

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        {/* ── Notifications ── */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Notifications
              </h2>
              <p className="text-sm text-slate-500">
                Choose which emails you receive.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              {savingNotif === "notifyNewBooking" && (
                <Loader2 className="absolute right-14 top-4 h-4 w-4 animate-spin text-slate-400" />
              )}
              <Toggle
                label="New booking"
                description="Email when a player books one of your slots."
                checked={notifs.notifyNewBooking}
                onChange={(v) => handleToggle("notifyNewBooking", v)}
              />
            </div>

            <div className="relative">
              {savingNotif === "notifyCancellation" && (
                <Loader2 className="absolute right-14 top-4 h-4 w-4 animate-spin text-slate-400" />
              )}
              <Toggle
                label="Cancellation"
                description="Email when a booking is cancelled."
                checked={notifs.notifyCancellation}
                onChange={(v) => handleToggle("notifyCancellation", v)}
              />
            </div>

            <div className="relative">
              {savingNotif === "notifyDailySummary" && (
                <Loader2 className="absolute right-14 top-4 h-4 w-4 animate-spin text-slate-400" />
              )}
              <Toggle
                label="Daily summary"
                description="Morning digest of upcoming slots for the day."
                checked={notifs.notifyDailySummary}
                onChange={(v) => handleToggle("notifyDailySummary", v)}
              />
            </div>
          </div>

          <p className="mt-5 flex items-center gap-1.5 text-xs text-slate-400">
            <BellOff className="h-3.5 w-3.5" />
            Emails are sent to {user?.email}
          </p>
        </Card>

        {/* ── Business Details ── */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Business Details
              </h2>
              <p className="text-sm text-slate-500">
                Used on invoices and payouts.
              </p>
            </div>
          </div>

          <form onSubmit={handleBizSave} className="space-y-4">
            <Input
              label="Business / Venue Name"
              name="businessName"
              value={bizForm.businessName}
              onChange={(e) =>
                setBizForm((f) => ({ ...f, businessName: e.target.value }))
              }
              leftIcon={Building2}
              placeholder="e.g. Green Turf Sports Club"
            />
            <Input
              label="GST Number"
              name="gstNumber"
              value={bizForm.gstNumber}
              onChange={(e) =>
                setBizForm((f) => ({ ...f, gstNumber: e.target.value.toUpperCase() }))
              }
              leftIcon={Hash}
              placeholder="15-character GSTIN"
            />
            <Input
              label="UPI ID"
              name="upiId"
              value={bizForm.upiId}
              onChange={(e) =>
                setBizForm((f) => ({ ...f, upiId: e.target.value }))
              }
              leftIcon={CreditCard}
              placeholder="yourname@upi"
            />

            <Button type="submit" loading={savingBiz} className="w-full sm:w-auto">
              <CheckCircle2 className="h-4 w-4" />
              Save Details
            </Button>
          </form>
        </Card>
      </div>

      {/* ── Verification Document ── */}
      <Card className="mt-6 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Venue Verification</h2>
            <p className="text-sm text-slate-500">
              Upload a document so our team can verify your venue is legitimate.
            </p>
          </div>
        </div>

        <input ref={docInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" className="hidden" onChange={handleDocUpload} />

        {user?.verificationDocUrl ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <FileText className="h-8 w-8 shrink-0 text-blue-500" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{user.verificationDocType || "Document"}</p>
                <p className="text-xs text-slate-500">Uploaded successfully</p>
              </div>
              <a href={user.verificationDocUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-700">
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={() => docInputRef.current?.click()} loading={docUploading}>
                <Upload className="h-4 w-4" /> Replace
              </Button>
              <Button variant="danger" size="sm" onClick={handleDocRemove} loading={docUploading}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Document Type</label>
              <div className="flex flex-wrap gap-2">
                {["GST Certificate", "Shop Registration", "Venue Photo ID", "Other"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocType(type)}
                    className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                      docType === type
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
              <FileText className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No document uploaded</p>
              <p className="mt-1 max-w-xs text-xs text-slate-500">
                GST certificate, shop registration, or a photo of your venue entrance. JPG, PNG or PDF, max 10 MB.
              </p>
              <Button className="mt-4" size="sm" onClick={() => docInputRef.current?.click()} loading={docUploading} disabled={!docType}>
                <Upload className="h-4 w-4" /> Upload Document
              </Button>
              {!docType && <p className="mt-2 text-xs text-amber-600">Select a document type above first</p>}
            </div>
          </div>
        )}
      </Card>

      {/* ── Payment QR ── */}
      <Card className="mt-6 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-700">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Payment QR</h2>
            <p className="text-sm text-slate-500">
              Players can scan this after booking to pay you via UPI.
            </p>
          </div>
        </div>

        <input
          ref={qrInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleQrUpload}
        />

        {user?.paymentQrUrl ? (
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <img
                src={user.paymentQrUrl}
                alt="Your payment QR"
                className="h-40 w-40 rounded-xl object-contain"
              />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-600">
                Your UPI QR is live. Players will see a{" "}
                <span className="font-semibold text-emerald-700">Scan &amp; Pay</span>{" "}
                button after booking any of your slots.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => qrInputRef.current?.click()}
                  loading={qrUploading}
                >
                  <Upload className="h-4 w-4" />
                  Replace QR
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleQrRemove}
                  loading={qrUploading}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
              <QrCode className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">No QR uploaded yet</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Upload your UPI QR code — the one from GPay, PhonePe, or your bank app works fine.
            </p>
            <Button
              className="mt-5"
              size="sm"
              onClick={() => qrInputRef.current?.click()}
              loading={qrUploading}
            >
              <Upload className="h-4 w-4" />
              Upload QR Code
            </Button>
          </div>
        )}
      </Card>
    </Container>
  );
}

export default SettingsPage;
