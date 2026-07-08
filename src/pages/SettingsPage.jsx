import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { updateSettings } from "../firebase/firestore";

export default function SettingsPage({
  uid,
  settings,
  loading,
  currency,
  onToast
}) {
  const [breakfastPrice, setBreakfastPrice] = useState(50);
  const [lunchPrice, setLunchPrice] = useState(50);
  const [dinnerPrice, setDinnerPrice] = useState(50);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [saving, setSaving] = useState(false);

  // Sync state with settings document from Firestore
  useEffect(() => {
    if (settings) {
      setBreakfastPrice(settings.mealPrices?.breakfast ?? 50);
      setLunchPrice(settings.mealPrices?.lunch ?? 50);
      setDinnerPrice(settings.mealPrices?.dinner ?? 50);
      setCurrencySymbol(settings.currency ?? "₹");
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(uid, {
        mealPrices: {
          breakfast: Number(breakfastPrice),
          lunch: Number(lunchPrice),
          dinner: Number(dinnerPrice)
        },
        currency: currencySymbol.trim() || "₹"
      });
      onToast("Meal rates and currency symbol updated successfully!", "success");
    } catch (err) {
      console.error(err);
      onToast("Failed to save settings: " + err.message, "danger");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in space-y-4">
      <div>
        <h3 className="font-heading font-extrabold text-lg text-text-dark">Base Meal Pricing Setup</h3>
        <p className="text-xs text-text-gray mt-0.5 font-medium">Modify rates charged per meal. Changes apply to subsequent attendance calculations.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-6 -translate-y-6 blur-lg pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-dark/80 block font-sans">Currency Symbol</label>
            <input
              type="text"
              required
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              placeholder="e.g. ₹, $, £"
              maxLength={3}
              className="w-24 px-3 py-2 bg-gray-50 focus:bg-white text-sm font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-dark/80 block font-sans">Breakfast Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-gray">{currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={breakfastPrice}
                  onChange={(e) => setBreakfastPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-gray-50 focus:bg-white text-xs sm:text-sm font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-dark/80 block font-sans">Lunch Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-gray">{currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={lunchPrice}
                  onChange={(e) => setLunchPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-gray-50 focus:bg-white text-xs sm:text-sm font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-dark/80 block font-sans">Dinner Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-gray">{currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={dinnerPrice}
                  onChange={(e) => setDinnerPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-gray-50 focus:bg-white text-xs sm:text-sm font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-150">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-70 text-xs font-bold text-white rounded-xl shadow-md shadow-primary/10 transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
            >
              {saving ? (
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? "Saving Price Setup..." : "Save Prices"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
