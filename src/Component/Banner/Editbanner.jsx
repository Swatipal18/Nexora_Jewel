import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./AddBanner.module.css";
import { FaUpload, FaTimes } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

export default function Editbanner() {
  const { register, handleSubmit, setValue } = useForm();
  const [previewImages, setPreviewImages] = useState([]);
  // console.log('previewImages: ', previewImages);
  const [imageFiles, setImageFiles] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [targetArea, setTargetArea] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [allOldImageUrls, setAllOldImageUrls] = useState([]);
  const [deletedOldImageUrls, setDeletedOldImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axiosInstance.get(`${baseUrl}/banner/getDetails/{id}`, {
          params: { id: id },
        });
        const banner = response.data.data;
        // console.log('banner: ', banner);

        setValue("text", banner.text || "");
        setValue("targetArea", banner.targetArea || "");
        setTargetArea(banner.targetArea);

        if (banner.imageUrl?.length > 0) {
          const fullUrls = banner.imageUrl?.map((url) => {
            const fullPath = url.startsWith("http") ? url : `${baseUrl}${url}`;
            const urlWithoutQuery = fullPath.split('?')[0];
            const extension = urlWithoutQuery.split('.').pop().toLowerCase();
            // console.log("Extension: ", extension);
            return {
              src: fullPath,
              origin: "old",
              originalPath: url,
              type: extension === "mp4" ? "video" : "image"
            };
          });
          setPreviewImages(fullUrls);
          setAllOldImageUrls(banner.imageUrl);
        }
      } catch (err) {
        toast.error("Failed to load banner data.");
        console.error(err);
      }
    };
    fetchBanner();
  }, [id]);

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
        toast.error(`File too large: ${file.name}`);
        continue;
      }
      validFiles.push(file);
      previews.push({
        src: URL.createObjectURL(file),
        origin: "new",
        type: file.type.startsWith("video") ? "video" : "image",
      });
    }
    if (validFiles.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} image(s) for this section.`);
      return;
    }


    setImageFiles((prev) => [...prev, ...validFiles]);
    setPreviewImages((prev) => [...prev, ...previews]);
  };


  const handleImageDelete = (index) => {
    const updatedPreviews = [...previewImages];
    const imageToDelete = updatedPreviews[index];
    if (imageToDelete.origin === "old") {
      setDeletedOldImageUrls((prev) => [...prev, imageToDelete.originalPath]);
    }
    updatedPreviews.splice(index, 1);


    if (imageToDelete.origin === "new") {
      const updatedFiles = [...imageFiles];
      updatedFiles.splice(index, 1);
      setImageFiles(updatedFiles);
    }

    setPreviewImages(updatedPreviews);
  };

  const handleExistingImageDelete = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
  };

  const closeModal = () => setModalImage(null);


  const urlToFile = async (url, filename) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    formData.append("targetArea", data.targetArea);
    formData.append("text", data.text || "");


    imageFiles.forEach((file) => {
      formData.append("images", file);
    });


    const notDeletedOldUrls = allOldImageUrls.filter(
      (url) => !deletedOldImageUrls.includes(url)
    );

    for (let i = 0; i < notDeletedOldUrls.length; i++) {
      const url = notDeletedOldUrls[i];
      try {
        const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
        const filename = fullUrl.split("/").pop().split("?")[0];
        const file = await urlToFile(fullUrl, filename);
        formData.append("images", file);
      } catch (err) {
        console.error("Error converting old file:", url, err);
        toast.error("Failed to prepare existing media. Try again.");
        setLoading(false);
        return;
      }
    }


    deletedOldImageUrls.forEach((url) => {
      formData.append("oldImageUrls", url);
    });



    try {
      setLoading(true);
      const res = await axiosInstance.put(`${baseUrl}/banner/update/${id}`, formData);
      toast.success("Banner updated!", { theme: "dark" });
      navigate("/AllBanner");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed!", { theme: "dark" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <form className={`container mt-4 mb-3 ${styles.form}`} onSubmit={handleSubmit(onSubmit)}>
        <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
          <h4 className="mb-3"><b>Edit Banner</b></h4>
          <select
            {...register("targetArea")}
            value={targetArea}
            onChange={(e) => {
              setTargetArea(e.target.value);
              setValue("targetArea", e.target.value);
            }}
            className="form-select w-25 ms-auto"
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
            <option value="Instagram Gallery">Instagram Gallery</option>

            <option value="Inner Jewel">Inner Jewel</option>
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
        {targetArea === "Circular Gallary" && (
          <div className="form-group mt-3">
            <label htmlFor="faqText" className="mb-3"><b>Circular Gallary</b></label>
            <textarea
              id="faqText"
              {...register("text")}
              rows="3"
              className="form-control"
              placeholder="Enter Circular Gallary here..."
            ></textarea>
          </div>
        )}
        {targetArea === "Inner Jewel" && (
          <div className="form-group mt-3">
            <label htmlFor="faqText" className="mb-3"><b>Inner Jewel</b></label>
            <textarea
              id="faqText"
              {...register("text")}
              rows="3"
              className="form-control"
              placeholder="Enter Inner Jewel here..."
            ></textarea>
          </div>
        )}
        {targetArea === "Welcome Jewel Video" && (
          <div className="form-group mt-3">
            <label htmlFor="faqText" className="mb-3"><b>Welcome Jewel Video</b></label>
            <textarea
              id="faqText"
              {...register("text")}
              rows="3"
              className="form-control"
              placeholder="Enter Welcome Jewel Video here..."
            ></textarea>
          </div>
        )}
        {targetArea === "Zoom Section" && (
          <div className="form-group mt-3">
            <label htmlFor="faqText" className="mb-3"><b>Zoom Section</b></label>
            <textarea
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
            multiple
            accept="image/*,video/mp4"
            onChange={onImageChange}
            className={styles.hiddenInput}
          />

          {previewImages.length === 0 && existingImages.length === 0 && (
            <label htmlFor="fileInput" className={styles.uploadLabel}>
              <FaUpload className={styles.uploadIcon} />
              <p>Upload Image Here</p>
              <small>(.jpeg, .png, .gif, .mp4 files supported)</small><br />
              <small>(Max size: 50MB)</small>
            </label>
          )}

          {/* Main Preview (Image or Video) */}
          {previewImages.length > 0 && (
            <div className={styles.imageWrapper}>
              {previewImages[0].type.startsWith("video") ? (
                <video
                  src={previewImages[0].src}
                  controls
                  className={styles.mainImage}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImage(previewImages[0].src);
                  }}
                />
              ) : (
                <img
                  src={previewImages[0].src}
                  alt="Main Preview"
                  className={styles.mainImage}
                  onClick={() => setModalImage(previewImages[0].src)}
                />
              )}

              <FaTimes
                className={styles.deleteIcon}
                onClick={() => handleImageDelete(0)}
                title="Delete Image"
              />
            </div>
          )}

          {previewImages.length > 1 && (

            <div className={styles.thumbnailRow}>
              {previewImages.slice(1)?.map((src, idx) => (
                <div className={styles.thumbnailWrapper} key={`thumb-${idx}`}>
                  {src.type.startsWith("video") ? (
                    <video
                      src={src.src}
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
                      src={src.src}
                      alt={`preview-${idx}`}
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
                    title="Delete Preview"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
          <button type="submit" className="btn  ms-auto" disabled={loading}
            style={{ backgroundColor: 'var(--text-black, #55142A)', color: 'var(--white, #FFF3E3)', boxShadow: '0 4px 6px #71213c87' }}>
            {loading ? "Updating..." : "Update Banner"}
          </button>
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
          <img src="/images/ZyraBlackSVG-01.png" alt="" style={{ height: "50%", width: "50%", color: "white" }} className={styles.loaderImage} />
        </div>
      )}
    </>
  );
}
