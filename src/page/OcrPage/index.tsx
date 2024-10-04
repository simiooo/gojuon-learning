import { InboxOutlined, TranslationOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, Form, Image, message, Result, Row, Select, Slider, Space, Spin, Upload } from 'antd'
import { createWorker, Lang, PSM } from 'tesseract.js';
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
const PSMOptions = [
  {
    "label": "Orientation and script detection only.",
    "value": PSM.OSD_ONLY
  },
  {
    "label": "Automatic page segmentation with orientation and script detection (OSD).",
    "value": PSM.AUTO_OSD
  },
  {
    "label": "Automatic page segmentation, but no OSD, or OCR.",
    "value": PSM.AUTO_ONLY
  },
  {
    "label": "Fully automatic page segmentation, but no OSD.",
    "value": PSM.AUTO
  },
  {
    "label": "Assume a single column of text of variable sizes.",
    "value": PSM.SINGLE_COLUMN
  },
  {
    "label": "Assume a single uniform block of vertically aligned text.",
    "value": PSM.SINGLE_BLOCK_VERT_TEXT
  },
  {
    "label": "Assume a single uniform block of text. (Default.)",
    "value": PSM.SINGLE_BLOCK
  },
  {
    "label": "Treat the image as a single text line.",
    "value": PSM.SINGLE_LINE
  },
  {
    "label": "Treat the image as a single word.",
    "value": PSM.SINGLE_WORD
  },
  {
    "label": "Treat the image as a single word in a circle.",
    "value": PSM.CIRCLE_WORD
  },
  {
    "label": "Treat the image as a single character.",
    "value": PSM.SINGLE_CHAR
  },
  {
    "label": "Find as much text as possible in no particular order.",
    "value": PSM.SPARSE_TEXT
  },
  {
    "label": "Sparse text with orientation and script detection.",
    "value": PSM.SPARSE_TEXT_OSD
  },
  {
    "label": "Treat the image as a single text line, bypassing hacks that are Tesseract-specific.",
    "value": PSM.RAW_LINE
  }
]
async function engineWorker(langs?: Lang[], oem: 0 /* legacy */ | 1 /** LSTM/neural network */ = 1, image?: File, options?: { 
  psm?: PSM,
  logger: (arg: Tesseract.LoggerMessage) => void }) {
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
  await worker.setParameters({
    tessedit_pageseg_mode: options?.psm,
  });
  const { data } = await worker.recognize(image, {
    // rectangle: { top: 0, left: 0, width: 100, height: 100 },

  }, {
    hocr: true
  });
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
      dom.style.left = `${Number(left / 1.25)}px`
      dom.style.top = `${Number(top / 1.25)}px`
      const height = bottom - top
      dom.style.fontSize = `${height / 1.5}px`
      dom.style.color = '#222'
      dom.style.whiteSpace = 'nowrap'
      // const width = right - left
      // const domWidth = dom.getBoundingClientRect().width
      // dom.style.letterSpacing = `${(width - domWidth) / (dom?.innerText ?? '').length / 2}px`
      dom.style.letterSpacing = `${-1.5}px`
      // dom.style.fontSize = `${height}px`

    } else if (result?.bbox && dom.className.indexOf('word') > -1 && 'style' in dom) {
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
  const { runAsync, loading, data } = useRequest(async (v) => {
    try {
      setRegPercent(0)
      const file = v?.["file"]?.['file']?.response?.data
      const result = await engineWorker(v["language"], Math.round(Number(v["quality"] ?? 1)) as 0 | 1, file as File | undefined, {
        logger: (msg) => {
          setRegPercent(msg.progress * 100)
        },
        psm: v["psm"]
      })
      textRef.current.innerHTML = ''
      textRef.current.append(result)
      return result

    } catch (error) {
      console.log(error)
      message.error(error.message ?? error)
    } finally {
      setRegPercent(100)
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
          language: ['eng', 'jpn'],
          psm: PSM.SINGLE_BLOCK
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
              gutter={[24, 16]}

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
                    style={{
                      minWidth: '8rem'
                    }}
                  ></Select>
                </Form.Item>

              </Col>
              <Form.Item
              label="Page Segement Mode"
              name="psm"
              rules={[
                {
                  required: true,
                  message: 'Please select page segement mode',
                }
              ]}
              >
                <Select
                style={{
                  minWidth: '16rem'
                }}
                options={PSMOptions}
                ></Select>
              </Form.Item>
              <Col>
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
                    style={{
                      minWidth: '8rem'
                    }}
                    max={1}
                    min={0}
                  ></Slider>
                </Form.Item>
              </Col>
              <Col>
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
                        height: '40vh',
                        display: 'flex',
                        flexDirection: 'column',
                        paddingTop: '10vh',
                        justifyContent: 'flex-start',
                        alignItems: 'center'
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
                      {!data && <Result status={'info'}>
                        <p>Waiting task to start</p>
                      </Result>}
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