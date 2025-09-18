import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "../AddItem.module.css";
import { Form, Row, Col, Button } from "react-bootstrap";
import { HiMiniArrowUpOnSquare } from "react-icons/hi2";
import axiosInstance from "../../../api/axiosInstance";
import AutoCompleteMultiSelect from "../AutoCompleteMultiSelect";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function EditItem() {
  const { id } = useParams();
  // console.log('id: ', id);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, getValues, setError, watch,
    clearErrors, formState: { errors } } = useForm();
  const [selectedImages, setSelectedImages] = useState([]);
  // console.log('selectedImages: ', selectedImages);
  const [error, seterror] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [type, setDropDownType] = useState("")
  // console.log('type: ', type);

  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayImage, setOverlayImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [FormDatas, setFormData] = useState(() => {
    const saved = localStorage.getItem("draftData");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        itemName: parsed.itemName || "",
        description: parsed.description || "",
        metalWeight: parsed.metalWeight || "",
        grossWeight: parsed.grossWeight || "",
        netWeight: parsed.netWeight || "",
        perGramWeight: parsed.perGramWeight || "",
        makingCharges: parsed.makingCharges || "",
        gst: parsed.gst || "",
        otherCharges: parsed.otherCharges || "",
        discount: parsed.discount || "",
        mrp: parsed.mrp || "",
        sellingPrice: parsed.sellingPrice || "",
        skus: parsed.skus || "",
        categoryId: parsed.categoryId || "",
        suppllierId: parsed.suppllierId || "",
        subCategoryId: parsed.subCategoryId || [],
        metalId: parsed.metalId || [],
        sizeId: parsed.sizeId || [],
      };
    }
    return {
      itemName: "",
      description: "",
      metalWeight: "",
      grossWeight: "",
      netWeight: "",
      perGramWeight: "",
      makingCharges: "",
      gst: "",
      otherCharges: "",
      discount: "",
      mrp: "",
      sellingPrice: "",
      skus: "",
      categoryId: "",
      suppllierId: "",
      subCategoryId: [],
      metalId: [],
      sizeId: [],
    };
  });



  console.log('FormDatas: ', FormDatas);

  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 50000000 && file.type.startsWith("image/"));

    if (validFiles.length !== files.length) {

      toast.error('Some files were rejected due to size or format.');
    }
    setSelectedImages(validFiles);
    setValue("images", validFiles, { shouldValidate: true });
    autoSaveFormData({ ...getValues(), images: validFiles });

  };
  const urlToFile = async (url, filename) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: blob.type });
    return file;
  };


  async function getDetailsById() {
    try {
      let res = await axiosInstance.put(`${baseUrl}/item/update/${id}`)
      // console.log("response", res)
      const data = res.data.data;


      // reset(data);
      setFormData({
        itemName: data.itemName || "",
        description: data.description || "",
        // metalWeight: data.metalWeight || "",
        // grossWeight: data.grossWeight || "",
        // netWeight: data.netWeight || "",
        // perGramWeight: data.perGramWeight || "",
        // makingCharges: data.makingCharges || "",
        // gst: data.gst || "",
        // otherCharges: data.otherCharges || "",
        // discount: data.discount || "",
        // mrp: data.mrp || "",
        // sellingPrice: data.sellingPrice || "",
        skus: data.skus || "",
        categoryId: data.categoryId || "",
        suppllierId: data.suppllierId || "",
        subCategoryId: data.subCategoryId || [],
        metalId: data.metalId || [],
        sizeId: data.sizeId || [],
      });

      const normalizedData = {

        itemName: data.itemName || "",
        itemCode: data.itemCode || "",

        description: data.description || "",
        metalWeight: data.metalWeight || "",
        grossWeight: data.grossWeight?.$numberDecimal || "",
        netWeight: data.netWeight?.$numberDecimal || "",
        perGramWeight: data.perGramWeight?.$numberDecimal || "",
        makingCharges: data.makingCharges?.$numberDecimal || "",
        gst: data.gst?.$numberDecimal || "",
        labourCharges: data.labourCharges?.$numberDecimal || "",
        itemRate: data.itemRate?.$numberDecimal || "",
        otherCharges: data.otherCharges || 0,
        labourRatePerGram: data.labourRatePerGram || "",
        metalRatePerGram: data.metalRatePerGram || "",
        lessWeight: data.lessWeight?.$numberDecimal || "",
        discount: data.discount || 0,
        mrp: data.mrp?.$numberDecimal || "",
        sellingPrice: data.sellingPrice?.$numberDecimal || "",
        skus: data.skus || "",
        categoryId: data.categoryId || "",
        suppllierId: data.suppllierId || "",
        subCategoryId: data.subCategoryId || [],
        metalId: data.metalId || [],
        sizeId: data.sizeId || [],
        type: data.type?.toString() || "",
      };

      console.log('normalizedData: ', normalizedData);
      reset(normalizedData);
      setValue("type", data.type?.toString() || "");


      if (data.imageUrl) {
        setSelectedImages(data.imageUrl);
      }


      if (data.imageUrl && Array.isArray(data.imageUrl)) {
        const files = await Promise.all(
          data.imageUrl?.map((url, index) =>
            urlToFile(url, `image-${index + 1}.jpg`)
          )
        );
        setSelectedImages(files);
      }

    }
    catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (id) {
      getDetailsById();

    }
  }, [id]);


  const onSubmit = async (data) => {
    // console.log('data: ', data);

    toast.dismiss();
    setLoading(true)
    if (selectedImages.length === 0) {
      // setError("images", { type: "manual", message: "Please select at least one image." });
      toast.error("Please select at least one image.", { autoClose: "1500", theme: "dark" })
      setLoading(false);
      return;
    }
    clearErrors("images");


    const errors = [];

    if (selectedImages.length === 0) {
      errors.push("Please upload at least one image.");
    }

    if (!FormDatas.categoryId || FormDatas.categoryId.length === 0) {
      errors.push("Please select at least one Category.");
    }
    if (!FormDatas.subCategoryId || FormDatas.subCategoryId.length === 0) {
      errors.push("Please select at least one Sub-Category.");
    }
    if (!FormDatas.metalId || FormDatas.metalId.length === 0) {
      errors.push("Please select at least one Metal.");
    }
    if (!FormDatas.sizeId || FormDatas.sizeId.length === 0) {
      errors.push("Please select at least one Size.");
    }
    if (!FormDatas.suppllierId || FormDatas.suppllierId.length === 0) {
      errors.push("Please select at least one Supplier.");
    }

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err, { theme: "dark", autoClose: 2500 }));
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();




    const normalizeValue = (value) => {
      return value === "" || value === undefined ? null : value;
    };

    const appendIfVisible = (field, value) => {
      if (isFieldVisible(field)) {
        formDataToSend.append(field, normalizeValue(value));
      }
    };


    const freshValues = getValues();
    const updatedData = {
      ...data,
      ...FormDatas,
      ...freshValues,
      // itemCode,
      type
    };
    // console.log('updatedData: ', updatedData);

    if (updatedData.suppllierId) {
      updatedData.suppllierId = updatedData.suppllierId.toString();
    }






    formDataToSend.append("itemCode", updatedData.itemCode);
    formDataToSend.append("itemName", updatedData.itemName);
    formDataToSend.append("description", updatedData.description);

    appendIfVisible("grossWeight", parseFloat(updatedData.grossWeight || 0).toFixed(2));
    appendIfVisible("netWeight", parseFloat(updatedData.netWeight || 0).toFixed(2));
    appendIfVisible("perGramWeight", parseFloat(updatedData.perGramWeight || 0).toFixed(2));
    appendIfVisible("lessWeight", parseFloat(updatedData.lessWeight || 0).toFixed(2));

    appendIfVisible("metalRatePerGram", updatedData.metalRatePerGram || 0);
    appendIfVisible("labourRatePerGram", updatedData.labourRatePerGram || 0);
    appendIfVisible("itemRate", parseFloat(updatedData.itemRate || 0).toFixed(2));
    appendIfVisible("labourCharges", parseFloat(updatedData.labourCharges || 0).toFixed(2));
    appendIfVisible("otherCharges", parseFloat(updatedData.otherCharges || 0).toFixed(2));

    appendIfVisible("mrp", parseFloat(updatedData.mrp || 0).toFixed(2));
    appendIfVisible("gst", parseFloat(updatedData.gst || 0).toFixed(2));
    appendIfVisible("sellingPrice", parseFloat(updatedData.sellingPrice || 0).toFixed(2));
    appendIfVisible("discount", updatedData.discount || 0);

    // formDataToSend.append("grossWeight", parseFloat(updatedData.grossWeight || 0).toFixed(2));

    // formDataToSend.append("netWeight", normalizeValue(parseFloat(updatedData.netWeight || 0).toFixed(2)));
    // formDataToSend.append("perGramWeight", normalizeValue(parseFloat(updatedData.perGramWeight || 0).toFixed(2)));
    // formDataToSend.append("makingCharges", normalizeValue(parseFloat(updatedData.makingCharges || 0).toFixed(2)));

    // formDataToSend.append("labourCharges", normalizeValue(parseFloat(updatedData.labourCharges || 0).toFixed(2)));

    // formDataToSend.append("lessWeight", normalizeValue(parseFloat(updatedData.lessWeight || 0).toFixed(2)));
    // formDataToSend.append("metalRatePerGram", normalizeValue(updatedData.metalRatePerGram));
    // formDataToSend.append("labourRatePerGram", normalizeValue(updatedData.labourRatePerGram));
    // formDataToSend.append("itemRate", normalizeValue(parseFloat(updatedData.itemRate || 0).toFixed(2)));


    // formDataToSend.append("gst", normalizeValue(parseFloat(updatedData.gst || 0).toFixed(2)));
    // formDataToSend.append("otherCharges", normalizeValue(parseFloat(updatedData.otherCharges || 0).toFixed(2)));
    // formDataToSend.append("discount", normalizeValue(updatedData.discount));
    // formDataToSend.append("mrp", normalizeValue(parseFloat(updatedData.mrp || 0).toFixed(2)));
    // formDataToSend.append("sellingPrice", normalizeValue(parseFloat(updatedData.sellingPrice || 0).toFixed(2)));
    formDataToSend.append("skus", normalizeValue(updatedData.skus));
    // console.log('type before submit', updatedData.type)
    formDataToSend.append("type", +updatedData.type);
    // console.log('type after submit: ', +updatedData.type);

    formDataToSend.append('categoryId', FormDatas.categoryId);
    formDataToSend.append('suppllierId', FormDatas.suppllierId);


    if (Array.isArray(FormDatas.subCategoryId)) {
      FormDatas.subCategoryId.forEach(id => {
        formDataToSend.append('subCategoryId[]', id);
      });
    } else {
      formDataToSend.append('subCategoryId', FormDatas.subCategoryId);
    }

    if (Array.isArray(FormDatas.metalId)) {
      FormDatas.metalId.forEach(id => {
        formDataToSend.append('metalId[]', id);
      });
    } else {
      formDataToSend.append('metalId', FormDatas.metalId);
    }

    if (Array.isArray(FormDatas.sizeId)) {
      FormDatas.sizeId.forEach(id => {
        formDataToSend.append('sizeId[]', id);
      });
    } else {
      formDataToSend.append('sizeId', FormDatas.sizeId);
    }

    selectedImages.forEach((file) => {
      formDataToSend.append('images', file)
    })
    // console.log('formDataToSend: ', formDataToSend);

    try {

      const response = await axiosInstance.put(`${baseUrl}/item/update/${id}`, formDataToSend);
      // console.log(' response ---------------------: ', response);


      toast.success("Item updated successfully!", { theme: "dark", autoClose: 1500 });
      handleClearAll();
      setLoading(false)
      navigate('/Allitem')
    } catch (error) {

      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(`${errorMessage}`, { theme: "dark", autoClose: 2000 });
      setLoading(false)
    }
  };





  const handleClearAll = () => {
    reset({
      categoryId: "",
      suppllierId: "",
      subCategoryId: [],
      metalId: [],
      sizeId: []
    });
    setSelectedCategories([]);
    setSelectedImages([]);
    setInputValue("");

    localStorage.removeItem('draftData');
    setFormData({
      categoryId: "",
      suppllierId: "",
      subCategoryId: [],
      metalId: [],
      sizeId: [],
    });
    setShowDropdown(false);
  };

  const loadFormData = () => {
    const savedData = JSON.parse(localStorage.getItem('draftData'));
    if (savedData) {
      reset(savedData);
      setFormData(savedData);
      setSelectedCategories(savedData.selectedCategories || []);
      setSelectedImages(savedData.selectedImages || []);
    }
  };

  const autoSaveFormData = (data) => {
    const draftData = {
      ...data,
      ...FormDatas,
      selectedImages,
      selectedCategories,
    };
    localStorage.setItem("draftData", JSON.stringify(draftData));
  };
  useEffect(() => {

    loadFormData();

  }, [])
  const handleDeleteImage = (index) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    if (index === 0 && updatedImages.length > 0) {
      updatedImages[0] = updatedImages[0];
    }

    setSelectedImages(updatedImages);
  };
  async function deldata(id) {
    let result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    })
    if (result.isConfirmed) {
      try {
        let del = await axiosInstance.delete(`${baseUrl}/item/delete/${id}`)
        toast.success("Delete Item Successfully!", { theme: "dark", autoClose: 1500 });

        navigate('/Allitem')
      }
      catch (e) {
        console.log(e)
      }
    }
  }

  const visibleFieldsByType = {
    "1": ["grossWeight", "lessWeight", "netWeight", "metalRatePerGram", "itemRate", "labourCharges", "labourRatePerGram", "otherCharges", "mrp", "sellingPrice", "gst", "discount"],
    "2": ["grossWeight", "perGramWeight", "mrp", "sellingPrice", "gst", "discount"],
    "3": ["grossWeight", "mrp", "sellingPrice", "gst", "discount"],
  };

  const selectedType = watch("type");

  useEffect(() => {
    setDropDownType(selectedType);
  }, [selectedType]);

  const isFieldVisible = (field) => visibleFieldsByType[selectedType]?.includes(field);

  const grossWeight = parseFloat(watch("grossWeight")) || 0;
  const lessWeight = parseFloat(watch("lessWeight")) || 0;
  const metalRatePerGram = parseFloat(watch("metalRatePerGram")) || 0;
  const labourRatePerGram = parseFloat(watch("labourRatePerGram")) || 0;
  const otherCharges = parseFloat(watch("otherCharges")) || 0;
  const discount = parseFloat(watch("discount")) || 0;


  useEffect(() => {
    if (selectedType === "1") {
      const netWeight = grossWeight - lessWeight;
      const itemRate = netWeight * metalRatePerGram;
      const labourCharges = grossWeight * labourRatePerGram;
      const mrp = itemRate + labourCharges + otherCharges;
      const gst = +(mrp * 0.03);
      const sellingPrice = mrp + gst - discount;
      const finalPrice = sellingPrice - discount;

      setValue("netWeight", netWeight.toFixed(2));
      setValue("itemRate", itemRate.toFixed(2));
      setValue("labourCharges", labourCharges.toFixed(2));
      setValue("mrp", mrp.toFixed(2));
      setValue("gst", gst.toFixed(2));
      setValue("sellingPrice", sellingPrice.toFixed(2));
      setValue("finalPrice", finalPrice.toFixed(2));

      const updatedData = {
        ...getValues(),
        netWeight,
        itemRate,
        labourCharges,
        mrp,
        gst,
        sellingPrice,
        finalPrice
      };

      localStorage.setItem("draftData", JSON.stringify(updatedData));
    }
  }, [grossWeight, lessWeight, metalRatePerGram, labourRatePerGram, otherCharges, discount, selectedType]);


  useEffect(() => {
    if (selectedType === "2") {
      const grossWeight = parseFloat(watch("grossWeight")) || 0;
      const perGramWeight = parseFloat(watch("perGramWeight")) || 0;
      const discount = parseFloat(watch("discount")) || 0;

      const baseAmount = grossWeight * perGramWeight;
      const gst = +(baseAmount * 0.03);
      const sellingPrice = baseAmount + gst - discount;
      const finalPrice = sellingPrice - discount;

      setValue("mrp", baseAmount.toFixed(2));
      setValue("gst", gst.toFixed(2));
      setValue("sellingPrice", sellingPrice.toFixed(2));
      setValue("finalPrice", finalPrice.toFixed(2));

      const updatedData = {
        ...getValues(),
        mrp: baseAmount,
        gst,
        sellingPrice,
        finalPrice,
      };

      localStorage.setItem("draftData", JSON.stringify(updatedData));
    }
  }, [watch("grossWeight"), watch("perGramWeight"), watch("discount"), selectedType]);

  useEffect(() => {
    if (selectedType === "3") {
      const mrp = parseFloat(watch("mrp")) || 0;
      const discount = parseFloat(watch("discount")) || 0;

      const gst = +(mrp * 0.03);
      const sellingPrice = mrp + gst - discount;
      const finalPrice = sellingPrice - discount;

      setValue("gst", gst.toFixed(2));
      setValue("sellingPrice", sellingPrice.toFixed(2));
      setValue("finalPrice", finalPrice.toFixed(2));

      const updatedData = {
        ...getValues(),
        gst,
        sellingPrice,
        finalPrice,
      };

      localStorage.setItem("draftData", JSON.stringify(updatedData));
    }
  }, [watch("mrp"), watch("discount"), selectedType]);
  return (
    <div className={styles.container}>
      <div className={`${styles.header} justify-content-end`}>
        {/* <h2 className="fw-bold">Item Creation</h2> */}
        <div className={styles.headerButtons}>
          {/* <Button className="bg-success bg-gradient" size="sm">SAVE</Button> */}
          <Button variant="dark" size="sm" className="ms-2 bg-danger bg-gradient" onClick={() => deldata(id)}>DELETE</Button>
        </div>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}
        className={styles.formContainer}
        encType="multipart/form-data">
        <Row>
          {/* First Row */}



          <Col lg={6}>
            <Form.Group className="mb-3 d-flex ">
              <Form.Label style={{ width: "170px" }}>Item Name :</Form.Label>
              <div className="w-100">
                <Form.Control
                  type="text"
                  placeholder="Item Name"
                  {...register("itemName",
                    {
                      required: "Item Name is required",
                      onBlur: (e) => {
                        const value = e.target.value;
                        autoSaveFormData({ ...getValues(), itemName: value });
                        setFormData((prev) => ({
                          ...prev,
                          itemName: value,
                        }));
                      },
                      onChange: (e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          itemName: value,
                        }));
                      },
                    })}
                  isInvalid={!!errors.itemName}
                />


                <Form.Control.Feedback type="invalid">
                  {errors.itemName?.message}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

          </Col>

          <Col lg={6}>
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="me-2 mb-0" style={{ width: "150px" }}>Item Code :</Form.Label>
              <Form.Control type="text" readOnly

                {...register("itemCode",
                  {
                    onBlur: (e) => {
                      const value = e.target.value;
                      autoSaveFormData({ ...getValues(), itemName: value });
                      setFormData((prev) => ({
                        ...prev,
                        itemCode: value,
                      }));
                    },
                    onChange: (e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        itemCode: value,
                      }));
                    },
                  })} />

            </Form.Group>
          </Col>

          {/* Second Row */}
          <Col lg={7}>
            <AutoCompleteMultiSelect
              label="Category"
              placeholder="Select category"
              apiUrl={`${baseUrl}/item/categories`}
              fieldKey="categoryId"
              draftData={FormDatas}
              setDraftData={setFormData}
              error={error}


            />

            <AutoCompleteMultiSelect
              label="Sub-Category"
              placeholder="Search or select sub-category"
              apiUrl={`${baseUrl}/item/by-category/${FormDatas.categoryId}`}
              fieldKey="subCategoryId"
              draftData={FormDatas}
              setDraftData={setFormData}
              dependentId={FormDatas.categoryId}
              error={error}
              value={FormDatas.subCategoryId}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, subCategoryId: value }));
                autoSaveFormData({ ...getValues(), subCategoryId: value });
              }}
            />



            <AutoCompleteMultiSelect
              label="Size"
              placeholder="Search or select size"
              apiUrl={`${baseUrl}/item/size`}
              fieldKey="sizeId"
              draftData={FormDatas}
              setDraftData={setFormData}
              error={error}
            />
            {/* <p>{error}</p> */}


            <AutoCompleteMultiSelect
              label="Metal"
              placeholder="Search or select metal"
              apiUrl={`${baseUrl}/item/metals`}
              fieldKey="metalId"
              draftData={FormDatas}
              setDraftData={setFormData}
              error={error}
            />
            {/* <p>{error}</p> */}


            <AutoCompleteMultiSelect
              label="Supplier"
              placeholder="Search or select supplier"
              apiUrl={`${baseUrl}/item/supplier`}
              fieldKey="suppllierId"
              draftData={FormDatas}
              setDraftData={setFormData}
              error={error}
            />
            {/* <p>{error}</p> */}




            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="me-2 mb-0" style={{ width: "147px" }}>skus :</Form.Label>
              <div className="w-100">
                <Form.Control type="number"
                  {...register("skus", {
                    required: "skus is required",

                    onBlur: (e) => {
                      const value = e.target.value;
                      autoSaveFormData({ ...getValues(), skus: value });
                      setFormData(prev => ({ ...prev, skus: value }));
                    },

                    onChange: (e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, skus: value }));
                    },
                  })}

                  isInvalid={!!errors.skus} placeholder="skus"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.skus?.message}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>




          <Col lg={5}>
            <Form.Group className="mb-3">
              <div className={styles.uploadBox} >
                {/* Main Image Preview */}
                {selectedImages.length > 0 && (
                  <div className={styles.imageContainer}
                    onClick={() => {
                      const imageSrc = selectedImages[0] instanceof File
                        ? URL.createObjectURL(selectedImages[0])
                        : selectedImages[0];
                      setOverlayImage(imageSrc);
                      setShowOverlay(true);
                    }}
                  >
                    <img
                      src={
                        selectedImages[0] instanceof File
                          ? URL.createObjectURL(selectedImages[0])
                          : selectedImages[0]
                      }
                      alt="Selected Preview"
                      className={styles.selectedImagePreview}
                      style={{ cursor: "pointer" }}
                    />


                    {/* Delete Button for Main Image */}
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(0);
                      }}
                    >
                      &times;
                    </button>
                  </div>
                )}

                {/* Display the count of selected images */}
                {selectedImages.length > 1 && (
                  <p className={styles.selectedImageCount}>
                    {selectedImages.length - 1} more images selected
                  </p>
                )}

                {/* Arrow Icon and Text */}
                <div className={styles.uploadIcon}>
                  <HiMiniArrowUpOnSquare size={50} />
                </div>

                {/* Conditional Rendering for Upload Text and Supported Formats */}
                {selectedImages.length === 0 && (
                  <>
                    <p><b>Upload Image Here</b></p>
                    <p className={styles.uploadNote}>
                      (.jpeg, .png, .gif, .mp4 files supported only) <br />
                      (Max file size 50MB)
                    </p>
                  </>
                )}

                {/* Hidden Input */}
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  // {...register("images",{
                  //   required: "images is required", 
                  //   onBlur: () => autoSaveFormData({ ...getValues() })
                  // })}
                  {...register("images")}
                  onChange={handleImageChange}
                  className={styles.fileInput}

                  isInvalid={!!errors.images}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.images?.message}
                </Form.Control.Feedback>

                {/* Thumbnails (small images) */}
                {selectedImages.length > 1 && (
                  <div className={styles.uploadThumbnails}>
                    {selectedImages.slice(1)?.map((img, index) => {
                      const imageSrc = img instanceof File ? URL.createObjectURL(img) : img;
                      return (
                        <div key={index} className={styles.thumbnailContainer}>
                          <img
                            src={imageSrc}
                            alt={`Preview ${index}`}
                            className={styles.thumbnail}
                            onClick={() => {
                              setOverlayImage(imageSrc);
                              setShowOverlay(true);
                            }}
                            style={{ cursor: "pointer" }}
                          />
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(index + 1);
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </Form.Group>
          </Col>




          <Col lg={6}>
          </Col>

          <Col lg={12}>
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label style={{ width: "140px" }}>Description :</Form.Label>
              <div className="w-100">
                <Form.Control as="textarea" rows={3}
                  {...register("description", {
                    // required: "Description is required",

                    onBlur: (e) => {
                      const value = e.target.value;
                      autoSaveFormData({ ...getValues(), description: value });
                      setFormData(prev => ({ ...prev, description: value }));
                    },

                    onChange: (e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, description: value }));
                    },
                  })}


                  placeholder="Description" style={{ width: "100%" }}
                // isInvalid={!!errors.description}
                />
                {/* <Form.Control.Feedback type="invalid">
                  {errors.description?.message}
                </Form.Control.Feedback> */}
              </div>
            </Form.Group>
          </Col>


          <Col lg={12}>
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label style={{ width: "140px" }}>Gender :</Form.Label>
              <div className="w-100 d-flex gap-4">
                {["Men", "Women", "Kids"]?.map((label) => (
                  <Form.Check
                    key={label}
                    type="radio"
                    label={label}
                    value={label.toLowerCase()}
                    {...register("gender", {
                      required: "Please select a gender",
                      onChange: (e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({ ...prev, gender: value }));
                        autoSaveFormData({ ...getValues(), gender: value });
                      },
                    })}
                    checked={watch("gender") === label.toLowerCase()}
                    name="gender"
                    isInvalid={!!errors.gender}

                  />
                ))}
              </div>
            </Form.Group>
            <Form.Control.Feedback type="invalid">
              {errors.skus?.message}
            </Form.Control.Feedback>
          </Col>


          <Col lg={12}>
            <Form.Group className="mb-3 d-flex gap-4 align-items-center">
              <Form.Label className="me-2 mb-0">Select Type:</Form.Label>
              <div className="d-flex gap-4">
                {["1", "2", "3"]?.map((val) => (
                  <Form.Check
                    key={val}
                    inline
                    type="radio"
                    label={`Type ${val}`}
                    id={`type${val}`}
                    value={val}


                    {...register("type", {
                      onChange: (e) => {
                        const value = e.target.value;
                        setDropDownType(value);
                      },
                    })}
                  />
                ))}
              </div>
            </Form.Group>
          </Col>



          {/* Metal Weights Section */}
          {isFieldVisible("metalWeight") && (
            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-1 mb-0" style={{ width: "195px" }}>Metal Weight :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("metalWeight", {
                      required: "Metal Weight is required",

                      onBlur: (e) => {
                        const value = e.target.value;
                        autoSaveFormData({ ...getValues(), metalWeight: value });
                        setFormData(prev => ({ ...prev, metalWeight: value }));
                      },

                      onChange: (e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, metalWeight: value }));
                      },
                    })}
                    // style={{ width: "80%" }} 
                    placeholder="Metal Weight"

                    isInvalid={!!errors.metalWeight} />
                  <Form.Control.Feedback type="invalid">
                    {errors.metalWeight?.message}
                  </Form.Control.Feedback>

                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("grossWeight") && (
            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-1 mb-0" style={{ width: "190px" }}>Gross Weight :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("grossWeight",
                      {
                        required: "Gross Weight is required",
                        onBlur: (e) => {
                          const value = e.target.value;
                          autoSaveFormData({ ...getValues(), grossWeight: value });
                          setFormData(prev => ({ ...prev, grossWeight: value }));
                        },

                        onChange: (e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, grossWeight: value }));
                        },
                      })}
                    // style={{ width: "80%" }}
                    placeholder="Gross Weight"
                    isInvalid={!!errors.grossWeight} />
                  <Form.Control.Feedback type="invalid">
                    {errors.grossWeight?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("netWeight") && (
            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "170px" }}>Net Weight :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("netWeight",

                      {
                        required: "Net Weight is required",


                        onBlur: (e) => {
                          const value = e.target.value;
                          autoSaveFormData({ ...getValues(), netWeight: value });
                          setFormData(prev => ({ ...prev, netWeight: value }));
                        },

                        onChange: (e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, netWeight: value }));
                        },
                      })}



                    placeholder="Net Weight"
                    isInvalid={!!errors.netWeight} />
                  <Form.Control.Feedback type="invalid">
                    {errors.netWeight?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          {/* Pricing Section */}
          {isFieldVisible("perGramWeight") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-1 mb-0" style={{ width: "180px" }}>Per Gram Rate :</Form.Label>

                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("perGramWeight",

                      {
                        required: "Per Gram Weight is required",

                        onBlur: (e) => {
                          const value = e.target.value;
                          autoSaveFormData({ ...getValues(), perGramWeight: value });
                          setFormData(prev => ({ ...prev, perGramWeight: value }));
                        },

                        onChange: (e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, perGramWeight: value }));
                        },
                      })}

                    // style={{ width: "90%" }}
                    placeholder="Per Gram Rate"
                    isInvalid={!!errors.perGramWeight} />
                  <Form.Control.Feedback type="invalid">
                    {errors.perGramWeight?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("labourRatePerGram") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "200px" }}>Labour Per Gram :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    {...register("labourRatePerGram",
                      {
                        required: "Labour Per Gram is required",

                        onBlur: (e) => {
                          const value = e.target.value;
                          autoSaveFormData({ ...getValues(), labourRatePerGram: value });
                          setFormData(prev => ({ ...prev, labourRatePerGram: value }));
                        },

                        onChange: (e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, labourRatePerGram: value }));
                        },
                      })}
                    // style={{ width: "90%" }}
                    placeholder="Labour Charges"
                    isInvalid={!!errors.makingCharges} />
                  <Form.Control.Feedback type="invalid">
                    {errors.makingCharges?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("labourCharges") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "220px" }}>Labour Amount :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("labourCharges",
                      {
                        required: ">Labour Amount is required",

                        onBlur: (e) => {
                          const value = e.target.value;
                          autoSaveFormData({ ...getValues(), labourCharges: value });
                          setFormData(prev => ({ ...prev, labourCharges: value }));
                        },

                        onChange: (e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, labourCharges: value }));
                        },
                      })}
                    // style={{ width: "90%" }}
                    placeholder="Labour Charges"
                    isInvalid={!!errors.makingCharges} />
                  <Form.Control.Feedback type="invalid">
                    {errors.makingCharges?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("lessWeight") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "150px" }}>Less Weight:</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("lessWeight",
                      {
                        required: " lessWeight is required",

                        onBlur: (e) => {
                          const value = e.target.value;
                          autoSaveFormData({ ...getValues(), lessWeight: value });
                          setFormData(prev => ({ ...prev, lessWeight: value }));
                        },

                        onChange: (e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, lessWeight: value }));
                        },
                      })}
                    // style={{ width: "90%" }}
                    placeholder="Less Weight"
                    isInvalid={!!errors.lessWeight} />
                  <Form.Control.Feedback type="invalid">
                    {errors.lessWeight?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("metalRatePerGram") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "220px" }}>Metal Rate Per Gram :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    {...register("metalRatePerGram",
                      {
                        required: "Making Charges is required",

                        onBlur: (e) => {
                          const value = e.target.value;
                          autoSaveFormData({ ...getValues(), metalRatePerGram: value });
                          setFormData(prev => ({ ...prev, metalRatePerGram: value }));
                        },

                        onChange: (e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, metalRatePerGram: value }));
                        },
                      })}
                    // style={{ width: "90%" }}
                    placeholder="Metal Rate Per Gram"
                    isInvalid={!!errors.metalRatePerGram} />
                  <Form.Control.Feedback type="invalid">
                    {errors.metalRatePerGram?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("itemRate") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "220px" }}>Item Amount :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("itemRate",
                      {
                        required: "Item Amount  is required",

                        onBlur: (e) => {
                          const value = e.target.value;
                          autoSaveFormData({ ...getValues(), itemRate: value });
                          setFormData(prev => ({ ...prev, itemRate: value }));
                        },

                        onChange: (e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, itemRate: value }));
                        },
                      })}
                    // style={{ width: "90%" }}
                    placeholder="Item Amount"
                    isInvalid={!!errors.itemRate} />
                  <Form.Control.Feedback type="invalid">
                    {errors.itemRate?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("gst") && (


            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "150px" }}>GST :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("gst", {
                      required: "GST is requires",

                      onBlur: (e) => {
                        const value = e.target.value;
                        autoSaveFormData({ ...getValues(), gst: value });
                        setFormData(prev => ({ ...prev, gst: value }));
                      },

                      onChange: (e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, gst: value }));
                      },
                    })}
                    placeholder="GST"
                    isInvalid={!!errors.gst} />
                  <Form.Control.Feedback type="invalid">
                    {errors.gst?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("otherCharges") && (


            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "198px" }}>Other Charges </Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("otherCharges", {
                      // required: "Other Charges is required",

                      onBlur: (e) => {
                        const value = e.target.value;
                        autoSaveFormData({ ...getValues(), otherCharges: value });
                        setFormData(prev => ({ ...prev, otherCharges: value }));
                      },

                      onChange: (e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, otherCharges: value }));
                      },
                    })}
                    placeholder="Other Charges"
                  // style={{ width: "93%" }} 
                  // isInvalid={!!errors.otherCharges} 
                  />
                  {/* <Form.Control.Feedback type="invalid">
                  {errors.otherCharges?.message}
                </Form.Control.Feedback> */}
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("discount") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "150px" }}>Discount :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"

                    {...register("discount", {
                      // required: "Discount is required",

                      onBlur: (e) => {
                        const value = e.target.value;
                        autoSaveFormData({ ...getValues(), discount: value });
                        setFormData(prev => ({ ...prev, discount: value }));
                      },

                      onChange: (e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, discount: value }));
                      },
                    })}


                    placeholder="Discount"
                  // isInvalid={!!errors.discount}
                  />
                  {/* <Form.Control.Feedback type="invalid">
                  {errors.discount?.message}
                </Form.Control.Feedback> */}
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("mrp") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "150px" }}>MRP :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("mrp", {
                      required: "MRP is required",


                      onBlur: (e) => {
                        const value = e.target.value;
                        autoSaveFormData({ ...getValues(), mrp: value });
                        setFormData(prev => ({ ...prev, mrp: value }));
                      },

                      onChange: (e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, mrp: value }));
                      },
                    })}


                    placeholder="MRP"
                    onBlur={(e) => autoSaveFormData({ ...getValues(), mrp: e.target.value })} isInvalid={!!errors.mrp} />
                  <Form.Control.Feedback type="invalid">
                    {errors.mrp?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          <Col lg={6}>
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="me-2 mb-0" style={{ width: "150px" }}>Sale Price :</Form.Label>
              <div className="w-100">
                <Form.Control type="number"
                  min="0.00"
                  step="0.01"
                  {...register("sellingPrice", {
                    required: "Sale Price is required",


                    onBlur: (e) => {
                      const value = e.target.value;
                      autoSaveFormData({ ...getValues(), sellingPrice: value });
                      setFormData(prev => ({ ...prev, sellingPrice: value }));
                    },

                    onChange: (e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, sellingPrice: value }));
                    },
                  })}


                  placeholder="Sale Price"
                  isInvalid={!!errors.sellingPrice} />
                <Form.Control.Feedback type="invalid">
                  {errors.sellingPrice?.message}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* Submit Button */}
          <Col lg={12} className="text-end">
            <Button type="submit" variant="dark" className={styles.submitButton} disabled={loading}>
              {loading ? "Submitting..." : "UPDATE"}
            </Button>
          </Col>
          {showOverlay && (
            <div
              className={styles.overlay}
              onClick={() => setShowOverlay(false)}
            >
              <img
                src={overlayImage}
                alt="Full Size Preview"
                className={styles.fullSizeImage}
              />
              <button
                className={styles.overlayClose}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOverlay(false);
                }}
              >
                &times;
              </button>
            </div>
          )}

        </Row>
      </Form>
    </div>
  );
}
