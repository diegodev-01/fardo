export interface IBale {
    _id: string;
    name: string;
    weight: number;
    totalPrice: number;
    sendPrice: number;
    totalQuantity: number;
    state: "ABIERTO" | "A LA VENTA" | "VENDIDO";
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}