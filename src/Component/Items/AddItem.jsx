import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./Additem.module.css";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import { HiMiniArrowUpOnSquare } from "react-icons/hi2";
import axiosInstance from "../../api/axiosInstance";
import AutoCompleteMultiSelect from "./AutoCompleteMultiSelect";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


export function AddItem() {
  const { register, handleSubmit, reset, setValue, getValues, setError, watch,
    clearErrors, formState: { errors }, trigger } = useForm({
      defaultValues: {
        // type: "1", // Set default radio selection to "Type 1"
        discount: "0",
      },
    });

  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, seterror] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayImage, setOverlayImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type, setDropDownType] = useState("")
  // console.log('typesssss: ', type);
  const [itemCode, setItemCode] = useState('')

  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const DRAFT_KEY = 'addItemDraft';


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
        labourCharges: parsed.labourCharges || "",
        lessWeight: parsed.lessWeight || "",
        metalRatePerGram: parsed.metalRatePerGram || "",
        labourRatePerGram: parsed.labourRatePerGram || "",
        itemRate: parsed.itemRate || "",
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
      itemCode,
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
    formDataToSend.append("type", +updatedData.type);
    // console.log('type: ', +updatedData.type);
    formDataToSend.append("gender", updatedData.gender || "");

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
    console.log('formDataToSend: ', formDataToSend);

    try {

      const response = await axiosInstance.post(`${baseUrl}/item/create`, formDataToSend);
      // console.log('response:------- ', response);
      toast.success("Item created successfully!", { theme: "dark", autoClose: 1500 });
      handleClearAll();
      setLoading(false)
      navigate("/Allitem")

    } catch (error) {

      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(`${errorMessage}`, { theme: "dark", autoClose: 2000 });
      console.error(error);

      setLoading(false)
    } finally {
      setLoading(false)

    }
  };


  async function getItemCode() {
    let res = await axiosInstance.get(`${baseUrl}/item/next/code`)
    // console.log('res-------------: ', res.data);
    setItemCode(res.data);

  }
  useEffect(() => {
    getItemCode()
  }, [])


  // async function getDetailsById(itemCode) {
  //   console.log('itemCode: ', itemCode);
  //   try {

  //     let res = await axiosInstance.get(`${baseUrl}/item/getAll`, {
  //       params: {
  //         page: 1,
  //         limit: 100,
  //       },
  //     });
  //     // console.log('res: ', res);

  //     const allItems = Array.isArray(res.data.data)
  //       ? res.data.data
  //       : res.data.data.items || [];

  //     const foundItem = allItems.find((item) => item.itemCode === itemCode);

  //     if (!foundItem) {
  //       toast.error(`Item with code "${itemCode}" not found`);
  //       return;
  //     }


  //     const id = foundItem._id;
  //     const detailRes = await axiosInstance.get(`${baseUrl}/item/get/${encodeURIComponent(itemCode)}`);
  //     console.log('detailRes: ', detailRes);

  //     // const data = detailRes.data.data;
  //     // console.log('data: ', data);


  //     // reset(data);
  //     // setFormData({
  //     //   // itemName: data.itemName || "",
  //     //   // description: data.description || "",
  //     //   // metalWeight: data.metalWeight || "",
  //     //   // grossWeight: data.grossWeight || "",
  //     //   // netWeight: data.netWeight || "",
  //     //   // perGramWeight: data.perGramWeight || "",
  //     //   // makingCharges: data.makingCharges || "",
  //     //   // gst: data.gst || "",
  //     //   // otherCharges: data.otherCharges || "",
  //     //   // discount: data.discount || "",
  //     //   // mrp: data.mrp || "",
  //     //   // sellingPrice: data.sellingPrice || "",
  //     //   // skus: data.skus || "",
  //     //   categoryId: data.categoryId || "",
  //     //   suppllierId: data.suppllierId || "",
  //     //   subCategoryId: data.subCategoryId || [],
  //     //   metalId: data.metalId || [],
  //     //   sizeId: data.sizeId || [],
  //     // });

  //     // const normalizedData = {

  //     //   itemName: data.itemName || "",
  //     //   itemCode: data.itemCode || "",

  //     //   description: data.description || "",
  //     //   metalWeight: data.metalWeight || "",
  //     //   grossWeight: data.grossWeight?.$numberDecimal || "",
  //     //   netWeight: data.netWeight?.$numberDecimal || "",
  //     //   perGramWeight: data.perGramWeight?.$numberDecimal || "",
  //     //   makingCharges: data.makingCharges?.$numberDecimal || "",
  //     //   gst: data.gst?.$numberDecimal || "",
  //     //   labourCharges: data.labourCharges?.$numberDecimal || "",
  //     //   itemRate: data.itemRate?.$numberDecimal || "",
  //     //   otherCharges: data.otherCharges || "",
  //     //   labourRatePerGram: data.labourRatePerGram || "",
  //     //   metalRatePerGram: data.metalRatePerGram || "",
  //     //   lessWeight: data.lessWeight?.$numberDecimal || "",
  //     //   discount: data.discount || "",
  //     //   mrp: data.mrp?.$numberDecimal || "",
  //     //   sellingPrice: data.sellingPrice?.$numberDecimal || "",
  //     //   skus: data.skus || "",
  //     //   categoryId: data.categoryId || "",
  //     //   suppllierId: data.suppllierId || "",
  //     //   subCategoryId: data.subCategoryId || [],
  //     //   metalId: data.metalId || [],
  //     //   sizeId: data.sizeId || [],
  //     //   type: data.type?.toString() || "",
  //     // };

  //     // reset(normalizedData);
  //     // setValue("type", data.type?.toString() || "");
  //     // // console.log('data.imageUrl: ', data.imageUrl);

  //     // if (data.imageUrl) {
  //     //   setSelectedImages(data.imageUrl);
  //     // }
  //     // toast.success('Items fetched successfully.', { theme: "dark", autoClose: 1500 });

  //   }
  //   catch (e) {
  //     const errorMessage =
  //       e?.response?.data?.message || "Something went wrong!";
  //     toast.error(` ${errorMessage}`, { theme: "dark", autoClose: 2000 });
  //     console.error(e);
  //   }
  // }

  const handleClearAll = () => {
    reset({
      itemName: "",
      categoryId: "",
      suppllierId: "",
      subCategoryId: [],
      metalId: [],
      sizeId: []
    });

    setFormData({
      itemName: "",
      categoryId: "",
      suppllierId: "",
      subCategoryId: [],
      metalId: [],
      sizeId: []
    });

    setSelectedCategories([]);
    setSelectedImages([]);
    setInputValue("");
    setShowDropdown(false);

    // ✅ Only remove draft if it was restored
    if (isDraftRestored) {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem("draftData");
      setIsDraftSaved(false);
      setIsDraftRestored(false);
      toast.success("Draft cleared.");
    }
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

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      setIsDraftSaved(true);
    }
  }, []);

  const handleToggleDraft = () => {
    if (!isDraftSaved) {
      // Save the data and clear form
      const data = getValues();
      const draftData = {
        ...data,
        ...FormDatas,
        selectedImages,
        selectedCategories,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));

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
      setShowDropdown(false);
      setFormData({});

      toast.success("Draft saved successfully!");
      setIsDraftSaved(true);
      setIsDraftRestored(false);
    } else {
      // Load the saved draft data
      const storedData = JSON.parse(localStorage.getItem(DRAFT_KEY));
      if (storedData) {
        reset(storedData);
        setFormData(storedData);
        setSelectedCategories(storedData.selectedCategories || []);
        setSelectedImages(storedData.selectedImages || []);
        toast.info("Draft restored.");
        setIsDraftRestored(true);
      }
      setIsDraftSaved(false);
    }
  };


  const handleDeleteImage = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    setValue("images", updatedImages, { shouldValidate: true });
    autoSaveFormData({ ...getValues(), images: updatedImages });
  };


  useEffect(() => {
    // setValue("type", "1");
    setValue("discount", "0");
    setValue("otherCharges", "0");
  }, [setValue]);

  const visibleFieldsByType = {
    "1": ["grossWeight", "lessWeight", "netWeight", "metalRatePerGram", "itemRate", "labourCharges", "labourRatePerGram", "otherCharges", "mrp", "sellingPrice", "gst", "discount"],
    "2": ["grossWeight", "perGramWeight", "mrp", "sellingPrice", "gst", "discount"],
    "3": ["grossWeight", "mrp", "sellingPrice", "gst", "discount"],
  };

  const selectedType = watch("type");
  const visibleFields = visibleFieldsByType[selectedType] || [];
  const isFieldVisible = (field) => visibleFields.includes(field);

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

  const fetchItemDetails = async () => {
    if (!itemCode?.trim()) return;

    try {
      setLoading(true)
      const res = await axiosInstance.post(`${baseUrl}/item/get/${itemCode}`, { itemCode });
      const itemData = res.data.data;

      console.log('itemData: ', itemData);

      reset({
        itemName: itemData.itemName || "",
        skus: itemData.skus || "",
        description: itemData.description || "",
        gender: itemData.gender || "",
        metalWeight: itemData.metalWeight || "",
        grossWeight: itemData.grossWeight?.$numberDecimal || "",
        lessWeight: itemData.lessWeight?.$numberDecimal || "",
        netWeight: itemData.netWeight?.$numberDecimal || "",
        labourRatePerGram: itemData.labourRatePerGram || "",
        labourCharges: itemData.labourCharges?.$numberDecimal || "",
        metalRatePerGram: itemData.metalRatePerGram || "",
        itemRate: itemData.itemRate?.$numberDecimal || "",
        gst: itemData.gst?.$numberDecimal || "",
        perGramWeight: itemData.perGramWeight?.$numberDecimal || "",
        otherCharges: itemData.otherCharges ?? "",    // fallback "" instead of 0
        type: itemData.type?.toString() || "",
        discount: itemData.discount ?? "",
        mrp: itemData.mrp?.$numberDecimal || "",
        sellingPrice: itemData.sellingPrice?.$numberDecimal || "",
        finalPrice: itemData.finalPrice?.$numberDecimal || "",
      });

      setFormData({
        type: itemData.type?.toString() || "",
        categoryId: itemData.categoryId || "",
        suppllierId: itemData.suppllierId || "",
        subCategoryId: itemData.subCategoryId || [],
        metalId: itemData.metalId || [],
        sizeId: itemData.sizeId || [],
        gender: itemData.gender || "",
      });

      if (itemData.imageUrl) {
        setSelectedImages(itemData.imageUrl);
      }

      toast.success('Items fetched successfully.', { theme: "dark", autoClose: 1500 });
      // setValue("type", data.type?.toString() || "");

      setValue("categoryId", itemData.categoryId || "");
      setValue("suppllierId", itemData.suppllierId || "");
      setValue("subCategoryId", itemData.subCategoryId || []);
      setValue("metalId", itemData.metalId || []);
      setValue("sizeId", itemData.sizeId || []);

      console.log("type", itemData.type)
      setDropDownType(itemData.type)
      localStorage.setItem("itemType", itemData.type?.toString() || "");
      // console.log("typesss after", type)

      setTimeout(() => {
        console.log("Form after reset:", watch());
      }, 1000);
      setLoading(false)

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch item details");
    } finally {
      localStorage.removeItem("draftData");
      setLoading(false)

    }
  };

  useEffect(() => {
    const savedType = localStorage.getItem("itemType");
    if (savedType) {
      setDropDownType(savedType);
      setValue("type", savedType);
    }
  }, []);


  // useEffect(() => {
  //   setValue("type", type?.toString() || "");

  // }, [])

  // console.log("type aftre", type)
  // useEffect(() => {
  //   if (localStorage.getItem("fetchedOnce") === "true") {
  //     handleClearAll();
  //     reset({
  //       itemName: "",
  //       skus: "",
  //       description: ""
  //     })
  //     setFormData({
  //       itemName: "",
  //       skus: "",
  //       description: ""
  //     })
  //     localStorage.removeItem("fetchedOnce");
  //   }
  // }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchItemDetails();
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className="fw-bold">Item Creation</h2>
        <div className={styles.headerButtons}>
          <Button
            variant="dark"
            size="sm"
            onClick={handleToggleDraft}
          >
            {isDraftSaved ? "Restore Draft" : "Save Draft"}
          </Button>





          <Button variant="dark" size="sm" className="ms-2" onClick={handleClearAll}>Clear All</Button>
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
                  {...register("itemName", {
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
              <Form.Label className="me-2 mb-1" style={{ width: "150px" }}>
                Item Code :
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter item code"
                />
                <Button
                  style={{whiteSpace: "nowrap", backgroundColor: 'var(--text-black, #55142A)', color: 'var(--white, #FFF3E3)', boxShadow: '0 4px 6px #71213c87',  border:'none'}}
                  onClick={fetchItemDetails}
                >
                  Fetch
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
          {/* <Col lg={6}>
                  <Form.Group className="mb-3  d-flex align-items-center">
                    <Form.Label className="me-2 mb-1" style={{ width: "150px" }}>
                      Item Code :
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={itemCode}
                        onChange={(e) => setItemCode(e.target.value)}
                        placeholder="Enter item code"

                      />
                      <Button
                        variant="outline-secondary"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        Fetch
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col> */}
          {/* onClick={() => getDetailsById(itemCode)}


                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    getDetailsById(itemCode);
                  }
                }} */}
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
              trigger={trigger}
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

            <AutoCompleteMultiSelect
              label="Metal"
              placeholder="Search or select metal"
              apiUrl={`${baseUrl}/item/metals`}
              fieldKey="metalId"
              draftData={FormDatas}
              setDraftData={setFormData}
              error={error}
            />

            <AutoCompleteMultiSelect
              label="Supplier"
              placeholder="Search or select supplier"
              apiUrl={`${baseUrl}/item/supplier`}
              fieldKey="suppllierId"
              draftData={FormDatas}
              setDraftData={setFormData}
              error={error}
            />

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
                  <div
                    className={styles.imageContainer}
                    onClick={() => {
                      const imageSrc =
                        selectedImages[0] instanceof File || selectedImages[0] instanceof Blob
                          ? URL.createObjectURL(selectedImages[0])
                          : selectedImages[0];
                      setOverlayImage(imageSrc);
                      setShowOverlay(true);
                    }}
                  >
                    <img
                      src={
                        selectedImages[0] instanceof File || selectedImages[0] instanceof Blob
                          ? URL.createObjectURL(selectedImages[0])
                          : selectedImages[0]
                      }
                      alt="Selected Preview"
                      className={styles.selectedImagePreview}
                      style={{ cursor: "pointer" }}
                    />
                    {/* Delete Button */}
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.preventDefault();
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
                      const imageSrc =
                        img instanceof File || img instanceof Blob ? URL.createObjectURL(img) : img;
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
                              e.preventDefault();
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

                />

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
                    checked={watch("type") === val}
                    {...register("type", {
                      onChange: (e) => {
                        const value = e.target.value;
                        setDropDownType(value)
                        // console.log("Selected Type:", value);
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
                <Form.Label className="me-1 mb-0" style={{ width: "200px" }}>Gross Weight :</Form.Label>
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
                    placeholder="Gross Weight"
                    isInvalid={!!errors.grossWeight} />
                  <Form.Control.Feedback type="invalid">
                    {errors.grossWeight?.message}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("lessWeight") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "200px" }}>Less Weight:</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("lessWeight",
                      {


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

                    placeholder="Less Weight"
                  />

                </div>
              </Form.Group>
            </Col>
          )}
          {isFieldVisible("netWeight") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "200px" }}>Net Weight :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("netWeight",

                      {
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
                  />

                </div>
              </Form.Group>
            </Col>
          )}

          {/* Pricing Section */}

          {isFieldVisible("perGramWeight") && (
            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-1 mb-0" style={{ width: "200px" }}>Per Gram Rate :</Form.Label>

                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("perGramWeight",

                      {


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


                    placeholder="Per Gram Rate"
                  />

                </div>
              </Form.Group>
            </Col>
          )}
          {isFieldVisible("labourRatePerGram") && (
            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className={`me-2 mb-0 ${styles.labelFixedWidth}`}>Labour Per Gram :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    {...register("labourRatePerGram",
                      {


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

                    placeholder="Labour Charges"
                  />

                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("labourCharges") && (
            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "210px" }}>Labour Amount :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("labourCharges",
                      {


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

                    placeholder="Labour Charges"
                  />

                </div>
              </Form.Group>
            </Col>
          )}



          {isFieldVisible("metalRatePerGram") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "200px" }}>Metal Rate Per Gram :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    {...register("metalRatePerGram",
                      {


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

                    placeholder="Metal Rate Per Gram"
                  />

                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("itemRate") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className="me-2 mb-0" style={{ width: "200px" }}>Item Amount :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("itemRate",
                      {


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

                    placeholder="Item Amount"
                  />

                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("gst") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className={`${styles.LabelData} me-2 mb-0`} >GST :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("gst", {


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
                  />

                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("otherCharges") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className={`${styles.LabelData} me-2 mb-0`}>Other Charges: </Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    {...register("otherCharges", {


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

                  />

                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("discount") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className={`${styles.LabelData} me-2 mb-0`}>Discount :</Form.Label>
                <div className="w-100">
                  <Form.Control
                    type="number"
                    placeholder="Discount"
                    value={watch("discount")}
                    {...register("discount", {
                      onBlur: (e) => {
                        const value = e.target.value === "" ? "0" : e.target.value;
                        autoSaveFormData({ ...getValues(), discount: value });
                        setFormData(prev => ({ ...prev, discount: value }));
                      },
                      onChange: (e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, discount: value }));
                      },
                    })}
                  />

                </div>
              </Form.Group>
            </Col>
          )}

          {isFieldVisible("mrp") && (

            <Col lg={4}>
              <Form.Group className="mb-3 d-flex align-items-center">
                <Form.Label className={`${styles.LabelData} me-2 mb-0`} >MRP :</Form.Label>
                <div className="w-100">
                  <Form.Control type="number"
                    min="0.00"
                    step="0.01"
                    {...register("mrp", {



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
                    onBlur={(e) => autoSaveFormData({ ...getValues(), mrp: e.target.value })} />

                </div>
              </Form.Group>
            </Col>
          )}

          <Col lg={6}>
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className={`${styles.LabelData} me-2 mb-0`} >Sale Price :</Form.Label>
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
            <Button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Submitting..." : "ADD ITEM"}
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
      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loader}></div>

        </div>
      )}
    </div>

  );
}
