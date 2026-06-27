import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BarChart3, Lightbulb, HelpCircle, ClipboardList, Camera, Menu, X, ArrowLeft } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { useIsMobile } from '../hooks/useMediaQuery'
import ProfileMenu from '../components/ProfileMenu'

const NAV = [
  { path: '/dashboard',               label: 'Overview',         Icon: LayoutDashboard },
  { path: '/school/reports',          label: 'Reports',          Icon: BarChart3 },
  { path: '/school/recommendations',  label: 'Recommendations',  Icon: Lightbulb },
  { path: '/school/scan',             label: 'Scan Form',        Icon: Camera },
]

function pageTitle(pathname) {
  return pathname === '/dashboard'               ? 'Overview'
    : pathname === '/school/reports'             ? 'Reports'
    : pathname === '/school/recommendations'     ? 'Recommendations'
    : pathname === '/school'                     ? 'Submit Audit'
    : pathname === '/school/scan'                ? 'Scan Form'
    : 'School Portal'
}

export default function SchoolLayout({ children }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const { lang, setLanguage, t } = useLang()
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close the drawer whenever the route changes
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])
  // Never leave the drawer mounted when we grow back to desktop
  useEffect(() => { if (!isMobile) setDrawerOpen(false) }, [isMobile])

  // ── Sidebar contents (shared by desktop rail + mobile drawer) ──
  const SidebarInner = (
    <>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0 0.5rem', marginBottom:'1.75rem' }}>
        <div style={{ width:34, height:34, background:'#1E2F1E', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>📍</div>
        <div>
          <p style={{ fontWeight:900, fontSize:'0.88rem', color:'#1E2F1E', lineHeight:1.1, margin:0 }}>{t('School Portal')}</p>
        </div>
      </div>

      {/* Section label */}
      <p style={{ fontSize:'0.58rem', fontWeight:800, color:'#9ca3af', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0 0.75rem', marginBottom:'0.4rem' }}>{t('Carbon Management')}</p>

      {/* Nav */}
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>
        {NAV.map(({ path, label, Icon }) => {
          const active = location.pathname === path
          return (
            <Link key={path} to={path} style={{ display:'flex', alignItems:'center', gap:'0.55rem', padding:'0.575rem 0.75rem', borderRadius:'0.65rem', fontWeight: active?700:500, fontSize:'0.8rem', color: active?'#fff':'#4E7D5B', background: active?'#2D4A32':'transparent', textDecoration:'none', transition:'background 0.15s' }}>
              <Icon size={15} />
              {t(label)}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ borderTop:'1px solid #e4edd6', paddingTop:'0.875rem', display:'flex', flexDirection:'column', gap:3 }}>
        <button onClick={() => navigate('/school')} style={{ background:'#1E2F1E', color:'#EEF2DC', border:'none', borderRadius:'0.65rem', padding:'0.625rem 0.75rem', fontWeight:700, fontSize:'0.79rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', justifyContent:'center', marginBottom:'0.25rem' }}>
          <ClipboardList size={13} /> {t('Submit Audit')}
        </button>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.45rem 0.75rem', color:'#7BAE7F', fontSize:'0.77rem', textDecoration:'none' }}>
          <HelpCircle size={13} /> {t('Help')}
        </Link>
      </div>
    </>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f5f7f0', fontFamily:"'Google Sans',sans-serif" }}>

      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <aside style={{ width:220, flexShrink:0, background:'#fff', borderRight:'1px solid #e4edd6', display:'flex', flexDirection:'column', padding:'1.5rem 0.875rem', minHeight:'100vh', position:'sticky', top:0, alignSelf:'flex-start' }}>
          {SidebarInner}
        </aside>
      )}

      {/* ── Mobile slide-in drawer + scrim ── */}
      {isMobile && drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(15,23,15,0.45)', zIndex:60 }} />
          <aside style={{ position:'fixed', top:0, left:0, bottom:0, width:'78%', maxWidth:300, background:'#fff', borderRight:'2px solid #e4edd6', display:'flex', flexDirection:'column', padding:'1.25rem 0.875rem', zIndex:61, overflowY:'auto' }}>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ position:'absolute', top:'0.9rem', right:'0.9rem', background:'none', border:'none', color:'#4E7D5B', cursor:'pointer', padding:4 }}>
              <X size={20} />
            </button>
            {SidebarInner}
          </aside>
        </>
      )}

      {/* ── Main area ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', minWidth:0, overflow:'hidden' }}>

        {/* Top bar */}
        <div style={{ background:'#fff', borderBottom:'1px solid #e4edd6', padding: isMobile ? '0.7rem 1rem' : '0.8rem 1.75rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.75rem', position:'sticky', top:0, zIndex:40 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', minWidth:0 }}>
            {isMobile && (
              <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ background:'none', border:'none', color:'#1E2F1E', cursor:'pointer', padding:4, display:'flex', alignItems:'center' }}>
                <Menu size={22} />
              </button>
            )}
            {/* Back to Overview — shown on every sub-page so users always have a way back */}
            {location.pathname !== '/dashboard' && (
              <button
                onClick={() => navigate('/dashboard')}
                aria-label="Back to Overview"
                style={{ display:'flex', alignItems:'center', gap:'0.3rem', background:'#f5f7ee', border:'1px solid #e4edd6', borderRadius:'0.55rem', padding:'0.35rem 0.6rem', color:'#2D4A32', fontWeight:700, fontSize:'0.74rem', cursor:'pointer', flexShrink:0 }}
              >
                <ArrowLeft size={14} /> {!isMobile && t('Overview')}
              </button>
            )}
            <p style={{ fontWeight:700, fontSize:'0.9rem', color:'#1E2F1E', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {t(pageTitle(location.pathname))}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexShrink:0 }}>
            {!isMobile && (
              <div style={{ display:'flex', background:'#1E2F1E', borderRadius:'2rem', padding:'0.2rem' }}>
                <button onClick={() => setLanguage('en')} style={{ padding:'0.25rem 0.75rem', fontSize:'0.7rem', fontWeight:700, background: lang==='en' ? '#fff' : 'transparent', color: lang==='en' ? '#1E2F1E' : '#7BAE7F', border:'none', cursor:'pointer', borderRadius:'1.5rem' }}>English</button>
                <button onClick={() => setLanguage('ne')} style={{ padding:'0.25rem 0.75rem', fontSize:'0.7rem', fontWeight:700, background: lang==='ne' ? '#fff' : 'transparent', color: lang==='ne' ? '#1E2F1E' : '#7BAE7F', border:'none', cursor:'pointer', borderRadius:'1.5rem' }}>नेपाली</button>
              </div>
            )}
            <ProfileMenu accent="#1E2F1E" />
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
