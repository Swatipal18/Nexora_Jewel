// /src/pages/Search.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import styles from "./Search.module.css";
import { Container, Row, Col, Card } from "react-bootstrap";

const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState({
    items: [],
    sizes: [],
    metals: [],
    users: [],
    categories: [],
    subcategory: [],
    supplier: [],
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [items, sizes, metals, users, categories, subcategory, supplier] =
          await Promise.all([
            axiosInstance.get(`${baseUrl}/item/getAll`, {
              params: { search: query, page: 1, limit: 100 },
            }),
            axiosInstance.get(`${baseUrl}/size/getAll`, {
              params: { search: query, page: 1, limit: 100 },
            }),
            axiosInstance.get(`${baseUrl}/metal/list`, {
              params: { search: query, page: 1, limit: 100 },
            }),
            axiosInstance.get(`${baseUrl}/item/getAllUser`, {
              params: { search: query, page: 1, limit: 100 },
            }),
            axiosInstance.get(`${baseUrl}/categories/getAll`, {
              params: { search: query, page: 1, limit: 100 },
            }),
            axiosInstance.get(`${baseUrl}/sub-categories/getAll`, {
              params: { search: query, page: 1, limit: 100 },
            }),
            axiosInstance.get(`${baseUrl}/supplier/getAll`, {
              params: { search: query, page: 1, limit: 100 },
            }),
          ]);

        setResults({
          items: items.data.data.items,
          sizes: sizes.data.data.sizes,
          metals: metals.data.data.metals,
          users: users.data.data.users,
          categories: categories.data.data.categories,
          subcategory: subcategory.data.data.categories,
          supplier: supplier.data.data.suppliers,
        });
      } catch (err) {
        console.error("Search fetch failed", err);
      }
    };

    fetchAll();
  }, [query]);

  const renderSection = (title, data, path, labelKey) => (
    <Col lg={4} md={6} className={styles.section}>
      <div className={styles.card}>
        <h4>{title} ({data.length})</h4>
        <Link to={`${path}?q=${query}`} className={styles.link}>
          View All {title}
        </Link>
        <ul>
          {data.slice(0, 3)?.map((item) => (
            <li key={item._id}>
              {typeof labelKey === "function" ? labelKey(item) : item[labelKey]}
            </li>
          ))}
        </ul>
      </div>
    </Col>
  );

  const allEmpty =
    results.items.length === 0 &&
    results.sizes.length === 0 &&
    results.metals.length === 0 &&
    results.users.length === 0 &&
    results.categories.length === 0 &&
    results.subcategory.length === 0 &&
    results.supplier.length === 0;

  return (
    <Container className={styles.container}>
      <h2 className={styles.title}>
        Search Results for <strong>"{query}"</strong>
      </h2>

      <Row>
        {results.items.length > 0 &&
          renderSection("Items", results.items, "/Allitem", "itemName")}

        {results.sizes.length > 0 &&
          renderSection("Sizes", results.sizes, "/Size", "sizeName")}

        {results.metals.length > 0 &&
          renderSection("Metals", results.metals, "/metal", "metalName")}

        {results.users.length > 0 &&
          renderSection("Users", results.users, "/user", (user) => `${user.firstName} ${user.lastName}`)}


        {results.categories.length > 0 &&
          renderSection("Categories", results.categories, "/category", "title")}

        {results.subcategory.length > 0 &&
          renderSection("Sub-Categories", results.subcategory, "/Subcatagory", "title")}

        {results.supplier.length > 0 &&
          renderSection("Suppliers", results.supplier, "/AllSupplier", "partyName")}
      </Row>

      {allEmpty && (
        <p className={styles.noResults}>
          No matches found for <strong>"{query}"</strong>
        </p>
      )}
    </Container>
  );
}
