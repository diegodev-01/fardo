import "server-only";
import { connectDB } from "../db";
import customerModel from "../models/customer.model";
import { Customer } from "../schemas/customer";
import saleModel from "../models/sale.model";

import garmentModel from "../models/garment.model";

export const getOrders = async () => {
  try {
    await connectDB();
    const orders = await saleModel.find({}).lean();

    const populatedOrders = await Promise.all(
      orders.map(async (sale) => {
        const customer = await customerModel.findById(sale.customerId).lean();
        const garment = await garmentModel.findById(sale.garmentId).lean();
        
        return {
          ...sale,
          _id: sale._id.toString(),
          customer: {
            name: customer?.name || "Desconocido",
            lastname: customer?.lastname || "",
            phone: customer?.phone || "",
          },
          garment: {
            name: garment?.name || "Prenda eliminada",
            finalPrice: sale.price || 0,
          },
          createdAt: sale.createdAt
            ? new Date(sale.createdAt).toISOString()
            : undefined,
          updatedAt: sale.updatedAt
            ? new Date(sale.updatedAt).toISOString()
            : undefined,
        };
      })
    );

    return populatedOrders.reverse();
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw new Error("Error al obtener los pedidos");
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
