export type TrackingStatus = 'Pending' | 'Info Received' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception' | 'Failed Attempt';

export interface TrackingDetails {
  trackingId: string;
  courierName: string;
  status: TrackingStatus;
  lastUpdated: string;
}

/**
 * MOCK SHIPPING TRACKING SERVICE
 * 
 * Replace these functions with actual API calls to your chosen provider 
 * (e.g., Shiprocket, TrackingMore, Shipway) once decided.
 */

// Simulates registering a new tracking ID with a shipping provider
export async function registerTrackingWithProvider(trackingId: string, courierName: string): Promise<{ success: boolean; status: TrackingStatus }> {
  // In a real scenario, you would POST to e.g., https://api.shiprocket.in/v1/external/courier/track
  console.log(`[Mock Shipping API] Registered tracking ${trackingId} for courier ${courierName}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    status: 'Info Received' // Initial status when a tracking ID is generated
  };
}

// Simulates fetching the latest status from a shipping provider
export async function fetchTrackingStatusFromProvider(trackingId: string, courierName: string): Promise<TrackingStatus> {
  console.log(`[Mock Shipping API] Fetching status for ${trackingId} (${courierName})`);
  
  await new Promise(resolve => setTimeout(resolve, 800));

  // For demonstration purposes, we'll return random statuses based on the tracking ID length
  // In reality, this would be an API call to the provider.
  const hash = trackingId.length + courierName.length;
  
  if (hash % 5 === 0) return 'Delivered';
  if (hash % 4 === 0) return 'Out for Delivery';
  if (hash % 3 === 0) return 'In Transit';
  if (hash % 2 === 0) return 'Exception';
  
  return 'In Transit';
}
