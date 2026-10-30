import { useState } from 'react'
import { contact } from '../data/site'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/** Sends a message through Web3Forms. Hidden until a key is set in data/site.ts. */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  if (!contact.formKey) return null

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    data.append('access_key', contact.formKey)
    data.append('subject', 'Nouveau message depuis le portfolio')
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  const field =
    'w-full rounded-[12px] border border-line bg-surface px-4 py-3 text-[15px] text-fg outline-none transition-colors placeholder:text-muted focus:border-accent'

  return (
    <form onSubmit={onSubmit} className="mt-12 grid max-w-[720px] gap-3 sm:grid-cols-2">
      <label className="grid gap-1.5">
        <span className="font-mono text-xs text-muted">Ton nom</span>
        <input id="contact-name" name="name" required autoComplete="name" className={field} />
      </label>
      <label className="grid gap-1.5">
        <span className="font-mono text-xs text-muted">Ton email</span>
        <input id="contact-email" name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="grid gap-1.5 sm:col-span-2">
        <span className="font-mono text-xs text-muted">Ton message</span>
        <textarea id="contact-message" name="message" required rows={5} className={`${field} resize-y`} />
      </label>
      {/* Honeypot against bots: humans never see it */}
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="rounded-full bg-accent px-6 py-3 font-mono text-sm text-bg transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {status === 'sending' ? 'Envoi…' : 'Envoyer'}
        </button>
        <span role="status" className="font-mono text-[13px] text-muted">
          {status === 'sent' && 'Message envoyé. Je te réponds vite.'}
          {status === 'error' && "L'envoi n'a pas marché. Réessaie, ou écris-moi sur Instagram."}
        </span>
      </div>
    </form>
  )
}
