import { useEffect, useMemo, useState } from "react"
import { Boxes, CalendarClock, Layers3, RefreshCw, Rotate3D, Search, Warehouse } from "lucide-react"
import Alert from "../components/Alert"
import { api, getApiError } from "../lib/api"

const MAP_WIDTH = 980
const MAP_HEIGHT = 600

const storedBookingStatuses = ["stored_in_assigned_area", "gate_out_requested", "gate_out_approved"]
const storedInventoryStatuses = ["in_yard", "for_billing", "pending_payment", "payment_verified", "cleared_for_gate_out", "hold"]

const statusLabels = {
  in_yard: "In Yard",
  hold: "Hold",
  gate_in_approved: "Gate-In Approved",
  stored_in_assigned_area: "Stored in Assigned Area",
  gate_out_requested: "Gate-Out Requested",
  gate_out_approved: "Gate-Out Approved",
  completed_gate_out_done: "Completed / Gate-Out Done",
}

const statusClass = (status) => {
  if (["in_yard", "stored_in_assigned_area"].includes(status)) return "bg-emerald-50 text-emerald-700"
  if (["gate_out_requested", "gate_out_approved"].includes(status)) return "bg-blue-50 text-blue-700"
  if (status === "hold") return "bg-red-50 text-red-700"
  return "bg-slate-100 text-slate-700"
}

const numberValue = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const formatDate = (value) => {
  if (!value) return "-"
  return new Date(value).toLocaleString()
}

const daysInYard = (value) => {
  if (!value) return 0
  const diff = Date.now() - new Date(value).getTime()
  return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0)
}

const getTeu = (size) => {
  if (Number(size) === 40) return 2
  if (Number(size) === 45) return 2.25
  return 1
}

const getBlockBounds = (block) => {
  const width = Math.max(numberValue(block.width, 210), 90)
  const height = Math.max(numberValue(block.height, 120), 70)
  const x = clamp(numberValue(block.x, 0), 0, MAP_WIDTH - width)
  const y = clamp(numberValue(block.y, 0), 0, MAP_HEIGHT - height)
  return { x, y, width, height }
}

const getSlotCounts = (block = {}, area = {}) => {
  const bayValue = block?.bayCount ?? block?.lineCount ?? area?.bayCount ?? area?.lineCount ?? 1
  const rowValue = block?.rowCount ?? area?.rowCount ?? 1
  const tierValue = block?.tierCount ?? area?.tierCount ?? 1

  return {
    bayCount: Math.max(numberValue(bayValue, 1), 1),
    rowCount: Math.max(numberValue(rowValue, 1), 1),
    tierCount: Math.max(numberValue(tierValue, 1), 1),
  }
}

const getViewerBlockBounds = (block, selectedBlockId, area) => {
  if (!selectedBlockId) return getBlockBounds(block)

  const { bayCount, rowCount } = getSlotCounts(block, area)
  const width = clamp(bayCount * 92 + 118, 460, 900)
  const height = clamp(rowCount * 62 + 118, 420, 760)

  return {
    x: 0,
    y: 0,
    width,
    height,
  }
}

const groupContainersByBlock = (containers) => {
  return containers.reduce((acc, container) => {
    if (!container.block) return acc
    if (!acc[container.block]) acc[container.block] = []
    acc[container.block].push(container)
    return acc
  }, {})
}

const getContainerBoxPosition = (container, block, area = {}, boundsOverride = null) => {
  const { bayCount, rowCount, tierCount } = getSlotCounts(block, area)
  const bay = clamp(numberValue(container.bay, 1), 1, bayCount)
  const row = clamp(numberValue(container.row, 1), 1, rowCount)
  const tier = clamp(numberValue(container.tier, 1), 1, tierCount)
  const bounds = boundsOverride || getBlockBounds(block)
  const leftPadding = 58
  const topPadding = 54
  const rightPadding = 26
  const bottomPadding = 44
  const usableWidth = Math.max(bounds.width - leftPadding - rightPadding, 80)
  const usableHeight = Math.max(bounds.height - topPadding - bottomPadding, 80)
  const cellWidth = Math.max(usableWidth / bayCount, 20)
  const cellHeight = Math.max(usableHeight / rowCount, 20)
  const boxWidth = clamp(cellWidth * 0.72, 22, 76)
  const boxHeight = clamp(cellHeight * 0.64, 18, 48)
  const stackStep = 26

  return {
    left: leftPadding + (bay - 1) * cellWidth + (cellWidth - boxWidth) / 2,
    top: topPadding + (row - 1) * cellHeight + (cellHeight - boxHeight) / 2,
    width: boxWidth,
    height: boxHeight,
    depth: clamp(cellHeight * 0.24, 8, 16),
    z: 24 + (tier - 1) * stackStep,
    stackStep,
    bay,
    row,
    tier,
    bayCount,
    rowCount,
    tierCount,
    label: `Bay ${bay} / Row ${row} / High ${tier}`,
  }
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
)

const StatCard = ({ label, value, icon: Icon }) => (
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

const AreaList = ({ areas, selectedAreaId, onSelectArea, containers }) => {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <Warehouse size={18} className="text-teal-700" />
        <h2 className="text-lg font-black text-slate-950">Yard Areas</h2>
      </div>
      <p className="mt-1 text-sm font-medium text-slate-500">Click an area to show its blocks and 3D container allocation.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {areas.length === 0 && <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">No yard areas yet.</div>}
        {areas.map((area) => {
          const areaContainers = containers.filter((container) => container.area === area.id)
          const total = numberValue(area.totalTeuSlots || area.capacityTeu, 0)
          const used = areaContainers.reduce((sum, container) => sum + getTeu(container.containerSize), 0)
          const usage = total ? clamp(Math.round((used / total) * 100), 0, 100) : 0
          const active = selectedAreaId === area.id

          return (
            <button
              key={area.id}
              type="button"
              onClick={() => onSelectArea(area.id)}
              className={`rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${active ? "border-teal-400 bg-teal-50 ring-4 ring-teal-100" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-black text-slate-950">{area.name}</div>
                  <div className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">{area.containerSize}ft • {area.lineCount}L / {area.rowCount}R / {area.tierCount}H</div>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-teal-700 shadow-sm">{areaContainers.length} CNTR</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-black text-slate-500">
                <span>{Math.round(used * 100) / 100} / {total} TEU</span>
                <span>{usage}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-teal-600" style={{ width: `${usage}%` }} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const BlockList = ({ selectedArea, blocks, selectedBlockId, onSelectBlock, containers }) => {
  const containersByBlock = useMemo(() => groupContainersByBlock(containers), [containers])

  if (!selectedArea) {
    return (
      <div className="card p-8 text-center">
        <Layers3 className="mx-auto text-slate-300" size={42} />
        <div className="mt-3 text-xl font-black text-slate-800">Select an area first</div>
        <div className="mt-1 text-sm font-semibold text-slate-500">Blocks will appear after selecting a yard area.</div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Boxes size={18} className="text-teal-700" />
            <h2 className="text-lg font-black text-slate-950">{selectedArea.name} Blocks</h2>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500">Click a block to focus the 3D viewer on containers in that block.</p>
        </div>
        <button type="button" onClick={() => onSelectBlock("")} className={`rounded-2xl px-4 py-2 text-sm font-black ${!selectedBlockId ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
          View all blocks
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {blocks.length === 0 && <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">No blocks configured for this area.</div>}
        {blocks.map((block) => {
          const blockContainers = containersByBlock[block.id] || []
          const total = numberValue(block.teuSlots || block.capacityTeu, 0)
          const used = blockContainers.reduce((sum, container) => sum + getTeu(container.containerSize), 0)
          const usage = total ? clamp(Math.round((used / total) * 100), 0, 100) : 0
          const active = selectedBlockId === block.id

          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onSelectBlock(block.id)}
              className={`rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${active ? "border-teal-400 bg-teal-50 ring-4 ring-teal-100" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-slate-950">{block.code}</div>
                  <div className="text-xs font-bold text-slate-500">{block.name}</div>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-teal-700 shadow-sm">{blockContainers.length} CNTR</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-600">
                <div className="rounded-xl bg-slate-50 p-2">{getSlotCounts(block, selectedArea).bayCount}<br /><span className="text-[10px] uppercase text-slate-400">Bay</span></div>
                <div className="rounded-xl bg-slate-50 p-2">{getSlotCounts(block, selectedArea).rowCount}<br /><span className="text-[10px] uppercase text-slate-400">Row</span></div>
                <div className="rounded-xl bg-slate-50 p-2">{getSlotCounts(block, selectedArea).tierCount}<br /><span className="text-[10px] uppercase text-slate-400">High</span></div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-black text-slate-500">
                <span>{Math.round(used * 100) / 100} / {total} TEU</span>
                <span>{usage}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-teal-600" style={{ width: `${usage}%` }} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const SlotSummaryCard = ({ label, value, sublabel, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
        <Icon size={22} />
      </div>
      <div>
        <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-2xl font-black leading-tight text-slate-950">{value}</div>
        {sublabel && <div className="text-xs font-semibold text-slate-500">{sublabel}</div>}
      </div>
    </div>
  </div>
)

const SlotLegend = () => (
  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
    <span className="inline-flex items-center gap-2"><span className="h-4 w-4 border border-slate-400 bg-white/70" /> Empty</span>
    <span className="inline-flex items-center gap-2"><span className="h-4 w-4 border border-emerald-800 bg-emerald-700" /> Assigned</span>
    <span className="inline-flex items-center gap-2"><span className="h-4 w-4 border border-amber-400 bg-amber-50" /> Selected</span>
  </div>
)

const getContainerSlotKey = (container) => {
  const bay = numberValue(container.bay, 1)
  const row = numberValue(container.row, 1)
  const tier = numberValue(container.tier, 1)
  return `${bay}-${row}-${tier}`
}

const makeCubePoints = ({ x, y, w, d, h }) => {
  const topA = [x, y]
  const topB = [x + w, y]
  const topC = [x + w + d, y + d * 0.62]
  const topD = [x + d, y + d * 0.62]
  const botA = [topA[0], topA[1] + h]
  const botB = [topB[0], topB[1] + h]
  const botC = [topC[0], topC[1] + h]
  const botD = [topD[0], topD[1] + h]

  return { topA, topB, topC, topD, botA, botB, botC, botD }
}

const pointsToString = (points) => points.map(([x, y]) => `${x},${y}`).join(" ")

const CubeSlot = ({ cube, assignedContainer, selected, onSelect }) => {
  const p = makeCubePoints(cube)
  const filled = Boolean(assignedContainer)
  const stroke = selected ? "#f59e0b" : filled ? "#047857" : "#94a3b8"
  const strokeWidth = selected ? 2.6 : filled ? 1.8 : 0.9
  const topFill = filled ? "#10b981" : "rgba(255,255,255,0.35)"
  const frontFill = filled ? "#059669" : "rgba(255,255,255,0.18)"
  const sideFill = filled ? "#047857" : "rgba(248,250,252,0.10)"
  const cursor = filled ? "pointer" : "default"

  return (
    <g onClick={filled ? onSelect : undefined} style={{ cursor }}>
      <polygon points={pointsToString([p.topA, p.topB, p.botB, p.botA])} fill={frontFill} stroke={stroke} strokeWidth={strokeWidth} />
      <polygon points={pointsToString([p.topB, p.topC, p.botC, p.botB])} fill={sideFill} stroke={stroke} strokeWidth={strokeWidth} />
      <polygon points={pointsToString([p.topA, p.topB, p.topC, p.topD])} fill={topFill} stroke={stroke} strokeWidth={strokeWidth} />
      <polyline points={pointsToString([p.topD, p.botD, p.botC])} fill="none" stroke={stroke} strokeWidth={strokeWidth} opacity={filled ? 0.85 : 0.55} />
      {filled && (
        <>
          <rect x={cube.x + cube.w * 0.18} y={cube.y + cube.h * 0.35} width={cube.w * 0.48} height={cube.h * 0.11} rx="2" fill="rgba(255,255,255,0.45)" />
          <text x={cube.x + cube.w * 0.5} y={cube.y + cube.h * 0.75} textAnchor="middle" className="fill-white text-[8px] font-black">
            {String(assignedContainer.containerNumber || "CNTR").slice(0, 6)}
          </text>
        </>
      )}
    </g>
  )
}

const BlockSlotMap = ({ selectedArea, block, containers }) => {
  const { bayCount: lineCount, rowCount, tierCount } = getSlotCounts(block, selectedArea)
  const [selectedContainerId, setSelectedContainerId] = useState("")

  const containersBySlot = useMemo(() => {
    return containers.reduce((acc, container) => {
      acc[getContainerSlotKey(container)] = container
      return acc
    }, {})
  }, [containers])

  useEffect(() => {
    if (containers.length === 0) {
      setSelectedContainerId("")
      return
    }

    if (!containers.some((container) => container.id === selectedContainerId)) {
      setSelectedContainerId(containers[0].id)
    }
  }, [containers, selectedContainerId])

  const selectedContainer = containers.find((container) => container.id === selectedContainerId) || containers[0] || null
  const selectedSlotKey = selectedContainer ? getContainerSlotKey(selectedContainer) : ""

  const cubeW = 55
  const cubeD = 38
  const cubeH = 34
  const originX = 98
  const originY = 285
  const svgWidth = Math.max(940, originX + rowCount * cubeW + lineCount * cubeD + 140)
  const svgHeight = Math.max(520, originY + lineCount * cubeD * 0.62 + cubeH + 110)

  const cubes = []
  for (let tier = 1; tier <= tierCount; tier += 1) {
    for (let line = lineCount; line >= 1; line -= 1) {
      for (let row = 1; row <= rowCount; row += 1) {
        const key = `${line}-${row}-${tier}`
        cubes.push({
          key,
          line,
          row,
          tier,
          x: originX + (row - 1) * cubeW + (line - 1) * cubeD,
          y: originY + (line - 1) * cubeD * 0.62 - (tier - 1) * cubeH,
          w: cubeW,
          d: cubeD,
          h: cubeH,
          assignedContainer: containersBySlot[key],
        })
      }
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-black uppercase tracking-wide text-slate-950">{block.code || block.name} Block - 3D Slot Map</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Rows: {rowCount} • Lines: {lineCount} • High: {tierCount}
          </p>
        </div>
        <SlotLegend />
      </div>

      <div className="overflow-auto bg-white p-5">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="min-h-[520px] w-full min-w-[900px]">
          <defs>
            <filter id="slotShadow" x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
          </defs>

          <text x="30" y="115" className="fill-slate-950 text-xs font-black">HIGH</text>
          <line x1="48" y1="132" x2="48" y2={originY + cubeH + 8} stroke="#0f172a" strokeWidth="1.2" />
          <path d="M48 132 L42 140 M48 132 L54 140" stroke="#0f172a" fill="none" />
          <path d={`M48 ${originY + cubeH + 8} L42 ${originY + cubeH} M48 ${originY + cubeH + 8} L54 ${originY + cubeH}`} stroke="#0f172a" fill="none" />
          {Array.from({ length: tierCount }, (_, index) => {
            const tier = index + 1
            const y = originY + cubeH - (tier - 1) * cubeH - cubeH / 2
            return <text key={`tier-label-${tier}`} x="70" y={y + 4} className="fill-slate-700 text-xs font-bold">{tier}</text>
          })}

          <g filter="url(#slotShadow)">
            {cubes.map((cube) => {
              const selected = cube.key === selectedSlotKey
              return (
                <CubeSlot
                  key={cube.key}
                  cube={cube}
                  assignedContainer={cube.assignedContainer}
                  selected={selected}
                  onSelect={() => setSelectedContainerId(cube.assignedContainer.id)}
                />
              )
            })}
          </g>

          {Array.from({ length: rowCount }, (_, index) => {
            const row = index + 1
            const x = originX + (row - 1) * cubeW + cubeW / 2
            const y = originY + lineCount * cubeD * 0.62 + cubeH + 26
            return <text key={`row-axis-${row}`} x={x} y={y} textAnchor="middle" className="fill-slate-700 text-xs font-bold">{row}</text>
          })}
          <line x1={originX} y1={originY + lineCount * cubeD * 0.62 + cubeH + 44} x2={originX + rowCount * cubeW} y2={originY + lineCount * cubeD * 0.62 + cubeH + 44} stroke="#0f172a" strokeWidth="1" />
          <path d={`M${originX + rowCount * cubeW} ${originY + lineCount * cubeD * 0.62 + cubeH + 44} L${originX + rowCount * cubeW - 10} ${originY + lineCount * cubeD * 0.62 + cubeH + 38} M${originX + rowCount * cubeW} ${originY + lineCount * cubeD * 0.62 + cubeH + 44} L${originX + rowCount * cubeW - 10} ${originY + lineCount * cubeD * 0.62 + cubeH + 50}`} stroke="#0f172a" fill="none" />
          <text x={originX + rowCount * cubeW / 2} y={originY + lineCount * cubeD * 0.62 + cubeH + 75} textAnchor="middle" className="fill-slate-950 text-xs font-black">ROW (HORIZONTAL)</text>

          {Array.from({ length: lineCount }, (_, index) => {
            const line = index + 1
            const x = originX + rowCount * cubeW + (line - 1) * cubeD + cubeD + 26
            const y = originY + (line - 1) * cubeD * 0.62 + cubeH + 14
            return <text key={`line-axis-${line}`} x={x} y={y} textAnchor="middle" className="fill-slate-700 text-xs font-bold">{line}</text>
          })}
          <line x1={originX + rowCount * cubeW + 16} y1={originY + cubeH + 22} x2={originX + rowCount * cubeW + lineCount * cubeD + 28} y2={originY + lineCount * cubeD * 0.62 + cubeH + 22} stroke="#0f172a" strokeWidth="1" />
          <text x={originX + rowCount * cubeW + lineCount * cubeD + 70} y={originY + lineCount * cubeD * 0.62 + cubeH + 45} className="fill-slate-950 text-xs font-black">LINE (DEPTH)</text>
        </svg>
      </div>

      <div className="border-t border-slate-200 p-5">
        {selectedContainer ? (
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-700 text-white"><Warehouse size={21} /></div>
              <div>
                <div className="text-xs font-black uppercase tracking-wide text-slate-500">Selected Coordinate</div>
                <div className="text-base font-black text-slate-950">
                  {selectedArea?.name} - Line {numberValue(selectedContainer.bay, 1)}, Row {numberValue(selectedContainer.row, 1)}, High {numberValue(selectedContainer.tier, 1)}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wide text-slate-500">Container ID</div>
              <div className="mt-1 font-black text-slate-950">{selectedContainer.containerNumber}</div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wide text-slate-500">Status</div>
              <div className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-700">Assigned</div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wide text-slate-500">Stored At</div>
              <div className="mt-1 text-sm font-bold text-slate-700">{formatDate(selectedContainer.storageStartDate || selectedContainer.storedAt || selectedContainer.updatedAt)}</div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wide text-slate-500">Customer</div>
              <div className="mt-1 text-sm font-bold text-slate-700">{selectedContainer.clientName || "-"}</div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
            No assigned container in this block yet.
          </div>
        )}
      </div>
    </div>
  )
}

const Storage3DViewer = ({ selectedArea, selectedBlockId, blocks, containers }) => {
  const visibleBlocks = selectedBlockId ? blocks.filter((block) => block.id === selectedBlockId) : blocks
  const focusedBlock = selectedBlockId ? visibleBlocks[0] : visibleBlocks.length === 1 ? visibleBlocks[0] : null
  const blockContainers = focusedBlock ? containers.filter((container) => container.block === focusedBlock.id) : []
  const { bayCount: lineCount, rowCount, tierCount } = getSlotCounts(focusedBlock || {}, selectedArea || {})

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/60 p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <SlotSummaryCard label="Block" value={focusedBlock?.code || selectedArea?.name || "-"} sublabel={focusedBlock?.name || "Selected yard block"} icon={Boxes} />
          <SlotSummaryCard label="Rows" value={focusedBlock ? rowCount : "-"} icon={Layers3} />
          <SlotSummaryCard label="Lines" value={focusedBlock ? lineCount : "-"} icon={Layers3} />
          <SlotSummaryCard label="High" value={focusedBlock ? tierCount : "-"} icon={Layers3} />
        </div>
      </div>

      <div className="p-5">
        {!selectedArea && (
          <div className="grid min-h-[420px] place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center">
            <div>
              <Warehouse className="mx-auto text-slate-300" size={46} />
              <div className="mt-3 text-xl font-black text-slate-800">Select a yard area</div>
              <div className="mt-1 text-sm font-semibold text-slate-500">The block slot map will appear after selecting an area.</div>
            </div>
          </div>
        )}

        {selectedArea && visibleBlocks.length === 0 && (
          <div className="grid min-h-[420px] place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center">
            <div>
              <Boxes className="mx-auto text-slate-300" size={46} />
              <div className="mt-3 text-xl font-black text-slate-800">No blocks configured</div>
              <div className="mt-1 text-sm font-semibold text-slate-500">Create blocks in Yard Area setup to view the slot map.</div>
            </div>
          </div>
        )}

        {selectedArea && visibleBlocks.length > 1 && !selectedBlockId && (
          <div className="grid min-h-[420px] place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center">
            <div>
              <Layers3 className="mx-auto text-slate-300" size={46} />
              <div className="mt-3 text-xl font-black text-slate-800">Select a block</div>
              <div className="mt-1 max-w-xl text-sm font-semibold text-slate-500">Choose a block from the block list above to display the exact Row, Line, and High slot map.</div>
            </div>
          </div>
        )}

        {focusedBlock && <BlockSlotMap selectedArea={selectedArea} block={focusedBlock} containers={blockContainers} />}
      </div>
    </div>
  )
}

const AdminStorageMonitoring = () => {
  const [areas, setAreas] = useState([])
  const [blocks, setBlocks] = useState([])
  const [containers, setContainers] = useState([])
  const [selectedAreaId, setSelectedAreaId] = useState("")
  const [selectedBlockId, setSelectedBlockId] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: "", message: "" })

  const selectedArea = useMemo(() => areas.find((area) => area.id === selectedAreaId) || null, [areas, selectedAreaId])

  const storedContainers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return containers.filter((container) => {
      const storedByBooking = storedBookingStatuses.includes(container.bookingStatus)
      const storedByInventory = storedInventoryStatuses.includes(container.status)
      const matchesSearch = !term || [container.containerNumber, container.bookingReference, container.clientName, container.areaName, container.blockCode, container.blockName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
      return (storedByBooking || storedByInventory) && matchesSearch
    })
  }, [containers, search])

  const selectedAreaContainers = useMemo(() => {
    return selectedAreaId ? storedContainers.filter((container) => container.area === selectedAreaId) : storedContainers
  }, [storedContainers, selectedAreaId])

  const selectedBlockContainers = useMemo(() => {
    return selectedBlockId ? selectedAreaContainers.filter((container) => container.block === selectedBlockId) : selectedAreaContainers
  }, [selectedAreaContainers, selectedBlockId])

  const totalTeu = useMemo(() => selectedAreaContainers.reduce((sum, container) => sum + getTeu(container.containerSize), 0), [selectedAreaContainers])

  const loadAreas = async () => {
    const { data } = await api.get("/admin/inventory/areas")
    setAreas(data.areas || [])
  }

  const loadBlocks = async (areaId = selectedAreaId) => {
    if (!areaId) {
      setBlocks([])
      return
    }
    const { data } = await api.get(`/admin/inventory/areas/${areaId}/blocks`)
    setBlocks(data.blocks || [])
  }

  const loadContainers = async () => {
    const { data } = await api.get("/admin/inventory/containers")
    setContainers(data.containers || [])
  }

  const loadAll = async () => {
    try {
      setLoading(true)
      setAlert({ type: "", message: "" })
      await Promise.all([loadAreas(), loadContainers()])
      if (selectedAreaId) await loadBlocks(selectedAreaId)
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (!selectedAreaId) {
      setBlocks([])
      setSelectedBlockId("")
      return
    }

    setSelectedBlockId("")
    loadBlocks(selectedAreaId).catch((error) => setAlert({ type: "error", message: getApiError(error) }))
  }, [selectedAreaId])

  useEffect(() => {
    const handleRealtime = (event) => {
      const eventType = event.detail?.type || ""
      if (!eventType.startsWith("booking:") && !eventType.startsWith("storage:") && !eventType.startsWith("inventory:") && !eventType.startsWith("yard:")) return
      loadAll()
    }

    window.addEventListener("otli:realtime", handleRealtime)
    return () => window.removeEventListener("otli:realtime", handleRealtime)
  }, [selectedAreaId])

  const handleRefresh = async () => {
    await loadAll()
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-700">
              <Warehouse size={14} /> Storage Monitoring
            </div>
            <h1 className="mt-3 text-3xl font-black text-slate-950">Areas, Blocks, and Stored Containers</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              Storage Monitoring starts as a list of areas and blocks. Once an area or block is clicked, the 3D view shows the stored containers in their exact Block, Bay, Row, and Tier location.
            </p>
          </div>
          <button type="button" onClick={handleRefresh} className="btn-secondary" disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <Alert type={alert.type}>{alert.message}</Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Selected Area" value={selectedArea?.name || "All"} icon={Warehouse} />
        <StatCard label="Stored Containers" value={selectedAreaContainers.length} icon={Boxes} />
        <StatCard label="Used TEU" value={Math.round(totalTeu * 100) / 100} icon={CalendarClock} />
      </div>

      <div className="card p-5">
        <Field label="Search Stored Containers">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input className="input pl-10" placeholder="Search container number, booking reference, customer, area, or block" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </Field>
      </div>

      <AreaList areas={areas} selectedAreaId={selectedAreaId} onSelectArea={setSelectedAreaId} containers={storedContainers} />
      <BlockList selectedArea={selectedArea} blocks={blocks} selectedBlockId={selectedBlockId} onSelectBlock={setSelectedBlockId} containers={selectedAreaContainers} />
      <Storage3DViewer selectedArea={selectedArea} selectedBlockId={selectedBlockId} blocks={blocks} containers={selectedBlockContainers} />

      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <Boxes size={18} className="text-teal-700" />
            <h2 className="text-lg font-black text-slate-950">Stored Container List</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Container</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Area / Block / Slot</th>
                <th className="px-5 py-3">Size / Type</th>
                <th className="px-5 py-3">Storage Start</th>
                <th className="px-5 py-3">Days</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedBlockContainers.length === 0 && !loading && (
                <tr><td colSpan="7" className="px-5 py-8 text-center font-semibold text-slate-500">No stored containers found for the selected view.</td></tr>
              )}
              {selectedBlockContainers.map((container) => {
                const displayStatus = container.bookingStatus || container.status
                const storageDate = container.storageStartDate || container.storedAt || container.updatedAt
                return (
                  <tr key={container.id} className="align-top">
                    <td className="px-5 py-4">
                      <div className="font-black text-slate-950">{container.containerNumber}</div>
                      <div className="text-xs font-semibold text-slate-500">{container.bookingReference || container.preAdviceNumber || "-"}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{container.clientName || "-"}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      <div>{container.areaName || "No area"}</div>
                      <div className="text-xs text-slate-500">{container.blockCode || container.blockName || "No block"} • {container.slotNumber || "No slot"}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{container.containerSize}ft • {container.containerType?.replace("_", " ")}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600"><CalendarClock className="mr-1 inline" size={14} /> {formatDate(storageDate)}</td>
                    <td className="px-5 py-4 font-black text-slate-950">{daysInYard(storageDate)}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(displayStatus)}`}>{statusLabels[displayStatus] || displayStatus?.replaceAll("_", " ")}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminStorageMonitoring
