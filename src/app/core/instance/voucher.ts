export interface Voucher {
  id?: number;
  nameVoucher: string;
  percent: number;
  startDate: Date;
  endDate: Date;
  createDate: Date;
  createBy: string;
  modifyDate?: Date;
  modifyBy: string;
}
