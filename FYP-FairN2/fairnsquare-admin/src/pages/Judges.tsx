import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import styles from './Judges.module.css'

export default function Judges() {
  const { judges, categories, addJudge, updateJudge, removeJudge } = useAdmin()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', accessCode: '', categoryId: '' })
  const [error, setError] = useState('')

  const resetForm = () => {
    setForm({ name: '', email: '', accessCode: '', categoryId: '' })
    setError('')
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (judge: typeof judges[0]) => {
    setForm({
      name: judge.name,
      email: judge.email,
      accessCode: judge.accessCode,
      categoryId: judge.categoryId?.toString() ?? '',
    })
    setEditingId(judge.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.accessCode.trim()) {
      setError('Name, email and access code are required.')
      return
    }
    if (form.accessCode.length !== 4 || !/^\d+$/.test(form.accessCode)) {
      setError('Access code must be exactly 4 digits.')
      return
    }
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      accessCode: form.accessCode,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    }
    if (editingId !== null) {
      updateJudge(editingId, payload)
    } else {
      addJudge(payload)
    }
    resetForm()
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Judges</h2>
        <button className={styles.addBtn} onClick={() => { resetForm(); setShowForm(true) }}>
          + Add Judge
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>{editingId ? 'Edit Judge' : 'Add New Judge'}</h3>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input className={styles.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@org.com" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Access Code (4 digits)</label>
                <input className={styles.input} value={form.accessCode} onChange={e => setForm(f => ({ ...f, accessCode: e.target.value }))} placeholder="1234" maxLength={4} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Assigned Category</label>
                <select className={styles.input} value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">— Unassigned —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={resetForm}>Cancel</button>
              <button type="submit" className={styles.saveBtn}>{editingId ? 'Save Changes' : 'Add Judge'}</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Name</span>
          <span>Email</span>
          <span>Code</span>
          <span>Category</span>
          <span>Actions</span>
        </div>
        {judges.map(judge => {
          const cat = categories.find(c => c.id === judge.categoryId)
          return (
            <div key={judge.id} className={styles.tableRow}>
              <span className={styles.judgeName}>{judge.name}</span>
              <span className={styles.muted}>{judge.email}</span>
              <span className={styles.code}>{judge.accessCode}</span>
              <span>
                {cat
                  ? <span className={styles.catBadge}>{cat.name}</span>
                  : <span className={styles.unassigned}>Unassigned</span>
                }
              </span>
              <span className={styles.actions}>
                <button className={styles.editBtn} onClick={() => handleEdit(judge)}>Edit</button>
                <button className={styles.removeBtn} onClick={() => removeJudge(judge.id)}>Remove</button>
              </span>
            </div>
          )
        })}
        {judges.length === 0 && (
          <div className={styles.empty}>No judges added yet.</div>
        )}
      </div>
    </div>
  )
}
