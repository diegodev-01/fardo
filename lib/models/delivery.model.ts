export type DeliveryMethodType =
  | "flash"
  | "punto fijo"
  | "envio";


export interface LocationDetails {
    name: string;
    address: string;
    notes?: string;
}

export interface IDelivery {
  _id: string;
  name: string;
  phone: string;
//   type: "ENVIO" | "ENTREGA";
  deliveryMethod: DeliveryMethodType;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
