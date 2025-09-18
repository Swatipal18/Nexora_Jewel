import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from '../supplier/Supplier.module.css';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';

export default function Coupon() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [ItemsID, setItems] = useState([]);

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const selectedItem = watch('ItemId');
  const selectedCategory = watch('categoryId');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(`${baseUrl}/categories/getAll`, { params: { page: 1, limit: 300 } });

        setCategories(response.data.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories", { theme: "dark" });
      }
    };

    fetchCategories();
  }, []);


  useEffect(() => {
    const fetchItemId = async () => {
      try {
        const response = await axiosInstance.get(`${baseUrl}/item/getAll`, { params: { page: 1, limit: 100 } });
        // console.log(response)
        setItems(response.data.data.items);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories", { theme: "dark" });
      }
    };

    fetchItemId();
  }, []);
  const onSubmit = async (data) => {
    setLoading(true);

    const hasItem = !!data.ItemId;
    const hasCategory = !!data.categoryId;

    // if (data.categoryId && data.ItemId) {
    //   toast.error("You can't select both Category and Item. Please choose only one.", { theme: "dark" });
    //   return;
    // }

    const payload = {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      usageLimit: Number(data.usageLimit),
      usedCount: 0,
      validFrom: new Date(data.validFrom).toISOString(),
      validTo: new Date(data.validTo).toISOString(),
      ...(hasItem ? { itemId: data.ItemId || null } : { categoryId: data.categoryId || null }),
    };

    try {
      await axiosInstance.post(`${baseUrl}/coupon/create`, payload);
      toast.success("Coupon added!", { theme: "dark", autoClose: 1500 });
      reset();
      navigate('/AllCoupon');
    } catch (e) {
      const errorMessage = e?.response?.data?.message || "Something went wrong!";
      toast.error(`${errorMessage}`, { theme: "dark", autoClose: 7000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-5 fw-bold">Create Coupon</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={`row g-3 ${styles.SupplierForm}`}>
          <div className="col-md-6">
            <label className="form-label " >Code</label>
            <input type="text" className="form-control text-uppercase"
              placeholder='Coupon Code'
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              {...register('code', { required: true })} />
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
            <input type="number" className="form-control"
              placeholder='Discount Value'
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              {...register('discountValue', { required: true })} />
            {errors.discountValue && <span className="text-danger">Discount value is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Item</label>
            <select className="form-select" {...register('ItemId')} disabled={!!selectedCategory}>
              <option value="">Select Item</option>
              {ItemsID?.length > 0 && ItemsID.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.itemName}
                </option>
              ))}
            </select>
          </div>


          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select className="form-select" {...register('categoryId')} disabled={!!selectedItem}>
              <option value="">Select Category</option>
              {categories?.length > 0 && categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>


          <div className="col-md-6">
            <label className="form-label">Usage Limit</label>
            <input type="number" className="form-control"
              placeholder='Usage Limit'
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              {...register('usageLimit', { required: true })} />
            {errors.usageLimit && <span className="text-danger">Usage limit is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Valid To</label>
            <input type="date" className="form-control"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              {...register('validTo', { required: true })}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.validTo && <span className="text-danger">Valid to date is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Valid From</label>
            <input type="date" className="form-control"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              {...register('validFrom', { required: true })}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.validFrom && <span className="text-danger">Valid from date is required</span>}
          </div>



          <div className="col-12 mt-3">
            <button type="submit" className="btn " disabled={loading}
              style={{ backgroundColor: 'var(--text-black, #55142A)', color: 'var(--white, #FFF3E3)', boxShadow: '0 4px 6px #71213c87' }}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

