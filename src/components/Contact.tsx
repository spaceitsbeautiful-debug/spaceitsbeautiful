import { useState } from 'react'
import { siGithub, siInstagram } from 'simple-icons'
import { contact } from '../data/site'
import { useT } from '../i18n'
import ContactForm from './ContactForm'
import { Eyebrow } from './ui'

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  const t = useT()
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard refused: the address stays visible and selectable */
    }
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-1.5 pl-5 font-mono text-sm">
      <span className="select-all">{email}</span>
      <button type="button" onClick={copy} className="rounded-full bg-accent px-3.5 py-1.5 text-bg">
        {copied ? t('Copié', 'Copied') : t('Copier', 'Copy')}
      </button>
    </span>
  )
}

const Icon = ({ path }: { path: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
    <path d={path} />
  </svg>
)

export default function Contact() {
  const t = useT()
  return (
    <section id="contact" className="relative border-t border-line pt-[clamp(72px,10vw,140px)] pb-[clamp(48px,6vw,80px)]">
      <Eyebrow>{t('Ouvert aux projets', 'Open to projects')}</Eyebrow>
      <h2 className="mt-5 mb-0 max-w-[14em] font-display text-[clamp(36px,7vw,120px)] leading-[1.02] font-bold tracking-[-0.02em] text-balance">
        {t(
          <>
            Un projet, une idée, une question&nbsp;? <span className="text-accent">Écris-moi.</span>
          </>,
          <>
            A project, an idea, a question? <span className="text-accent">Write to me.</span>
          </>,
        )}
      </h2>
      <div className="mt-9 flex flex-wrap items-center gap-3">
        {contact.instagram && (
          <a
            href={`https://www.instagram.com/${contact.instagram}/`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2.5 rounded-full border border-accent bg-accent px-5 py-3 font-mono text-sm text-bg transition-transform hover:-translate-y-px"
          >
            <Icon path={siInstagram.path} />@{contact.instagram}
          </a>
        )}
        {contact.github && (
          <a
            href={`https://github.com/${contact.github}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2.5 rounded-full border border-line px-5 py-3 font-mono text-sm transition-colors hover:border-accent"
          >
            <Icon path={siGithub.path} />
            github.com/{contact.github}
          </a>
        )}
        {contact.email && <CopyEmail email={contact.email} />}
      </div>
      <ContactForm />
    </section>
  )
}
