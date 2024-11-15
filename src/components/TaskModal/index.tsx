import { EyeInvisibleOutlined, EyeOutlined, NotificationOutlined } from '@ant-design/icons';
import { useKeyPress } from 'ahooks';
import { Button, Card, Col, Divider, Input, Modal, ModalProps, Popconfirm, Row, Space, Tooltip } from 'antd'
import React, { useState } from 'react'
export interface RenderCurrentRemember {
    title: string; id: string; content: [string, string][]
}
interface TaskModalProps extends ModalProps {
    remembered: object;
    unremembered: object;
    renderCurrentRemember: RenderCurrentRemember;
    rememberFn: (id: string) => void;
    unrememberFn: (id: string) => void;
}
export default function TaskModal(p: TaskModalProps) {
    const { remembered, unremembered, open, onCancel, renderCurrentRemember, rememberFn, unrememberFn, ...others } = p
    const [remHiddren, setRemHiddren] = useState<boolean>(true)
    useKeyPress('alt.q', () => {
        unrememberFn(renderCurrentRemember?.id)
    })
    useKeyPress('alt.w', () => {
        rememberFn(renderCurrentRemember?.id)
    })
    useKeyPress('alt.s', () => {
        setRemHiddren(!remHiddren)
    })
    return (
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
                        {/* <Space
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
                        </Space> */}
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
            open={open}
            onCancel={onCancel}
        >
            <Card
                title={<Space>
                    <h2
                        style={{
                            fontWeight: 400,
                            fontSize: '3rem',
                            whiteSpace: 'break-spaces',
                        }}
                    >{renderCurrentRemember?.title}</h2>
                    {/* <Tooltip
                        title={'Shortcuts: alt + r'}
                    >
                        <Button
                            icon={<NotificationOutlined />}
                            loading={ttsLoading}
                            onClick={() => {
                                ttsGetter(renderCurrentRemember?.kana ?? renderCurrentRemember?.word)
                            }}
                            type="text"></Button>
                    </Tooltip> */}

                </Space>}
            >
                <Row
                    gutter={[16, 24]}
                >
                    <Col span={24}>
                        <Row
                            gutter={[16, 6]}
                        >

                            {renderCurrentRemember.content?.map((content, index) => (
                                <Col span={24}
                                    key={index}
                                >
                                    <Space>{content?.[0]}: {remHiddren ? '****' : content?.[1]}</Space>
                                </Col>
                            ))}
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
                                        rememberFn(renderCurrentRemember?.id)
                                    }}
                                    type="link"
                                >Ok</Button>
                            </Tooltip>

                            <Tooltip
                                title="Shortcuts: alt + q"
                            >
                                <Button
                                    onClick={() => {
                                        unrememberFn(renderCurrentRemember?.id)
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
    )
}
