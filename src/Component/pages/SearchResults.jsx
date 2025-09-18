import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance'; // Adjust this path if needed

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();

  const [results, setResults] = useState({
    items: [],
    sizes: [],
    metals: [],
    users: [],
    categories: [],
    subcategory: [],
    supplier: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllResults = async () => {
      setLoading(true);
      try {
        const [itemsRes, sizeRes, metalRes, userRes, categories, subcategory, supplier] = await Promise.all([
          axiosInstance.get(`/item/getAll`, {
            params: { search: query, page: 1, limit: 100 }
          }),
          axiosInstance.get(`/size/getAll`, {
            params: { search: query, page: 1, limit: 100 }
          }),
          axiosInstance.get(`/metal/list`, {
            params: { search: query, page: 1, limit: 100 }
          }),
          axiosInstance.get(`/item/getAllUser`, {
            params: { search: query, page: 1, limit: 100 }
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
          items: itemsRes.data.data.items,
          sizes: sizeRes.data.data.sizes,
          metals: metalRes.data.data.metals,
          users: userRes.data.data.users,
          categories: categories.data.data.categories,
          subcategory: subcategory.data.data.categories,
          supplier: supplier.data.data.suppliers,
        });

      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllResults();
  }, [query]);

  const handleResultClick = (type, id) => {
    // Navigate to the detail page for the clicked result
    switch (type) {
      case 'items':
        navigate(`/Allitem?q=${query}&highlight=${id}`);
        break;
      case 'sizes':
        navigate(`/Size?q=${query}&highlight=${id}`);
        break;
      case 'metals':
        navigate(`/metal?q=${query}&highlight=${id}`);
        break;
      case 'users':
        navigate(`/user?q=${query}&highlight=${id}`);
        break;
      case 'categories':
        navigate(`/category?q=${query}&highlight=${id}`);
        break;
      case 'subcategory':
        navigate(`/Subcatagory?q=${query}&highlight=${id}`);
        break;
      case 'supplier':
        navigate(`/AllSupplier?q=${query}&highlight=${id}`);
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Search Results for "{query}"</h2>

      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          {Object.values(results).every(arr => arr.length === 0) && (
            <p>No results found.</p>
          )}

          {results.items?.length > 0 && (
            <div>
              <h4>🛍️ Items</h4>
              {results.items?.map(item => (
                <div
                  key={item._id}
                  style={{ cursor: "pointer", marginBottom: "10px" }}
                  onClick={() => handleResultClick('items', item._id)}
                >
                  {item.itemName}
                </div>
              ))}
            </div>
          )}

          {results.sizes?.length > 0 && (
            <div>
              <h4>📏 Sizes</h4>
              {results.sizes?.map(size => (
                <div
                  key={size._id}
                  style={{ cursor: "pointer", marginBottom: "10px" }}
                  onClick={() => handleResultClick('sizes', size._id)}
                >
                  {size.sizeName}
                </div>
              ))}
            </div>
          )}

          {results.metals?.length > 0 && (
            <div>
              <h4>🪙 Metals</h4>
              {results.metals?.map(metal => (
                <div
                  key={metal._id}
                  style={{ cursor: "pointer", marginBottom: "10px" }}
                  onClick={() => handleResultClick('metals', metal._id)}
                >
                  {metal.metalName}
                </div>
              ))}
            </div>
          )}

          {results.users?.length > 0 && (
            <div>
              <h4>👤 Users</h4>
              {results.users?.map(user => (
                <div
                  key={user._id}
                  style={{ cursor: "pointer", marginBottom: "10px" }}
                  onClick={() => handleResultClick('users', user._id)}
                >
                  {user.firstName} {user.lastName}
                </div>
              ))}
            </div>
          )}

          {results.categories?.length > 0 && (
            <div>
              <h4>🪙 categories</h4>
              {results.categories?.map(categories => (
                <div
                  key={categories._id}
                  style={{ cursor: "pointer", marginBottom: "10px" }}
                  onClick={() => handleResultClick('categories', categories._id)}
                >
                  {categories.title}
                </div>
              ))}
            </div>
          )}

          {results.subcategory?.length > 0 && (
            <div>
              <h4>🪙 subcategory</h4>
              {results.subcategory?.map(subcategory => (
                <div
                  key={subcategory._id}
                  style={{ cursor: "pointer", marginBottom: "10px" }}
                  onClick={() => handleResultClick('subcategory', subcategory._id)}
                >
                  {subcategory.title}
                </div>
              ))}
            </div>
          )}
          {results.supplier?.length > 0 && (
            <div>
              <h4>🪙 supplier</h4>
              {results.subcategory?.map(supplier => (
                <div
                  key={supplier._id}
                  style={{ cursor: "pointer", marginBottom: "10px" }}
                  onClick={() => handleResultClick('supplier', supplier._id)}
                >
                  {supplier.partyName}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
