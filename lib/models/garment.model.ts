export interface IGarment {
    _id: string;
    BaleId: string;
    code?: string;
    name: string;
    price: number;
    quantity?: number;
    state: "DISPONIBLE" | "DEFECTUOSO" | "RESERVADO" | "VENDIDO";
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}