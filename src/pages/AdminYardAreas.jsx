import { useEffect, useMemo, useState } from "react"
import { Edit3, Layers3, MapPinned, Plus, RefreshCw, Ruler, Trash2, Warehouse } from "lucide-react"
import Alert from "../components/Alert"
import { api, getApiError } from "../lib/api"

const emptyAreaForm = {
  name: "",
  lineCount: 1,
  rowCount: 1,
  tierCount: 1,
  containerSize: 20,
  capacityTeu: 1,
  status: "active",
  color: "#0f766e",
  sortOrder: 0,
  description: "",
}

const areaStatuses = ["active", "inactive", "maintenance"]
const containerSizes = [20, 40, 45]

const numberValue = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const getTeuFactor = (containerSize) => {
  if (Number(containerSize) === 40) return 2
  if (Number(containerSize) === 45) return 3
  return 1
}

const calculateAreaCapacity = (form) => {
  const lines = Math.max(numberValue(form.lineCount, 1), 1)
  const rows = Math.max(numberValue(form.rowCount, 1), 1)
  const high = Math.max(numberValue(form.tierCount, 1), 1)
  const capacity = lines * rows * high * getTeuFactor(form.containerSize)

  return Math.max(Math.round(capacity * 100) / 100, 1)
}

const Field = ({ label, children, hint }) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs font-semibold text-slate-400">{hint}</span>}
    </label>
  )
}

const StatCard = ({ label, value, icon: Icon }) => {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-black text-slate-950">{value}</div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

const AdminYardAreas = () => {
  const [summary, setSummary] = useState({ areaCount: 0, totalAreaCapacityTeu: 0, blockCount: 0, totalTeuSlots: 0 })
  const [areas, setAreas] = useState([])
  const [areaForm, setAreaForm] = useState(emptyAreaForm)
  const [editingAreaId, setEditingAreaId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const autoCapacity = useMemo(() => calculateAreaCapacity(areaForm), [areaForm.lineCount, areaForm.rowCount, areaForm.tierCount, areaForm.containerSize])

  const loadSummary = async () => {
    const { data } = await api.get("/admin/yard/summary")
    setSummary(data.summary || { areaCount: 0, totalAreaCapacityTeu: 0, blockCount: 0, totalTeuSlots: 0 })
  }

  const loadAreas = async () => {
    const { data } = await api.get("/admin/yard/areas")
    setAreas(data.areas || [])
  }

  const loadAll = async () => {
    try {
      setLoading(true)
      setError("")
      await Promise.all([loadSummary(), loadAreas()])
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setAreaForm((current) => {
      const next = { ...current, [name]: value }

      if (["lineCount", "rowCount", "tierCount", "containerSize"].includes(name) && !editingAreaId) {
        next.capacityTeu = calculateAreaCapacity(next)
      }

      return next
    })
  }

  const resetForm = () => {
    setAreaForm(emptyAreaForm)
    setEditingAreaId("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const payload = {
        ...areaForm,
        lineCount: Math.max(numberValue(areaForm.lineCount, 1), 1),
        rowCount: Math.max(numberValue(areaForm.rowCount, 1), 1),
        tierCount: Math.max(numberValue(areaForm.tierCount, 1), 1),
        containerSize: numberValue(areaForm.containerSize, 20),
        capacityTeu: Math.max(numberValue(areaForm.capacityTeu, autoCapacity), 1),
        sortOrder: numberValue(areaForm.sortOrder, 0),
      }

      if (editingAreaId) {
        await api.patch(`/admin/yard/areas/${editingAreaId}`, payload)
        setSuccess("Yard area updated successfully.")
      } else {
        await api.post("/admin/yard/areas", payload)
        setSuccess("Yard area created successfully.")
      }

      resetForm()
      await loadAll()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (area) => {
    setEditingAreaId(area.id)
    setAreaForm({
      name: area.name || "",
      lineCount: area.lineCount || 1,
      rowCount: area.rowCount || 1,
      tierCount: area.tierCount || 1,
      containerSize: area.containerSize || 20,
      capacityTeu: area.capacityTeu || 1,
      status: area.status || "active",
      color: area.color || "#0f766e",
      sortOrder: area.sortOrder || 0,
      description: area.description || "",
    })
  }

  const handleDelete = async (area) => {
    const confirmed = window.confirm(`Delete ${area.name}? This is only allowed when the area has no inventory blocks.`)
    if (!confirmed) return

    try {
      setError("")
      setSuccess("")
      await api.delete(`/admin/yard/areas/${area.id}`)
      setSuccess("Yard area deleted successfully.")
      await loadAll()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const stats = [
    { label: "Areas", value: summary.areaCount || 0, icon: MapPinned },
    { label: "Area capacity TEU", value: summary.totalAreaCapacityTeu || 0, icon: Warehouse },
    { label: "Inventory blocks", value: summary.blockCount || 0, icon: Layers3 },
    { label: "Block capacity TEU", value: summary.totalTeuSlots || 0, icon: Ruler },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-black uppercase tracking-wide text-teal-700">Yard Area Module</div>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Setup Yard Areas</h2>
          <p className="mt-1 max-w-3xl text-sm font-medium text-slate-600">
            Create the physical yard areas first. Each area has its own lines, rows, stacking high, container size, and TEU capacity.
          </p>
        </div>
        <button type="button" onClick={loadAll} className="btn-secondary">
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <Alert type="error">{error}</Alert>
      <Alert type="success">{success}</Alert>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="card space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-950">{editingAreaId ? "Edit Area" : "Add Area"}</h3>
              <p className="text-sm font-medium text-slate-500">Example: Alpha Yard, Bravo Yard, Empty Yard.</p>
            </div>
            {editingAreaId && (
              <button type="button" onClick={resetForm} className="text-sm font-black text-teal-700">
                Cancel
              </button>
            )}
          </div>

          <Field label="Area Name">
            <input className="input" name="name" value={areaForm.name} onChange={handleChange} placeholder="Alpha Yard" required />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Line">
              <input className="input" name="lineCount" type="number" min="1" value={areaForm.lineCount} onChange={handleChange} required />
            </Field>
            <Field label="Rows">
              <input className="input" name="rowCount" type="number" min="1" value={areaForm.rowCount} onChange={handleChange} required />
            </Field>
            <Field label="High">
              <input className="input" name="tierCount" type="number" min="1" value={areaForm.tierCount} onChange={handleChange} required />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Container Size">
              <select className="input" name="containerSize" value={areaForm.containerSize} onChange={handleChange}>
                {containerSizes.map((size) => (
                  <option key={size} value={size}>{size} FT</option>
                ))}
              </select>
            </Field>
            <Field label="Capacity (TEU)" hint={`Auto estimate: ${autoCapacity} TEU`}>
              <input className="input" name="capacityTeu" type="number" min="1" step="0.01" value={areaForm.capacityTeu} onChange={handleChange} required />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Status">
              <select className="input" name="status" value={areaForm.status} onChange={handleChange}>
                {areaStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </Field>
            <Field label="Color">
              <input className="input h-[46px]" name="color" type="color" value={areaForm.color} onChange={handleChange} />
            </Field>
          </div>

          <Field label="Sort Order">
            <input className="input" name="sortOrder" type="number" value={areaForm.sortOrder} onChange={handleChange} />
          </Field>

          <Field label="Notes">
            <textarea className="input min-h-24 resize-y" name="description" value={areaForm.description} onChange={handleChange} placeholder="Optional notes for this area." />
          </Field>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            <Plus size={17} />
            {saving ? "Saving..." : editingAreaId ? "Update Area" : "Create Area"}
          </button>
        </form>

        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h3 className="text-lg font-black text-slate-950">Area List</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">Inventory blocks are created and dragged in the Inventory module.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Line</th>
                  <th className="px-4 py-3">Rows</th>
                  <th className="px-4 py-3">High</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Blocks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading && (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center font-bold text-slate-500">Loading areas...</td>
                  </tr>
                )}

                {!loading && areas.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center font-bold text-slate-500">No areas yet.</td>
                  </tr>
                )}

                {areas.map((area) => (
                  <tr key={area.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded-full" style={{ background: area.color }} />
                        <div>
                          <div className="font-black text-slate-950">{area.name}</div>
                          <div className="text-xs font-black uppercase tracking-wide text-slate-500">{area.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">{area.lineCount}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">{area.rowCount}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">{area.tierCount}</td>
                    <td className="px-4 py-3 text-slate-600">{area.containerSize} FT</td>
                    <td className="px-4 py-3 font-black text-slate-950">{area.capacityTeu} TEU</td>
                    <td className="px-4 py-3 text-slate-600">{area.blockCount || 0}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{area.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => handleEdit(area)} className="rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200">
                          <Edit3 size={15} />
                        </button>
                        <button type="button" onClick={() => handleDelete(area)} className="rounded-full bg-red-50 p-2 text-red-700 hover:bg-red-100">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminYardAreas
