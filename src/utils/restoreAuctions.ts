import { edgeFunctionAdminOperations } from './edgeFunctionAdminOperations';
import { toast } from 'sonner';

/**
 * Restores 109 auctions that ended on 27 February 2026 at 14:00 back to live status.
 * New end time: Friday 7 March 2026 at 14:00 Polish time (CET, UTC+1)
 * Run this from the browser console: restoreAuctionsToLive()
 */
export async function restoreAuctionsToLive() {
  const carIds = [
    '0323dfc2-45c8-4221-b992-fcb40f83e74e',
    '04353558-7e62-490c-af33-fd672e84d15d',
    '05d611bb-85cf-4d6c-a511-7d3c2bcdea94',
    '0c85a327-c9dd-4202-88b2-277ebe4e6956',
    '0d1c1e0a-391f-44e8-8bdd-2bf9cb1881ee',
    '0d5c88fc-9b57-430b-bb30-9d1e2fd5a498',
    '10915fae-2ca3-436f-948f-f0c44ae3ead3',
    '13ef90a8-34da-44ef-9c5e-cd66d9a585b5',
    '189d153c-286d-4b1a-92dd-135b7d9090be',
    '19338e01-caed-4f2a-84b9-4989072691f4',
    '1b0a3c4d-7c46-424c-8017-671ab6a92cd0',
    '1b430a75-b0bb-455f-a5f8-eb3e6713ccc8',
    '1c23b76a-a8d5-4244-88c3-c1b1629a30e0',
    '21fb158e-223f-4f9e-8a22-fde66b4a51db',
    '2509cfd9-1a62-4146-bf85-3a7a093827eb',
    '26d67377-ec88-49bb-a5dd-1f916aa1c091',
    '27a57873-a9d8-4783-8603-b623c57d9417',
    '28641710-9397-4fef-b3ae-c55b140b0472',
    '28c182cb-41e5-4a54-a515-512934b6b063',
    '2c770e87-4573-4704-ae76-06997aacd515',
    '2d327d08-30bc-4158-a09f-5fb848be6c06',
    '2d8f9bad-682a-4cb7-8f46-900b8b7b6618',
    '2d9d78ee-9b2a-4527-b3ea-9730bfcddf1c',
    '3124e325-4f32-47d4-b3cd-3ad95df54e14',
    '323e87f2-3525-42c6-ab63-e014bdf894fc',
    '3295d912-8914-4680-93cd-d5cb23405fa6',
    '32a8c3d8-b8dd-4080-816b-1ffa166092df',
    '32c7bd03-2c62-4d91-bfe2-5126e245e99c',
    '34f2089c-1a40-41e9-a723-5f2b53fa40af',
    '376aa07a-4e02-46c8-aa13-7c9887a51a9f',
    '399b042a-b571-48df-b1a7-fa4656e9e65b',
    '3b03eb42-61d7-4fab-82d1-2b92c4b8bdc4',
    '3c898e5f-cdfe-4334-9f6d-fae97427463a',
    '3d636b27-db7b-4c38-b8a8-80f241870e2c',
    '403974c5-406a-4e87-a594-c81cd82456aa',
    '4158e5eb-aa10-4db3-a73c-889bb41f581c',
    '42b71942-2da1-4ce1-8c10-b7c999994835',
    '4801bf7d-fbc2-4af8-a097-8e809e50e6e2',
    '490eef92-1a73-43bb-87ab-97e83904a85b',
    '4bc3396b-6dde-4901-9c11-364375221c9d',
    '4d403024-5989-48ad-be4b-55b8a7f41924',
    '54f9672d-e5e6-4c09-8c77-da2586ac58ad',
    '5555d875-b322-4319-8adf-90ef2df4d4e4',
    '569a41e0-9c81-4e35-b777-6b64fb012ce2',
    '578d0a37-8ec2-400e-a45a-81a3ed8765cb',
    '5babc4a3-f00d-4fac-a111-92101d75195c',
    '5f4ed623-16ac-4e76-80fa-5edbe18bd1f5',
    '62a6dec7-897f-433a-87ff-acd422d8c4e0',
    '64cfbe78-69c7-44c2-bc8f-f930ba3256fc',
    '6ff11948-6e36-479d-a52c-ea07a316fd83',
    '74839b67-01c4-4b00-9bc6-930f030f05fd',
    '75f0409c-d4e7-4948-a0d8-b6f26763cc98',
    '776b72d8-2355-4f6a-9c4b-c89ee123ba5f',
    '7812aecb-3973-41f0-a84e-abbd75626a22',
    '797827d5-dbea-4709-a169-305da536bd25',
    '7a643b78-e606-4f60-9482-f8af992b558e',
    '7c4ce670-1b6d-494f-9fe9-79ce2a3fa392',
    '7f37d0b8-c93a-4e80-abb4-e4508aadd207',
    '81dff98c-f2de-4691-95ec-b9a3e2a89ef9',
    '842f1a9a-9249-47dc-8aff-5ee0ae39f660',
    '889226d3-00d1-495e-8a42-6df6c7ea5688',
    '8de6e31b-e125-466e-bbe2-57f2a90a7d49',
    '91f532fe-8cd7-4dc5-865b-42bdf984b292',
    '93811756-dc7c-40ec-b82e-cf264ae6ccae',
    '9469984b-9fb7-4374-9a5f-a648e0fc4ad7',
    '96a951ad-dec9-4217-95e7-2cf6bbe5cadf',
    '991077c8-b22c-4b9d-8341-0f6927438cba',
    '99363ae6-8738-46c0-90b9-7fe5f88339d5',
    '99847806-7b97-4e61-a2f9-839205bbd2a7',
    '9da8e59f-4fb2-45af-bea7-c7c90869b1f6',
    '9f84f40a-29ee-4b47-8af6-11bd79a033ea',
    'a35419f0-f880-451a-8f01-d7b4268f1b30',
    'a655331a-ca00-4926-9588-32790bf48076',
    'a7df67aa-a7ac-4594-9993-ed0ef0a9b098',
    'a84d9011-f56f-435b-a186-8592cc713ead',
    'a8cf1924-07a3-4d44-864a-064d4f96eee9',
    'aeaa99a2-3487-47a9-a767-da109f6575b0',
    'b0b3c07c-7a0d-4a95-ae4d-39a8af602d6b',
    'b2763f3d-6ab3-4a73-96d7-b171c89e9f1d',
    'b44465bb-728c-4a56-8311-59cc1f01ab16',
    'b7f28fcf-b106-4331-b33a-46c6a1e602a7',
    'b87c6c59-482f-45af-b555-972b5d3bb9ff',
    'b951308d-3e54-4a7d-8844-151e4d3b3de7',
    'c0910892-56b3-4729-8c68-ff83af0193d9',
    'c8e8e4c0-7534-4556-8f8d-61b09ebd2f4e',
    'cdab035e-c8ed-41b8-8e50-c9c54860e2bd',
    'ce8c4177-1b90-49b4-858a-82d907f61a6c',
    'd0f792ab-9c65-43ed-9103-69f221149903',
    'd1f4dd01-150f-4235-a429-77fab60db6f3',
    'd86d349d-7996-4efb-9584-ea03771debc6',
    'da61abcf-9290-4226-90a8-a4ff0cb35a5e',
    'dc797e82-804f-4304-81af-e255f7b6fe0b',
    'de3edc19-22ad-4c61-8b37-70aabd002d39',
    'e2fa2af2-0378-4359-ae59-88fea1d6a074',
    'e32f42b5-6c3b-467e-8bac-0abe0e240c65',
    'e42dee43-e5ff-47e9-a96a-99ca54918c1a',
    'e45a860b-a28d-427c-bf7c-24b48ab46af4',
    'e777226c-ca5e-48ca-96d2-e30865c1b0c7',
    'e880b271-95c7-4b55-88a5-ac036e6e0ce0',
    'ecb7ac1e-0e27-4837-934f-841d5bbb14a1',
    'f05c8926-7399-447a-b008-45f2838246bd',
    'f16b03b3-ae8a-4c26-85f4-dda6649e8e22',
    'f17e7cdb-7de8-4b3e-8c09-efe0b4780693',
    'f2b3f5c7-55ac-4e08-afae-240003a2edf1',
    'f59926d9-fc42-4c4c-94e6-6ea6ee68dd5d',
    'f7a3eaef-d714-432e-af04-54350dfd0dd6',
    'fa817ea9-c6a2-4053-b3f1-71c2952bf936',
    'ff7b2f6a-5bdb-424a-b233-42dcf571e10d',
    'ffc34ee6-5fb2-4e1f-9b4c-d491fbdc9cc9'
  ];
  
  // Friday 7 March 2026 at 14:00 Polish time (CET = UTC+1)
  const auctionEndTime = '2026-03-07T13:00:00Z';
  
  console.log('Starting bulk auction restore...');
  console.log(`Restoring ${carIds.length} auctions to live status`);
  console.log(`New end time: ${auctionEndTime} (14:00 Polish time, 7 March 2026)`);
  
  toast.info(`Restoring ${carIds.length} auctions...`);
  
  try {
    const result = await edgeFunctionAdminOperations.bulkRestoreAuctions(carIds, auctionEndTime) as {
      success: boolean;
      carsUpdated: number;
      schedulesUpdated: number;
      cars: any[];
      schedules: any[];
    } | null;
    
    if (result) {
      console.log('Restore completed successfully:', result);
      toast.success(`Successfully restored ${result.carsUpdated} auctions to live status!`);
      return result;
    } else {
      console.error('Restore failed - no result returned');
      toast.error('Failed to restore auctions');
      return null;
    }
  } catch (error) {
    console.error('Restore failed:', error);
    toast.error(`Failed to restore auctions: ${(error as Error).message}`);
    throw error;
  }
}

// Export for console usage
if (typeof window !== 'undefined') {
  (window as any).restoreAuctionsToLive = restoreAuctionsToLive;
}
