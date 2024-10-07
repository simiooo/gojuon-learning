import { useEventEmitter, useEventListener, useInterval, useKeyPress, useLocalStorageState, useRequest } from 'ahooks'
import { Avatar, Button, Card, Col, Descriptions, Divider, Input, List, message, Modal, Row, Skeleton, Space, Tag, Tooltip } from 'antd'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroll-component';

import prand from 'pure-rand';
import { AudioMutedOutlined, AudioOutlined, EyeInvisibleOutlined, EyeOutlined, NotificationOutlined } from '@ant-design/icons';
const PAGE_SIZE = 200
const seed = Date.now() ^ (Math.random() * 0x100000000);
const rng = prand.xoroshiro128plus(seed);
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

    const { data, runAsync } = useRequest(async (current: number = 1) => {
        try {
            const res = await axios.post<{ data?: Word[], total: number }>('/api/v1/vocabulary', {
                pageSize: PAGE_SIZE,
                current,
            })
            const result: { total: number, list: Word[], current?: number } = {
                total: res?.data?.total ?? 0,
                list: [...(data?.list ?? []), ...(res.data.data ?? [])],
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
        // manual: true,
    })
    const [unrememberedCount, setUnrememveredCount] = useState<number>(0)
    const renderCurrentRemember = useMemo(() => {
        const unrememberedEntries = Object.entries(unremembered ?? {})
        if(unrememberedCount > 7 && unrememberedEntries.length > 0) {
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

    useKeyPress('alt.d', () => {
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
    }, [remembered, renderCurrentRemember, data])

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
    useKeyPress('alt.e', () => {
        ttsGetter(renderCurrentRemember?.kana)
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
                    </Space>}
                    // width={'80vw'}
                    // height={'80vh'}
                    footer={null}
                    open={rememberModal}
                    onCancel={() => setRememberModal(false)}
                >
                    <Card
                        title={<Space>
                            <h2>{renderCurrentRemember?.word}</h2>
                            <Tooltip
                                title={'Shortcuts: alt + e'}
                            >
                                <Button
                                    icon={<NotificationOutlined />}
                                    loading={ttsLoading}
                                    onClick={() => {
                                        ttsGetter(renderCurrentRemember?.kana)
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
                                        title="Shortcuts: alt + d"
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
                    <Space><Button

                        type={'primary'}
                        onClick={() => {
                            changeWord()
                            setRememberModal(true)
                        }}
                    >To Remember</Button>
                    </Space>
                </Col>
                <Col span={24}>
                    <InfiniteScroll
                        dataLength={data?.list?.length ?? 0}
                        next={() => runAsync((data?.current ?? 0) + 1)}
                        hasMore={(data?.list?.length ?? 0) < data?.total}
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
                                <List.Item key={item.kana}>
                                    <Card
                                        title={item.word}
                                        extra={<Space>
                                            {/* <Button
                                        type="link"
                                        size='small'
                                        >Remembered</Button> */}
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
                                                    {item.chineseMeaning?.map(word => {
                                                        return <Tag
                                                            key={word}
                                                            title={word}
                                                            color="blue"
                                                        >{word}</Tag>
                                                    })}

                                                </Space></Col>
                                        </Row>} />

                                    </Card>


                                </List.Item>
                            )}
                        />
                    </InfiniteScroll>
                </Col>

            </Row>
        </div>

    )
}
