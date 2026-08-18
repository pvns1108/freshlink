import { useEffect, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { CATEGORIES } from "../../utils/constants.js";

const EMPTY = {
  name: "",
  category: "Other",
  quantity: 1,
  unit: "units",
  expiryDate: "",
  storageLocation: "",
  temperatureC: "",
  condition: "Normal",
  notes: "",
};

export default function AddFoodModal({ open, onClose, onSubmit, initialValue, submitting }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name || "",
        category: initialValue.category || "Other",
        quantity: initialValue.quantity || 1,
        unit: initialValue.unit || "units",
        expiryDate: initialValue.expiryDate ? new Date(initialValue.expiryDate).toISOString().slice(0, 10) : "",
        storageLocation: initialValue.storageLocation || "",
        temperatureC: initialValue.temperatureC ?? "",
        condition: initialValue.aiCondition || "Normal",
        notes: initialValue.notes || "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [initialValue, open]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      quantity: Number(form.quantity) || 1,
      temperatureC: form.temperatureC === "" ? null : Number(form.temperatureC),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initialValue ? "Edit Food Item" : "Add Food Manually"} size="lg">
      <form id="food-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Food name" required>
          <input required value={form.name} onChange={update("name")} className="input" />
        </Field>
        <Field label="Category">
          <select value={form.category} onChange={update("category")} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity" required>
          <input type="number" min="1" required value={form.quantity} onChange={update("quantity")} className="input" />
        </Field>
        <Field label="Unit">
          <input value={form.unit} onChange={update("unit")} placeholder="units, kg, packets..." className="input" />
        </Field>
        <Field label="Expiry date" required>
          <input type="date" required value={form.expiryDate} onChange={update("expiryDate")} className="input" />
        </Field>
        <Field label="Storage location">
          <input value={form.storageLocation} onChange={update("storageLocation")} placeholder="Fridge, pantry..." className="input" />
        </Field>
        <Field label="Temperature (°C, optional)">
          <input type="number" value={form.temperatureC} onChange={update("temperatureC")} className="input" />
        </Field>
        <Field label="Condition">
          <select value={form.condition} onChange={update("condition")} className="input">
            {["Fresh", "Normal", "Near Expiry", "Possible Deterioration", "Inspection Required"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notes">
            <textarea value={form.notes} onChange={update("notes")} rows={2} className="input resize-none" />
          </Field>
        </div>
      </form>

      <style>{`.input { width: 100%; border-radius: 0.5rem; border: 1px solid #E1E7E1; background: #fff; padding: 0.6rem 0.85rem; font-size: 0.875rem; } .input:focus { outline: none; border-color: #146B4B; }`}</style>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form="food-form" disabled={submitting}>
          {submitting ? "Saving..." : initialValue ? "Save Changes" : "Add Food"}
        </Button>
      </div>
    </Modal>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-critical">*</span>}
      </span>
      {children}
    </label>
  );
}
