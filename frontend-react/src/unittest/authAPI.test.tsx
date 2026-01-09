import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest'; 
import axios from 'axios';
import { loginAPI, registerAPI, verifyEmailAPI } from '../api/authAPI';

// 1. Mock axios
vi.mock('axios');

// 2. Ép kiểu sử dụng import type vừa khai báo
const mockedAxios = axios as Mocked<typeof axios>;

describe('Auth API Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginAPI', () => {
    const loginData = { loginName: 'testuser', passWord: 'password123' };

    it('gọi đúng URL và trả về dữ liệu khi login thành công', async () => {
      const mockResponse = {
        data: {
          token: 'fake-token',
          message: 'Login success',
          success: true,
          user: { memberId: '1', memberFullName: 'Test User' }
        }
      };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await loginAPI(loginData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5075/api/auth/login',
        loginData
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('ném ra lỗi khi API login thất bại', async () => {
      const error = new Error('Network Error');
      mockedAxios.post.mockRejectedValue(error);

      await expect(loginAPI(loginData)).rejects.toThrow('Network Error');
    });
  });

  describe('registerAPI', () => {
    const registerData = {
      loginName: 'newuser',
      memberFullName: 'New User',
      email: 'new@gmail.com',
      passWord: 'password123'
    };

    it('gọi đúng URL và trả về dữ liệu User khi register thành công', async () => {
      const mockResponse = {
        data: { memberId: '2', email: 'new@gmail.com', loginName: 'newuser' }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await registerAPI(registerData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5075/api/auth/register',
        registerData
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('ném ra lỗi khi API register thất bại', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Register Failed'));
      await expect(registerAPI(registerData)).rejects.toThrow('Register Failed');
    });
  });

  describe('verifyEmailAPI', () => {
    const email = 'test@gmail.com';
    const code = '123456';

    it('gọi đúng URL với params và trả về dữ liệu khi verify thành công', async () => {
      const mockResponse = {
        data: { memberId: '1', isActive: true }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await verifyEmailAPI(email, code);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5075/api/auth/verify-email',
        { params: { email, code } }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('ném ra lỗi khi verify email thất bại', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Invalid Code'));
      await expect(verifyEmailAPI(email, code)).rejects.toThrow('Invalid Code');
    });
  });
});