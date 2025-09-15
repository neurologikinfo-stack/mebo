'use client'

import { useState } from 'react'

export default function LogoUploader({ currentLogo }) {
  const [preview, setPreview] = useState(currentLogo)

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <label className="block">
      <span className="text-sm font-medium">Logo</span>
      {preview && (
        <img
          src={preview}
          alt="Preview del logo"
          className="w-20 h-20 object-contain border rounded mb-2"
        />
      )}
      <input
        type="file"
        name="logo"
        accept="image/*"
        className="mt-1 w-full"
        onChange={handleChange}
      />
    </label>
  )
}
