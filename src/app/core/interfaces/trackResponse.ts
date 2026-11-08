export interface TrackingAWBReq {
  ActiveDataBase: string
  AccountPWD: string
  AccountNo: string
  TrackingNo: string
}


export interface TrackInfoRes {
  TrackInfo: TrackInfo[]
  code: string
  description: string
}

export interface TrackInfo {
  ShipmentInformation: ShipmentInformation
  trackList: TrackList[]
}

export interface ShipmentInformation {
  AWBNo: string
  AccountNo: string
  ActWeight: number
  AgentAWB: string
  AuditNote: any
  ConsigneeDetails: string
  ConsigneePhone?: string
  ConsigneeMobile?: string
  CustomerCash: string
  Destination: string
  GoodsDesc: string
  LastStatus: string
  Origin: string
  Pcs: number
  ProductType: any
  Receiver: string
  Sender: string
  Shipper?: string
  ServiceType: any
  ShipperDetails: string
  ShipperRef: any
  SpecialInstruct: string
  Weight: number
}

export interface TrackList {
  DeliveredTo: string
  Location: string
  Remarks: string
  Status: string
  TransTime: string
  Transdate: string
}
