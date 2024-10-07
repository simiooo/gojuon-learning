import { useEventEmitter, useEventListener, useKeyPress, useLocalStorageState, useRequest } from 'ahooks'
import { Avatar, Button, Card, Col, Descriptions, Divider, Input, List, message, Modal, Row, Skeleton, Space, Tag } from 'antd'
import React, { useCallback, useState } from 'react'
import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroll-component';

import prand from 'pure-rand';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
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
            return result
        } catch (error) {
            console.log(error);
        }

    }, {
        onSuccess() {
            setCacheData(data?.list ?? [])
        },
        // manual: true,
    })

    const changeWord = useCallback(() => {
        console.log(data?.list?.length)
        const result = Math.floor(prand.unsafeUniformIntDistribution(0, (data?.list?.length ?? 1) - 1, rng))
        setCurrentRememberIndex(result)
    }, [data])

    useKeyPress('alt.d', () => {
        setRemHiddren(!remHiddren)
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
                        <h5>To Remeber</h5>
                        <span>{Object.keys(remembered ?? {}).length} remembered</span>
                        </Space>  }
                    // width={'80vw'}
                    // height={'80vh'}
                    footer={null}
                    open={rememberModal}
                    onCancel={() => setRememberModal(false)}
                >
                    <Card
                        title={<h2>{cacheData[currentRememberIndex]?.word}</h2>}
                    >
                        <Row
                            gutter={[16, 24]}
                        >
                            <Col span={24}>
                                <Descriptions
                                    items={[
                                        {
                                            label: 'Kana',
                                            children: remHiddren ? '****' : cacheData[currentRememberIndex]?.kana,
                                            span: 24,
                                        },
                                        {
                                            label: 'Chinese Meaning',
                                            children: remHiddren ? '****' : cacheData[currentRememberIndex]?.chineseMeaning?.join('；'),
                                            span: 24,
                                        },
                                        {
                                            label: 'Word Class',
                                            children: remHiddren ? '****' : cacheData[currentRememberIndex]?.wordClass,
                                            span: 24,
                                        },
                                    ]}
                                />
                            </Col>
                            <Col span={24}>
                                <Input.TextArea></Input.TextArea>
                            </Col>
                            <Col span={24}>
                                <Space>
                                    <Button
                                        onClick={() => {
                                            setRemembered({ ...remembered, [JSON.stringify(cacheData?.[currentRememberIndex] ?? {})]: true })
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
                                            <Col span={24}><Space
                                                wrap={true}
                                            >
                                                {item.chineseMeaning?.map(word => {
                                                    return <Tag
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
