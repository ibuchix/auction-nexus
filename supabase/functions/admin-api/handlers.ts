
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AdminAction } from './types.ts';

export async function handleAdminAction(
  action: AdminAction,
  params: Record<string, any> | undefined,
  adminSupabase: SupabaseClient,
  user: any
): Promise<any> {
  console.log('Admin API called with action:', action, 'params:', params);

  switch (action) {
    case 'getAuctionListings':
      console.log('Fetching auction listings with params:', params);
      
      try {
        let query = adminSupabase.from('cars').select('*');
        
        // Update the filtering logic to include both 'approved' and 'available' status cars
        if (!params?.showAllCars && params?.status) {
          console.log('Applying status filter:', params.status);
          query = query.eq('auction_status', params.status);
        } else if (!params?.showAllCars) {
          // When not showing all cars, include both approved and available cars
          console.log('Filtering for auction-ready cars (approved and available)');
          query = query.in('status', ['approved', 'available']);
        } else {
          console.log('Showing all cars regardless of status');
        }
        
        const { data: carsData, error: carsError } = await query.order('created_at', { ascending: false });
        
        if (carsError) {
          console.error('Error fetching cars:', carsError);
          throw carsError;
        }
        
        console.log(`Successfully fetched ${carsData?.length || 0} cars`);
        
        // Log some details about the cars for debugging
        if (carsData && carsData.length > 0) {
          const fordMondeos = carsData.filter(car => 
            car.make?.toLowerCase().includes('ford') && 
            car.model?.toLowerCase().includes('mondeo')
          );
          console.log(`Found ${fordMondeos.length} Ford Mondeo cars:`, fordMondeos.map(car => ({
            id: car.id,
            title: car.title,
            status: car.status,
            auction_status: car.auction_status
          })));
        }
        
        return carsData;
      } catch (dbError) {
        console.error('Database error in getAuctionListings:', dbError);
        throw new Error(`Database query failed: ${dbError.message}`);
      }

    case 'getActiveAuctions':
      console.log('Fetching active auctions');
      try {
        const { data: activeData, error: activeError } = await adminSupabase
          .from('cars')
          .select('*')
          .in('auction_status', ['active', 'pending'])
          .eq('is_auction', true)
          .order('auction_end_time', { ascending: true });
        
        if (activeError) {
          console.error('Error fetching active auctions:', activeError);
          throw activeError;
        }
        
        console.log(`Successfully fetched ${activeData?.length || 0} active auctions`);
        return activeData;
      } catch (dbError) {
        console.error('Database error in getActiveAuctions:', dbError);
        throw new Error(`Database query failed: ${dbError.message}`);
      }

    case 'getAllUsers':
      console.log('Fetching all users');
      const { data: usersData, error: usersError } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      console.log(`Successfully fetched ${usersData?.length || 0} users`);
      return usersData;

    case 'getAllSellers':
      console.log('Fetching all sellers');
      const { data: sellersData, error: sellersError } = await adminSupabase
        .from('sellers')
        .select('*')
        .order('created_at', { ascending: false });

      if (sellersError) {
        console.error('Error fetching sellers:', sellersError);
        throw sellersError;
      }

      console.log(`Successfully fetched ${sellersData?.length || 0} sellers`);
      return sellersData;

    case 'getAllDealers':
      console.log('Fetching all dealers');
      const { data: dealersData, error: dealersError } = await adminSupabase
        .from('dealers')
        .select('*')
        .order('created_at', { ascending: false });

      if (dealersError) {
        console.error('Error fetching dealers:', dealersError);
        throw dealersError;
      }

      console.log(`Successfully fetched ${dealersData?.length || 0} dealers`);
      return dealersData;

    case 'getSellerCars':
      console.log('Fetching seller cars');
      const { data: sellerCarsData, error: sellerCarsError } = await adminSupabase
        .from('cars')
        .select('*')
        .eq('seller_id', params.sellerId)
        .order('created_at', { ascending: false });

      if (sellerCarsError) {
        console.error('Error fetching seller cars:', sellerCarsError);
        throw sellerCarsError;
      }

      console.log(`Successfully fetched ${sellerCarsData?.length || 0} seller cars`);
      return sellerCarsData;

    case 'updateUserRole':
      console.log('Updating user role');
      const { data: updateUserRoleData, error: updateUserRoleError } = await adminSupabase
        .from('profiles')
        .update({ role: params.role })
        .eq('id', params.userId)
        .select()
        .single();

      if (updateUserRoleError) {
        console.error('Error updating user role:', updateUserRoleError);
        throw updateUserRoleError;
      }

      console.log(`Successfully updated user role for user ${params.userId} to ${params.role}`);
      return updateUserRoleData;

    case 'suspendUser':
      console.log('Suspending user');
      const { data: suspendUserData, error: suspendUserError } = await adminSupabase
        .from('profiles')
        .update({ suspended: params.suspended })
        .eq('id', params.userId)
        .select()
        .single();

      if (suspendUserError) {
        console.error('Error suspending user:', suspendUserError);
        throw suspendUserError;
      }

      console.log(`Successfully suspended user ${params.userId}`);
      return suspendUserData;

    case 'verifyDealer':
      console.log('Verifying dealer');
      const { data: verifyDealerData, error: verifyDealerError } = await adminSupabase
        .from('dealers')
        .update({
          verification_status: 'approved',
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.dealerId)
        .select()
        .single();

      if (verifyDealerError) {
        console.error('Error verifying dealer:', verifyDealerError);
        throw verifyDealerError;
      }

      console.log(`Successfully verified dealer ${params.dealerId}`);
      return verifyDealerData;

    case 'rejectDealer':
      console.log('Rejecting dealer');
      const { data: rejectDealerData, error: rejectDealerError } = await adminSupabase
        .from('dealers')
        .update({
          verification_status: 'rejected',
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.dealerId)
        .select()
        .single();

      if (rejectDealerError) {
        console.error('Error rejecting dealer:', rejectDealerError);
        throw rejectDealerError;
      }

      console.log(`Successfully rejected dealer ${params.dealerId}`);
      return rejectDealerData;

    case 'deleteSeller':
      console.log('Deleting seller');
      // First delete any cars associated with this seller
      const { error: deleteCarsError } = await adminSupabase
        .from('cars')
        .delete()
        .eq('seller_id', params.sellerId);

      if (deleteCarsError) {
        console.error('Error deleting cars associated with seller:', deleteCarsError);
        throw deleteCarsError;
      }

      // Then delete the seller profile
      const { data: deleteSellerData, error: deleteSellerError } = await adminSupabase
        .from('sellers')
        .delete()
        .eq('user_id', params.sellerId);

      if (deleteSellerError) {
        console.error('Error deleting seller:', deleteSellerError);
        throw deleteSellerError;
      }

      console.log(`Successfully deleted seller ${params.sellerId}`);
      return deleteSellerData;

    case 'pauseAuction':
      console.log('Pausing auction');
      const { data: pauseAuctionData, error: pauseAuctionError } = await adminSupabase
        .from('cars')
        .update({ auction_status: 'paused' })
        .eq('id', params.auctionId)
        .select()
        .single();

      if (pauseAuctionError) {
        console.error('Error pausing auction:', pauseAuctionError);
        throw pauseAuctionError;
      }

      console.log(`Successfully paused auction ${params.auctionId}`);
      return pauseAuctionData;

    case 'startAuction':
      console.log('Starting auction');
      const { data: startAuctionData, error: startAuctionError } = await adminSupabase
        .from('cars')
        .update({ auction_status: 'active' })
        .eq('id', params.auctionId)
        .select()
        .single();

      if (startAuctionError) {
        console.error('Error starting auction:', startAuctionError);
        throw startAuctionError;
      }

      console.log(`Successfully started auction ${params.auctionId}`);
      return startAuctionData;

    case 'cancelAuction':
      console.log('Cancelling auction');
      const { data: cancelAuctionData, error: cancelAuctionError } = await adminSupabase
        .from('cars')
        .update({ auction_status: 'cancelled' })
        .eq('id', params.auctionId)
        .select()
        .single();

      if (cancelAuctionError) {
        console.error('Error cancelling auction:', cancelAuctionError);
        throw cancelAuctionError;
      }

      console.log(`Successfully cancelled auction ${params.auctionId}`);
      return cancelAuctionData;

    case 'checkSystemHealth':
      console.log('Checking system health');
      return { status: 'ok', timestamp: new Date().toISOString() };

    case 'recoverAuction':
      console.log('Recovering auction');
      return { status: 'recovery initiated', auctionId: params.auctionId, action: params.action };

    case 'verifyAccess':
      console.log('Verifying admin access');
      return { userId: user.id, timestamp: new Date().toISOString() };

    default:
      console.error('Unknown action:', action);
      throw new Error('Unknown action');
  }
}
