import React, { useState } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Form, Input, Card, message } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthService } from '../../service/authService';

const ResetPassword: React.FC = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const email = searchParams.get('email');
    const code = searchParams.get('code');

    const onFinish = async (values: { password: string; confirmPassword: string }) => {
        if (!email || !code) {
            message.error('Link không hợp lệ hoặc thiếu thông tin.');
            return;
        }

        setLoading(true);
        const result = await AuthService.resetPassword(
            email,
            code,
            values.password,
            values.confirmPassword
        );
        setLoading(false);

        if (result.success) {
            message.success('Change password successfull. Navigate to login');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            message.error(result.error || 'Change password failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 mr-[750px] mt-[-65px]">
            <img
                src="/Picture1.jpg"
                alt="Background"
                className="absolute inset-0 w-full h-[100%] -z-10"
            />
            <Card className="w-full max-w-md bg-white rounded-xl shadow-2xl !bg-gray-200">
                <h2 className="text-3xl font-extrabold text-center text-gray-700 mb-2">
                    Reset Password
                </h2>
                <br />
                <h1 className="text-gray-600 mb-6 text-left">
                    Password requires 8 characters or more, with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
                </h1>
                <br />
                <Form className="space-y-4" form={form} onFinish={onFinish}>
                    <Form.Item
                        name="password"
                    >
                        <div>
                            <div className="text-sm font-medium text-gray-700 flex items-center mb-1">
                                Password <span className="text-red-600 ml-1">*</span>
                            </div>
                            <Input.Password
                                placeholder="Enter password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                iconRender={(visible) => 
                                    visible ? <EyeOutlined className="h-5 w-5" /> : <EyeInvisibleOutlined className="h-5 w-5" />
                                }
                                visibilityToggle={{
                                    visible: passwordVisible,
                                    onVisibleChange: setPasswordVisible,
                                }}
                            />
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <div>
                            <div className="text-sm font-medium text-gray-700 flex items-center mb-1">
                                Confirm Password <span className="text-red-600 ml-1">*</span>
                            </div>
                            <Input.Password
                                placeholder="Enter confirm password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                iconRender={(visible) => 
                                    visible ? <EyeOutlined className="h-5 w-5" /> : <EyeInvisibleOutlined className="h-5 w-5" />
                                }
                                visibilityToggle={{
                                    visible: confirmPasswordVisible,
                                    onVisibleChange: setConfirmPasswordVisible,
                                }}
                            />
                        </div>
                    </Form.Item>

                    <Button
                        htmlType="submit"
                        loading={loading}
                        className="w-full bg-green-400 text-white font-bold py-6 rounded-lg hover:!bg-green-500 hover:!text-white transition duration-200 shadow-md hover:shadow-lg text-lg"
                    >
                        Change Password
                    </Button>
                </Form>
            </Card>
        </div>
    );
}

export default ResetPassword;