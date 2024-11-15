import React from 'react'

import styles from './index.module.css'
interface ProgressMapProps{
    data: any[]
}
export default function ProgressMap(p: ProgressMapProps) {
  return (
    <div
    className={styles.container}
    >
        {p.data.map((el, index) => <div
        key={index}
        className={styles.mark}
        style={{}}
        >
            
        </div>) }
    </div>
  )
}
