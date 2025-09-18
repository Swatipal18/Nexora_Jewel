import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Allbanner.module.css";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import Loader from "../pages/Loader/Loader";

export default function AllBanner() {
  const navigate = useNavigate();
  const [Allbanner, setAllBanner] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [targetAreaFilter, setTargetAreaFilter] = useState("all");
  const [loading, Setloader] = useState(false)

  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const handleAddBannerClick = () => {
    navigate("/Addbanner");
  };

  const handleEditBanner = (id) => {
    navigate(`/Editbanner/${id}`);
  };

  const getBanner = async () => {
    try {
      Setloader(true)

      const response = await axiosInstance.get(`${baseUrl}/banner/getAll`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            targetArea: targetAreaFilter !== "all" ? targetAreaFilter : undefined,
          }
        });
      setAllBanner(response.data.data.banners);

      const total = response.data.data.totalBanners;

      setTotalUsers(total)
      Setloader(false)

    } catch (error) {
      console.log(error);
    } finally {
      Setloader(false)

    }
  };

  useEffect(() => {
    getBanner();
  }, [currentPage, itemsPerPage, targetAreaFilter])

  const handleDeleteBanner = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      try {
        Setloader(true)

        await axiosInstance.delete(`${baseUrl}/banner/delete/{id}`, {
          params: { id: id }
        });
        toast.success("Delete Banner successfully!", { theme: "dark", autoClose: 1500 });
        getBanner();
        Setloader(false)

      } catch (error) {
        console.log("error: ", error);
        toast.error("Delete failed. Please try again.", { theme: "dark" });
      } finally {
        Setloader(false)

      }
    }
  };

  const handleImageClick = (imageUrls) => {
    const fullUrls = imageUrls.map(url => url.startsWith("http") ? url : `${baseUrl}${url}`);
    setGalleryImages(fullUrls);
    setShowGallery(true);
  };





  return (
    <>
      <div className={`container ${styles.bannerContainer}`}>
        <div className={`d-flex justify-content-between align-items-center flex-wrap mb-3 ${styles.header}`}>
          <button className={`btn  ${styles.addButton}`} onClick={handleAddBannerClick}>
            + New Add
          </button>
          <select className={`form-select w-auto ${styles.dropdown} `} value={targetAreaFilter}
            style={{
              backgroundColor: 'var(--white, #FFF3E3)',
              color: 'var(--text-black, #55142A)',
              border: '1px solid var(--light-black, #55142ac4)',
              borderRadius: '4px',
              padding: '5px 10px',
            }}
            onChange={(e) => {
              setTargetAreaFilter(e.target.value);
              setCurrentPage(1);
            }}>
            <option value="all">All</option>
            <option value="First Carousel">First Carousel</option>
            <option value="Top Sales Second Section">Top Sales Second Section</option>
            <option value="FAQ Section">FAQ Section</option>
            <option value="Moonlight Section">Moonlight Section</option>
            <option value="Welcome Jewel Video">Welcome Jewel Video</option>
            <option value="Earring Destiny">Earring Destiny</option>
            <option value="Detail view">Detail view</option>
            <option value="Hot Deals">Hot Deals</option>
            <option value="Zoom Section">Zoom Section</option>
            <option value="Instagram Gallery">Instagram Gallery</option>
            <option value="Products Preview">Products Preview</option>
            <option value="Circular Gallary">Circular Gallery</option>
            <option value="Inner Jewel">Inner Jewel</option>


          </select>
        </div>


        <div className={styles.tableWrapper}>
          <div className={styles.tableResponsive}>
            <table className={`table ${styles.bannerTable}`}>
              <thead>
                <tr>
                  <th>Banner</th>
                  <th>Target Area</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Allbanner?.length > 0 ? (
                  Allbanner?.map((v) => (
                    <tr key={v._id}>
                      <td>
                        {v.imageUrl?.length > 0 ? (
                          (() => {
                            const url = v.imageUrl[0];
                            const isFullUrl = url.startsWith("http");
                            const src = isFullUrl ? url : `${baseUrl}${url}`;


                            const filename = src.split("?")[0].split("/").pop().toLowerCase();

                            const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(filename);
                            const isVideo = /\.(mp4|webm|mov)$/i.test(filename);

                            if (isImage) {
                              return (
                                <img
                                  src={src}
                                  alt="banner"
                                  className={styles.bannerImage}
                                  onClick={() => handleImageClick(v.imageUrl)}
                                  style={{ cursor: "pointer" }}

                                />
                              );
                            } else if (isVideo) {
                              return (
                                <video
                                  src={src}
                                  className={styles.bannerImage}
                                  onClick={() => handleImageClick(v.imageUrl)}
                                  style={{ cursor: "pointer" }}
                                  muted
                                  autoPlay
                                  loop

                                />
                              );
                            } else {
                              return <span>Unsupported format</span>;
                            }
                          })()
                        ) : (
                          <span>No media</span>
                        )}
                      </td>

                      <td>{v.targetArea}</td>
                      <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className={styles.editBtn} onClick={() => handleEditBanner(v._id)}>Edit</button>
                        &nbsp;
                        <button className={styles.deleteBtn} onClick={() => handleDeleteBanner(v._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No Banner Available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showGallery && (
          <div className={styles.modalOverlay} onClick={() => setShowGallery(false)}>
            <div className={styles.modalGallery}>
              {galleryImages?.map((src, i) => {
                const filename = src.split("?")[0].split("/").pop().toLowerCase();
                const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(filename);
                const isVideo = /\.(mp4|webm|mov)$/i.test(filename);

                if (isImage) {
                  return (
                    <img
                      key={i}
                      src={src}
                      alt={`gallery-${i}`}
                      className={styles.modalImageThumbnail}

                    />
                  );
                } else if (isVideo) {
                  return (
                    <video
                      key={i}
                      src={src}
                      className={styles.VideoPreview}
                      controls
                      autoPlay
                      loop
                      muted

                    />
                  );
                } else {
                  return <div key={i}>Unsupported format</div>;
                }
              })}

            </div>
          </div>
        )}
      </div>
      <div className=" col-12 d-flex align-items-center mt-3 position-fixed p-2 ps-4 bottom-0" style={{ background: " var(--pagination-bg, #fde6c9ff)" }} >
        <div className={styles.paginationInfo}>
          <span>Showing {Allbanner.length} Of {totalUsers} Banner</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={styles.dropdown}
          >
            {[5, 10, 20, 50, 100]?.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className={styles.paginationControls}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={styles.pageBtn}
            disabled={currentPage === 1}
          >
            <FaCircleChevronLeft />
          </button>

          <span className={styles.pageNumber}>{currentPage}</span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev < Math.ceil(totalUsers / itemsPerPage) ? prev + 1 : prev
              )
            }
            className={styles.pageBtn}
            disabled={currentPage >= Math.ceil(totalUsers / itemsPerPage)}
          >
            <FaCircleChevronRight />
          </button>
        </div>

      </div>
      {loading && (
        <Loader />
      )}
    </>
  );
}
