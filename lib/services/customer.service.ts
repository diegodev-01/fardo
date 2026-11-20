import "server-only";
import { connectDB } from "../db";
import customerModel from "../models/customer.model";
import { Customer } from "../schemas/customer";

export const getCustomers = async () => {
  try {
    await connectDB();
    const customers = await customerModel.find({}).lean();

    return customers.map((customer) => ({
      ...customer,
      _id: customer._id.toString(),
      createdAt: customer.createdAt
        ? new Date(customer.createdAt).toISOString()
        : undefined,
      updatedAt: customer.updatedAt
        ? new Date(customer.updatedAt).toISOString()
        : undefined,
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Error al obtener los clientes");
  }
};

export const createCustomer = async (customerData: Customer) => {
  try {
    await connectDB();
    if (await customerModel.exists({ phone: customerData.phone })) {
      throw new Error("Ya existe un cliente con ese teléfono");
    }
    const newCustomer = await customerModel.create(customerData);
    return newCustomer;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Ya existe")) throw error;
    if ((error as { code?: number }).code === 11000) {
      throw new Error("Ya existe un cliente con ese correo");
    }
    console.error("Error creating customer:", error);
    throw new Error("Error al crear el cliente en la base de datos");
  }
};

export const getCustomerById = async (id: string) => {
  try {
    await connectDB();
    const customer = await customerModel.findById(id).lean();

    if (!customer) return null;

    return customer;
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    return null;
  }
};
