import { useEffect, useState } from "react";
import { ArrowRight, Clock, IndianRupee, Loader2, X, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { getExtendOptions } from "../../api/bookingApi";
import { createBooking } from "../../api/bookingApi";
import Button from "../ui/Button";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

export default function ExtendSessionSheet({ booking, onClose, onExtended }) {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [turf, setTurf] = useState(null);
  const [booking1hr, setBooking1hr] = useState(null);
  const [booking2hr, setBooking2hr] = useState(null);
  const [confirming, setConfirming] = useState(null); // slotId being confirmed

  useEffect(() => {
    getExtendOptions(booking.id)
      .then((res) => {
        setOptions(res.data.options);
        setTurf(res.data.turf);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Could not load extension options.");
        onClose();
      })
      .finally(() => setLoading(false));
  }, [booking.id]);

  const handleExtend = async (slot, label) => {
    setConfirming(slot.id);
    try {
      await createBooking(slot.id);
      toast.success(`${label} extension booked!`);
      onExtended?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to extend session.");
    } finally {
      setConfirming(null);
    }
  };

  const currentEndTime = formatTime(booking.slot.endTime);

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/75 backdrop-blur-md sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
        {/* Handle / Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Extend your session</h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {turf?.name} &middot; currently ends at {currentEndTime}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : options.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 py-8 text-center">
              <Clock className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">No slots available after your session</p>
              <p className="mt-1 text-xs text-slate-400">The next slot is either booked or blocked.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((slot, i) => {
                const label = i === 0 ? "+1 hour" : "+2 hours";
                const newEnd = formatTime(slot.endTime);
                const isConfirming = confirming === slot.id;

                return (
                  <button
                    key={slot.id}
                    onClick={() => handleExtend(slot, label)}
                    disabled={!!confirming}
                    className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                        {label}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(slot.startTime)}
                        <ArrowRight className="h-3 w-3" />
                        {newEnd}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-sm font-bold text-slate-700">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {slot.amount}
                      </span>
                      {isConfirming ? (
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                      ) : (
                        <span className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white group-hover:bg-emerald-600">
                          Book
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              <p className="pt-1 text-center text-xs text-slate-400">
                Payment at venue on game day &middot; booking confirmed instantly
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
