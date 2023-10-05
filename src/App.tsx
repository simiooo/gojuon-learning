import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { Button, Card, Col, Divider, Form, Input, Row, Select, Space, Tag, Tooltip, message } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { hiragana, hiragana_map, katakana, katakana_map } from './goguon'


// const tagRender = (props: TagProps & { label: any, value: any }) => {
//   const { label, value, closable, onClose } = props;
//   const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
//     event.preventDefault();
//     event.stopPropagation();
//   };
//   return (
//     <Tag
//       color={value}
//       onMouseDown={onPreventMouseDown}
//       closable={closable}
//       onClose={onClose}
//       style={{ marginRight: 3 }}
//     >
//       {label}
//     </Tag>
//   );
// };

function App() {

  const wordTypeList = [
    {
      label: '平假名',
      value: 'hiragana',
    },
    {
      label: '片假名',
      value: 'katakana',
    },
  ]
  const [wordType, setWordType] = useState<string[]>(['hiragana'])
  const renderWordsList = useMemo(() => {
    return [...hiragana, ...katakana].filter(ele => wordType.includes(ele.type))
  }, [wordType])
  const createRandomWord = useCallback(() => {
    const word = renderWordsList[createRandomIndex()]?.value
    setWord(word)
    return word
  }, [renderWordsList])

  const createRandomIndex = useCallback((): number => {
    return Math.floor(Math.random() * renderWordsList.length)
  }, [renderWordsList])
  const inputref = useRef(null)
  const [word, setWord] = useState<string>(renderWordsList[createRandomIndex()]?.value)
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

  useEffect(() => {
    createRandomWord()
  }, [renderWordsList])

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
            flex={'0 0 500px'}
            span={24}
          >
            <Select
              bordered={false}
              placeholder="假名范围"
              options={wordTypeList}
              onChange={(v) => {setWordType(v)}}
              style={{
                width: '220px'
              }}
              suffixIcon={<></>}
              mode="multiple"
            ></Select>
          </Col>
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
                      const character = ({ ...katakana_map, ...hiragana_map }[word] ?? '').split('/') as string[]
                      if(!(value.length > 0)) {
                        return Promise.reject('请输入罗马字')
                      }
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
            <Row style={{
              marginTop: '6px'
            }} justify={'end'}>
              <Col>
                <Space>
                  <div>{renderPercentScore}</div>
                  <div>{renderScore}</div>
                </Space>
              </Col>
            </Row>
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
                <Row gutter={[6, 4]}>
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

        </Row>


      </div>
    </div>
  )
}

export default App
