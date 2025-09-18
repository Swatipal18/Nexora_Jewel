import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Setting.module.css';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';

export default function Setting() {
  const { register, handleSubmit, watch, reset, formState: { errors, isValid } } = useForm({ mode: "onSubmit" });
  const [visible, setVisible] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const toggle = field => {
    setVisible(v => ({ ...v, [field]: !v[field] }));
  };

  const onSubmit = async (data) => {

    const adminId = localStorage.getItem('UserId');

    if (!adminId) {
      toast.error('Admin ID not found!', { theme: 'dark' });
      return;
    }

    const payload = {
      currentPassword: data.oldPassword,
      newPassword: data.newPassword,
      adminId
    };

    try {
      setLoading(true);
      await axiosInstance.put(`${baseUrl}/admin/change-password`, payload);
      toast.success('Password updated successfully!', { theme: 'dark' });
      reset();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update password', { theme: 'dark' });
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <p className={styles.title}>Manage Password</p>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {['old', 'new', 'confirm']?.map(key => {
            const label = key === 'old' ? 'Old Password' : key === 'new' ? 'New Password' : 'Confirm Password';
            const errorMsg = errors[key + 'Password']?.message;
            return (
              <div className={styles.field} key={key}>
                <label className={styles.label}
                  style={{ backgroundColor: 'var(--paginator-bg)' }}>{label}</label>
                <div className={styles.inputGroup}>
                  <input
                    type={visible[key] ? 'text' : 'password'}
                    className={styles.input}
                    {...register(key + 'Password', {
                      required: `${label} is required`,
                      ...(key === 'new' && {
                        minLength: {
                          value: 8,
                          message: `${label} must be at least 8 characters`,
                        },
                      }),
                      validate: key === 'confirm'
                        ? value => value === watch('newPassword') || 'Passwords do not match'
                        : undefined
                    })}
                  />
                  <button type="button" onClick={() => toggle(key)} className={styles.eyeBtn}>
                    {visible[key] ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errorMsg && <p className={styles.error}>{errorMsg}</p>}
              </div>
            );
          })}
          <button type="submit" className={styles.submitBtn} >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
