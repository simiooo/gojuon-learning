import { useEventEmitter, useEventListener, useInterval, useKeyPress, useLocalStorageState, useRequest } from 'ahooks'
import { Avatar, Button, Card, Col, Descriptions, Divider, Form, Input, List, message, Modal, Popconfirm, Row, Skeleton, Slider, Space, Spin, Tag, Tooltip } from 'antd'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './index.module.css'

import prand from 'pure-rand';
import { AudioMutedOutlined, AudioOutlined, EyeInvisibleOutlined, EyeOutlined, NotificationOutlined, WarningOutlined } from '@ant-design/icons';
import ProgressMap from '../../components/ProgressMap';
const PAGE_SIZE = 200
const seed = Date.now() ^ (Math.random() * 0x100000000);
const rng = prand.xoroshiro128plus(seed);
const UN_REMEMBERED_COUNT_UPPER = 4
type Word = {
    word: string;
    kana: string;
    chineseMeaning: string[];
    wordClass: string;
}
export default function Vocabulary() {
    const [rememberModal, setRememberModal] = useState<boolean>(false)
    // const [modal, modalHolder] = Modal.useModal()
    const [cacheData, setCacheData] = useLocalStorageState<Word[]>("vocabulary", { defaultValue: [] })
    const [remembered, setRemembered] = useLocalStorageState<{ [key: string]: boolean }>('remembered', { defaultValue: {} })
    const [unremembered, setUnremembered] = useLocalStorageState<{ [key: string]: boolean }>('unremembered', { defaultValue: {} })
    const [remHiddren, setRemHiddren] = useState<boolean>(true)
    const [currentRememberIndex, setCurrentRememberIndex] = useState(0)

    const { data: totalCount, refresh: countRefresh } = useRequest(async () => {
        try {
            const res = await axios.post<{ total: number }>('/api/v1/vocabularyCount', {
                keywords: form.getFieldValue(["keywords"]),
            })
            return res.data?.total ?? 0
        } catch (error) {
            message.error(error)
        }

    }, {
        onSuccess() {
            runAsync()
        }
    })


    const { data: ttsData, runAsync: ttsGetter, loading: ttsLoading } = useRequest(async (text?: string) => {
        if (!text) {
            throw Error('Please choose text to submit')
        }

        const res = await axios.post('/api/tts', {
            cache: false,
            text,
        }, {
            responseType: 'arraybuffer'
        })
        if (!!ttsData) {
            URL.revokeObjectURL(ttsData)
        }

        const url = URL.createObjectURL(new Blob([res?.data], { type: "audio/wav", }))
        const audio = new Audio(url)
        audio.play()
        return url
    }, {
        manual: true,
        onSuccess(data) {

        }
    })
    const [form] = Form.useForm()

    const { data, runAsync, loading: wordsLoading, refresh } = useRequest(async (current: number = 1, init?: boolean) => {
        try {
            const res = await axios.post<{
                isEnd?: boolean,
                data?: Word[], total: number
            }>('/api/v1/vocabulary', {
                pageSize: PAGE_SIZE,
                current,
                keywords: form.getFieldValue(["keywords"]),
            })
            const result: { total: number, list: Word[], current?: number, isEnd?: boolean } = {
                total: res?.data?.total ?? 0,
                isEnd: res?.data?.isEnd,
                list: init ? res?.data?.data ?? [] : [...(data?.list ?? []), ...(res.data.data ?? [])],
                current
            }
            setCacheData(result?.list ?? [])
            return result
        } catch (error) {
            console.log(error);
        }

    }, {
        onSuccess() {

        },
        manual: true,
    })
    const [unrememberedCount, setUnrememveredCount] = useState<number>(0)
    const renderCurrentRemember = useMemo(() => {
        const unrememberedEntries = Object.entries(unremembered ?? {})
        if (unrememberedCount > UN_REMEMBERED_COUNT_UPPER && unrememberedEntries.length > 0) {
            setUnrememveredCount(0)

            const result = Math.floor(prand.unsafeUniformIntDistribution(0, Math.max((unrememberedEntries?.length ?? 1), 1) - 1, rng))
            return JSON.parse(unrememberedEntries?.[result]?.[0] ?? '{}') as Word
        }
        setUnrememveredCount(unrememberedCount + 1)
        return cacheData[currentRememberIndex]
    }, [cacheData, currentRememberIndex])

    const changeWord = useCallback(() => {
        const result = Math.floor(prand.unsafeUniformIntDistribution(0, (data?.list?.length ?? 1) - 1, rng))
        setCurrentRememberIndex(result)
    }, [data])

    useKeyPress('alt.s', () => {
        setRemHiddren(!remHiddren)
    })

    const rememberFn = useCallback(() => {
        const index = JSON.stringify(renderCurrentRemember ?? {})
        setRemembered({ ...remembered, [index]: true })
        delete unremembered[index]
        setUnremembered({
            ...unremembered
        })
        changeWord()
    }, [remembered, renderCurrentRemember, data, unremembered])

    useKeyPress('alt.w', () => {
        rememberFn()
    })
    const unrememberFn = useCallback(() => {
        setUnrememveredCount(0)
        setUnremembered({
            ...unremembered, [JSON.stringify(renderCurrentRemember ?? {})]: true
        })
        changeWord()
    }, [renderCurrentRemember, unremembered, data])
    useKeyPress('alt.q', () => {
        unrememberFn()
    })
    useKeyPress('alt.r', () => {
        ttsGetter(renderCurrentRemember?.kana ?? renderCurrentRemember?.word)
    })



    return (
        <div
            style={{
                height: 'calc(100vh - 62px - 2rem)',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            <Row
                gutter={[16, 16]}
            >
                {/* {modalHolder} */}
                <Modal
                    title={<Space>
                        <h5>To Remember</h5>
                        <span>{Object.keys(remembered ?? {}).length} remembered</span>
                        <Popconfirm
                            title="Info"
                            description={<div
                                style={{
                                    maxHeight: '80vh',
                                    overflow: 'auto',
                                }}
                            >
                                <Space
                                    direction='vertical'
                                >
                                    {Object.entries(unremembered ?? {}).map(el => {
                                        const entry = JSON.parse(el[0] ?? "{}")
                                        return (
                                            <Tooltip
                                                key={el[0]}
                                                title={<div>
                                                    <Space
                                                        direction='vertical'
                                                    >
                                                        <div>
                                                            {entry?.kana}
                                                        </div>
                                                        <div>
                                                            {entry?.chineseMeaning?.join(';')}
                                                        </div>
                                                        <div>
                                                            {entry?.wordClass}
                                                        </div>
                                                    </Space>
                                                </div>}
                                            >
                                                <span
                                                    key={el[0]}
                                                >{entry?.word}</span>
                                            </Tooltip>
                                        )
                                    })}
                                </Space>
                            </div>}
                        >
                            <Button
                                danger
                                type="text"
                            >{Object.keys(unremembered ?? {}).length} unremembered</Button>
                        </Popconfirm>

                    </Space>}
                    // width={'80vw'}
                    // height={'80vh'}
                    footer={null}
                    open={rememberModal}
                    onCancel={() => setRememberModal(false)}
                >
                    <Card
                        title={<Space>
                            <h2
                                style={{
                                    fontWeight: 400,
                                    fontSize: '3rem',
                                    whiteSpace: 'break-spaces',
                                }}
                            >{renderCurrentRemember?.word}</h2>
                            <Tooltip
                                title={'Shortcuts: alt + r'}
                            >
                                <Button
                                    icon={<NotificationOutlined />}
                                    loading={ttsLoading}
                                    onClick={() => {
                                        ttsGetter(renderCurrentRemember?.kana ?? renderCurrentRemember?.word)
                                    }}
                                    type="text"></Button>
                            </Tooltip>

                        </Space>}
                    >
                        <Row
                            gutter={[16, 24]}
                        >
                            <Col span={24}>
                                <Row
                                    gutter={[16, 6]}
                                >
                                    <Col span={24}>
                                        <Space>Kana: {remHiddren ? '****' : renderCurrentRemember?.kana}</Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space>Chinese Meaning: {remHiddren ? '****' : renderCurrentRemember?.chineseMeaning?.join('；')}</Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space>Word Class: {remHiddren ? '****' : renderCurrentRemember?.wordClass}</Space>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={24}>
                                <Input.TextArea
                                    placeholder='Just exercise area, no more feature here.'
                                ></Input.TextArea>
                            </Col>
                            <Col span={24}>
                                <Space>
                                    <Tooltip
                                        title="Shortcuts: alt + w"
                                    >
                                        <Button
                                            onClick={() => {
                                                rememberFn()
                                            }}
                                            type="link"
                                        >Ok</Button>
                                    </Tooltip>

                                    <Tooltip
                                        title="Shortcuts: alt + q"
                                    >
                                        <Button
                                            onClick={() => {
                                                unrememberFn()
                                            }}
                                            danger
                                            type="link"
                                        >Nope</Button>
                                    </Tooltip>

                                    <Divider
                                        type="vertical"
                                    ></Divider>
                                    <Tooltip
                                        title="Shortcuts: alt + s"
                                    >
                                        <Button
                                            onClick={() => {
                                                setRemHiddren(!remHiddren)
                                            }}
                                            type="text"
                                            icon={remHiddren ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                        >{!remHiddren ? 'To Hidden' : 'To Visible'}</Button>
                                    </Tooltip>

                                </Space>
                            </Col>
                        </Row>

                    </Card>
                </Modal>
                <Col span={24}>
                    <Spin
                        spinning={wordsLoading}
                    >
                        <Form
                            form={form}
                            onFinish={() => {

                            }}
                        >
                            <Row gutter={[16, 16]}>
                                <Col>
                                    <Space>
                                        <Space.Compact>
                                            <Form.Item
                                                // label="keyword"
                                                noStyle
                                                name="keywords"
                                            >
                                                <Input
                                                    placeholder='Keywords to filter.'
                                                ></Input>
                                            </Form.Item>
                                            <Button
                                            loading={wordsLoading}
                                            onClick={() => {
                                                // countRefresh()
                                                runAsync(1, true)
                                            }}
                                            >Search</Button>
                                        </Space.Compact>

                                        <Button

                                            type={'primary'}
                                            onClick={() => {
                                                changeWord()
                                                setRememberModal(true)
                                            }}
                                        >To Remember</Button>
                                        <Button
                                            type="text"
                                            onClick={() => refresh()}
                                        >
                                            Refresh
                                        </Button>
                                    </Space>
                                </Col>
                                <Col flex={'1 1'}>
                                    <div>
                                        <Form.Item
                                            name="paginationRange"
                                            noStyle
                                        >
                                            <Slider
                                                onChangeComplete={e => {
                                                    runAsync(e, true)
                                                }}
                                                tooltip={{
                                                    formatter(value) {
                                                        return `Start at ${(value - 1) * PAGE_SIZE}th word`;
                                                    },
                                                }}
                                                min={1}
                                                max={Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
                                            ></Slider>
                                        </Form.Item>
                                        {/* <div>
                                        <ProgressMap
                                        data={[1,1,1,23,123,1,123,21,12,312,3,123,12,1]}
                                        ></ProgressMap>
                                        </div> */}
                                    </div>


                                </Col>
                                <Col>
                                    <div style={{ width: '.5rem' }}></div>
                                </Col>
                            </Row>
                        </Form>
                    </Spin>

                </Col>
                <Col span={24}>
                    <InfiniteScroll
                        dataLength={data?.list?.length ?? 0}
                        next={() => runAsync((data?.current ?? 0) + 1)}
                        hasMore={!data?.isEnd}
                        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                        scrollableTarget="scrollableDiv"
                        // height={'calc(100% - 64px)'}
                        height={'80vh'}
                    >
                        <List
                            grid={{
                                gutter: 16,
                                xs: 1,
                                sm: 2,
                                md: 2,
                                lg: 3,
                                xl: 4,
                                xxl: 4,
                            }}
                            dataSource={data?.list}
                            renderItem={(item, index) => (
                                <List.Item key={item.kana + item.word + item.wordClass + index}>
                                    <Card
                                        tabIndex={0}
                                        title={<div
                                        className={styles.card}
                                        style={{
                                            fontWeight: 400,
                                            fontSize: 24,
                                        }}
                                        >{item.word}</div> }
                                        extra={<Space>
                                            {(JSON.stringify(item ?? {}) in { ...remembered, ...unremembered }) ? undefined : <Tooltip
                                                title="Never encoutered the word in Remember Card"
                                            >
                                                <WarningOutlined />
                                            </Tooltip>}

                                        </Space>}
                                    >
                                        <Card.Meta title={item.kana} description={<Row
                                            gutter={8}
                                        >
                                            <Col span={24}>Word Class: {item.wordClass}</Col>
                                            <Col span={24}>
                                                <Space
                                                    wrap={true}
                                                    size={'small'}
                                                >
                                                    {item.chineseMeaning?.map((word, index) => {
                                                        return <Tag
                                                            key={word + index}
                                                            title={word}
                                                            color="blue"
                                                        >{word}</Tag>
                                                    })}

                                                </Space></Col>
                                        </Row>} />

                                    </Card>
                                    {(index + 1) % PAGE_SIZE === 0 ? <Divider></Divider> : undefined}


                                </List.Item>
                            )}
                        />
                    </InfiniteScroll>
                </Col>

            </Row>
        </div>

    )
}
