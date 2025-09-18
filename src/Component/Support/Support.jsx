import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Container, Row, Col } from 'react-bootstrap';
import styles from './SupportForm.module.css';
import { FaRegArrowAltCircleUp } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

export default function Support() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("title", data.title);
    formData.append("message", data.body);

    selectedImages.forEach((imgObj) => {
      formData.append("files", imgObj.file);
    });
    // console.log('formData: ', formData);

    // for (let pair of formData.entries()) {
    //   console.log(pair[0], pair[1]);
    // }

    try {
      setLoading(true)
      let post = await axiosInstance.post(`${baseUrl}/user/sendEmail`, formData);
      // console.log('post : ', post);
      toast.success("Sent Email Successfully");
      setLoading(false)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
      reset()
      setSelectedImages([])

    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files?.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setSelectedImages(prev => [...prev, ...previews]);
  };

  const removeImage = (indexToRemove) => {
    const updated = selectedImages.filter((_, idx) => idx !== indexToRemove);
    setSelectedImages(updated);
    if (fileInputRef.current && updated.length === 0) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`container-fluid mb-4 mt-5 ${styles.wrapper}`}>
      <h4 className="mb-4 fw-bold">Support</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-lg-8">
            <div className={styles.formLinks}>
              <label>Email:</label>
              <input
                type="Email"
                placeholder="Add A Link Here"
                {...register("email", { required: "Email is required" })}
                className={`form-control ${styles.input} ${errors.email ? 'is-invalid' : ''}`}
              />
            </div>

            <div className={styles.formLinks}>
              <label>Title:</label>
              <input
                type="text"
                placeholder="Add A Title Here"
                {...register("title", { required: "Title is required" })}
                className={`form-control ${styles.input} ${errors.title ? 'is-invalid' : ''}`}
              />
            </div>

            <div className={styles.formLinks}>
              <label>Message :</label>
              <textarea
                placeholder="Write A Message Here..."
                {...register("body", { required: "Title is required" })}
                className={`form-control ${styles.textarea}  ${errors.body ? 'is-invalid' : ''}`}
              />
            </div>


          </div>

          <div className="col-lg-4 mt-4 mt-lg-0">
            <div className={styles.uploadBox}>
              {selectedImages.length === 0 ? (
                <>
                  <div className={styles.uploadIcon}><FaRegArrowAltCircleUp /></div>
                  <h5 className="mb-3 mt-3 ">Upload An Image Here</h5>
                  <small ><b>(JPG, PNG only, Max 10MB)</b></small>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    multiple
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                  <br />
                  <button
                    type="button"
                    className={styles.selectButton}
                    onClick={() => fileInputRef.current.click()}
                  >
                    Select Image
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.selectedImageCount}>
                    {selectedImages.length} image{selectedImages.length > 1 ? "s" : ""} selected
                  </p>
                  <div className={styles.previewContainerScroll}>

                    {selectedImages?.map((imgObj, index) => (
                      <div key={index} className={styles.imagePreviewBox}>
                        <img
                          src={imgObj.url}
                          alt={`Preview ${index + 1}`}
                          className={styles.previewImage}
                        />
                        <span className={styles.deleteIcon} onClick={() => removeImage(index)}>
                          <IoIosClose />
                        </span>
                      </div>
                    ))}
                  </div>

                </>
              )}
            </div>
          </div>
        </div>

        <div className={`text-end mt-4 ${styles.submitWrapper}`}>
          <button type="submit" className={styles.submitBtn}>
            {loading ? "Sending..." : "SEND EMAIL"}
          </button>
        </div>
      </form>
    </div>
  );
}
