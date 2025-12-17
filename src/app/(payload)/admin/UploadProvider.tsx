'use client'

import { UploadHandlersProvider } from '@payloadcms/ui/providers/UploadHandlers'
import React from 'react'

export const UploadProvider = (props: { children?: React.ReactNode }) => {
  return <UploadHandlersProvider>{props.children}</UploadHandlersProvider>
}
