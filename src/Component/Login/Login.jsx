import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from './Login.module.css';
import logo from '../../assets/images/LOGO.png';
import { useNavigate } from 'react-router-dom';
import {
  isMobile,
  isTablet,
  isDesktop,
  browserName,
  osName,
  deviceType,
} from "react-device-detect";
import { getFcmToken } from '../../firebase';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { useDispatch } from 'react-redux';
import { setToken } from '../../store/authSlice';
import { messaging } from '/src/firebase.js';

const Login = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()



  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const generateDeviceId = () => {
    return `${browserName}${osName}${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  };

  let savedDeviceId = localStorage.getItem("deviceId");
  if (!savedDeviceId) {
    savedDeviceId = generateDeviceId();
    localStorage.setItem("deviceId", savedDeviceId);
  }

  const deviceInfo = {
    deviceId: savedDeviceId,
    deviceType: deviceType,
    isMobile: isMobile,
    isTablet: isTablet,
    isDesktop: isDesktop,
    browserName: browserName,
    osName: osName,
  };

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.warn("Notification permission denied.");
        }
      });
    }
  }, []);


  const onSubmit = async (data) => {
    setLoading(true);
    // console.log('data: ', data);
    const fcmToken = await getFcmToken();
    let detail = {
      userName: data.username,
      password: data.password,
      deviceId: deviceInfo.deviceId,
      fcmToken: fcmToken || "no_token",
      deviceType: "web"
    }
    try {
      const response = await axiosInstance.post(`${baseUrl}/admin/login`, detail);
      // console.log("response", response)
      const token = response.data.data.accessToken;
      dispatch(setToken(token))
      const userId = response.data.data.id;

      localStorage.setItem("UserId", userId);
      localStorage.setItem("authToken", token);
      reset();
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 1000,
        theme: "colored",
      });

      setTimeout(() => {
        navigate("/Admin");
      }, 1200);
    } catch (err) {
      console.log(err);
      let errorMessage = "An error occurred. Please try again.";
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      }
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.loginBox}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo" className="img-fluid w-50" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Username</label>
            <input
              type="text"
              {...register('username', { required: true })}
              placeholder="Enter your username"
            />
            {errors.username && <span className={styles.error}>Username is required</span>}
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={show ? 'text' : 'password'}
                {...register('password', { required: true })}
                placeholder="Enter your password"
              />
              <span className={styles.eyeIcon} onClick={() => setShow(!show)}>👁️</span>
            </div>
            {errors.password && <span className={styles.error}>Password is required</span>}
          </div>

          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? "Logging in..." : "Login"}</button>
          {/* <p className={styles.forgot}>Forgot Username or Password?</p> */}
        </form>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"

      />
    </div>
  );
};

export default Login;
