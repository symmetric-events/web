'use client'
import React from 'react'
import { Button } from '../components/Button';

export const CtaButton = () => {
  return (
    <Button
    variant="secondary"
    onClick={() => {
      const requestFormSection = document.getElementById('request-form-in-house');
      if (requestFormSection) {
        requestFormSection.scrollIntoView({ behavior: 'smooth' });
      }
    }}
  >Request an In-House Training</Button>
  )
}