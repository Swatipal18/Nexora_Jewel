import React, { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./AddBanner.module.css";
import { FaUpload, FaTimes } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Addbanner() {
  const { register, handleSubmit } = useForm();
  const [previewImages, setPreviewImages] = useState([]);
  // console.log('previewImages: ', previewImages);

  const [imageFiles, setImageFiles] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [targetArea, setTargetArea] = useState("");
  const [loading, setloading] = useState(false);

  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const onImageChange = (e) => {


    const files = Array.from(e.target.files);
    let maxImages = Infinity;

    switch (targetArea) {
      case "Top Sales Second Section":
      case "FAQ Section":
        maxImages = 3;
        break;
      case "Moonlight Section":
      case "Hot Deals":
      case "Zoom Section":
        maxImages = 2;
        break;
      case "Earring Destiny":
        maxImages = 12;
        break;
      case "Inner Jewel":
      case "Circular Gallary":
        maxImages = 1;
        break;
      case "First Carousel":
        maxImages = Infinity;
        break;
      case "Products Preview":
      case "Detail view":
      case "Welcome Jewel Video":
        maxImages = 1;
        break;
      case "Instagram Gallery":
        maxImages = 7;
        break;
      default:
        maxImages = 0;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "image/avif"];
    const maxSize = 50 * 1024 * 1024;

    const validFiles = [];
    const previews = [];

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Unsupported file type: ${file.name}`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`File too large (max 50MB): ${file.name}`);
        continue;
      }
      validFiles.push(file);
      previews.push({ url: URL.createObjectURL(file), type: file.type });
    }

    if (validFiles.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} image(s) for this section.`);
      return;
    }

    setImageFiles(validFiles);
    setPreviewImages(previews);
  };

  const handleImageDelete = (index) => {
    const newPreviews = [...previewImages];
    const newFiles = [...imageFiles];
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    setPreviewImages(newPreviews);
    setImageFiles(newFiles);
  };

  const closeModal = () => setModalImage(null);
  const onSubmit = async (data) => {
    const formData = new FormData();

    if (imageFiles.length === 0) {
      toast.error("Please select at least one image.", { autoClose: "1500", theme: "dark" })
      return;
    }

    formData.append("targetArea", String(data.targetArea));
    formData.append("text", data.text || "");
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });


    console.log('formData: ', formData);

    try {
      setloading(true)
      const response = await axiosInstance.post(`${baseUrl}/banner/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // console.log('response: ', response);

      toast.success("Banner added successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      navigate("/AllBanner")

      setImageFiles([]);
      setPreviewImages([]);
      setTargetArea("");
      setloading(false)
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to upload banner.";
      console.log('errorMessage: ', errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      console.error("Upload failed", error);
      setloading(false)
    }
  };

  return (
    <>

      <form className={`container mt-4 mb-3 ${styles.form}`} onSubmit={handleSubmit(onSubmit)}>
        <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
          <h4 className="mb-3"><b>Add Banner</b></h4>
          <select
            {...register("targetArea")}
            value={targetArea}
            onChange={(e) => setTargetArea(e.target.value)}
            className="form-select w-25 ms-auto"
            style={{
              backgroundColor: "var(--white, #FFF3E3)",
              color: "var(--text-black, #55142A)",
              border: "1px solid var(--light-black, #55142ac4)"
            }}
          >
            <option value="">Select Area</option>
            <option value="First Carousel">First Carousel</option>
            <option value="Top Sales Second Section">Top Sales Second Section</option>
            <option value="FAQ Section">FAQ Section</option>
            <option value="Moonlight Section">Moonlight Section</option>
            <option value="Welcome Jewel Video">Welcome Jewel Video</option>
            <option value="Earring Destiny">Earring Destiny</option>
            <option value="Detail view">Detail view</option>
            <option value="Hot Deals">Hot Deals</option>
            <option value="Zoom Section">Zoom Section</option>
            <option value="Products Preview">Products Preview</option>
            <option value="Circular Gallary">Circular Gallery</option>
            <option value="Inner Jewel">Inner Jewel</option>
            <option value="Instagram Gallery">Instagram Gallery</option>
          </select>
        </div>


        {targetArea === "FAQ Section" && (
          <div className="form-group mt-3">
            <label htmlFor="faqText" className="mb-3"><b>FAQ Text</b></label>
            <textarea
              id="faqText"
              {...register("text")}
              rows="3"
              className="form-control"
              placeholder="Enter FAQ text here..."
            ></textarea>
          </div>
        )}
        {targetArea === "Inner Jewel" && (
          <div className="form-group mt-3">
            <label htmlFor="faqText" className="mb-3"><b>Inner jewel Text</b></label>
            <textarea
              id="faqText"
              {...register("text")}
              rows="3"
              className="form-control"
              placeholder="Enter inner jewel text..."
            />
          </div>
        )}
        {targetArea === "Circular Gallary" && (
          <div className="form-group mt-3">
            <label htmlFor="faqText" className="mb-3"><b>Circular Gallery Text</b></label>
            <input
              id="faqText"
              {...register("text")}
              rows="3"
              className="form-control"
              placeholder="Enter Circular Gallery text..."
            />
          </div>
        )}
        {targetArea === "Welcome Jewel Video" && (
          <div className="form-group mt-3">
            <label htmlFor="faqText" className="mb-3"><b>Welcome Jewel Video</b></label>
            <input
              id="faqText"
              {...register("text")}
              rows="3"
              className="form-control"
              placeholder="Enter Welcome Jewel Video text..."
            />
          </div>
        )}
        {targetArea === "Zoom Section" && (
          <div className="form-group mt-3">
            <label htmlFor="faqText" className="mb-3"><b>Zoom Section</b></label>
            <input
              id="faqText"
              {...register("text")}
              rows="3"
              className="form-control"
              placeholder="Enter Zoom Section text..."
            />
          </div>
        )}
        <div className={styles.uploadBox}>
          <input
            id="fileInput"
            type="file"
            {...register("images")}
            multiple
            accept="image/*,video/mp4"
            onChange={onImageChange}
            className={styles.hiddenInput}
            disabled={!targetArea}
          />

          {!targetArea && (
            <p className="text-danger mt-2" style={{ fontSize: "14px" }}>
              Please select a target area before uploading images.
            </p>
          )}

          {previewImages.length > 0 ? (
            <div className={styles.imageWrapper}>
              {previewImages[0].type.startsWith("video") ? (
                <video
                  src={previewImages[0].url}
                  controls
                  className={styles.mainImage}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImage(previewImages[0].url);
                  }}
                />
              ) : (
                <img
                  src={previewImages[0].url}
                  alt="Main Preview"
                  className={styles.mainImage}
                  onClick={() => setModalImage(previewImages[0].url)}
                />
              )}

              <FaTimes
                className={styles.deleteIcon}
                onClick={() => handleImageDelete(0)}
                title="Delete Image"
              />
            </div>
          ) : (
            <label htmlFor="fileInput" className={styles.uploadLabel}>
              <FaUpload className={styles.uploadIcon} />
              <p>Upload Image Here</p>
              <small>(.jpeg, .png, .gif, .mp4 files supported)</small><br />
              <small>(Max size: 50MB)</small>
            </label>
          )}

          {previewImages.length > 1 && (
            <div className={styles.thumbnailRow}>
              {previewImages.slice(1)?.map((preview, idx) => (
                <div className={styles.thumbnailWrapper} key={idx}>
                  {preview.type.startsWith("video") ? (
                    <video
                      src={preview.url}
                      className={styles.thumbnail}
                      onClick={() => {
                        const newPreviews = [...previewImages];
                        const newFiles = [...imageFiles];
                        [newPreviews[0], newPreviews[idx + 1]] = [newPreviews[idx + 1], newPreviews[0]];
                        [newFiles[0], newFiles[idx + 1]] = [newFiles[idx + 1], newFiles[0]];
                        setPreviewImages(newPreviews);
                        setImageFiles(newFiles);
                      }}
                    />
                  ) : (
                    <img
                      src={preview.url}
                      className={styles.thumbnail}
                      onClick={() => {
                        const newPreviews = [...previewImages];
                        const newFiles = [...imageFiles];
                        [newPreviews[0], newPreviews[idx + 1]] = [newPreviews[idx + 1], newPreviews[0]];
                        [newFiles[0], newFiles[idx + 1]] = [newFiles[idx + 1], newFiles[0]];
                        setPreviewImages(newPreviews);
                        setImageFiles(newFiles);
                      }}
                    />
                  )}
                  <MdDelete
                    className={styles.deleteIconSmall}
                    onClick={() => handleImageDelete(idx + 1)}
                    title="Delete Thumbnail"
                  />
                </div>
              ))}

            </div>
          )}
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3 mt-3">

          <button type="submit" className="btn  ms-auto"
          style={{backgroundColor:"var(--button-bg, #55142A)", color:"white", borderRadius:"5px", padding:"8px 20px", border:"none"}}
          disabled={loading}>{loading ? "Submitting..." : "Add Banner"}</button>
        </div>
      </form>

      {modalImage && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          {modalImage.endsWith(".mp4") ? (
            <video src={modalImage} controls className={styles.modalImage} />
          ) : (
            <img src={modalImage} alt="Large preview" className={styles.modalImage} />
          )}
        </div>
      )}
      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loader}></div>
        </div>
      )}
    </>
  );
}
