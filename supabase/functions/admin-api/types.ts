
export interface AdminOperationRequest {
  action: string;
  params?: Record<string, any>;
}

export interface AdminOperationResponse<T = any> {
  data?: T;
  error?: string;
}

export type AdminAction = 
  | 'getAuctionListings'
  | 'getActiveAuctions'
  | 'getAllUsers'
  | 'getAllSellers'
  | 'getAllDealers'
  | 'getSellerCars'
  | 'updateUserRole'
  | 'suspendUser'
  | 'verifyDealer'
  | 'rejectDealer'
  | 'deleteSeller'
  | 'pauseAuction'
  | 'startAuction'
  | 'cancelAuction'
  | 'checkSystemHealth'
  | 'recoverAuction'
  | 'verifyAccess';
