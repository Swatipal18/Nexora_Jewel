import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import styles from '../Supplier.module.css'
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-toastify';


export default function EditSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    register, handleSubmit, reset, formState: { errors }
  } = useForm();



  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;
  useEffect(() => {
    async function fetchSupplier() {
      try {
        const response = await axiosInstance.get(`${baseUrl}/supplier/get/${id}`);
        const supplier = response.data.data;
        reset(supplier);
      } catch (error) {
        console.error("Error fetching supplier:", error);
      }
    }
    fetchSupplier();
  }, [id, reset]);


  const onSubmit = async (formData) => {
    try {
      await axiosInstance.put(`${baseUrl}/supplier/update/${id}`, formData);
      toast.success("Supplier updated successfully!", {
        theme: "dark",
        autoClose: 1500
      });
      navigate("/AllSupplier")
    } catch (error) {
      // console.error("Update failed:", error);
      toast.error("Failed to update supplier.");
    }
  };
  return (
    <div className="container my-4">
      <h2 className="mb-5 fw-bold">Edit Supplier</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={`row g-3 ${styles.SupplierForm}`}>
          <div className="col-md-6">
            <label className="form-label">Party Name</label>
            <input
              type="text"
              className="form-control"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              {...register('partyName', { required: true })}
            />
            {errors.partyName && <span className="text-danger">Party Name is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Party Code</label>
            <input
              type="text" style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('partyCode', { required: true })}
            />
            {errors.partyCode && <span className="text-danger">Party Code is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Firm Name</label>
            <input
              type="text"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('firmName', { required: true })}
            />
            {errors.firmName && <span className="text-danger">Firm Name is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Address</label>
            <input
              type="text" style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('address', { required: true })}
            />
            {errors.address && <span className="text-danger">Address is required</span>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Bank Name</label>
            <input
              type="text"
              className="form-control"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              {...register('accountName', { required: true })}
            />
            {errors.accountName && <span className="text-danger">Bank Name is required</span>}
          </div>
          <div className="col-md-6">
            <label className="form-label">IFSC Code</label>
            <input
              type="text"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('ifscCode', { required: true })}
            />
            {errors.ifscCode && <span className="text-danger">IFSC Code is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Account Holder Name</label>
            <input
              type="text"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('accountHolderName', { required: true })}
            />
            {errors.accountHolderName && <span className="text-danger">Account Holder Name is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Account Number</label>
            <input
              type="number"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('accountNumber', { required: true })}
            />
            {errors.accountNumber && <span className="text-danger">Account Number is required</span>}
          </div>

          <div className="col-md-4">
            <label className="form-label">City</label>
            <input
              type="text"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('city', { required: true })}
            />
            {errors.city && <span className="text-danger">City is required</span>}
          </div>

          <div className="col-md-4">
            <label className="form-label">State</label>
            <input
              type="text"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('state', { required: true })}
            />
            {errors.state && <span className="text-danger">State is required</span>}
          </div>

          <div className="col-md-4">
            <label className="form-label">Pin Code</label>
            <input
              type="number"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('pinCode', { required: true })}
            />
            {errors.pinCode && <span className="text-danger">Pin Code is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Mobile No</label>
            <input
              type="number"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('mobileNo', { required: true })}
            />
            {errors.mobileNo && <span className="text-danger">Mobile No is required</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">GST No</label>
            <input
              type="number"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('gstNo', { required: true })}
            />
            {errors.gstNo && <span className="text-danger">GST No is required</span>}
          </div>

          <div className="col-12">
            <label className="form-label">Reference By</label>
            <input
              type="text"
              style={{ backgroundColor: 'var(--white, #FFF3E3)', border: '1px solid var(--light-black, #55142ac4)', boxShadow: '0 4px 6px #71213c87' }}
              className="form-control"
              {...register('referenceBy')}
            />
          </div>

          <div className="col-12 mt-3">
            <button type="submit" className="btn "
              style={{ backgroundColor: 'var(--text-black, #55142A)', color: 'var(--white, #FFF3E3)', boxShadow: '0 4px 6px #71213c87' }}>
              Submit</button>
          </div>
        </div>
      </form>
    </div>
  )
}
