import { WarningOutlined } from '@ant-design/icons'
import { useKeyPress, useLocalStorageState, useRequest } from 'ahooks'
import { Button, Card, Col, Divider, List, Row, Skeleton, Space, Tag, Tooltip } from 'antd'
import axios from 'axios'
import prand from 'pure-rand'
import React, { useCallback, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import TaskModal, { RenderCurrentRemember } from '../../components/TaskModal'
type Explanation = {
    content?: string;
    example?: string;
    extra?: string;
};

type GrammarItem = {
    _id: string;
    grammarSchema?: string;
    explanation?: Explanation[];
    tags?: string[];
};
const PAGE_SIZE = 200
const seed = Date.now() ^ (Math.random() * 0x100000000);
const rng = prand.xoroshiro128plus(seed);
const UN_REMEMBERED_COUNT_UPPER = 4
export default function Grammar() {
    const [cacheData, setCacheData] = useLocalStorageState<GrammarItem[]>("grammar", { defaultValue: [] })
    const [remembered, setRemembered] = useLocalStorageState<{ [key: string]: boolean }>('rememberedGrammar', { defaultValue: {} })
    const [unremembered, setUnremembered] = useLocalStorageState<{ [key: string]: boolean }>('unrememberedGrammar', { defaultValue: {} })
    const [unrememberedCount, setUnrememveredCount] = useState<number>(0)
    const [currentRememberIndex, setCurrentRememberIndex] = useState(0)

    const [modalOpen, setModalOpen] = useState<boolean>(false)
    
    

    const { data, runAsync, loading: grammarLoading, refresh } = useRequest(async (current: number = 1, init?: boolean) => {
        try {
            const res = await axios.post<{
                isEnd?: boolean,
                data?: GrammarItem[], total: number
            }>('/api/v1/grammar', {
                pageSize: PAGE_SIZE,
                current,
            })
            const result: { total: number, list: GrammarItem[], current?: number, isEnd?: boolean } = {
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
        // manual: true,
    })

    const renderCurrentRemember = useMemo<RenderCurrentRemember>(() => {
        const unrememberedEntries = Object.entries(unremembered ?? {})
        if (unrememberedCount > UN_REMEMBERED_COUNT_UPPER && unrememberedEntries.length > 0) {
            setUnrememveredCount(0)

            const result = Math.floor(prand.unsafeUniformIntDistribution(0, Math.max((unrememberedEntries?.length ?? 1), 1) - 1, rng))
            const record = data?.list?.[currentRememberIndex]
            return {
                id: record?._id,
                title: record?.grammarSchema,
                content: record?.explanation?.map?.(el => {
                    return [
                        ["Content", el.content],
                        ["Example", el.example],
                        ["Extra", el.extra],
                    ]
                }).flat() as [string, string][]
            }
        }
        setUnrememveredCount(unrememberedCount + 1)
        const result = data?.list?.[currentRememberIndex]
        return {
            id: result?._id,
            title: result?.grammarSchema,
            content: result?.explanation?.map?.(el => {
                return [
                    ["Content", el.content],
                    ["Example", el.example],
                    ["Extra", el.extra],
               
                ]
            }).flat() as [string, string][]
        }
    }, [data, currentRememberIndex])

    const unrememberFn = useCallback((id: string) => {
        setUnremembered({ ...unremembered, [id]: true })
        delete remembered[id]
        setRemembered({...remembered})
        changeWord()
    }, [renderCurrentRemember, unremembered, data])
    const rememberFn = useCallback((id: string) => {
        setRemembered({ ...remembered, [id]: true })
        delete unremembered[id]
        setUnremembered({...unremembered})
        changeWord()
    }, [remembered, renderCurrentRemember, data, unremembered])

    const changeWord = useCallback(() => {
        const result = Math.floor(prand.unsafeUniformIntDistribution(0, (data?.list?.length ?? 1) - 1, rng))
        setCurrentRememberIndex(result)
    }, [data])


    return (
        <div
            style={{
                height: 'calc(100vh - 62px - 2rem)',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            <TaskModal
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false)
                }}
                remembered={remembered}
                unremembered={unremembered}
                renderCurrentRemember={renderCurrentRemember}
                rememberFn={function (id): void {
                    rememberFn(id)
                }}
                unrememberFn={function (id): void {
                    unrememberFn(id)
                }}
            >

            </TaskModal>
            <Row>
                <Col span="24">
                    <Space>
                        <Button
                            loading={grammarLoading}
                            onClick={() => {
                                refresh()
                            }}
                        // type="text"

                        >
                            Refresh
                        </Button>
                        <Button
                        onClick={() => {
                            changeWord()
                            setModalOpen(true)
                        }}
                        >To Remember</Button>
                    </Space>
                </Col>
                <Col span="24">
                    <div>
                        <InfiniteScroll
                            dataLength={data?.list?.length ?? 0}
                            next={() => runAsync((data?.current ?? 0) + 1)}
                            hasMore={!data?.isEnd}
                            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                            endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                            scrollableTarget="scrollableDiv"
                            // height={'calc(100% - 64px)'}
                            style={{
                                padding: '1rem 1rem 1rem 0rem'
                            }}
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
                                    <List.Item key={item.grammarSchema}>
                                        <Card
                                            style={{
                                                height: '28rem',
                                                // height:'100%',
                                                overflow: 'auto',
                                            }}
                                            title={
                                                <div
                                                    style={{
                                                        whiteSpace: 'break-spaces'
                                                    }}
                                                >
                                                    {item.grammarSchema}
                                                </div>
                                            }
                                            extra={<Space>


                                            </Space>}
                                        >
                                            <div
                                                style={{

                                                }}
                                            >
                                                <Card.Meta description={<Row
                                                    gutter={8}
                                                >
                                                    {
                                                        item?.explanation?.map((explanation, index, thisArr) => {
                                                            return <Col key={explanation?.content} span={24}>

                                                                <Row>
                                                                    <Col span={24}><strong>
                                                                        <span>{index + 1}. </span>
                                                                        {explanation?.content}</strong> </Col>
                                                                    <div
                                                                        style={{
                                                                            height: '.5rem',
                                                                            width: '1px'
                                                                        }}
                                                                    ></div>
                                                                    <Col span={24}>{explanation?.example}</Col>
                                                                    <Col span={24}>{explanation?.extra}</Col>
                                                                </Row>
                                                                {index + 1 != thisArr.length && <Divider></Divider>}
                                                            </Col>
                                                        })
                                                    }

                                                </Row>} />
                                            </div>


                                        </Card>
                                        {(index + 1) % PAGE_SIZE === 0 ? <Divider></Divider> : undefined}


                                    </List.Item>
                                )}
                            />
                        </InfiniteScroll>
                    </div>
                </Col>
            </Row>
        </div>
    )
}
