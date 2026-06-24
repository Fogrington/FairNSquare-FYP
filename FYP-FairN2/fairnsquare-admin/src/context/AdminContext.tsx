import React, { createContext, useContext, useState, ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = {
  id: number
  name: string
}

export type Project = {
  id: number
  categoryId: number
  title: string
  presenter: string
  institution: string
}

export type Judge = {
  id: number
  name: string
  email: string
  accessCode: string
  categoryId: number | null
}

export type ScoreEntry = {
  judgeId: number
  projectId: number
  criterionId: number
  criterionLabel: string
  value: number
  weight: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Engineering & Technology' },
  { id: 2, name: 'Life Sciences & Health' },
]

const INITIAL_PROJECTS: Project[] = [
  { id: 101, categoryId: 1, title: 'AquaFlow: Smart Irrigation System', presenter: 'Emma Bartlett', institution: 'University of Newcastle' },
  { id: 102, categoryId: 1, title: 'BridgeScan: Structural Monitoring', presenter: 'Lena Kowalski', institution: 'TAFE NSW Hunter' },
  { id: 103, categoryId: 1, title: 'NanoGrid: Peer-to-Peer Energy Trading', presenter: 'Yuki Tanaka', institution: 'University of Newcastle' },
  { id: 104, categoryId: 1, title: 'TrailSafe: Bushwalker SOS Beacon', presenter: 'Caitlin Moore', institution: 'Hunter Valley Grammar' },
  { id: 201, categoryId: 2, title: 'DermAI: Skin Lesion Classifier', presenter: 'Aisha Okafor', institution: 'University of Newcastle' },
  { id: 202, categoryId: 2, title: 'MindBridge: Rural Mental Health Platform', presenter: 'Zoe Patterson', institution: 'University of Newcastle' },
  { id: 203, categoryId: 2, title: 'GlucoWatch: Non-Invasive BGL Monitor', presenter: 'Fatima Al-Hassan', institution: 'Hunter Medical Research Institute' },
]

const INITIAL_JUDGES: Judge[] = [
  { id: 1, name: 'Sarah Chen', email: 'sarah.chen@hunterwise.org', accessCode: '1234', categoryId: 1 },
  { id: 2, name: 'Marcus Webb', email: 'marcus.webb@hunterwise.org', accessCode: '5678', categoryId: 2 },
  { id: 3, name: 'Priya Nair', email: 'priya.nair@hunterwise.org', accessCode: '9012', categoryId: 1 },
]

// Mock scores — simulate some judges having scored some projects
const INITIAL_SCORES: ScoreEntry[] = [
  { judgeId: 1, projectId: 101, criterionId: 1, criterionLabel: 'Innovation', value: 8, weight: 0.3 },
  { judgeId: 1, projectId: 101, criterionId: 2, criterionLabel: 'Technical Merit', value: 7, weight: 0.3 },
  { judgeId: 1, projectId: 101, criterionId: 3, criterionLabel: 'Impact', value: 9, weight: 0.25 },
  { judgeId: 1, projectId: 101, criterionId: 4, criterionLabel: 'Presentation', value: 8, weight: 0.15 },
  { judgeId: 1, projectId: 102, criterionId: 1, criterionLabel: 'Innovation', value: 6, weight: 0.3 },
  { judgeId: 1, projectId: 102, criterionId: 2, criterionLabel: 'Technical Merit', value: 8, weight: 0.3 },
  { judgeId: 1, projectId: 102, criterionId: 3, criterionLabel: 'Impact', value: 7, weight: 0.25 },
  { judgeId: 1, projectId: 102, criterionId: 4, criterionLabel: 'Presentation', value: 7, weight: 0.15 },
  { judgeId: 3, projectId: 101, criterionId: 1, criterionLabel: 'Innovation', value: 9, weight: 0.3 },
  { judgeId: 3, projectId: 101, criterionId: 2, criterionLabel: 'Technical Merit', value: 8, weight: 0.3 },
  { judgeId: 3, projectId: 101, criterionId: 3, criterionLabel: 'Impact', value: 8, weight: 0.25 },
  { judgeId: 3, projectId: 101, criterionId: 4, criterionLabel: 'Presentation', value: 9, weight: 0.15 },
  { judgeId: 2, projectId: 201, criterionId: 1, criterionLabel: 'Innovation', value: 9, weight: 0.3 },
  { judgeId: 2, projectId: 201, criterionId: 2, criterionLabel: 'Technical Merit', value: 8, weight: 0.3 },
  { judgeId: 2, projectId: 201, criterionId: 3, criterionLabel: 'Impact', value: 10, weight: 0.25 },
  { judgeId: 2, projectId: 201, criterionId: 4, criterionLabel: 'Presentation', value: 9, weight: 0.15 },
]

// ─── Context ──────────────────────────────────────────────────────────────────

type AdminContextType = {
  // Auth
  admin: boolean
  adminLogin: (email: string, password: string) => boolean
  adminLogout: () => void
  // Data
  categories: Category[]
  projects: Project[]
  judges: Judge[]
  scores: ScoreEntry[]
  // Judge actions
  addJudge: (judge: Omit<Judge, 'id'>) => void
  updateJudge: (id: number, updates: Partial<Judge>) => void
  removeJudge: (id: number) => void
  // Category actions
  addCategory: (name: string) => void
  removeCategory: (id: number) => void
  // Project actions
  addProject: (project: Omit<Project, 'id'>) => void
  removeProject: (id: number) => void
  // Computed
  getProjectWeightedAverage: (projectId: number) => number | null
  getCategoryResults: (categoryId: number) => { project: Project; average: number | null; judgeCount: number }[]
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState(false)
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES)
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [judges, setJudges] = useState<Judge[]>(INITIAL_JUDGES)
  const [scores] = useState<ScoreEntry[]>(INITIAL_SCORES)

  const adminLogin = (email: string, password: string) => {
    if (email === 'admin@hunterwise.org' && password === 'admin123') {
      setAdmin(true)
      return true
    }
    return false
  }

  const adminLogout = () => setAdmin(false)

  const addJudge = (judge: Omit<Judge, 'id'>) => {
    const id = Math.max(0, ...judges.map(j => j.id)) + 1
    setJudges(prev => [...prev, { ...judge, id }])
  }

  const updateJudge = (id: number, updates: Partial<Judge>) => {
    setJudges(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j))
  }

  const removeJudge = (id: number) => {
    setJudges(prev => prev.filter(j => j.id !== id))
  }

  const addCategory = (name: string) => {
    const id = Math.max(0, ...categories.map(c => c.id)) + 1
    setCategories(prev => [...prev, { id, name }])
  }

  const removeCategory = (id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const addProject = (project: Omit<Project, 'id'>) => {
    const id = Math.max(0, ...projects.map(p => p.id)) + 1
    setProjects(prev => [...prev, { ...project, id }])
  }

  const removeProject = (id: number) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const getProjectWeightedAverage = (projectId: number): number | null => {
    const projectScores = scores.filter(s => s.projectId === projectId)
    if (projectScores.length === 0) return null

    // Group by judge
    const judgeIds = [...new Set(projectScores.map(s => s.judgeId))]
    const judgeAverages: number[] = []

    for (const judgeId of judgeIds) {
      const judgeScores = projectScores.filter(s => s.judgeId === judgeId)
      const criteria = [...new Set(judgeScores.map(s => s.criterionId))]
      // Only include complete scorecards (all 4 criteria)
      if (criteria.length < 4) continue
      const weighted = judgeScores.reduce((sum, s) => sum + s.value * s.weight, 0)
      judgeAverages.push(weighted)
    }

    if (judgeAverages.length === 0) return null
    return judgeAverages.reduce((a, b) => a + b, 0) / judgeAverages.length
  }

  const getCategoryResults = (categoryId: number) => {
    return projects
      .filter(p => p.categoryId === categoryId)
      .map(project => {
        const projectScores = scores.filter(s => s.projectId === project.id)
        const judgeIds = [...new Set(projectScores.map(s => s.judgeId))]
        return {
          project,
          average: getProjectWeightedAverage(project.id),
          judgeCount: judgeIds.length,
        }
      })
      .sort((a, b) => (b.average ?? -1) - (a.average ?? -1))
  }

  return (
    <AdminContext.Provider value={{
      admin, adminLogin, adminLogout,
      categories, projects, judges, scores,
      addJudge, updateJudge, removeJudge,
      addCategory, removeCategory,
      addProject, removeProject,
      getProjectWeightedAverage, getCategoryResults,
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin(): AdminContextType {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
