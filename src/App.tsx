import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { Button, Card, Col, Divider, Form, Input, Layout, Row, Select, Space, Tabs, Tag, Tooltip, message } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { useResponsive } from 'ahooks';
import { hiragana, hiragana_map, katakana, katakana_map } from './goguon'
import prand from 'pure-rand'
import OcrPage from './page/OcrPage';
import KanaLearning from './page/KanaLearning';
import Vocabulary from './page/Vocabulary';




function App() {

  return (
    <Layout
      style={{
        padding: '1rem 2rem'
      }}
    >
      <Tabs
        items={[
          {
            key: '1',
            label: 'Learning',
            children: <KanaLearning />,

          },
          {
            label: 'Image To Text',
            key: '2',
            children: <OcrPage />,
          },
          {
            label: 'Vocabulary',
            key: '3',
            children: <Vocabulary />,
          },
        ]}
      >

      </Tabs>

    </Layout>
  )
}

export default App
