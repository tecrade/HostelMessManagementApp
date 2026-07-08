import React, { useState } from "react";
import { Plus, Edit, Trash2, X, Save, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { addSpecial, updateSpecial, deleteSpecial } from "../firebase/firestore";
import { TableRowSkeleton, EmptyState } from "../components/SkeletonLoader";

export default function SpecialsPage({
  uid,
  specials = [],
  loading,
  currency = "₹",
  onToast
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState(null); // special item object if editing, null if adding
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      onToast("Please complete the special item form.", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editingSpecial) {
        await updateSpecial(uid, editingSpecial.id, {
          name: name.trim(),
          price: Number(price)
        });
        onToast(`Special "${name.trim()}" updated successfully!`, "success");
      } else {
        await addSpecial(uid, {
          name: name.trim(),
          price: Number(price)
        });
        onToast(`Special "${name.trim()}" created successfully!`, "success");
      }
      handleCloseForm();
    } catch (err) {
      console.error(err);
      onToast("Failed to save special item: " + err.message, "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (special) => {
    setEditingSpecial(special);
    setName(special.name);
    setPrice(special.price);
    setFormOpen(true);
  };

  const handleToggleStatus = async (special) => {
    try {
      await updateSpecial(uid, special.id, {
        enabled: special.enabled === false ? true : false
      });
      onToast(
        `Special "${special.name}" ${special.enabled === false ? "enabled" : "disabled"} successfully!`,
        "success"
      );
    } catch (err) {
      onToast("Failed to update status: " + err.message, "danger");
    }
  };

  const handleDeleteClick = async (special) => {
    if (confirm(`Are you sure you want to delete special item "${special.name}"?`)) {
      try {
        await deleteSpecial(uid, special.id);
        onToast(`Special item "${special.name}" deleted successfully.`, "success");
      } catch (err) {
        onToast("Failed to delete special item: " + err.message, "danger");
      }
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingSpecial(null);
    setName("");
    setPrice("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-150">
        <div>
          <h3 className="font-heading font-extrabold text-lg text-text-dark">Special Menu Items</h3>
          <p className="text-xs text-text-gray mt-0.5 font-medium">Manage custom specials used for daily calculations</p>
        </div>
        <button
          onClick={() => {
            setEditingSpecial(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3.5 py-2 border border-primary/20 rounded-xl cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Special</span>
        </button>
      </div>

      {/* Form Dialog Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseForm} />
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 z-10 animate-slide-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-heading font-bold text-sm text-text-dark">
                {editingSpecial ? "Edit Special Item" : "Create Special Item"}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1 rounded-lg hover:bg-gray-100 text-text-gray cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-dark/80 block font-sans">Item Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chicken Biryani, Egg Roast"
                  className="w-full px-3.5 py-2.5 bg-gray-50 focus:bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-dark/80 block font-sans">Price</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-gray">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="120"
                    className="w-full pl-7 pr-4 py-2.5 bg-gray-50 focus:bg-white text-sm font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100 font-sans">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 py-2 border border-gray-200 text-xs font-bold text-text-gray hover:bg-gray-50 rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-primary hover:bg-primary-hover disabled:opacity-75 text-xs font-bold text-white rounded-xl shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1 cursor-pointer text-center"
                >
                  {saving ? (
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>{saving ? "Saving..." : "Save Special"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Specials Table */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[450px]">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-text-gray bg-gray-50 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-5">Name</th>
                <th className="py-3 px-4 sm:px-5 text-right">Price</th>
                <th className="py-3 px-4 sm:px-5 text-center">Status</th>
                <th className="py-3 px-4 sm:px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-text-dark bg-white">
              {loading ? (
                <>
                  <TableRowSkeleton cols={4} />
                  <TableRowSkeleton cols={4} />
                </>
              ) : specials.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-0">
                    <EmptyState
                      icon={Sparkles}
                      title="No special items yet"
                      description="Create items like Fish Fry (₹80) or Chicken Curry (₹120) for checkmark listing in daily sheets."
                      action={
                        <button
                          onClick={() => setFormOpen(true)}
                          className="mx-auto flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Special Item
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                specials.map((special) => (
                  <tr key={special.id} className="hover:bg-primary-light/5 transition-colors">
                    <td className="py-3 px-4 sm:px-5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/5 border border-primary/5 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-bold">{special.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 sm:px-5 text-right font-extrabold text-primary font-sans">
                      {currency}{special.price}
                    </td>
                    <td className="py-3 px-4 sm:px-5 text-center">
                      <button
                        onClick={() => handleToggleStatus(special)}
                        className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border cursor-pointer select-none transition-all ${
                          special.enabled !== false
                            ? "bg-success/15 border-success/25 text-success hover:bg-success/20"
                            : "bg-gray-100 border-gray-250 text-text-gray hover:bg-gray-200"
                        }`}
                      >
                        {special.enabled !== false ? (
                          <>
                            <ToggleRight className="h-3.5 w-3.5" />
                            <span>Enabled</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-3.5 w-3.5" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 sm:px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(special)}
                          className="p-1.5 text-primary hover:bg-primary-light rounded-lg cursor-pointer"
                          title="Edit Special details"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(special)}
                          className="p-1.5 text-danger hover:bg-danger/10 rounded-lg cursor-pointer"
                          title="Delete Special Item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
