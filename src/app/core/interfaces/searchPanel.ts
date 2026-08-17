export interface ShipmentDetails {
  AWBNo: string;
  AccountNo: string;
  PaymentMethod: string;
  BookingRefNo: string;
  Origin: string;
  Destination: string;
  NoofPieces: number;
  Weight: number;
  ActWeight: number;
  PickupDate: string;
  ProductType: string;
  ServiceType: string;
  Mode: string;
  ShipperRef: string;
  Shipper: string;
  SendersTel: string;
  SendersMobile: string;
  Consignee: string;
  ConsigneePhone: string;
  ConsigneeMobile: string;
  ConsigneeAddress1: string;
  AgentCode: string;
  MasterAWB: string;
  Courier: string;
  Specialinstruct: string;
  GoodsDesc: string;
  CashtoCollect: number;
  ValueCurrency: string;
  ValueOfShipment: number;
  Consigneecity: string;
  DeliveredDate: string;
  DeliveredTime: string;
  Status: string;
  Remarks: string;
  ReceivedBy: string;
  Branch: string;
  RecvId: string;
  StatusNotes: string;
  DelRelation: string;
  SealNo: string;
  ShipperAddress1: string;
  ShipperAddress2: string;
  ShipperTel2: string;
  Ageing: number;
  ForwadingAWB: string;
}

export interface TrackingResponseSearchawb {
  Description: string;
  code: string;
  JasonString: string;
}

export interface searchPanelReq{
    AccessCode:string,
    ActiveDataBase:string,
    FilterCondition:string,
    FilterFinal:string,
    FilterMid:string,
    Status:string,
}