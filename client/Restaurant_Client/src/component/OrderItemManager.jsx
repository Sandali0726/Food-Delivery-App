import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addOrderItem, removeOrderItem, getOrderItems } from '../features/orderSlice';
import { Loader2 } from 'lucide-react';

export default function OrderItemManager({ orderId }) {
  const dispatch = useDispatch();
  const { orderItems, loading } = useSelector(state => state.orders || { orderItems: [], loading: false });
  const [form, setForm] = useState({ foodName: '', quantity: 1, price: '', foodId: '' });
  const [adding, setAdding] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    await dispatch(addOrderItem({ ...form, orderId, quantity: Number(form.quantity), price: Number(form.price) }));
    setForm({ foodName: '', quantity: 1, price: '', foodId: '' });
    setAdding(false);
    dispatch(getOrderItems(orderId));
  };

  const handleDelete = async (id) => {
    await dispatch(removeOrderItem(id));
    dispatch(getOrderItems(orderId));
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">Manage Order Items</h2>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4 flex-wrap">
        <input name="foodName" value={form.foodName} onChange={handleChange} placeholder="Food Name" required className="border p-2 rounded" />
        <input name="foodId" value={form.foodId} onChange={handleChange} placeholder="Food ID" required className="border p-2 rounded" />
        <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} placeholder="Qty" required className="border p-2 rounded w-20" />
        <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} placeholder="Price" required className="border p-2 rounded w-24" />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={adding}>{adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Item'}</button>
      </form>
      <ul className="divide-y">
        {orderItems && orderItems.length > 0 ? orderItems.map(item => (
          <li key={item.orderItemId} className="flex justify-between items-center py-2">
            <span>{item.foodName} x{item.quantity} - ${item.price}</span>
            <button onClick={() => handleDelete(item.orderItemId)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
          </li>
        )) : <li className="text-gray-500 py-2">No items found.</li>}
      </ul>
    </div>
  );
}
