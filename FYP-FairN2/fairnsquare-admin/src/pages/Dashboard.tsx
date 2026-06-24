import { useAdmin } from '../context/AdminContext'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { judges, categories, projects, scores } = useAdmin()

  const now = new Date()
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-AU')

  // Compute scoring progress
  const judgeIds = [...new Set(scores.map(s => s.judgeId))]
  const judgesScored = judgeIds.length
  const totalScoreCards = judges.length * projects.length
  const completedCards = (() => {
    let count = 0
    for (const j of judges) {
      for (const p of projects.filter(pr => {
        const cat = categories.find(c => c.id === pr.categoryId)
        const judge = judges.find(jj => jj.id === j.id)
        return judge?.categoryId === pr.categoryId
      })) {
        const jScores = scores.filter(s => s.judgeId === j.id && s.projectId === p.id)
        if (jScores.length >= 4) count++
      }
    }
    return count
  })()

  const stats = [
    { label: 'Judges', value: judges.length, sub: `${judgesScored} have scored` },
    { label: 'Categories', value: categories.length, sub: 'active' },
    { label: 'Projects', value: projects.length, sub: 'total entries' },
    { label: 'Score Submissions', value: completedCards, sub: 'completed scorecards' },
  ]

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div>
          <h1 className={styles.welcome}>Welcome,</h1>
          <h2 className={styles.adminName}>Admin</h2>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.time}>{timeStr}</span>
          <span className={styles.date}>{dateStr}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statSub}>{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Category summary */}
      <h3 className={styles.sectionTitle}>Category Overview</h3>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Category</span>
          <span>Projects</span>
          <span>Judges Assigned</span>
        </div>
        {categories.map(cat => {
          const catProjects = projects.filter(p => p.categoryId === cat.id)
          const catJudges = judges.filter(j => j.categoryId === cat.id)
          return (
            <div key={cat.id} className={styles.tableRow}>
              <span className={styles.catName}>{cat.name}</span>
              <span>{catProjects.length}</span>
              <span>{catJudges.length}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
