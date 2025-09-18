import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from '../../supplier/Supplier.module.css';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';

export default function EditCoupon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [couponData, setCouponData] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      code: '',
      discountType: '',
      discountValue: '',
      itemId: '',
      categoryId: '',
      usageLimit: '',
      validFrom: '',
      validTo: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [itemRes, catRes, couponRes] = await Promise.all([
          axiosInstance.get(`${baseUrl}/item/getAll`, { params: { page: 1, limit: 100 } }),
          axiosInstance.get(`${baseUrl}/item/categories`),
          axiosInstance.get(`${baseUrl}/coupon/get/${id}`),
        ]);

        const itemsData = Array.isArray(itemRes.data) ? itemRes.data : itemRes.data.data.items || [];

        const categoriesData = Array.isArray(catRes.data) ? catRes.data : catRes.data.data.categories || [];
        const coupon = couponRes.data.data;
        // console.log('coupon: ', coupon);


        setItems(itemsData);
        setCategories(categoriesData);

        const formattedCoupon = {
          code: coupon.code || '',
          discountType: coupon.discountType || '',
          discountValue: coupon.discountValue || '',
          itemId: coupon.itemId?._id || coupon.itemId || null,
          categoryId: coupon.categoryId?._id || coupon.categoryId || null,
          usageLimit: coupon.usageLimit || '',
          validFrom: coupon.validFrom?.split('T')[0] || '',
          validTo: coupon.validTo?.split('T')[0] || '',
        };

        setCouponData(formattedCoupon);
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };

    fetchAllData();
  }, [id]);

  useEffect(() => {
    if (couponData && items.length && categories.length) {
      reset(couponData);
      // console.log('couponData.itemId:', couponData.itemId);
      // console.log('items:', items.map(i => ({ id: i._id, name: i.itemName })));
    }
  }, [couponData, items, categories, reset]);


  const onSubmit = async (data) => {

    const payload = {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      usageLimit: Number(data.usageLimit),
      validFrom: new Date(data.validFrom).toISOString(),
      validTo: new Date(data.validTo).toISOString(),
      itemId: data.itemId || null,
      categoryId: data.categoryId || null
    };
    try {
      setLoading(true);
      await axiosInstance.put(`${baseUrl}/coupon/update/${id}`, payload);
      toast.success('Coupon updated successfully');
      navigate('/AllCoupon');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(`${errorMessage}`, { theme: "dark", autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-5 fw-bold">Edit Coupon</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={`row g-3 ${styles.SupplierForm}`}>
          <div className="col-md-6">
            <label className="form-label">Code</label>
            <input type="text" className="form-control" {...register('code', { required: true })}
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
            />
            {errors.code && <span className="text-danger">Code is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Discount Type</label>
            <select className="form-select" {...register('discountType', { required: true })}>
              <option value="">Select Type</option>
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>
            </select>
            {errors.discountType && <span className="text-danger">Discount type is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Discount Value</label>
            <input type="number" className="form-control" {...register('discountValue', { required: true })}
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }} />
            {errors.discountValue && <span className="text-danger">Discount value is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Item</label>
            <select className="form-select" {...register('itemId')}>
              <option value="">Select Item</option>
              {items?.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.itemName || item.name || item._id}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select className="form-select" {...register('categoryId')}>
              <option value="">Select Category</option>
              {categories?.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Usage Limit</label>
            <input type="number" className="form-control" {...register('usageLimit', { required: true })}
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
            />
            {errors.usageLimit && <span className="text-danger">Usage limit is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Valid To</label>
            <input type="date" className="form-control" {...register('validTo', { required: true })}
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
            />
            {errors.validTo && <span className="text-danger">Valid to date is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Valid From</label>
            <input type="date" className="form-control" {...register('validFrom', { required: true })}
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
            />
            {errors.validFrom && <span className="text-danger">Valid from date is required</span>}
          </div>



          <div className="col-12 mt-3">
            <button type="submit" className="btn " disabled={loading}
              style={{ backgroundColor: 'var(--text-black, #55142A)', color: 'var(--white, #FFF3E3)', boxShadow: '0 4px 6px #71213c87' }}>

              {loading ? "Submitting..." : "Update"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
