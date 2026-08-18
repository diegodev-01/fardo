import "server-only";
import { connectDB } from "../db";
import customerModel from "../models/customer.model";
import { Customer } from "../schemas/customer";
import saleModel from "../models/sale.model";

export const getOrders = async () => {
  try {
    await connectDB();
    const orders = await saleModel.find({}).lean();

    return orders.map((sale) => ({
      ...sale,
      _id: sale._id.toString(),
      createdAt: sale.createdAt
        ? new Date(sale.createdAt).toISOString()
        : undefined,
      updatedAt: sale.updatedAt
        ? new Date(sale.updatedAt).toISOString()
        : undefined,
    }));
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw new Error("Error al obtener los clientes");
  }
};

export const createOrder = async (orderData: Customer) => {
  try {
    await connectDB();
    const newOrder = await saleModel.create(orderData);
    return newOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Error al crear el cliente en la base de datos");
  }
};

export const getOrderById = async (id: string) => {
  try {
    await connectDB();
    const order = await saleModel.findById(id).lean();

    if (!order) return null;

    return order;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return null;
  }
};
