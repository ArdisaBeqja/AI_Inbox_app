import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Inbox, AlertCircle, Clock3, FileText, CalendarDays, Sparkles, CheckCircle2 } from 'lucide-react'
import './styles.css'

const API = 'http://localhost:8000'

function App() {
  const [emails, setEmails] = useState([])
  const [selected, setSelected] = useState(null)
  const [draft, setDraft] = useState('')
  const [loadingDraft, setLoadingDraft] = useState(false)

  useEffect(() => {
    fetch(`${API}/emails`)
      .then(r => r.json())
      .then(data => {
        setEmails(data)
        if (data.length) setSelected(data[0])
      })
  }, [])

  const counts = useMemo(() => ({
    urgent: emails.filter(e => e.priority === 'High' && e.status !== 'done').length,
    reply: emails.filter(e => e.status === 'needs_reply').length,
    invoices: emails.filter(e => e.category === 'Invoice').length,
    bookings: emails.filter(e => e.category === 'Booking').length,
  }), [emails])

  async function generateDraft() {
    if (!selected) return
    setLoadingDraft(true)
    setDraft('')
    const res = await fetch(`${API}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_id: selected.id })
    })
    const data = await res.json()
    setDraft(data.draft)
    setLoadingDraft(false)
  }

  async function markDone() {
    if (!selected) return
    const res = await fetch(`${API}/emails/${selected.id}/mark-done`, { method: 'POST' })
    const updated = await res.json()
    setEmails(prev => prev.map(e => e.id === updated.id ? updated : e))
    setSelected(updated)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><Sparkles size={22}/> InboxAI</div>
        <nav>
          <button className="nav-active"><Inbox size={18}/> Inbox</button>
          <button><AlertCircle size={18}/> Urgent <span>{counts.urgent}</span></button>
          <button><Clock3 size={18}/> Needs reply <span>{counts.reply}</span></button>
          <button><FileText size={18}/> Invoices <span>{counts.invoices}</span></button>
          <button><CalendarDays size={18}/> Bookings <span>{counts.bookings}</span></button>
        </nav>
        <div className="sidebar-footer">MVP Demo<br/><small>React + FastAPI</small></div>
      </aside>

      <main className="content">
        <header>
          <div>
            <p className="eyebrow">SMART INBOX</p>
            <h1>Good morning 👋</h1>
            <p className="sub">Here’s what needs your attention today.</p>
          </div>
        </header>

        <section className="stats">
          <Stat label="Urgent" value={counts.urgent} />
          <Stat label="Needs Reply" value={counts.reply} />
          <Stat label="Invoices" value={counts.invoices} />
          <Stat label="Bookings" value={counts.bookings} />
        </section>

        <section className="workspace">
          <div className="email-list">
            <div className="panel-title">Needs Reply</div>
            {emails.map(email => (
              <button key={email.id} onClick={() => {setSelected(email); setDraft('')}} className={`email-card ${selected?.id === email.id ? 'selected' : ''}`}>
                <div className="email-topline">
                  <strong>{email.sender.split('<')[0].trim()}</strong>
                  <span className={`priority ${email.priority.toLowerCase()}`}>{email.priority}</span>
                </div>
                <div className="subject">{email.subject}</div>
                <div className="summary">{email.summary}</div>
                {email.status === 'done' && <div className="done"><CheckCircle2 size={14}/> Done</div>}
              </button>
            ))}
          </div>

          <div className="detail-panel">
            {!selected ? <p>Select an email</p> : <>
              <div className="detail-header">
                <div>
                  <p className="eyebrow">{selected.category}</p>
                  <h2>{selected.subject}</h2>
                  <p className="sender">From {selected.sender}</p>
                </div>
                <span className={`priority ${selected.priority.toLowerCase()}`}>{selected.priority}</span>
              </div>

              <div className="message-box">{selected.body}</div>

              <div className="ai-card">
                <div className="ai-title"><Sparkles size={18}/> AI Analysis</div>
                <p><strong>Summary:</strong> {selected.summary}</p>
                <p><strong>Suggested action:</strong> {selected.action}</p>
              </div>

              <div className="actions">
                <button className="primary" onClick={generateDraft} disabled={loadingDraft}>
                  <Sparkles size={17}/>{loadingDraft ? 'Generating...' : 'Generate Reply'}
                </button>
                <button className="secondary" onClick={markDone}><CheckCircle2 size={17}/> Mark Done</button>
              </div>

              {draft && <div className="draft-box">
                <div className="panel-title">Suggested Reply</div>
                <textarea value={draft} onChange={e => setDraft(e.target.value)} />
                <button className="primary full">Approve & Send (demo)</button>
              </div>}
            </>}
          </div>
        </section>
      </main>
    </div>
  )
}

function Stat({label, value}) {
  return <div className="stat-card"><span>{label}</span><strong>{value}</strong></div>
}

createRoot(document.getElementById('root')).render(<App />)
