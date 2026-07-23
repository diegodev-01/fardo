export interface IUser {
    _id: string;
    name: string;
    phone: string;
    role: "admin" | "customer" | "salesperson";
    email?: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}