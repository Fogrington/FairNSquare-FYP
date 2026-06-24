import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import styles from './Results.module.css'

export default function Results() {
  const { categories, judges, scores, getCategoryResults } = useAdmin()
  const [selectedCat, setSelectedCat] = useState<number>(categories[0]?.id ?? 0)

  const results = selectedCat ? getCategoryResults(selectedCat) : []
  const topScore = results[0]?.average ?? null

  const getJudgeScoresForProject = (projectId: number) => {
    const judgeIds = [...new Set(scores.filter(s => s.projectId === projectId).map(s => s.judgeId))]
    return judgeIds.map(judgeId => {
      const judge = judges.find(j => j.id === judgeId)
      const judgeScores = scores.filter(s => s.judgeId === judgeId && s.projectId === projectId)
      const complete = judgeScores.length >= 4
      const weighted = complete
        ? judgeScores.reduce((sum, s) => sum + s.value * s.weight, 0)
        : null
      return { judge, judgeScores, weighted, complete }
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Results</h2>
      </div>

      {/* Category tabs */}
      <div className={styles.tabs}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${styles.tab} ${selectedCat === cat.id ? styles.tabActive : ''}`}
            onClick={() => setSelectedCat(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {results.length === 0 && (
        <div className={styles.empty}>No projects or scores in this category yet.</div>
      )}

      {results.map(({ project, average, judgeCount }, idx) => {
        const judgeBreakdown = getJudgeScoresForProject(project.id)
        const isFirst = idx === 0 && average !== null
        return (
          <div key={project.id} className={`${styles.projectCard} ${isFirst ? styles.projectCardTop : ''}`}>
            <div className={styles.projectHeader}>
              <div className={styles.projectLeft}>
                {isFirst && <span className={styles.trophy}>🏆</span>}
                <div>
                  <span className={styles.rank}>#{idx + 1}</span>
                  <span className={styles.projectTitle}>{project.title}</span>
                  <span className={styles.projectMeta}>{project.presenter} · {project.institution}</span>
                </div>
              </div>
              <div className={styles.scoreDisplay}>
                {average !== null ? (
                  <>
                    <span className={styles.scoreValue}>{average.toFixed(2)}</span>
                    <span className={styles.scoreMax}>/10</span>
                  </>
                ) : (
                  <span className={styles.noScore}>Not yet scored</span>
                )}
                <span className={styles.judgeCount}>{judgeCount} judge{judgeCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Score bar */}
            {average !== null && (
              <div className={styles.barContainer}>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${(average / 10) * 100}%` }} />
                </div>
              </div>
            )}

            {/* Judge breakdown */}
            {judgeBreakdown.length > 0 && (
              <div className={styles.breakdown}>
                {judgeBreakdown.map(({ judge, judgeScores, weighted, complete }) => (
                  <div key={judge?.id} className={styles.judgeRow}>
                    <span className={styles.judgeName}>{judge?.name ?? 'Unknown'}</span>
                    <div className={styles.criteriaScores}>
                      {judgeScores.map(s => (
                        <span key={s.criterionId} className={styles.criterionChip}>
                          {s.criterionLabel}: <strong>{s.value}</strong>
                        </span>
                      ))}
                    </div>
                    <span className={styles.judgeTotal}>
                      {complete && weighted !== null ? `${weighted.toFixed(2)}/10` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
