import React, { useState } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from "../../service/authService";
import { type LoginRequest } from "../../api/authAPI";
import { Button, Form, Input, Card, message } from 'antd';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);

    const [formData, setFormData] = useState<LoginRequest>({
        loginName: "",
        passWord: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordVisibilityToggle = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = async () => {
        try {
            const result = await AuthService.login(formData);

            if (result.success) {
                message.success("Login successfully!");
                setTimeout(() => {
                    navigate("/dashboard");
                }, 500);
            } else {
                message.error("Username or password not match");
            }
        } catch (error) {
            console.log("Error when login", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center mr-[800px] mt-[-30px]">
            <img
                src="/Picture1.jpg"
                alt="Background"
                className="absolute inset-0 w-full h-[105%]"
            />

            <Card className="flex items-center justify-center bg-gray-200">
                <h2 className="text-3xl font-extrabold text-center text-gray-700 mb-6">
                    Login WBBBSS System
                </h2>
                <Form className="space-y-4" onFinish={handleSubmit}>
                    <div className="space-y-1">
                        <Form.Item className="text-sm font-medium text-gray-700 flex items-center mb-[-5px]">
                            Username <span className="text-red-600 ml-1">*</span>
                        </Form.Item>
                        <Input
                            type="text"
                            name="loginName"
                            value={formData.loginName}
                            onChange={handleChange}
                            required
                            placeholder="Enter username"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="space-y-1">
                        <Form.Item className="text-sm font-medium text-gray-700 flex items-center mb-[-5px]">
                            Password <span className="text-red-600 ml-1">*</span>
                        </Form.Item>
                        <div className="relative">
                            <Input
                                type={passwordVisible ? "text" : "password"}
                                name="passWord"
                                value={formData.passWord}
                                onChange={handleChange}
                                required
                                placeholder="Enter password"
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            />
                            <button
                                onClick={handlePasswordVisibilityToggle}
                                className="absolute inset-y-2 right-1 flex items-center pr-3 text-gray-500 hover:text-gray-700 border-white hover:border-white active:border-white"
                            >
                                {passwordVisible ? (
                                    <EyeInvisibleOutlined className="h-5 w-5 " />
                                ) : (
                                    <EyeOutlined className="h-5 w-5 " />
                                )}
                            </button>
                        </div>

                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-green-600 font-medium hover:underline transition"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <Button
                        htmlType="submit"
                        className="w-full bg-green-400 text-white font-bold py-6 rounded-lg hover:!bg-green-500 hover:!text-white transition duration-200 shadow-md hover:shadow-lg text-lg"
                    >
                        Login
                    </Button>
                </Form>
                <p className="text-center text-sm text-gray-600 mt-5">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-semibold text-green-600 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </Card>
            <br></br>
            <Card className="bg-gray-200">
                <div className="max-w-4xl mx-auto text-left text-gray-600">
                    <img
                        src="/logo.png"
                        alt="WBS Logo"
                        className="h-12 mx-auto mb-3 object-contain"
                    />
                    <p className="font-semibold text-xl text-gray-800 mb-2">Contact us:</p>
                    <div className="font-semibold text-sm space-y-1">
                        <p>TEL: +84 (0)234 658332</p>
                        <p>SALE: +84 971 652 334</p>
                        <p>EMAIL: sales@brycen.com.vn</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Login;