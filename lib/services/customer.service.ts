import { Customer } from "../schemas/customer";

export const getCustomers = async () => {
  try {
    const response = await fetch("/api/customers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error fetching customers");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const createCustomer = async (customerData: Customer) => {
  try {
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error creating customer");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

export const getCustomerById = async (id: string) => {
  try {
    const response = await fetch(`/api/customers/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error fetching customer");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }
};
