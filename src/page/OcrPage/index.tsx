import { InboxOutlined, TranslationOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, Form, Image, message, Row, Select, Slider, Space, Spin, Upload } from 'antd'
import { createWorker, Lang } from 'tesseract.js';
import React, { useRef, useState } from 'react'
import styles from './index.module.css'
import { useRequest, useSize } from 'ahooks';
// import { XMLParser } from 'fast-xml-parser';
const luangesList = [
  {
    "key": "chi_sim",
    "label": "Chinese Simplified"
  },
  {
    "key": "chi_tra",
    "label": "Chinese Traditional"
  },
  {
    "key": "jpn",
    "label": "Japanese"
  },
  {
    "key": "eng",
    "label": "English"
  }
] as const
// const xmlParser = new XMLParser({
//   ignoreAttributes: false,
//   unpairedTags: ["hr", "br", "link", "meta"],
//   stopNodes: ["*.pre", "*.script"],
//   processEntities: true,
//   htmlEntities: true
// });
// function xmlTraversal(xmlDoc: object) {
//     Object.entries(xmlDoc ?? {})
// }
let worker: Tesseract.Worker | undefined
async function engineWorker(langs?: Lang[], oem: 0 /* legacy */ | 1 /** LSTM/neural network */ = 1, image?: File, options?: { logger: (arg: Tesseract.LoggerMessage) => void }) {
  if (!langs) {
    throw Error('Please select Language')
  }
  if (typeof oem !== 'number') {
    throw Error('Please select oem')
  }
  if (!image) {
    throw Error('Please select image')
  }
  worker = (worker && (await worker.reinitialize(langs, oem), worker)) || await createWorker(langs, oem, {
    logger: options?.logger,
  });
  const { data } = await worker.recognize(image, {
    // rectangle: { top: 0, left: 0, width: 100, height: 100 },

  }, {
    hocr: true
  });
  // const result = xmlParser.parse(data.hocr) //hocr
  // console.log(result)
  const root = document.createDocumentFragment()
  const div = document.createElement('div')
  div.innerHTML = data.hocr
  traversalDom(div, hocrStylify)
  root.appendChild(div)
  return root
}

function hocrStylify(root) {
  traversalDom(root, (dom) => {
    if (dom instanceof DocumentFragment) {
      return
    }
    const ocrAttr = (dom as any)?.attributes?.title?.value?.split(';')?.map(el => {
      const splitIndex = Math.max(0, el?.indexOf(' '))
      return [el?.slice?.(0, splitIndex), el?.slice?.(splitIndex)?.trim?.()]
    }
    ).filter(el => el?.[0] && el?.[1])
    const result = Object.fromEntries(ocrAttr ?? [])
    if (result?.bbox && dom.className === 'ocr_line' && 'style' in dom) {
      const [left, top, right, bottom] = result?.bbox?.split(' ') ?? []
      
      dom.style.position = `absolute`
      dom.style.left = `${Number(left/1.25)}px`
      dom.style.top = `${Number(top/1.25)}px`
      const height = bottom - top
      dom.style.fontSize = `${height / 1.5}px`
      dom.style.color = '#222'
      dom.style.whiteSpace = 'nowrap'
      // const width = right - left
      // const domWidth = dom.getBoundingClientRect().width
      // dom.style.letterSpacing = `${(width - domWidth) / (dom?.innerText ?? '').length / 2}px`
      dom.style.letterSpacing = `${-1.5}px`
      // dom.style.fontSize = `${height}px`

    } else if (result?.bbox && dom.className.indexOf('word') > -1 && 'style' in dom && dom.children.length > 0) {
      // const [left, top, right, bottom] = result?.bbox?.split(' ') ?? []
      // const height = bottom - top
      // const width = right - left
      // const domWidth = dom.getBoundingClientRect().width
      // dom.style.letterSpacing = `${(width - domWidth) / (dom?.innerText ?? '').length}px`
      // dom.style.fontSize = `${height/ 2}px`
      // dom.style.color = '#222'
      // dom.style.transformOrigin = 'center'
      // dom.style.whiteSpace = 'nowrap'
    }
    if (result?.rotate && 'style' in dom) {
      dom.style.transform = `rotate(${result?.rotate})`
    }

  })
}

export default function OcrPage() {
  const [form] = Form.useForm()
  const [regPercent, setRegPercent] = useState<number>(0)
  const [cacheImage, setCacheImage] = useState<string>()
  const textRef = useRef<HTMLDivElement>()
  const { runAsync, loading } = useRequest(async (v) => {
    try {
      setRegPercent(0)
      const file = v?.["file"]?.['file']?.response?.data
      const result = await engineWorker(v["language"], Math.round(Number(v["quality"] ?? 1)) as 0 | 1, file as File | undefined, {
        logger: (msg) => {
          setRegPercent(msg.progress * 100)
        },
      })
      textRef.current.innerHTML = ''
      textRef.current.append(result)
      return result

    } catch (error) {
      console.log(error)
      message.error(error.message ?? error)
    }
  }, {
    manual: true
  })

  const textContainerSize = useSize(document.getElementsByClassName('text_image')[0])

  return (
    <div
      className={styles.ocrPage}
    >
      <Form
        form={form}
        onValuesChange={(v) => {

          const file = v?.["file"]?.['file']?.response?.data
          if (file) {
            const rd = new FileReader()
            rd.readAsDataURL(file)
            rd.onloadend = (e) => {
              if (cacheImage) {
                URL.revokeObjectURL(cacheImage)
              }

              setCacheImage(e.target.result as string)
            }
          }

        }}
        onFinish={(v) => {
          runAsync(v)

        }}
        initialValues={{
          quality: 1,
          language: ['eng', 'jpn']
        }}
      >

        <Row
          className={styles.content}
          gutter={[8, 4]}
        >
          <Col
            span={24}
          >


            <Row
              gutter={[4, 4]}

            >
              <Col>
                <Form.Item
                  name="language"
                  label="Language"
                  rules={[
                    {
                      required: true,
                      message: 'Please select language',
                    }
                  ]}
                >
                  <Select
                    suffixIcon={<TranslationOutlined />}
                    options={luangesList.map(el => ({ label: el.label, value: el.key }))}
                    mode="multiple"

                  ></Select>
                </Form.Item>
                <Form.Item
                  name="quality"
                  label="Quality"
                  rules={[
                    {
                      required: true,
                      message: 'Please select quality',
                    }
                  ]}
                >
                  <Slider
                    disabled
                    max={1}
                    min={0}
                  ></Slider>
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button
                      type={'primary'}
                      htmlType='submit'
                      loading={loading}
                    >
                      Recognize Text
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>

          </Col>
          <Divider></Divider>
          <Col
            span={24}
          >
            <Row
              gutter={[16, 4]}

            >
              <Col span={12}>
                <Form.Item
                  name="file"
                  // noStyle
                  rules={[
                    {
                      required: true,
                      message: 'Please upload image',
                    }
                  ]}
                >
                  <Upload.Dragger
                    name='file'
                    multiple={true}
                    showUploadList={false}
                    customRequest={(info) => {
                      info.onSuccess({ status: 200, data: info.file }, info.file)
                    }}
                  >

                    {cacheImage ? <Image
                    preview={false}
                      className='text_image'
                      src={cacheImage}
                    ></Image> : <div
                    style={{
                      height:'40vh'
                    }}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Click or drag file to this area to upload</p>
                      <p className="ant-upload-hint">
                        Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                        banned files.
                      </p>
                    </div>}
                  </Upload.Dragger>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Spin
                  percent={regPercent}
                  spinning={loading}
                  >
                  <Card
                    style={{
                      height: textContainerSize?.height ?? '40vh',
                      width: textContainerSize?.width
                    }}
                    cover={true}>
                    <div
                      ref={textRef}
                    ></div>
                  </Card>
                </Spin>
              </Col>
            </Row>

          </Col>
        </Row>

      </Form>
    </div>

  )
}


export function traversalDom(dom?: Element | HTMLElement | DocumentFragment, cb?: (item: Element | HTMLElement | DocumentFragment) => void) {
  if (!dom) {
    return
  }
  cb?.(dom)
  for (const el of dom?.children ?? []) {
    cb?.(el)
    traversalDom(el, cb)
  }
}