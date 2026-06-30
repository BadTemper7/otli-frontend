import { Link } from "react-router-dom"
import { ArrowRight, ClipboardList } from "lucide-react"

const PlaceholderPage = ({ title, description, moduleName = "CMS Module", checklist = [] }) => {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-700">
          <ClipboardList size={14} />
          {moduleName}
        </div>
        <h1 className="mt-3 text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="card p-6">
          <h2 className="text-lg font-black text-slate-950">Recommended CMS Fields</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(checklist.length ? checklist : ["Search and filter", "View details", "Approve or reject", "Add remarks", "Upload or view documents", "Export report"]).map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-black text-slate-950">Yard CMS Ready</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Yard setup and inventory board are already active. Use Yard Area Setup for capacity configuration, then Inventory Board for drag and drop block layout.
          </p>
          <div className="mt-4 space-y-3">
            <Link to="/admin/yard-areas" className="btn-secondary w-full justify-between">
              Open Yard Area Setup <ArrowRight size={16} />
            </Link>
            <Link to="/admin/inventory" className="btn-primary w-full justify-between">
              Open Inventory Board <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceholderPage
