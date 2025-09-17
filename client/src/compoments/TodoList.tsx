import { Button, Checkbox, Modal, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

type productType = {
  id: number;
  product_name: string;
  isStatus: boolean;
};

export default function TodoList() {
  const [products, setProducts] = useState<productType[]>([]);
  const [error, setError] = useState("");
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [idDelete, setIdDelete] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const getTodoList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/products`);
      setProducts(response.data);
      setError("");
    } catch (error) {
      console.log("error: ", error);
      setError("không thể tải danh sách công việc");
    } finally {
      setLoading(false);
    }
  };
  const handleToggleStatus = async (id: number) => {
    try {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      await axios.patch(`http://localhost:3000/products/${id}`, { isStatus: !product.isStatus });
      getTodoList();
      setError("");
    } catch (error) {
      console.log("error:", error);
      setError("không thể cập nhập trạng thái công việc");
    }
  };
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/products/${id}`);
      getTodoList();
      setError("");
    } catch (error) {
      console.log("error: ", error);
      setError("Lỗi xoá công việc");
    }
  };
  const showModalDelete = (id: number) => {
    setOpenDelete(true);
    setIdDelete(id);
  };
  const showModalEdit = (id: number) => {
    setOpenEdit(true);
    setIdDelete(id);
  };
  const handleOk = () => {
    if (idDelete !== null) {
      handleDelete(idDelete);
    }
    setOpenDelete(false);
  };
  const handleCancel = () => {
    setOpenDelete(false);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "") {
      setError("Danh sách công việc không được để trống");
      return;
    }
    const isDuplicate = products.some((p) => p.product_name.trim().toLowerCase() === input.trim().toLowerCase());
    if (isDuplicate) {
      setError("Công việc đã tồn tại");
      return;
    }
    try {
      await axios.post(`http://localhost:3000/products`, { product_name: input, isStatus: false });
      getTodoList();
      setError("");
      setInput("");
    } catch (error) {
      console.log("error: ", error);
    }
  };
  useEffect(() => {
    getTodoList();
  }, []);
  return (
    <>
      <div className="flex justify-center items-center mt-2 ">
        <div className=" flex flex-col justify-center items-center gap-3 w-[500px] border p-[20px] rounded">
          <h1>Quản lý công việc</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-1 w-full">
            <input
              type="text"
              placeholder="Nhập tên công việc"
              className="border p-2 rounded w-full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {error && <div className="text-red-500">{error}</div>}
            <button type="submit" className="border bg-blue-500 text-white rounded py-2 hover:bg-blue-600">
              Thêm công việc
            </button>
          </form>
          {/* Bộ lọc */}
          <div className="flex gap-2 w-full justify-center">
            <button className="bg-blue-500 text-white px-4 py-1 rounded">Tất cả</button>
            <button className="bg-white text-black border px-4 py-1 rounded">Hoàn thành</button>
            <button className="bg-white text-black border px-4 py-1 rounded">Đang thực hiện</button>
          </div>
          {/* render danh sách */}
          <Spin spinning={loading} className="w-full">
            <div className="w-[450px] min-h-[200px]">
              <ul className="flex flex-col gap-2">
                {products.map((product) => (
                  <li key={product.id} className="flex items-center justify-between border p-2 rounded">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={product.isStatus} onChange={() => handleToggleStatus(product.id)} />
                      <span className={product.isStatus ? "line-through text-gray-500" : ""}>
                        {product.product_name}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => showModalEdit(product.id)}>✏️</button>
                      <button onClick={() => showModalDelete(product.id)}>🗑️</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Spin>
          {/*  */}
          <div className="flex justify-between w-full">
            <button className="bg-red-500 text-white p-2 rounded px-5">Xoá công việc hoàn thành</button>
            <button className="bg-red-500 text-white p-2 rounded px-5">Xoá tất cả công việc</button>
          </div>
          <Modal open={openDelete} onOk={handleOk} onCancel={handleCancel}>
            <p>
              Bạn có chắc chắn muốn xoá công việc {products.find((p) => p.id === idDelete)?.product_name || ""} không?
            </p>
          </Modal>
          <Modal
            open={openEdit}
            footer={[<Button>Huỷ</Button>, <Button>Cập nhập</Button>]}
            onCancel={() => setOpenEdit(false)}
          >
            <h2>Sửa công việc</h2>
            <br />
            <input type="text" className="border rounded w-full p-[5px]" />
          </Modal>
        </div>
      </div>
    </>
  );
}
