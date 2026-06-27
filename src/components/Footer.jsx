import React from 'react'
import { Github, Twitter, Mail } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import logoImg from '../assets/logo.png'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="bg-forest-800 text-black mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src={logoImg} alt="Co Paila" className="h-10 w-auto object-contain mb-3" />
            <p className="text-mint-200 text-sm leading-relaxed">
              {t('Empowering schools to track, understand, and reduce their carbon footprint — one eco action at a time.')}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-mint-300 mb-3">{t('Quick Links')}</h4>
            <ul className="space-y-2 text-sm text-mint-200">
              <li><a href="#" className="hover:text-black transition-colors">{t('About CoPaila')}</a></li>
              <li><a href="#" className="hover:text-black transition-colors">{t('How It Works')}</a></li>
              <li><a href="#" className="hover:text-black transition-colors">{t('For Schools')}</a></li>
              <li><a href="#" className="hover:text-black transition-colors">{t('Contact Us')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-mint-300 mb-3">{t('Connect')}</h4>
            <div className="flex gap-3">
              {[Github, Twitter, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center hover:bg-forest-600 transition-colors">
                  <Icon size={16} className="text-mint-300" />
                </a>
              ))}
            </div>
            <p className="text-xs text-mint-200/60 mt-4">{t('© 2026 CoPaila. Built for a greener future 🌍')}</p>
          </div>
        </div>

        {/* LeafNode team attribution */}
        <div className="mt-8 pt-6 border-t border-forest-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-mint-200/50">{t('A product by the LeafNode team')}</p>
          <div className="flex items-center gap-1 select-none" style={{ lineHeight: 1 }}>
            <span style={{
              color: '#96db6e',
              fontWeight: 900,
              fontSize: '1.35rem',
              letterSpacing: '-0.03em',
              fontFamily: "'Google Sans', sans-serif",
            }}>LeafNode</span>
            {/* Clover icon — 4 petal circles, stroke matches footer bg for petal definition */}
            
            <sup style={{ color: '#96db6e', fontSize: '0.55rem', fontWeight: 800, marginTop: '-10px', marginLeft: '-1px' }}>™</sup>
          </div>
        </div>
      </div>
    </footer>
  )
}
