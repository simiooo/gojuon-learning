import { useEventEmitter, useEventListener, useKeyPress, useLocalStorageState, useRequest } from 'ahooks'
import { Avatar, Button, Card, Col, Descriptions, Divider, Input, List, message, Modal, Row, Skeleton, Space, Tag } from 'antd'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroll-component';

import prand from 'pure-rand';
import { AudioMutedOutlined, AudioOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
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
    const [remHiddren, setRemHiddren] = useState<boolean>(true)
    const [currentRememberIndex, setCurrentRememberIndex] = useState(0)

    const audioRef = useRef<HTMLAudioElement>()

    const {data: ttsData, runAsync: ttsGetter, loading: ttsLoading} = useRequest(async (text?: string) => {
        if(!text) {
            throw Error('Please choose text to submit')
        }
        
        const res = await axios.post('/api/tts', {
            voice: 'coqui-tts:ja',
            text: text,
            cache: false,
        })
        if(!!ttsData) {
            URL.revokeObjectURL(ttsData)
        }
        const url = URL.createObjectURL(res?.data)
        return url
    }, {
        manual: true,
        onSuccess(data) {
            audioRef.current.src = data
            audioRef.current.play()
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

    const changeWord = useCallback(() => {
        const result = Math.floor(prand.unsafeUniformIntDistribution(0, (data?.list?.length ?? 1) - 1, rng))
        console.log(result, "<---- word index")
        setCurrentRememberIndex(result)
    }, [data])

    useKeyPress('alt.d', () => {
        setRemHiddren(!remHiddren)
    })
    useKeyPress('alt.w', () => {
        setRemembered({ ...remembered, [JSON.stringify(renderCurrentRemember ?? {})]: true })
        changeWord()
    })
    useKeyPress('alt.q', () => {
        changeWord()
    })
    const renderCurrentRemember = useMemo(() => {
        return cacheData[currentRememberIndex]
    }, [cacheData, currentRememberIndex])

    return (
        <div
            style={{
                height: 'calc(100vh - 62px - 2rem)',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            <audio 
            ref={audioRef}
            style={{display: 'none'}}
            
            ></audio>
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
                            
                            <Button 
                            icon={<AudioMutedOutlined />}
                            loading={ttsLoading}
                            onClick={() => {
                                ttsGetter(renderCurrentRemember?.word)
                            }}
                            type="text"></Button>
                        </Space> }
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
                                    <Button
                                        onClick={() => {
                                            setRemembered({ ...remembered, [JSON.stringify(renderCurrentRemember ?? {})]: true })
                                            changeWord()
                                        }}
                                        type="link"
                                    >Ok</Button>
                                    <Button
                                        onClick={() => {
                                            changeWord()
                                        }}
                                        danger
                                        type="link"
                                    >Nope</Button>
                                    <Divider
                                        type="vertical"
                                    ></Divider>
                                    <Button
                                        onClick={() => {
                                            setRemHiddren(!remHiddren)
                                        }}
                                        type="text"
                                        icon={remHiddren ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    >{!remHiddren ? 'To Hidden' : 'To Visible'}</Button>
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
                    >Start Remember</Button>
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
