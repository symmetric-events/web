'use client'
import React from 'react'
import { Button } from '../components/Button';
import { InHouseTrainingForm } from './InHouseTrainingForm';

export const CtaButton = () => {
  return (
    <InHouseTrainingForm
      trigger={
        <Button>
          Request an In-House Training
        </Button>
      }
    />
  )
}