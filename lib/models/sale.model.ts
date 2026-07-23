export interface ISale {
  _id: string;
  garmentId: string;
  customerId: string;
  price: number;

  paymentState: "PENDIENTE" | "PAGADO" | "CANCELADO";
  comprobanteUrl?: string;

  deliveryId?: string;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
