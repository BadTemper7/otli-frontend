const OtpInput = ({ value, onChange, disabled }) => {
  const chars = value.padEnd(6, " ").slice(0, 6).split("")

  const updateAt = (index, nextValue) => {
    const cleaned = nextValue.replace(/\D/g, "").slice(-1)
    const next = value.padEnd(6, " ").split("")
    next[index] = cleaned || " "
    onChange(next.join("").replace(/\s/g, "").slice(0, 6))

    if (cleaned) {
      const nextInput = document.querySelector(`[data-otp-index="${index + 1}"]`)
      nextInput?.focus()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    onChange(pasted)
  }

  return (
    <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
      {chars.map((char, index) => (
        <input
          key={index}
          data-otp-index={index}
          className="h-12 rounded-2xl border border-slate-300 bg-white text-center text-lg font-black outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
          value={char.trim()}
          disabled={disabled}
          inputMode="numeric"
          maxLength={1}
          onChange={(event) => updateAt(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !event.currentTarget.value && index > 0) {
              const prevInput = document.querySelector(`[data-otp-index="${index - 1}"]`)
              prevInput?.focus()
            }
          }}
        />
      ))}
    </div>
  )
}

export default OtpInput
