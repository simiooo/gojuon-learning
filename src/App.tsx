import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { Button, Card, Col, Divider, Form, Input, Row, Space, Tag, Tooltip, message } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { gojuon, gojuon_map } from './goguon'



function App() {


  const createRandomWord = () => {
    const word = gojuon[createRandomIndex()]
    setWord(word)
    return word
  }

  const createRandomIndex = (): number => {
    return Math.floor(Math.random() * gojuon.length)
  }
  const inputref = useRef(null)
  const [word, setWord] = useState<string>(gojuon[createRandomIndex()])
  const [form] = Form.useForm()
  const [error, setError] = useState<boolean>(false)
  const [doneList, setDoneList] = useState<{ status: "sucess" | 'error', content: string }[]>([])

  const renderScore = useMemo(() => {
    return `${doneList.filter(vl => vl.status === 'sucess').length}/${doneList.length}`
  }, [doneList])

  const renderPercentScore = useMemo(() => {
    return `${(doneList.filter(vl => vl.status === 'sucess').length / (doneList.length || 1) * 100).toFixed(2)}%`
  }, [doneList])

  useEffect(() => {
    if (doneList.length > 0) {
      window.localStorage.setItem('doneList', JSON.stringify(doneList))
    }
    if (doneList.length > 200) {
      doneList.shift()
      setDoneList([...doneList])
    }
  }, [doneList])

  useEffect(() => {
    setDoneList(JSON.parse(window.localStorage.getItem('doneList')) ?? [])
    setMissMap(new Map(JSON.parse(window.localStorage.getItem('missMap'))) ?? new Map())
  }, [])

  const [missMap, setMissMap] = useState<Map<string, number>>(new Map())
  const [rank, setRank] = useState([])

  useEffect(() => {
    if (missMap.size > 0) {
      window.localStorage.setItem('missMap', JSON.stringify([...missMap]))
    }

    setRank([...missMap].sort((pre, val) => {
      return val[1] - pre[1]
    }).slice(0, 10))
  }, [missMap])

  return (
    <div className='main'>
      <Form
        form={form}
        onFinish={async (v) => {
          setDoneList([...doneList, {
            status: 'sucess',
            content: v?.word
          }])
          form.resetFields()
          createRandomWord()
          setError(false)
          setTimeout(() => {
            inputref.current.focus()

          })
        }}
        onFinishFailed={(v) => {
          const cnt = missMap.get(word) ?? 0
          missMap.set(word, cnt + 1)
          setMissMap(new Map([...missMap]))
          setDoneList([...doneList, {
            status: 'error',
            content: v?.values?.word
          }])
          setError(true)
          message.error('罗马字不正确')
        }}
      >
        <Row
          gutter={[16, 40]}
          justify={'center'}
        >
          <Col
            span={24}
            flex={'500px'}
          >
            <Card
              bordered
              title={<h1
                style={{
                  textAlign: 'center'
                }}
              >
                <Space><div
                  style={{
                    color: error ? 'red' : undefined
                  }}
                >{word}</div>
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
                  ref={inputref}
                  placeholder='请输入罗马字'
                  bordered={false}></Input>
              </Form.Item>
            </Card>
          </Col>
          <Col
            span={24}
          >
            <Tooltip
              title="输入对应的正确罗马字后可“下一个”"
            >
              <Row
                gutter={[10, 16]}
                justify={'center'}>
                <Col>

                  <Form.Item
                    noStyle
                    name="submit"
                  >
                    <Space>
                      <Button
                        htmlType='submit'
                        type={"primary"}
                      >下一个</Button>
                    </Space>

                  </Form.Item>
                </Col>
              </Row>
            </Tooltip>
          </Col>

          <Col flex={'500px'} span={24}>
            <Divider orientation="left" plain>
              常错假名
            </Divider>
            <Row gutter={[4, 6]} justify={'start'}>
              <Col>
                <Row  gutter={[6, 4]}>
                  {
                    rank.map(ele => <Col>
                      <Tag>
                        {ele[0]}
                      </Tag>
                    </Col>)
                  }
                </Row>

              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
      <div className="score">
        <Row justify={'end'} gutter={[10, 16]}>


          <Col span={24}>
            <Row justify={'end'}>
              <Col>
                <Space>
                  <div>{renderPercentScore}</div>
                  <div>{renderScore}</div>
                </Space>
              </Col>
            </Row>

          </Col>
        </Row>


      </div>
    </div>
  )
}

export default App
