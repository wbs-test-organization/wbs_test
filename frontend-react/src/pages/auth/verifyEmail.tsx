import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../../service/authService'; 

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const email = searchParams.get('email');
    const code = searchParams.get('code');

    if (!email || !code) {
      return;
    }

    // Gọi API xác thực
    const verify = async () => {
      try {
        const result = await AuthService.verifyEmail(email, code);
        
        if (result.success) {
          setStatus('success');
          setMessage('Tài khoản của bạn đã được kích hoạt thành công!');
          
          // Chuyển hướng về trang đăng nhập sau 3 giây
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Xác thực thất bại. Vui lòng thử lại.');
        }
      } catch (error) {
        console.log("Error when verigy email", error);
        setStatus('error');
        setMessage('Có lỗi xảy ra trong quá trình xác thực.');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 max-w-md w-full text-center">
        
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <h2 className="text-2xl font-semibold text-gray-800">Đang xác thực...</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600">Xác thực thành công!</h2>
            <p className="text-gray-600 leading-relaxed">{message}</p>
            <p className="text-sm text-gray-400">
              Bạn sẽ được chuyển đến trang đăng nhập trong 3 giây...
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600">Xác thực thất bại</h2>
            <p className="text-gray-600 leading-relaxed">{message}</p>
            <button 
              onClick={() => navigate('/register')}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Quay lại đăng ký
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default VerifyEmailPage;