import { div } from 'framer-motion/client';
import React from 'react';

const PurchaseList = ({ purchases }) => {
  return (
    <div className="mb-6">
      <table className="w-full text-left border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Purchase ID</th>
            <th className="border px-4 py-2">Customer</th>
            <th className='border px-4 py-2'>Items</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase._id}>
              <td className="border px-4 py-2">{purchase._id}</td>
              <td className="border px-4 py-2">{purchase.user.name}</td>
              <td className="border px-4 py-2">
                {purchase.items.map(item => (
                  <div key={item._id} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>Quantity: {item.quantity}</span>
                  </div>
                ))}
              </td>
              <td className="border px-4 py-2">{purchase.status}</td>
              <td className="border px-4 py-2">
                <button className="bg-blue-500 text-white px-4 py-1 rounded">Update Status</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseList;
