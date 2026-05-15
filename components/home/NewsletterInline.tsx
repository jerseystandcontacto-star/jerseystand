'use client'

export function NewsletterInline() {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const email = new FormData(form).get('email') as string
        fetch('/api/newsletter', {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: { 'Content-Type': 'application/json' },
        }).then(() => {
          form.reset()
          alert('¡Gracias! Revisa tu email para confirmar.')
        })
      }}
    >
      <input
        type="email"
        name="email"
        placeholder="tu@email.com"
        required
        className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#c9a227]"
      />
      <button
        type="submit"
        className="bg-[#c9a227] text-[#111410] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#e8bc35] transition-colors"
      >
        ✓
      </button>
    </form>
  )
}
