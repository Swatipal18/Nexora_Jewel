import React, { useState, useEffect, useRef } from "react";
import { Form, Modal, Button } from "react-bootstrap";
import styles from "./Additem.module.css";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const AutoCompleteMultiSelect = ({
  label,
  placeholder,
  apiUrl,
  fieldKey,
  draftData,
  setDraftData,
  dependentId, error,
  trigger
}) => {
  const dropdownRef = useRef(null);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(
    Array.isArray(draftData[fieldKey])
      ? draftData[fieldKey]
      : draftData[fieldKey]
        ? [draftData[fieldKey]]
        : []
  );
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const singleSelectFields = ["categoryId", "suppllierId"];

  const navigate = useNavigate();



  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");


  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState("");

  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;


  const createItemApiMap = {
    categoryId: "/categories/create",
    sizeId: "/size/create",
    metalId: "/metal/create",
    subCategoryId: "/sub-categories/create",
  };

  const fieldLabelMap = {
    categoryId: "Category",
    subCategoryId: "Sub-category",
    sizeId: "Size",
    metalId: "Metal",
  };

  const fetchItems = async () => {
    try {
      let url = apiUrl;
      if (fieldKey === "subCategoryId" && dependentId) {

        url = `${baseUrl}/item/by-category/${dependentId}`;

      }
      const response = await axiosInstance.get(url);
      const data = response?.data?.data;
      let items = [];

      if (fieldKey === "sizeId") {
        items = (data?.sizes || [])?.map((item) => ({
          ...item,
          title: item.sizeName || item.title || "",
        }));
      } else if (fieldKey === "metalId") {
        items = (data?.metals || [])?.map((item) => ({
          ...item,
          title: item.metalName || item.title || "",
        }));

      } else if (fieldKey === "suppllierId") {
        items = (data?.suppliers || [])?.map((item) => ({
          ...item,
          title: item.partyName || item.title || "",
        }));
      }
      else if (fieldKey === "subCategoryId") {
        items = (data?.subCategories || [])?.map((item) => ({

          ...item,
          title: item.title || "",
        }));
      } else if (fieldKey === "categoryId") {
        items = (data?.categories || [])?.map((item) => ({
          ...item,
          title: item.title || "",
        }));
      } else {
        const raw = data?.[fieldKey] || data?.list || [];
        items = raw?.map((item) => ({
          ...item,
          title: item.title || "",
        }));
      }
      setFilteredItems(items);
      setAllItems(items);
    } catch (error) {
      console.error(`Error fetching ${fieldKey}`, error);
      setAllItems([]);
    }
  };


  const handleInputClick = () => {
    setShowDropdown(true);
  };

  useEffect(() => {
    if (fieldKey === "subCategoryId") {
      if (dependentId) {
        fetchItems();
      } else {
        setAllItems([]);
        setFilteredItems([]);
        setSelectedItems([]);
        setDraftData((prev) => ({
          ...prev,
          subCategoryId: [],
        }));
      }
    } else {

      fetchItems();
    }
  }, [dependentId]);





  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setDraftData((prev) => ({
      ...prev,
      [`${fieldKey}_input`]: newValue,
    }));
  };

  // useEffect(() => {
  //   if (touched) {
  //     if (selectedItems.length === 0) {
  //       setValidationError(`Please select at least one ${label.toLowerCase()}.`);
  //     } else {
  //       setValidationError("");
  //     }
  //   }
  // }, [touched, selectedItems, label]);


  useEffect(() => {
    if (draftData && (draftData[fieldKey] !== undefined)) {
      const ids = Array.isArray(draftData[fieldKey])
        ? draftData[fieldKey]
        : [draftData[fieldKey]];
      const matchedItems = allItems.filter((item) =>
        ids.includes(item._id)
      );
      setSelectedItems(matchedItems);
    } else {
      setSelectedItems([]);
    }
  }, [draftData, allItems]);





  const handleSelectItem = (item) => {
    if (singleSelectFields.includes(fieldKey)) {
      setSelectedItems([item]);
    } else {
      if (!selectedItems.some((selected) => selected._id === item._id)) {
        setSelectedItems((prevItems) => [...prevItems, item]);
      } else {
        return;
      }
    }


    setDraftData((prev) => {
      const updated = {
        ...prev,
        [fieldKey]: singleSelectFields.includes(fieldKey)
          ? item._id
          : [...selectedItems, item]?.map((i) => i._id)
      };
      if (trigger) {
        trigger(fieldKey);
      }
      return updated;
    });

    // if (singleSelectFields.includes(fieldKey)) {
    //   setShowDropdown(false);
    // }
    setInputValue("");
    setShowDropdown(false);
    setValidationError("");
    setTouched(true);
  };






  const handleRemoveItem = (id) => {
    setTouched(true);

    if (singleSelectFields.includes(fieldKey)) {

      setSelectedItems([]);
      setDraftData((prev) => ({
        ...prev,
        [fieldKey]: "",
      }));
    } else {
      const updated = selectedItems.filter((item) => item._id !== id);
      setSelectedItems(updated);
      setDraftData((prev) => ({
        ...prev,
        [fieldKey]: updated?.map((i) => i._id),
      }));
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);

      }

    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const lowerValue = inputValue.toLowerCase();
    const matched = allItems.filter((item) =>
      (item.title || "").toLowerCase().includes(lowerValue)
    );
    setFilteredItems(matched);

  }, [inputValue, allItems]);



  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const endpoint = createItemApiMap[fieldKey];

    try {
      const payload = { title: newCategoryName.trim() };


      if (fieldKey === "suppllierId") {
        payload.partyName = payload.title;
        delete payload.title;
      } else if (fieldKey === "metalId") {
        payload.metalName = payload.title;
        delete payload.title;
      } else if (fieldKey === "sizeId") {
        payload.sizeName = payload.title;
        delete payload.title;
      }

      const response = await axiosInstance.post(`${baseUrl}${endpoint}`, payload);
      const newItem = response.data.data;


      const formattedItem = {

        ...newItem,
        title:
          newItem.title ||
          newItem.partyName ||
          newItem.sizeName ||
          newItem.metalName ||
          "",
      };

      const updatedItems = [...allItems, formattedItem];
      setAllItems(updatedItems);
      setFilteredItems(updatedItems);
      handleSelectItem(formattedItem);
      toast.success("value added!", { theme: "dark", autoClose: 1500 });
    } catch (error) {
      console.error("Error creating new value", error);
    }

    setShowModal(false);
    setNewCategoryName("");
    setInputValue("");
  };

  useEffect(() => {
    if (fieldKey === "subCategoryId") {
      if (dependentId) {
        fetchItems();
      } else {

        setAllItems([]);
        setFilteredItems([]);
        setSelectedItems([]);
        setDraftData((prev) => ({
          ...prev,
          subCategoryId: [],
        }));
      }
    }
  }, [dependentId]);




  useEffect(() => {
    localStorage.setItem("draftData", JSON.stringify(draftData));
  }, [draftData]);

  useEffect(() => {
    const draft = JSON.parse(localStorage.getItem("draftData") || "{}");

    if (allItems.length && draft[fieldKey]) {
      const ids = Array.isArray(draft[fieldKey]) ? draft[fieldKey] : [draft[fieldKey]];
      const matchedItems = allItems.filter((item) => ids.includes(item._id));
      setSelectedItems(matchedItems);
    }
  }, [allItems]);
  return (
    <Form.Group
      className={`${touched && selectedItems.length === 0 ? 'mb-4' : 'mb-3'} d-flex align-items-start`}
      ref={dropdownRef}
    >

      <Form.Label className="me-2 mb-1" style={{ width: "150px" }}>
        {label}
      </Form.Label>
      <div className={`${styles.inputWrapper} flex-grow-1`}>
        {selectedItems?.map((item, i) => (
          <span key={i} className={styles.chip}>
            {item.title}
            <button type="button"
              onClick={() => handleRemoveItem(item._id)}
              className={styles.chipClose}
            >
              ×
            </button>
          </span>
        ))}

        <Form.Control
          type="text"
          value={inputValue}
          onClick={handleInputClick}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={styles.input}
        />


        {error && <div style={{ color: 'red', fontSize: '0.875rem', marginTop: 4 }}>{error}</div>}
        {showDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownList}>
              {filteredItems.length > 0 ? (
                filteredItems?.map((item, i) => {
                  const isSelected = selectedItems.some((i) => i._id === item._id);
                  return (
                    <div
                      key={i}
                      className={`${styles.dropdownItem} ${isSelected ? styles.selectedItem : ""}`}
                      onClick={() => handleSelectItem(item)}
                    >
                      {item.title}
                    </div>
                  )
                })
              ) :

                (
                  <div className={styles.dropdownItem}>No data available</div>
                )}
            </div>

            {fieldKey !== "suppllierId" && (
              <div
                className={styles.addButton}
                onClick={() => {
                  if (fieldKey === "categoryId") {
                    navigate("/category");
                    return;
                  } else if (fieldKey === "subCategoryId") {
                    navigate("/Subcatagory");
                    return;
                  } else {
                    setNewCategoryName(inputValue);
                    setShowModal(true);
                  }
                }
                }
              >
                + Add
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for adding new category */}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
        className="add-modal "
      >
        <Modal.Header closeButton className=" border-bottom-0" style={{
          backgroundColor: "var(--white, #FFF3E3) "
        }}>
          <Modal.Title className="fw-semibold  fs-5"
            style={{
              color: "var(--text-black, #55142A)"
            }}>
            Add New {fieldLabelMap[fieldKey] || "Value"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0" style={{
          backgroundColor: "var(--white, #FFF3E3) "
        }}>
          <Form.Group>
            <Form.Label className="mb-2 fw-semibold "
              style={{
                color: "var(--text-black, #55142A)",
              }}>
              {fieldLabelMap[fieldKey] || "Value"} Name
            </Form.Label>
            <Form.Control
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={`Enter ${fieldLabelMap[fieldKey] || "value"} name`}
              className=" px-2 py-2 mt-2 shadow-sm "
              style={{
                color: "var(--text-black, #55142A)",
                backgroundColor: "var(--white, #FFF3E3) ",
                border: "1px solid var(--text-black, #55142A)",
                boxShadow: "0 4px 6px #71213c87"
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-2"
          style={{
            color: "var(--text-black, #55142A)",
            backgroundColor: "var(--white, #FFF3E3) ",

          }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
            className=" px-4"
            style={{
              color: "var(--text-black, #55142A)",
              backgroundColor: "var(--white, #FFF3E3) ",
              border: "1px solid var(--text-black, #55142A)",
              boxShadow: "0 4px 6px #71213c87"
            }}
          >
            Cancel
          </Button>
          <Button
            variant="dark"
            onClick={handleCreateCategory}
            className=" px-4"
            style={{
              color: "var(--white, #FFF3E3)",
              backgroundColor: "var(--text-black, #55142A) ",
              border: "1px solid var(--text-black, #55142A)",
              boxShadow: "0 4px 6px #71213c87"
            }}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>

    </Form.Group >

  );
};

export default AutoCompleteMultiSelect;
