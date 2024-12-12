import React from 'react';
import { Form, Input, Button, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import styles from './index.module.css';

interface LoginForm {
  username: string;
  pwd: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: LoginForm) => {
    try {
      const response = await axios.post('/login', values);
      if (response.data.success) {
        message.success('登录成功！');
        // 这里可以添加登录成功后的路由跳转
      } else {
        message.error(response.data.message || '登录失败，请重试！');
      }
    } catch (error) {
      message.error('登录失败，请检查网络连接！');
    }
  };

  return (
    <Row className={styles['login-container']}>
      <Col xs={24} sm={24} md={12} lg={8} xl={6} className={styles["login-form"]}>
        <Row>
          <Col span={24}>
            <h2>用户登录</h2>
          </Col>
        </Row>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row>
            <Col span={24}>
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名！' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名" 
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                name="pwd"
                rules={[{ required: true, message: '请输入密码！' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  登录
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
  );
};

export default Login;
