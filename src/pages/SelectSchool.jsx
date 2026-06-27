import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// This route just redirects back to landing which has the school selector
export default function SelectSchool() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/') }, [])
  return null
}
