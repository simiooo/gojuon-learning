import { useLocalStorageState, useRequest } from 'ahooks'
import { Avatar, Button, Card, Col, Descriptions, Divider, List, message, Modal, Row, Skeleton, Space, Tag } from 'antd'
import React, { useState } from 'react'
import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroll-component';

import prand from 'pure-rand';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

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
    const [remHiddren ,setRemHiddren] = useState<boolean>(true)
    const [currentRememberIndex, setCurrentRememberIndex] = useState(0)

    const { data, runAsync } = useRequest(async () => {
        try {
            const res = await axios.post<{ data?: Word[], total: number }>('/api/v1/vocabulary', {
                pageSize: 40,
                current: 1,
            })
            const result: { total: number, list: Word[] } = { total: res?.data?.total ?? 0, list: [...(data?.list ?? []), ...(res.data.data ?? [])] }
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

    const changeWord = () => {
        const result = Math.floor(prand.unsafeUniformIntDistribution(0, (data?.list?.length ?? 1) - 1, rng))
        setCurrentRememberIndex(result)

    }


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
                    title="To Remeber"
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
                        next={() => runAsync()}
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
