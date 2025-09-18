import React, { useEffect, useRef, useState } from "react";
import { Form, useForm } from "react-hook-form";
import styles from "./AddNotification.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

export default function AddNotification() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [sendTime, setSendTime] = useState("now");
  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([])
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [ItemsID, setItems] = useState([]);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [second, setSecond] = useState("00");
  const [ampm, setAmPm] = useState("AM");
  const [scheduleDate, setScheduleDate] = useState("");

  const selectedItem = watch('ItemId');
  const selectedCategory = watch('categoryId');

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;


  useEffect(() => {
    const fetchCategories = async () => {
      try {

        const response = await axiosInstance.get(`${baseUrl}/categories/getAll`, { params: { page: 1, limit: 300 } });

        setCategories(response.data.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // toast.error("Failed to load categories", { theme: "dark" });
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItemId = async () => {
      try {
        const response = await axiosInstance.get(`${baseUrl}/item/getAll`, { params: { page: 1, limit: 300 } });
        // console.log(response)
        setItems(response.data.data.items);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // toast.error("Failed to load categories", { theme: "dark" });
      }
    };

    fetchItemId();
  }, []);

  // const onSubmit = (data) => {
  //   console.log('data: ', data);
  //   data.sendTime = sendTime;
  //   data.image = selectedImage;
  // }

  // const onSubmit = async (data) => {


  //   const payload = {
  //     title: data.title,
  //     body: data.body,
  //     itemId: data.ItemId || null,
  //     categoryId: data.categoryId || null,
  //     images: selectedImage ? [selectedImage] : [],
  //     link: data.link,
  //     isScheduled: sendTime === "schedule" ? "schedule" : "not-scheduled",
  //   };

  //   if (data.categoryId && data.ItemId) {
  //     toast.error("You can't select both Category and Item. Please choose only one.", { theme: "dark" });
  //     return;
  //   }
  //   if (sendTime === "schedule") {
  //     if (!scheduleDate) {
  //       toast.error("Please select schedule date");
  //       return;
  //     }

  //     let hr = parseInt(hour);
  //     if (ampm === "PM" && hr !== 12) hr += 12;
  //     if (ampm === "AM" && hr === 12) hr = 0;

  //     const fullDate = new Date(`${scheduleDate}T${String(hr).padStart(2, "0")}:${minute}:${second}`);
  //     payload.scheduleDateTime = fullDate.toISOString();
  //   }


  //   try {
  //     setLoading(true)

  //     let res = await axiosInstance.post(`${baseUrl}/notification/create`, payload)
  //     console.log("Final Payload", payload);
  //     toast.success("Item created successfully!", { theme: "dark", autoClose: 1500 });
  //     navigate("/AllNotification")
  //     setLoading(false)
  //   } catch (e) {
  //     console.log(e)
  //     setLoading(false)
  //   } finally {
  //     setLoading(false)
  //   }
  // };
  const formatDateToISO = () => {
    if (!scheduleDate || !hour || !minute || !ampm) return "";

    let h = parseInt(hour, 10);
    let m = parseInt(minute, 10);
    let s = parseInt(second || "0", 10);

    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;

    // Create local date object
    const localDate = new Date(
      `${scheduleDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    );

    // Convert to UTC timestamp and subtract 2 hours (in ms)
    const adjustedTime = new Date(localDate.getTime() - 2 * 60 * 60 * 1000);

    // Return adjusted ISO time
    return adjustedTime.toISOString();
  };



  const onSubmit = async (data) => {
    if (data.categoryId && data.ItemId) {
      toast.error("You can't select both Category and Item. Please choose only one.", { theme: "dark" });
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("body", data.body);
    formData.append("link", data.link);
    formData.append("isScheduled", sendTime === "schedule" ? "schedule" : "not-scheduled");

    if (data.ItemId) formData.append("itemId", data.ItemId);
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (selectedImages.length > 0) {
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });
    }


    if (sendTime === "schedule") {
      const isoDateTime = formatDateToISO();

      if (!isoDateTime) {
        toast.error("Please complete schedule date and time");
        return;
      }

      // console.log("UTC Time:", isoDateTime);
      formData.append("scheduleDateTime", isoDateTime);
    }
    // console.log('formData: ', formData);

    try {
      setLoading(true);
      await axiosInstance.post(`${baseUrl}/notification/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Notification sent successfully!", { theme: "dark", autoClose: 1500 });
      navigate("/AllNotification");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (value) => {
    setSendTime(value);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

    const validFiles = files.filter(
      (file) => allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      toast.error("Some files are invalid (Only PNG, JPG,JPEG under 10MB allowed).");
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
  };


  const removeImage = () => {
    setSelectedImages(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`container-fluid mb-4 mt-5 ${styles.wrapper}`}>
      <h4 className="mb-4 fw-bold ">Send A New Notification</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-lg-8">
            <div className={styles.formLinks}>
              <label>Title:</label>
              <input
                type="text"
                placeholder="Add A Title Here"
                {...register("title", { required: "Title is required", })}
                className={`form-control ${styles.input} ${errors.title ? 'is-invalid' : ''}`}
              // isInvalid={!!errors.title}
              />
              {/* {errors.title && (
                  <div className="invalid-feedback">
                    {errors.title.message}
                  </div>
                )} */}
            </div>

            <div className={styles.formLinks}>
              <label>Message :</label>
              <textarea
                placeholder="Write A Message Here..."
                {...register("body", { required: "Message is required", })}
                className={`form-control ${styles.textarea}${errors.title ? 'is-invalid' : ''}`}
              />

            </div>
            <div className={styles.formLinks}>
              <label>Link:</label>
              <input
                type="text"
                placeholder="Add A Link Here"
                {...register("link", { required: "Link is required", })}
                className={`form-control ${styles.input} ${errors.title ? 'is-invalid' : ''}`}
              />

            </div>
            <div className={`${styles.formLinks} d-flex gap-2 align-item-center `}>
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
            </div>

            <div className="row">


              <div className="col-md-6">
                <div className="mb-3">
                  <label>Send Time</label>
                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      onClick={() => handleTabClick("now")}
                      className={`${styles.btn} ${sendTime === "now" ? styles.active : ""}`}
                    >
                      Now
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabClick("schedule")}
                      className={`${styles.btn} ${sendTime === "schedule" ? styles.active : ""}`}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Schedule Fields */}
            {sendTime === "schedule" && (
              <div className={styles.formGroup}>
                <div className={styles.formField} style={{ minWidth: "250px", marginRight: "2px" }}>
                  <label className="form-label" >Schedule Date</label>
                  <input
                    type="date"
                    className={`form-control ${styles.Dateinput}`}
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>

                <div className={styles.formField}>
                  <label className="form-label">Hour</label>
                  <select value={hour} onChange={(e) => setHour(e.target.value)} className="form-select">
                    {[...Array(12).keys()]?.map(i => (
                      <option key={i + 1}>{String(i + 1).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label className="form-label">Minute</label>
                  <select value={minute} onChange={(e) => setMinute(e.target.value)} className="form-select">
                    {[...Array(60).keys()]?.map(i => (
                      <option key={i}>{String(i).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label className="form-label">Second</label>
                  <select value={second} onChange={(e) => setSecond(e.target.value)} className="form-select">
                    {[...Array(60).keys()]?.map(i => (
                      <option key={i}>{String(i).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label className="form-label">AM/PM</label>
                  <select value={ampm} onChange={(e) => setAmPm(e.target.value)} className="form-select">
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            )}

            {/* </div> */}
          </div>

          <div className="col-lg-4 mt-4 mt-lg-0">
            {/* <label>Image:</label> */}
            <div className={styles.uploadBox}>
              {selectedImages.length === 0 ? (
                <>
                  <div className={styles.uploadIcon}><FaRegArrowAltCircleUp /></div>
                  <h5 className="mb-3 mt-3 ">Upload An Image Here</h5>
                  <small ><b>(JPG, PNG only, Max 10MB)</b></small>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    ref={fileInputRef}

                    onChange={handleImageChange}
                    className={styles.fileInput}
                  /><br />
                  <button
                    type="button"
                    className={styles.selectButton}
                    onClick={() => fileInputRef.current.click()}
                  >
                    Select Image
                  </button>
                </>
              ) : (
                <div className={styles.previewContainer}>
                  {selectedImages?.map((image, index) => (
                    <div key={index} className={styles.imagePreviewBox}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className={styles.previewImage}
                      />
                      <span
                        className={styles.deleteIcon}
                        onClick={() => {
                          const updatedImages = [...selectedImages];
                          updatedImages.splice(index, 1);
                          setSelectedImages(updatedImages);
                          if (fileInputRef.current && updatedImages.length === 0) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <IoIosClose />
                      </span>
                    </div>
                  ))}
                  <p className={styles.selectedImageCount}>
                    {selectedImages.length} image{selectedImages.length > 1 ? "s" : ""} selected
                  </p>
                </div>
              )}


            </div>
          </div>
        </div>

        <div className={`text-end mt-4 ${styles.submitWrapper}`}>
          <button type="submit" className={styles.submitBtn}>
            {loading ? "Submitting..." : "SEND NOTIFICATION"}
          </button>
        </div>
      </form>
    </div>
  );
}
