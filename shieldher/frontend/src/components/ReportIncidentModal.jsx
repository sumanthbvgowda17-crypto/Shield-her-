import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, X, Send, CheckCircle2 } from 'lucide-react';
import { saveIncident } from '../supabase/incidentsService';

export default function ReportIncidentModal({ isOpen, onClose, userCoords, onIncidentReported }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Harassment / Stalking');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const lat = userCoords?.[0] || userCoords?.lat || 12.2958;
  const lng = userCoords?.[1] || userCoords?.lng || 76.6394;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    const fullTitle = `[${category}] ${title.trim()}`;
    const result = await saveIncident({
      title: fullTitle,
      description: description.trim() || `User reported ${category} incident at (${lat.toFixed(4)}, ${lng.toFixed(4)}).`,
      latitude: lat,
      longitude: lng,
      status: 'active'
    });

    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      if (onIncidentReported) onIncidentReported(result.data);
      setTimeout(() => {
        setSubmitted(false);
        setTitle('');
        setDescription('');
        onClose();
      }, 1800);
    } else {
      setErrorMsg(result.error || 'Failed to submit report. Ensure you are signed in.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-card-border w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 border-b border-card-border mb-4">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-lg text-text">Report Safety Incident</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 text-center flex flex-col items-center gap-3"
            >
              <CheckCircle2 className="w-14 h-14 text-safe animate-bounce" />
              <p className="font-bold text-lg text-text">Incident Reported Successfully</p>
              <p className="text-xs text-muted max-w-xs">
                Your report has been securely saved to the safety database and shared with nearby guardians.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                  Incident Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary transition-colors font-medium"
                >
                  <option value="Harassment / Stalking">Harassment / Stalking</option>
                  <option value="Suspicious Activity">Suspicious Activity</option>
                  <option value="Poor Lighting / Dark Zone">Poor Lighting / Dark Zone</option>
                  <option value="Physical Hazard">Physical Hazard / Unsafe Area</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Other Safety Concern">Other Safety Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                  Incident Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unlit road with suspicious group"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary transition-colors placeholder:text-muted/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                  Details / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide additional details to alert other women and authorities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary transition-colors placeholder:text-muted/60 resize-none"
                />
              </div>

              {/* Tagged Location */}
              <div className="bg-background border border-card-border rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>Pinned GPS Location:</span>
                </div>
                <span className="font-mono font-bold text-text">
                  {Number(lat).toFixed(4)}° N, {Number(lng).toFixed(4)}° E
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-xs text-danger font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-background border border-card-border text-muted hover:text-text rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

