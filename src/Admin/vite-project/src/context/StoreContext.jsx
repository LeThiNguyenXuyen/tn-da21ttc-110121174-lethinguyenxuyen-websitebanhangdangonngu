import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const StoreContext = createContext();

const StoreContextProvider = ({ children }) => {
  const [Product_list, setProduct_list] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/product/list");
      setProduct_list(Array.isArray(res.data) ? res.data : res.data.data);
    } catch (err) {
      console.error("Lỗi khi fetch sản phẩm:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <StoreContext.Provider value={{ Product_list, fetchProducts }}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
