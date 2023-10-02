import { useCallback, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Alert, Button, Card, Col, Form, Input, Popover, Row, Space, Tooltip } from 'antd'
import { NamePath } from 'antd/es/form/interface'
import { CloseOutlined } from '@ant-design/icons'

const gojuon = `あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほやゆよらりるれろわをえん`.split('')
const gojuon_map = {
  'あ': 'a',
  'い': 'i',
  'う': 'u',
  'え': 'e',
  'お': 'o',
  'か': 'ka',
  'き': 'ki',
  'く': 'ku',
  'け': 'ka',
  'こ': 'ko',
  'さ': 'sa',
  'し': 'si/shi',
  'す': 'su',
  'せ': 'se',
  'そ': 'so',
  'た': 'ta',
  'ち': 'ti/chi',
  'つ': 'tu/tsu',
  'て': 'te',
  'と': 'to',
  'な': 'na',
  'に': 'ni',
  'ぬ': 'nu',
  'ね': 'ne',
  'の': 'no',
  'は': 'ha',
  'ひ': 'hi',
  'ふ': 'hu',
  'へ': 'he',
  'ほ': 'ho',
  'ま': 'ma',
  'み': 'mi',
  'む': 'mu',
  'め': 'me',
  'も': 'mo',
  'や': 'ya',
  'ゆ': 'yu',
  'よ': 'yo',
  'ら': 'ra',
  'り': 'ri',
  'る': 'ru',
  'れ': 're',
  'ろ': 'ro',
  'わ': 'wa',
  'を': 'wo',
  'ん': 'n',
} as const

function App() {


  const createRandomWord = () => {
    const word = gojuon[createRandomIndex()]
    setWord(word)
    return word
  }

  const createRandomIndex = (): number => {
    return Math.floor(Math.random() * gojuon.length)
  }

  const [word, setWord] = useState<string>(gojuon[createRandomIndex()])
  const [form] = Form.useForm()
  const [error, setError] = useState<boolean>(false)

  return (
    <div className='main'>
      <Form
        form={form}
        onFinish={async () => {
          form.resetFields()
          createRandomWord()
          setError(false)
        }}
        onFinishFailed={() => {
          setError(true)
        }}
      >
        <Row
          gutter={[16, 40]}
          justify={'center'}
        >
          <Col
            span={24}
          >
            <Card
              bordered
              title={<h1
                style={{
                  textAlign: 'center'
                }}
              >
                <Space><div>{word}</div>
                {error ? <CloseOutlined 
                style={{
                  color: 'red',
                
                }}
                /> : undefined}
                </Space>
                </h1>}
            >
              <Form.Item
                noStyle
                name="word"
                normalize={(v?: string) => {
                  return (v ?? '').trim()
                }}
                rules={[
                  {
                    validator: (_, value: string | undefined) => {
                      const character = (gojuon_map[word] ?? '').split('/') as string[]
                      if (character.includes((value ?? '').toLowerCase())) {
                        return Promise.resolve(200)
                      } else {
                        return Promise.reject('读音不正确')
                      }
                    }
                  }
                ]}
              >
                <Input
                  maxLength={8}
                  placeholder='请输入罗马字'
                  bordered={false}></Input>
              </Form.Item>
            </Card>
          </Col>
          <Col
            span={24}
          >
            <Tooltip
              title="输入对应的正确罗马字后可“下一步”"
            >
              <Row
                gutter={[10, 16]}
                justify={'center'}>
                <Col>

                  <Form.Item
                    noStyle
                    name="submit"
                  >
                    <Button
                      htmlType='submit'
                      type={"primary"}
                    >下一个</Button>
                  </Form.Item>
                </Col>
              </Row>
            </Tooltip>
          </Col>
        </Row>
      </Form>

    </div>
  )
}

export default App
