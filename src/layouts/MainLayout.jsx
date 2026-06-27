import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function MainLayout({ children, noFooter = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-mint-100 bg-leaf-pattern">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!noFooter && <Footer />}
    </div>
  )
}
