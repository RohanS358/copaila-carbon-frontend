import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { primeSpeech } from './services/tts'
import Landing from './pages/Landing'
import SelectSchool from './pages/SelectSchool'
import RoleSelection from './pages/RoleSelection'
import StudentDashboard from './pages/StudentDashboard'
import PetRPG from './pages/PetRPG'
import Lessons from './pages/Lessons'
import Leaderboard from './pages/Leaderboard'
import Achievements from './pages/Achievements'
import Events from './pages/Events'
import SchoolDataEntry from './pages/SchoolDataEntry'
import CarbonDashboard from './pages/CarbonDashboard'
import SchoolReports from './pages/SchoolReports'
import SchoolRecommendations from './pages/SchoolRecommendations'
import SchoolOCRScan from './pages/SchoolOCRScan'
import JoinUs from './pages/JoinUs'
import SchoolRegister from './pages/SchoolRegister'
import IndividualRegister from './pages/IndividualRegister'
import Login from './pages/Login'
import Download from './pages/Download'
import { RequireAccess, RedirectIfAuth } from './components/RouteGuards'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes>
        {/* Public / pre-login */}
        <Route path="/"               element={<Landing />} />
        <Route path="/download"       element={<Download />} />
        <Route path="/about"          element={<Navigate to="/#about" replace />} />
        <Route path="/faq"            element={<Navigate to="/#faq"   replace />} />
        <Route path="/select-school"  element={<SelectSchool />} />
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* Auth — already-signed-in users skip these and land on their dashboard */}
        <Route path="/join"                  element={<RedirectIfAuth><JoinUs /></RedirectIfAuth>} />
        <Route path="/register/school"       element={<SchoolRegister />} />
        <Route path="/register/individual"   element={<IndividualRegister />} />
        <Route path="/login"                 element={<RedirectIfAuth><Login /></RedirectIfAuth>} />

        {/* Student portal */}
        <Route path="/student"               element={<RequireAccess role="student"><StudentDashboard /></RequireAccess>} />
        <Route path="/student/pet"           element={<RequireAccess role="student"><PetRPG /></RequireAccess>} />
        <Route path="/student/lessons"       element={<RequireAccess role="student"><Lessons /></RequireAccess>} />
        <Route path="/student/leaderboard"   element={<RequireAccess role="student"><Leaderboard /></RequireAccess>} />
        <Route path="/student/achievements"  element={<RequireAccess role="student"><Achievements /></RequireAccess>} />
        <Route path="/student/events"        element={<RequireAccess role="student"><Events /></RequireAccess>} />

        {/* School / admin */}
        <Route path="/school"                    element={<RequireAccess role="school"><SchoolDataEntry /></RequireAccess>} />
        <Route path="/dashboard"                 element={<RequireAccess role="school"><CarbonDashboard /></RequireAccess>} />
        <Route path="/school/reports"            element={<RequireAccess role="school"><SchoolReports /></RequireAccess>} />
        <Route path="/school/recommendations"    element={<RequireAccess role="school"><SchoolRecommendations /></RequireAccess>} />
        <Route path="/school/scan"               element={<RequireAccess role="school"><SchoolOCRScan /></RequireAccess>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

// Prime Web Speech on the very first click/tap anywhere in the app so the
// pet's greeting is audible even if the user navigates fast via keyboard/link.
function SpeechPrimer() {
  useEffect(() => {
    const handler = () => { primeSpeech(); document.removeEventListener('click', handler, true) }
    document.addEventListener('click', handler, { capture: true, once: true, passive: true })
    return () => document.removeEventListener('click', handler, true)
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <SpeechPrimer />
            <AnimatedRoutes />
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
